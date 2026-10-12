"""Config flow for the Jow integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN


class JowConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the Jow config flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle the initial dummy step."""
        if user_input is not None:
            return self.async_create_entry(title="Jow", data={})

        return self.async_show_form(step_id="user")
