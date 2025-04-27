// js/combat/StatusEffects.js

/**
 * Defines the properties and potentially utility functions for status effects.
 * This acts as a registry or definition source for UI and potentially logic checks.
 */

export const STATUS_EFFECTS = {
    // --- Buffs ---
    'Strength': {
        id: 'Strength',
        name: 'Strength',
        type: 'buff',
        description: 'Increases Attack damage dealt by the amount.',
        icon: 'fa-solid fa-dumbbell',
        stacking: true, // Amount stacks
        durationBased: false, // Effect based on amount, duration typically 99 (combat long)
        persists: false // Does it last between combats? No.
    },
    'Dexterity': {
        id: 'Dexterity',
        name: 'Dexterity',
        type: 'buff',
        description: 'Increases Block gained by the amount.',
        icon: 'fa-solid fa-shield-halved',
        stacking: true,
        durationBased: false,
        persists: false
    },
    'Regen': {
        id: 'Regen',
        name: 'Regeneration',
        type: 'buff',
        description: 'At the end of your turn, heal Integrity equal to the amount.',
        icon: 'fa-solid fa-heart-pulse',
        stacking: true, // Amount stacks
        durationBased: true, // Duration also matters (ticks down)
        persists: false
    },
    'Intangible': {
        id: 'Intangible',
        name: 'Intangible',
        type: 'buff',
        description: 'Reduces all incoming Attack damage to 1. Fades at end of turn.',
        icon: 'fa-solid fa-ghost',
        stacking: false, // Duration might refresh, amount usually 1
        durationBased: true,
        persists: false // Typically lasts only 1 turn
    },
     'Metallicize': {
        id: 'Metallicize',
        name: 'Metallicize',
        type: 'buff',
        description: 'At the end of your turn, gain Block equal to the amount.',
        icon: 'fa-solid fa-cubes-stacked', // Changed icon
        stacking: true,
        durationBased: false, // Amount persists, duration likely permanent for combat (99)
        persists: false
    },
     'ProtocolActive': { // Example custom buff from D/s
         id: 'ProtocolActive',
         name: 'Protocol Active',
         type: 'buff',
         description: 'Enhances specific actions while active (e.g., increases Block gained).',
         icon: 'fa-solid fa-scroll',
         stacking: true, // Amount might increase effect
         durationBased: true, // Can have a duration or be permanent (99)
         persists: false
     },
     'FocusNextTurn': { // From Shadow Insight artifact
         id: 'FocusNextTurn',
         name: 'Focused',
         type: 'buff',
         description: 'Gain Focus equal to the amount at the start of your next turn.',
         icon: 'fa-solid fa-bolt-lightning',
         stacking: true, // Amount stacks
         durationBased: true, // Usually lasts 1 turn cycle (applied, triggers next turn, removed)
         persists: false
     },
     'TemporaryHP': { // For Stubborn Psyche artifact (Simplified Version)
         id: 'TemporaryHP',
         name: 'Temporary HP',
         type: 'buff',
         description: 'Increases maximum Integrity temporarily (effect removed end of combat).', // Actual HP buffing needs Player logic
         icon: 'fa-solid fa-heart-circle-plus',
         stacking: true, // Amount represents the HP buff
         durationBased: false, // Lasts until end of combat
         persists: false // Removed after combat
     },
     'MirrorShieldUsed': { // Internal flag for Mirror Shield artifact
          id: 'MirrorShieldUsed',
          name: 'Mirror Shield Used',
          type: 'internal', // Not displayed directly to player usually
          description: 'Internal flag: Mirror Shield artifact has triggered this combat.',
          icon: 'fa-solid fa-ban', // Hidden icon
          stacking: false,
          durationBased: false, // Lasts combat (duration 99)
          persists: false
     },
     // --- Example: Retain Status ---
      'Retain': {
           id: 'Retain',
           name: 'Retain',
           type: 'buff',
           description: 'This card is not discarded at the end of turn.',
           icon: 'fa-solid fa-hand-holding',
           stacking: false,
           durationBased: true, // Lasts until played or end of combat potentially
           persists: false
      },


    // --- Debuffs ---
    'Weak': {
        id: 'Weak',
        name: 'Weak',
        type: 'debuff',
        description: 'Deals 25% less Attack damage.',
        icon: 'fa-solid fa-hand-dots', // Using this for weak/less impact
        stacking: false, // Duration refreshes
        durationBased: true,
        persists: false
    },
    'Vulnerable': {
        id: 'Vulnerable',
        name: 'Vulnerable',
        type: 'debuff',
        description: 'Takes 50% more damage from Attacks.',
        icon: 'fa-solid fa-shield-slash', // Broken shield metaphor
        stacking: false,
        durationBased: true,
        persists: false
    },
    'Frail': {
        id: 'Frail',
        name: 'Frail',
        type: 'debuff',
        description: 'Gains 25% less Block.',
        icon: 'fa-solid fa-bone', // Brittle/Frail metaphor
        stacking: false,
        durationBased: true,
        persists: false
    },
    'Poison': {
        id: 'Poison',
        name: 'Poison',
        type: 'debuff',
        description: 'At the start of turn, takes damage equal to the amount, then amount decreases by 1.',
        icon: 'fa-solid fa-skull-crossbones',
        stacking: true, // Amount stacks
        durationBased: false, // Effect tied to amount, not turns directly
        persists: false
    },
    'Burn': {
         id: 'Burn',
         name: 'Burn',
         type: 'debuff',
         description: 'At the start of turn, takes damage equal to the amount.',
         icon: 'fa-solid fa-fire-flame-curved', // More dynamic fire icon
         stacking: true, // Amount can stack
         durationBased: true, // Duration ticks down
         persists: false
     },
    'Confusion': { // Example for status card effect
         id: 'Confusion',
         name: 'Confusion',
         type: 'debuff',
         description: 'At the start of turn, discard 1 random card.',
         icon: 'fa-solid fa-question',
         stacking: false,
         durationBased: true, // Usually lasts 1 turn
         persists: false
     },
     'Entangle': { // Example for increasing cost
         id: 'Entangle',
         name: 'Entangle',
         type: 'debuff',
         description: 'Increases the cost of cards played by the amount.',
         icon: 'fa-solid fa-link-slash',
         stacking: true, // Amount stacks (+1 cost per stack)
         durationBased: true,
         persists: false
     },
     'Stunned': { // Example for skipping turn
          id: 'Stunned',
          name: 'Stunned',
          type: 'debuff',
          description: 'Cannot perform actions for 1 turn.',
          icon: 'fa-solid fa-star-half-stroke', // Dizzy/Stunned icon
          stacking: false,
          durationBased: true, // Lasts 1 turn, removed after skipping action
          persists: false
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
