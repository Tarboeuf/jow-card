# Jow for Home Assistant

A custom Home Assistant integration for [Jow](https://www.jow.fr) recipes, and the companion Lovelace card to browse them.

> **Status:** work in progress. Both the integration and the card are dummies for now. Recipe browsing comes later.

## Installation

Add the repository to HACS **twice**, once per category:

1. Open HACS in Home Assistant.
2. Go to **Integrations** → ⋮ → **Custom repositories**.
3. Add `https://github.com/Tarboeuf/jow-card` with category **Integration**, and install **Jow**.
4. Go to **Dashboards** (in the HACS sidebar) → ⋮ → **Custom repositories**.
5. Add `https://github.com/Tarboeuf/jow-card` with category **Dashboard**, and install **Jow Card**.
6. Restart Home Assistant.

### Integration setup

Go to **Settings → Devices & Services → Add Integration**, search for **Jow**, and complete the (dummy) setup flow.

### Card usage

Edit a dashboard, add the **Jow Card** manually, with YAML:

```yaml
type: custom:jow-card
```

## Repository layout

- `custom_components/jow/` — the integration
- `jow-card.js` — the Lovelace card

## License

MIT
