// js/core/Artifact.js

// Import artifact definitions
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js';

/**
 * Represents a passive artifact item held by the player.
 */
export class Artifact {
    constructor(artifactId) {
        const template = ARTIFACT_TEMPLATES?.[artifactId]; // Use optional chaining

        if (!template) {
            console.error(`Artifact Error: Template not found for ID: ${artifactId}`);
            // Create a fallback/error artifact
            this.id = 'error_artifact';
            this.name = 'Missing Relic';
            this.description = 'This artifact definition seems to be missing or broken.';
            this.rarity = 'common';
            this.trigger = null;
            this._effect = () => { console.warn("Tried to execute effect of missing artifact."); };
            this._condition = () => false; // Condition always false for error artifact
            return;
        }

        this.id = template.id;
        this.name = template.name;
        this.description = template.description;
        this.rarity = template.rarity || 'common';
        this.trigger = template.trigger; // String indicating when the effect might fire (e.g., 'onTurnStart')
        this.isPassive = template.isPassive || false; // Flag for passive effects handled elsewhere

        // Store the effect function and condition function
        // Ensure functions exist or provide safe defaults
        this._effect = typeof template.effect === 'function' ? template.effect : () => {};
        this._condition = typeof template.condition === 'function' ? template.condition : () => true;

        // Removed console.log from constructor for cleaner logs
    }

    /**
     * Checks if the artifact should trigger based on the game event and its condition.
     * If it should, executes the artifact's effect.
     * @param {string} eventName - The name of the game event occurring (e.g., 'onTurnStart', 'onCardPlay').
     * @param {Player} player - The player object.
     * @param {GameState} gameState - The current game state.
     * @param {object | null} eventData - Additional data related to the event (e.g., { card: Card, damageAmount: number, status: object }).
     */
    handleEvent(eventName, player, gameState, eventData = null) {
        // Ignore passive artifacts or artifacts without a matching trigger
        if (this.isPassive || this.trigger !== eventName) {
            return;
        }

        // Check if the artifact's specific condition is met
        let conditionMet = false;
        try {
            // Pass relevant properties from eventData directly to the condition function
            // Rely on the condition function defined in ArtifactDefinitions to know what to expect
            conditionMet = this._condition(player, gameState, eventData);
        } catch (error) {
            console.error(`Error evaluating condition for artifact ${this.name} (ID: ${this.id}) on event ${eventName}:`, error, "EventData:", eventData);
            conditionMet = false; // Fail safe
        }

        // If the condition is met, execute the effect
        if (conditionMet) {
            // console.log(`Artifact Triggered: ${this.name} on ${eventName}`); // Can be noisy
            try {
                 // Pass relevant data to the effect function, similar to condition
                 this._effect(player, gameState, eventData);
            } catch (error) {
                 console.error(`Error executing effect for artifact ${this.name} (ID: ${this.id}) on event ${eventName}:`, error, "EventData:", eventData);
            }
        }
    }

    /**
     * Generates HTML for displaying the artifact (e.g., in UI lists).
     * @returns {string} HTML string representation.
     */
    getDisplayHtml() {
        return `
            <div class="artifact-display" data-artifact-id="${this.id}">
                <strong>${this.name}</strong> (${this.rarity})<br>
                <small>${this.description}</small>
            </div>
        `;
    }

     /**
      * Generates HTML for displaying the artifact in a tooltip.
      * @returns {string} HTML string representation.
      */
     getTooltipHtml() {
         return `
            <div class="artifact-tooltip">
                <div class="tooltip-header"><strong>${this.name}</strong> <em>(${this.rarity})</em></div>
                <hr>
                <div class="tooltip-description">${this.description}</div>
                 ${this.isPassive ? '<hr><div class="tooltip-passive"><i>(Passive Effect)</i></div>' : ''}
             </div>
         `;
         // Note: The actual tooltip listener would be added by the UIManager when rendering this.
     }

} // End of Artifact class
