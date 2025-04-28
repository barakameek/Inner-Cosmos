// js/combat/StatusEffects.js

/**
 * Defines the properties and potentially utility functions for status effects.
 * This acts as a registry or definition source for UI and potentially logic checks.
 * Descriptions updated for richer tooltips.
 */

export const STATUS_EFFECTS = {
    // --- Buffs ---
    'Strength': {
        id: 'Strength',
        name: 'Strength',
        type: 'buff',
        description: 'Increases Attack damage dealt by the amount.', // Clear description
        icon: 'fa-solid fa-dumbbell',
        stacking: true, // Amount stacks
        durationBased: false, // Effect based on amount, duration typically 99 (combat long)
        persists: false, // Does it last between combats? No.
        valueType: 'damage', // Hints at what it affects for UI feedback
    },
    'Dexterity': {
        id: 'Dexterity',
        name: 'Dexterity',
        type: 'buff',
        description: 'Increases Block gained by the amount.', // Clear description
        icon: 'fa-solid fa-shield-halved',
        stacking: true,
        durationBased: false,
        persists: false,
        valueType: 'block', // Hints at what it affects
    },
    'Regen': {
        id: 'Regen',
        name: 'Regeneration',
        type: 'buff',
        description: 'At the end of your turn, heal Integrity equal to the amount.', // Clear description
        icon: 'fa-solid fa-heart-pulse',
        stacking: true, // Amount stacks
        durationBased: true, // Duration also matters (ticks down)
        persists: false,
        valueType: 'heal',
    },
    'Intangible': {
        id: 'Intangible',
        name: 'Intangible',
        type: 'buff',
        description: 'Reduces all incoming Attack damage to 1.', // Clear description
        icon: 'fa-solid fa-ghost',
        stacking: false, // Duration might refresh, amount usually 1
        durationBased: true,
        persists: false, // Typically lasts only 1 turn
        valueType: 'damageTaken',
    },
     'Metallicize': {
        id: 'Metallicize',
        name: 'Metallicize',
        type: 'buff',
        description: 'At the end of your turn, gain Block equal to the amount.', // Clear description
        icon: 'fa-solid fa-cubes-stacked', // Changed icon
        stacking: true,
        durationBased: false, // Amount persists, duration likely permanent for combat (99)
        persists: false,
        valueType: 'block',
    },
     'ProtocolActive': { // Example custom buff from D/s
         id: 'ProtocolActive',
         name: 'Protocol Active',
         type: 'buff',
         description: 'Enhances specific actions while active (e.g., increases Block gained by amount).', // Clarified
         icon: 'fa-solid fa-scroll',
         stacking: true, // Amount might increase effect
         durationBased: true, // Can have a duration or be permanent (99)
         persists: false,
         valueType: 'various', // Affects multiple things
     },
     'FocusNextTurn': { // From Shadow Insight artifact
         id: 'FocusNextTurn',
         name: 'Focused',
         type: 'buff',
         description: 'Gain Focus equal to the amount at the start of your next turn.', // Clear description
         icon: 'fa-solid fa-bolt-lightning',
         stacking: true, // Amount stacks
         durationBased: true, // Usually lasts 1 turn cycle (applied, triggers next turn, removed)
         persists: false,
         valueType: 'resource',
     },
     'TemporaryHP': { // For Stubborn Psyche artifact (Simplified Version)
         id: 'TemporaryHP',
         name: 'Temporary HP',
         type: 'buff',
         description: 'Increases maximum Integrity temporarily by the amount (effect removed end of combat).', // Updated description
         icon: 'fa-solid fa-heart-circle-plus',
         stacking: true, // Amount represents the HP buff
         durationBased: false, // Lasts until end of combat
         persists: false, // Removed after combat
         valueType: 'hp',
     },
     'MirrorShieldUsed': { // Internal flag for Mirror Shield artifact
          id: 'MirrorShieldUsed',
          name: 'Mirror Shield Used',
          type: 'internal', // Not displayed directly to player usually
          description: 'Internal flag: Mirror Shield artifact has triggered this combat.',
          icon: 'fa-solid fa-ban', // Hidden icon
          stacking: false,
          durationBased: false, // Lasts combat (duration 99)
          persists: false,
          valueType: 'flag',
     },
     // --- Example: Retain Status ---
      'Retain': {
           id: 'Retain',
           name: 'Retain',
           type: 'buff', // Could be internal if only on cards
           description: 'This card is not discarded at the end of turn.',
           icon: 'fa-solid fa-hand-holding',
           stacking: false,
           durationBased: true, // Lasts until played or end of combat potentially
           persists: false,
           valueType: 'card',
      },


    // --- Debuffs ---
    'Weak': {
        id: 'Weak',
        name: 'Weak',
        type: 'debuff',
        description: 'Deals 25% less damage with Attacks for the duration.', // Clarified duration impact
        icon: 'fa-solid fa-hand-dots', // Using this for weak/less impact
        stacking: false, // Duration refreshes
        durationBased: true,
        persists: false,
        valueType: 'damage',
    },
    'Vulnerable': {
        id: 'Vulnerable',
        name: 'Vulnerable',
        type: 'debuff',
        description: 'Takes 50% more damage from Attacks for the duration.', // Clarified duration impact
        icon: 'fa-solid fa-shield-slash', // Broken shield metaphor
        stacking: false,
        durationBased: true,
        persists: false,
        valueType: 'damageTaken',
    },
    'Frail': {
        id: 'Frail',
        name: 'Frail',
        type: 'debuff',
        description: 'Gains 25% less Block for the duration.', // Clarified duration impact
        icon: 'fa-solid fa-bone', // Brittle/Frail metaphor
        stacking: false,
        durationBased: true,
        persists: false,
        valueType: 'block',
    },
    'Poison': {
        id: 'Poison',
        name: 'Poison',
        type: 'debuff',
        description: 'At the start of turn, takes damage equal to the amount, then amount decreases by 1.', // Clear description
        icon: 'fa-solid fa-skull-crossbones',
        stacking: true, // Amount stacks
        durationBased: false, // Effect tied to amount, not turns directly
        persists: false,
        valueType: 'damageOverTime',
    },
    'Burn': {
         id: 'Burn',
         name: 'Burn',
         type: 'debuff',
         description: 'At the start of turn, takes damage equal to the amount. Duration decreases each turn.', // Clarified duration
         icon: 'fa-solid fa-fire-flame-curved', // More dynamic fire icon
         stacking: true, // Amount can stack
         durationBased: true, // Duration ticks down
         persists: false,
         valueType: 'damageOverTime',
     },
    'Confusion': { // Example for status card effect
         id: 'Confusion',
         name: 'Confusion',
         type: 'debuff',
         description: 'At the start of turn, discard 1 random card.', // Clear description
         icon: 'fa-solid fa-question',
         stacking: false,
         durationBased: true, // Usually lasts 1 turn
         persists: false,
         valueType: 'card',
     },
     'Entangle': { // Example for increasing cost
         id: 'Entangle',
         name: 'Entangle',
         type: 'debuff',
         description: 'Increases the cost of cards played by the amount for the duration.', // Clarified amount/duration
         icon: 'fa-solid fa-link-slash',
         stacking: true, // Amount stacks (+1 cost per stack)
         durationBased: true,
         persists: false,
         valueType: 'cost',
     },
     'Stunned': { // Example for skipping turn
          id: 'Stunned',
          name: 'Stunned',
          type: 'debuff',
          description: 'Cannot perform actions for the duration (usually 1 turn). Removed after skipping action.', // Clarified removal
          icon: 'fa-solid fa-star-half-stroke', // Dizzy/Stunned icon
          stacking: false,
          durationBased: true, // Lasts 1 turn, removed after skipping action
          persists: false,
          valueType: 'turn',
      },

    // Add more status effects as needed...
};

/**
 * Utility function to get status effect definition by ID.
 * @param {string} statusId - The ID of the status effect.
 * @returns {object | null} The status effect definition or null if not found.
 */
export function getStatusEffectDefinition(statusId) {
    return STATUS_EFFECTS[statusId] || null;
}

/**
 * Utility function to generate detailed tooltip text for an active status effect.
 * @param {object} activeEffect - The active status effect object { id, amount, duration, source }.
 * @returns {string} Formatted HTML string for the tooltip.
 */
export function getStatusTooltipHtml(activeEffect) {
    const definition = getStatusEffectDefinition(activeEffect.id);
    if (!definition) {
        return `<strong>Unknown Status: ${activeEffect.id}</strong><br>Data missing.`;
    }

    let html = `<div class="status-tooltip">`;
    html += `<div class="tooltip-header"><i class="${definition.icon || 'fa-solid fa-circle-question'}"></i> <strong>${definition.name}</strong> <em>(${definition.type})</em></div>`;
    html += `<hr>`;
    html += `<div class="tooltip-description">${definition.description}</div>`;

    // Current Effect & Duration/Stacks
    let currentEffect = "";
    if (definition.stacking && activeEffect.amount > 0) {
        switch(definition.id) {
            case 'Strength': currentEffect = `Currently: +${activeEffect.amount} Attack damage.`; break;
            case 'Dexterity': currentEffect = `Currently: +${activeEffect.amount} Block gain.`; break;
            case 'Regen': currentEffect = `Currently: Heals ${activeEffect.amount} at end of turn.`; break;
            case 'Metallicize': currentEffect = `Currently: Gains ${activeEffect.amount} Block at end of turn.`; break;
            case 'Poison': currentEffect = `Currently: Deals ${activeEffect.amount} damage at start of turn.`; break;
            case 'Burn': currentEffect = `Currently: Deals ${activeEffect.amount} damage at start of turn.`; break;
            case 'Entangle': currentEffect = `Currently: Card costs +${activeEffect.amount} Focus.`; break;
            case 'ProtocolActive': currentEffect = `Currently: Effect strength ${activeEffect.amount}.`; break; // Generic
            case 'FocusNextTurn': currentEffect = `Currently: Gain ${activeEffect.amount} Focus next turn.`; break;
            case 'TemporaryHP': currentEffect = `Currently: +${activeEffect.amount} Max HP.`; break;
            default: currentEffect = `Stacks: ${activeEffect.amount}.`; // Fallback for other stacking types
        }
    }

    let durationText = "";
    if (definition.durationBased && activeEffect.duration !== 99 && activeEffect.duration > 0) {
        durationText = `Duration: ${activeEffect.duration} turn${activeEffect.duration > 1 ? 's' : ''}.`;
    } else if (definition.durationBased && activeEffect.duration === 99) {
        durationText = `Duration: Permanent (Combat).`;
    } else if (!definition.durationBased && definition.stacking) {
        // Duration is tied to amount, like Poison
        durationText = `Ends when stacks reach 0.`;
    }

    if (currentEffect || durationText) {
        html += `<hr>`;
        if (currentEffect) html += `<div class="tooltip-current-effect">${currentEffect}</div>`;
        if (durationText) html += `<div class="tooltip-duration">${durationText}</div>`;
    }

    // Optional Source
    // if (activeEffect.source && activeEffect.source !== 'Unknown') {
    //     html += `<div class="tooltip-source"><em>Source: ${activeEffect.source}</em></div>`;
    // }

    html += `</div>`;
    return html;
}
