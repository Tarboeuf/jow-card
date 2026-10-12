"""WebSocket API for resolving Jow recipes."""

import json
import logging
import re
from typing import Any
from urllib.parse import quote, unquote, urljoin, urlparse

import aiohttp
import probatio

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)
_BUILD_ID = "7b553074c79a90f"
_ALLOWED_HOSTS = {"api.jow.fr", "app.jow.com", "jow.fr"}
_REDIRECT_STATUSES = {301, 302, 303, 307, 308}
_REDIRECT_SCRIPT = re.compile(r"window\.location\s*=\s*['\"]([^'\"]+)['\"]")


def async_register_api(hass: HomeAssistant) -> None:
    """Register the Jow recipe WebSocket command."""
    websocket_api.async_register_command(hass, websocket_get_recipe)


@websocket_api.websocket_command(
    {
        probatio.Required("type"): f"{DOMAIN}/recipe",
        probatio.Required("recipe_url"): str,
    }
)
@websocket_api.async_response
async def websocket_get_recipe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Resolve a Jow share URL and return its recipe details."""
    try:
        recipe = await _async_get_recipe(hass, msg["recipe_url"])
    except aiohttp.ClientError, TimeoutError, ValueError, KeyError, TypeError:
        _LOGGER.exception("Unable to fetch Jow recipe")
        connection.send_error(
            msg["id"], websocket_api.ERR_UNKNOWN_ERROR, "Unable to fetch Jow recipe"
        )
        return

    connection.send_result(msg["id"], recipe)


async def _async_get_recipe(hass: HomeAssistant, recipe_url: object) -> dict[str, Any]:
    """Fetch a recipe using Jow's share page and Next.js data endpoint."""
    if not isinstance(recipe_url, str):
        raise TypeError("Recipe URL must be a string")

    parsed_url = urlparse(recipe_url)
    if parsed_url.scheme != "https" or parsed_url.hostname not in _ALLOWED_HOSTS:
        raise ValueError("Unsupported Jow URL")

    session = async_get_clientsession(hass)
    if parsed_url.hostname == "jow.fr":
        recipe_slug = _recipe_slug(parsed_url.path)
    else:
        share_html = await _async_get_text(session, recipe_url)
        redirect = _REDIRECT_SCRIPT.search(share_html)
        if redirect is None:
            raise ValueError("Jow share page did not contain a recipe redirect")
        redirect_url = urlparse(urljoin(recipe_url, redirect.group(1)))
        if redirect_url.scheme != "https" or redirect_url.hostname != "jow.fr":
            raise ValueError("Jow share page redirected outside jow.fr")
        recipe_slug = _recipe_slug(redirect_url.path)

    encoded_slug = quote(recipe_slug, safe="-")
    json_url = (
        f"https://jow.fr/_next/data/{_BUILD_ID}/fr/recipes/{encoded_slug}.json"
        "?coversCount=4"
    )
    recipe_data = json.loads(await _async_get_text(session, json_url))
    recipe = recipe_data["pageProps"]["recipe"]
    calories = next(
        (
            fact
            for fact in recipe.get("nutritionalFacts", [])
            if fact.get("id") == "ENERC"
        ),
        None,
    )
    nutri_score = next(
        (
            score.get("score")
            for score in recipe.get("nutritionalRatingScores", [])
            if score.get("id") == "nutriscore"
        ),
        None,
    )
    return {
        "title": recipe["title"],
        "description": recipe.get("description", ""),
        "image_url": recipe.get("imageUrlHD") or recipe.get("imageUrl", ""),
        "recipe_url": f"https://jow.fr/recipes/{encoded_slug}",
        "preparation_time": recipe.get("preparationTime"),
        "cooking_time": recipe.get("cookingTime"),
        "rating": recipe.get("aggregateRating"),
        "calories": calories.get("amount") if calories else None,
        "nutri_score": nutri_score,
        "price_label": recipe.get("pricePerPortionTag", {}).get("label"),
        "tools": [
            tool["name"] for tool in recipe.get("requiredTools", []) if tool.get("name")
        ],
        "ingredients": [
            {
                "name": constituent.get("name", ""),
                "image_url": constituent.get("imageUrl", ""),
                "quantity_per_cover": constituent.get("quantityPerCover", 0),
                "unit_name": constituent.get("unit", {}).get("name", ""),
                "abbreviations": [
                    {
                        key: abbreviation[key]
                        for key in (
                            "label",
                            "minAmount",
                            "maxAmount",
                            "divisor",
                            "digits",
                            "inverse",
                        )
                        if key in abbreviation
                    }
                    for abbreviation in constituent.get("unit", {}).get(
                        "abbreviations", []
                    )
                ],
                "optional": constituent.get("isOptional", False),
            }
            for constituent in recipe.get("constituents", [])
        ],
        "steps": [
            direction.get("label", "").strip()
            for direction in recipe.get("directions", [])
            if direction.get("label")
        ],
    }


def _recipe_slug(path: str) -> str:
    """Extract and validate a recipe slug from a Jow recipe path."""
    match = re.fullmatch(r"/recipes/([^/]+)/?", path)
    if match is None:
        raise ValueError("URL is not a Jow recipe")
    slug = unquote(match.group(1))
    if not re.fullmatch(r"[a-zA-Z0-9-]+", slug):
        raise ValueError("Invalid Jow recipe slug")
    return slug


async def _async_get_text(session: aiohttp.ClientSession, url: str) -> str:
    """GET a Jow URL while validating every redirect target."""
    for _ in range(4):
        async with session.get(
            url, allow_redirects=False, timeout=aiohttp.ClientTimeout(total=20)
        ) as response:
            if response.status in _REDIRECT_STATUSES:
                location = response.headers.get("Location")
                if location is None:
                    raise ValueError("Jow returned a redirect without a location")
                url = urljoin(url, location)
                parsed_url = urlparse(url)
                if (
                    parsed_url.scheme != "https"
                    or parsed_url.hostname not in _ALLOWED_HOSTS
                ):
                    raise ValueError("Jow redirected outside an allowed domain")
                continue
            response.raise_for_status()
            return await response.text()
    raise ValueError("Too many redirects from Jow")
