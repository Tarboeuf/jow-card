# Jow for Home Assistant

A custom Home Assistant integration for [Jow](https://www.jow.fr) recipes, and the companion Lovelace card to browse them.

> **Status:** work in progress. The card resolves Jow recipe share URLs; the integration does not yet provide entities.

## Installation

Add the repository to HACS as an **Integration**:

1. Open HACS in Home Assistant.
2. Go to **Integrations** → ⋮ → **Custom repositories**.
3. Add `https://github.com/Tarboeuf/jow-card` with category **Integration**, then install **Jow**.
4. Restart Home Assistant.

### Integration setup

Go to **Settings → Devices & Services → Add Integration**, search for **Jow**, and complete the (dummy) setup flow.

### Card usage

The integration automatically registers the card JavaScript. Add a manual card to your dashboard with YAML:

```yaml
type: custom:jow-card
recipe_url: input_text.jow_recipe_url
```

Set the `input_text` value to a Jow share URL, for example `https://app.jow.com/EC0U?action=recipe&recipeId=...`. The card resolves the share URL, fetches its recipe data through the Jow integration, and displays the recipe details. Remove any manually added `/local/community/jow-card/jow-card.js` resource to avoid loading the card twice.

## Repository layout

- `custom_components/jow/` — the integration
- `custom_components/jow/frontend/jow-card.js` — the Lovelace card, served and registered by the integration

## License

MIT
