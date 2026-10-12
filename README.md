# Jow integration for Home Assistant

A custom Home Assistant integration for [Jow](https://www.jow.fr) recipes, and the companion Lovelace card to browse them.

> **Status:** work in progress. The integration currently installs via HACS and provides a dummy config flow. Recipe browsing comes later.

## Installation

### HACS (custom repository)

1. Open HACS in Home Assistant.
2. Go to **Integrations** → ⋮ → **Custom repositories**.
3. Add `https://github.com/Tarboeuf/jow-card` with category **Integration**.
4. Install **Jow**.
5. Restart Home Assistant.
6. Go to **Settings → Devices & Services → Add Integration**, search for **Jow**, and complete the (dummy) setup flow.

## License

MIT
