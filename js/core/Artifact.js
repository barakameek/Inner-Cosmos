// js/core/Artifact.js

// Import artifact definitions
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js'; // Adjust path if needed

/**
 * Represents a passive artifact item held by the player.
 */
export class Artifact {
    constructor(artifactId) {
        const template = ARTIFACT_TEMPLATES[artifactId];
        if (!template) {
            console.error(`Artifact Error: Template not found for ID: ${artifactId}`);
            // Create a fallback/error artifact?
            this.id = 'error_artifact';
            this.name = 'Missing Relic';
            this.description = 'This artifact seems broken.';
            this.rarity = 'common';
            this.trigger = null; // No trigger for error artifact
            this._effect = () => {}; // No effect
            this._condition = () => true; // Condition always true (but won't trigger)
            return;
        }

        this.id = template.id;
        this.name = template.name;
        this.description = template.description;
        this.rarity = template.rarity || 'common';
        this.trigger = template.trigger; // String indicating when the effect might fire (e.g., 'onTurnStart')

        // Store the effect function and condition function
        this._effect = template.effect || (() => {}); // The actual function to execute
        this._condition = template.condition || (() => true); // Condition function, defaults to always true if undefined

        console.log(`Artifact created: ${this.name}`);
    }

    /**
     * Checks if the artifact should trigger based on the game event and its condition.
     * If it should, executes the artifact's effect.
     * @param {string} eventName - The name of the game event occurring (e.g., 'onTurnStart', 'onCardPlay').
     * @param {Player} player - The player object.
     * @param {GameState} gameState - The current game state.
     * @param {object | null} eventData - Additional data related to the event (e.g., the card played, the status applied).
     */
    handleEvent(eventName, player, gameState, eventData = null) {
        // Check if the event name matches the artifact's trigger
        if (this.trigger !== eventName) {
            return; // This artifact doesn't trigger on this event
        }

        // Check if the artifact's specific condition is met
        // Pass relevant data to the condition function based on the event type
        let conditionMet = false;
        try {
            switch (eventName) {
                case 'onCardPlay':
                    conditionMet = this._condition(eventData.card, player, gameState); // Pass card played
                    break;
                case 'onTurnStart':
                case 'onCombatStart':
                case 'onCombatEnd':
                     conditionMet = this._condition(player, gameState);
                     break;
                 case 'onDamageTaken':
                     conditionMet = this._condition(eventData.damageAmount, player, gameState); // Pass damage amount
                     break;
                 case 'onStatusAppliedToPlayer':
                     conditionMet = this._condition(eventData.status, player, gameState); // Pass status object
                     break;
                // Add more cases for other potential triggers
                default:
                    conditionMet = this._condition(player, gameState, eventData); // Generic fallback
            }
        } catch (error) {
            console.error(`Error evaluating condition for artifact ${this.name} on event ${eventName}:`, error);
            conditionMet = false; // Fail safe
        }


        // If the condition is met, execute the effect
        if (conditionMet) {
            try {
                 // Pass relevant data to the effect function
                 this._effect(player, gameState, eventData?.card || eventData?.status || eventData?.damageAmount || eventData); // Pass specific data if available
            } catch (error) {
                 console.error(`Error executing effect for artifact ${this.name} on event ${eventName}:`, error);
            }
        }
    }

    /**
     * Generates HTML for displaying the artifact (e.g., in UI).
     * @returns {string} HTML string representation.
     */
    getDisplayHtml() {
        return `
            <div class="artifact-display" data-artifact-id="${this.id}">
                <strong>${this.name}</strong> (${this.rarity})<br>
                <small>${this.description}</small>
            </div>
        `;
        // TODO: Add tooltip listener here or in UIManager when rendering
    }

} // End of Artifact class
