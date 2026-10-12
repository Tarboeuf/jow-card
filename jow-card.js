/**
 * Jow Lovelace card (dummy).
 * Displays a placeholder; real recipe browsing comes later.
 */
class JowCard extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 3;
  }

  _render() {
    if (!this._config) return;
    this.innerHTML = `
      <ha-card>
        <div class="card-content" style="padding: 16px;">
          <h3>Jow</h3>
          <p>Dummy card — recipes coming soon.</p>
        </div>
      </ha-card>
    `;
  }
}

customElements.define("jow-card", JowCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "jow-card",
  name: "Jow Card",
  preview: false,
  description: "Browse Jow recipes (dummy)",
});
