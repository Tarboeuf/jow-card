/** Jow Lovelace card for displaying recipes from Jow share URLs. */
class JowCard extends HTMLElement {
    setConfig(config) {
        this._config = config;
        this._recipeUrl = undefined;
        this._recipe = null;
        this._error = false;
        this._loading = false;
        this._requestId = 0;
        this._servings = 4;
        this._render();
    }

    set hass(hass) {
        this._hass = hass;
        this._updateRecipe();
    }

    getCardSize() {
        return 8;
    }

    _render() {
        if (!this._config) return;

        const card = document.createElement("ha-card");
        card.className = "jow-recipe-card";
        const style = document.createElement("style");
        style.textContent = `
      .jow-recipe-card {
        --jow-bg: #151c23;
        --jow-panel: #202a33;
        --jow-text: #f4f7fa;
        --jow-muted: #aebbc8;
        --jow-accent: #ffad5c;
        --jow-green: #8bd5a8;
        overflow: hidden;
        color: var(--jow-text);
        background: var(--jow-bg);
        font-family: var(--primary-font-family, sans-serif);
      }
      .jow-recipe-card .jow-hero {
        position: relative;
        min-height: 280px;
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        background: #26313a;
      }
      .jow-recipe-card .jow-hero-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .jow-recipe-card .jow-hero::after {
        position: absolute;
        inset: 0;
        background: linear-gradient(0deg, #0a0e12 0%, #0a0e1266 48%, transparent 100%);
        content: "";
      }
      .jow-recipe-card .jow-hero-content {
        position: relative;
        z-index: 1;
        width: 100%;
        padding: 24px;
      }
      .jow-recipe-card .jow-eyebrow {
        color: var(--jow-green);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .jow-recipe-card .jow-title {
        margin: 8px 0 14px;
        font-size: 30px;
        line-height: 1.1;
      }
      .jow-recipe-card .jow-chips,
      .jow-recipe-card .jow-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .jow-recipe-card .jow-chip,
      .jow-recipe-card .jow-tag {
        padding: 7px 10px;
        border: 1px solid #ffffff20;
        border-radius: 6px;
        background: #ffffff14;
        color: var(--jow-text);
        font-size: 13px;
      }
      .jow-recipe-card .jow-content {
        padding: 20px;
      }
      .jow-recipe-card .jow-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 14px;
        margin-bottom: 20px;
      }
      .jow-recipe-card .jow-rating {
        color: #ffd166;
        font-weight: 700;
      }
      .jow-recipe-card .jow-servings {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--jow-muted);
      }
      .jow-recipe-card .jow-servings button {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 6px;
        background: #35424d;
        color: var(--jow-text);
        font: inherit;
        font-size: 20px;
        cursor: pointer;
      }
      .jow-recipe-card .jow-servings button:disabled {
        opacity: .45;
        cursor: default;
      }
      .jow-recipe-card .jow-servings-count {
        min-width: 1.5em;
        color: var(--jow-text);
        text-align: center;
      }
      .jow-recipe-card .jow-columns {
        display: grid;
        grid-template-columns: minmax(0, .9fr) minmax(0, 1.3fr);
        gap: 20px;
      }
      .jow-recipe-card .jow-section-title {
        margin: 0 0 14px;
        font-size: 19px;
      }
      .jow-recipe-card .jow-ingredients {
        padding: 16px;
        border-radius: 6px;
        background: #10161c;
      }
      .jow-recipe-card .jow-ingredient-list,
      .jow-recipe-card .jow-steps {
        display: grid;
        gap: 10px;
      }
      .jow-recipe-card .jow-ingredient {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .jow-recipe-card .jow-ingredient-image {
        width: 44px;
        height: 44px;
        border-radius: 6px;
        background: #303b45;
        object-fit: cover;
      }
      .jow-recipe-card .jow-ingredient-name {
        overflow-wrap: anywhere;
        font-weight: 600;
      }
      .jow-recipe-card .jow-optional {
        display: block;
        color: var(--jow-muted);
        font-size: 12px;
      }
      .jow-recipe-card .jow-quantity {
        color: var(--jow-green);
        font-size: 13px;
        font-weight: 700;
        text-align: right;
      }
      .jow-recipe-card .jow-step {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 10px;
        padding: 12px;
        border-radius: 6px;
        background: var(--jow-panel);
      }
      .jow-recipe-card .jow-step-number {
        display: grid;
        width: 32px;
        height: 32px;
        place-items: center;
        border-radius: 6px;
        background: #344d43;
        color: #b7f2cb;
        font-weight: 800;
      }
      .jow-recipe-card .jow-step-text {
        margin: 4px 0 0;
      }
      .jow-recipe-card .jow-footer {
        margin-top: 20px;
      }
      .jow-recipe-card .jow-tag {
        border: 0;
        background: #10161c;
        color: var(--jow-muted);
      }
      .jow-recipe-card .jow-tag strong {
        color: var(--jow-text);
      }
      .jow-recipe-card .jow-link {
        display: inline-block;
        margin-top: 16px;
        color: var(--jow-accent);
        font-weight: 700;
      }
      .jow-recipe-card .jow-state {
        padding: 24px;
        color: var(--jow-muted);
      }
      @media (max-width: 680px) {
        .jow-recipe-card .jow-hero { min-height: 240px; }
        .jow-recipe-card .jow-hero-content { padding: 18px; }
        .jow-recipe-card .jow-content { padding: 14px; }
        .jow-recipe-card .jow-columns { grid-template-columns: 1fr; }
      }
      @media (min-width: 681px) and (max-width: 850px) {
        .jow-recipe-card .jow-columns { grid-template-columns: 1fr; }
      }
    `;
        card.append(style);

        if (!this._recipe) {
            const state = document.createElement("div");
            state.className = "jow-state";
            state.textContent = this._loading
                ? "Chargement de la recette..."
                : this._error
                    ? "Impossible de charger cette recette Jow."
                    : "Renseignez recipe_url avec un lien de recette Jow.";
            card.append(state);
            this.replaceChildren(card);
            return;
        }

        const hero = document.createElement("header");
        hero.className = "jow-hero";
        if (this._recipe.image_url) {
            const image = document.createElement("img");
            image.className = "jow-hero-image";
            image.src = this._recipe.image_url;
            image.alt = this._recipe.title;
            image.loading = "lazy";
            hero.append(image);
        }

        const heroContent = document.createElement("div");
        heroContent.className = "jow-hero-content";
        heroContent.append(this._element("div", "jow-eyebrow", "Recette Jow"));
        heroContent.append(this._element("h1", "jow-title", this._recipe.title));

        const chips = document.createElement("div");
        chips.className = "jow-chips";
        this._appendChip(chips, "Pr\u00e9paration", this._recipe.preparation_time);
        this._appendChip(chips, "Cuisson", this._recipe.cooking_time);
        if (this._recipe.rating != null) {
            chips.append(
                this._element(
                    "span",
                    "jow-chip",
                    `Note : ${this._formatRating()} / 5`,
                ),
            );
        }
        heroContent.append(chips);
        hero.append(heroContent);
        card.append(hero);

        const content = document.createElement("div");
        content.className = "jow-content";
        const toolbar = document.createElement("div");
        toolbar.className = "jow-toolbar";
        if (this._recipe.rating != null) {
            const rating = document.createElement("div");
            rating.className = "jow-rating";
            rating.textContent = `\u2605 ${this._formatRating()} / 5`;
            toolbar.append(rating);
        }

        const servings = document.createElement("div");
        servings.className = "jow-servings";
        servings.append(this._element("span", "", "Portions"));
        const minus = this._element("button", "", "\u2212");
        minus.type = "button";
        minus.setAttribute("aria-label", "Diminuer le nombre de portions");
        minus.disabled = this._servings <= 1;
        minus.addEventListener("click", () => {
            this._servings = Math.max(1, this._servings - 1);
            this._render();
        });
        servings.append(minus);
        servings.append(this._element("strong", "jow-servings-count", this._servings));
        const plus = this._element("button", "", "+");
        plus.type = "button";
        plus.setAttribute("aria-label", "Augmenter le nombre de portions");
        plus.disabled = this._servings >= 12;
        plus.addEventListener("click", () => {
            this._servings = Math.min(12, this._servings + 1);
            this._render();
        });
        servings.append(plus);
        toolbar.append(servings);
        content.append(toolbar);

        const columns = document.createElement("div");
        columns.className = "jow-columns";
        const ingredientsSection = document.createElement("section");
        ingredientsSection.className = "jow-ingredients";
        ingredientsSection.append(
            this._element("h2", "jow-section-title", "Ingr\u00e9dients"),
        );
        const ingredientList = document.createElement("div");
        ingredientList.className = "jow-ingredient-list";
        for (const ingredient of this._recipe.ingredients || []) {
            const row = document.createElement("div");
            row.className = "jow-ingredient";
            if (ingredient.image_url) {
                const image = document.createElement("img");
                image.className = "jow-ingredient-image";
                image.src = ingredient.image_url;
                image.alt = "";
                image.loading = "lazy";
                image.addEventListener("error", () => image.remove(), { once: true });
                row.append(image);
            } else {
                row.append(this._element("span", "jow-ingredient-image", ""));
            }
            const name = document.createElement("div");
            name.className = "jow-ingredient-name";
            name.append(document.createTextNode(ingredient.name));
            if (ingredient.optional) {
                name.append(this._element("span", "jow-optional", "Facultatif"));
            }
            row.append(name);
            row.append(
                this._element("div", "jow-quantity", this._formatQuantity(ingredient)),
            );
            ingredientList.append(row);
        }
        ingredientsSection.append(ingredientList);
        columns.append(ingredientsSection);

        const stepsSection = document.createElement("section");
        stepsSection.append(
            this._element("h2", "jow-section-title", "Pr\u00e9paration"),
        );
        const steps = document.createElement("div");
        steps.className = "jow-steps";
        for (const [index, stepText] of (this._recipe.steps || []).entries()) {
            const step = document.createElement("div");
            step.className = "jow-step";
            step.append(this._element("div", "jow-step-number", index + 1));
            step.append(this._element("p", "jow-step-text", stepText));
            steps.append(step);
        }
        stepsSection.append(steps);
        columns.append(stepsSection);
        content.append(columns);

        const footer = document.createElement("div");
        footer.className = "jow-footer";
        if (this._recipe.calories != null) {
            this._appendTag(footer, `${this._recipe.calories} kcal`, "par portion");
        }
        if (this._recipe.nutri_score) {
            this._appendTag(footer, `Nutri-score ${this._recipe.nutri_score}`);
        }
        if (this._recipe.price_label) {
            this._appendTag(footer, this._recipe.price_label);
        }
        if (this._recipe.tools?.length) {
            this._appendTag(footer, "Mat\u00e9riel", this._recipe.tools.join(" + "));
        }
        content.append(footer);

        if (this._recipe.recipe_url) {
            const link = this._element("a", "jow-link", "Voir la recette sur Jow");
            link.href = this._recipe.recipe_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            content.append(link);
        }

        card.append(content);
        this.replaceChildren(card);
    }

    _element(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        element.textContent = text;
        return element;
    }

    _appendChip(container, label, minutes) {
        if (minutes == null) return;
        container.append(
            this._element("span", "jow-chip", `${label} : ${minutes} min`),
        );
    }

    _appendTag(container, label, detail = "") {
        const tag = document.createElement("div");
        tag.className = "jow-tag";
        tag.append(this._element("strong", "", label));
        if (detail) tag.append(document.createTextNode(` ${detail}`));
        container.append(tag);
    }

    _formatRating() {
        return new Intl.NumberFormat("fr-FR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(this._recipe.rating * 5);
    }

    _formatQuantity(ingredient) {
        const amount = Number(ingredient.quantity_per_cover) * this._servings;
        const rules = ingredient.abbreviations || [];
        const rule =
            rules.find(
                (candidate) =>
                    amount >= (candidate.minAmount ?? 0) &&
                    (candidate.maxAmount == null || amount < candidate.maxAmount),
            ) || rules.at(-1);
        const divisor = rule?.divisor || 1;
        const value = rule?.inverse ? amount / divisor : amount * divisor;
        const digits = rule?.digits ?? 2;
        const quantity = new Intl.NumberFormat("fr-FR", {
            maximumFractionDigits: rule?.inverse ? Math.max(digits, 2) : digits,
        }).format(value);
        const unit = rule?.label?.trim() || ingredient.unit_name?.toLowerCase() || "";
        return `${quantity}${unit ? ` ${unit}` : ""}`;
    }

    _updateRecipe() {
        if (!this._config || !this._hass) return;

        const configuredRecipeUrl = this._config.recipe_url;
        const isEntityId =
            typeof configuredRecipeUrl === "string" &&
            /^[a-z0-9_]+\.[a-z0-9_]+$/i.test(configuredRecipeUrl);
        const recipeUrl = isEntityId
            ? this._hass.states[configuredRecipeUrl]?.state
            : configuredRecipeUrl;

        if (recipeUrl === this._recipeUrl) return;
        this._recipeUrl = recipeUrl;
        const requestId = ++this._requestId;
        this._recipe = null;
        this._error = false;
        this._loading = Boolean(
            recipeUrl && recipeUrl !== "unknown" && recipeUrl !== "unavailable",
        );
        this._render();

        if (!this._loading) return;

        this._hass
            .callWS({ type: "jow/recipe", recipe_url: recipeUrl })
            .then((recipe) => {
                if (requestId !== this._requestId) return;
                this._recipe = recipe;
                this._loading = false;
                this._render();
            })
            .catch(() => {
                if (requestId !== this._requestId) return;
                this._error = true;
                this._loading = false;
                this._render();
            });
    }
}

if (!customElements.get("jow-card")) {
    customElements.define("jow-card", JowCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "jow-card")) {
    window.customCards.push({
        type: "jow-card",
        name: "Jow Card",
        preview: false,
        description: "Load a recipe from a Jow share URL.",
    });
}
