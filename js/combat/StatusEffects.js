// js/combat/StatusEffects.js

/**
 * Defines the properties and potentially utility functions for status effects.
 * This acts as a registry or definition source.
 */

export const STATUS_EFFECTS = {
    // --- Buffs ---
    'Strength': {
        id: 'Strength',
        name: 'Strength',
        type: 'buff',
        description: 'Increases Attack damage dealt by the amount.',
        icon: 'fa-solid fa-dumbbell', // Font Awesome class example
        stacking: true, // Amount stacks
        durationBased: false, // Effect based on amount, duration often pseudo-permanent (99)
        persists: false // Does it last between combats? Usually no.
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
        description: 'At the end of turn, heal Integrity equal to the amount.',
        icon: 'fa-solid fa-heart-pulse',
        stacking: true, // Amount stacks
        durationBased: true, // Duration also matters
        persists: false
    },
    'Intangible': {
        id: 'Intangible',
        name: 'Intangible',
        type: 'buff',
        description: 'Reduces all incoming Attack damage to 1 for the duration.',
        icon: 'fa-solid fa-ghost',
        stacking: false, // Usually doesn't stack amount, duration might refresh
        durationBased: true,
        persists: false // Typically lasts only 1 turn
    },
     'Metallicize': {
        id: 'Metallicize',
        name: 'Metallicize',
        type: 'buff',
        description: 'At the end of turn, gain Block equal to the amount.',
        icon: 'fa-solid fa-industry', // Example icon
        stacking: true,
        durationBased: false, // Amount persists, duration likely permanent for combat (99)
        persists: false
    },
     'ProtocolActive': { // Example custom buff
         id: 'ProtocolActive',
         name: 'Protocol Active',
         type: 'buff',
         description: 'Enhances specific actions while active. Increases Block gained.',
         icon: 'fa-solid fa-scroll',
         stacking: true, // Amount might increase effect
         durationBased: true, // Can have a duration or be permanent (99)
         persists: false
     },
     'FocusNextTurn': { // From artifact example
         id: 'FocusNextTurn',
         name: 'Focused',
         type: 'buff',
         description: 'Gain Focus equal to the amount at the start of your next turn.',
         icon: 'fa-solid fa-bolt-lightning',
         stacking: true,
         durationBased: true, // Usually lasts 1 turn
         persists: false
     },
     'TempMaxHP': { // Complex status example
         id: 'TempMaxHP',
         name: 'Temporary Vitality',
         type: 'buff',
         description: 'Temporarily increases Max Integrity by the amount for this combat.',
         icon: 'fa-solid fa-heart-circle-plus',
         stacking: true,
         durationBased: false, // Lasts until end of combat
         persists: false
     },


    // --- Debuffs ---
    'Weak': {
        id: 'Weak',
        name: 'Weak',
        type: 'debuff',
        description: 'Deals 25% less Attack damage for the duration.',
        icon: 'fa-solid fa-hand-dots', // Example icon
        stacking: false, // Duration refreshes, amount usually irrelevant (just presence)
        durationBased: true,
        persists: false
    },
    'Vulnerable': {
        id: 'Vulnerable',
        name: 'Vulnerable',
        type: 'debuff',
        description: 'Takes 50% more damage from Attacks for the duration.',
        icon: 'fa-solid fa-heart-crack',
        stacking: false,
        durationBased: true,
        persists: false
    },
    'Frail': {
        id: 'Frail',
        name: 'Frail',
        type: 'debuff',
        description: 'Gains 25% less Block for the duration.',
        icon: 'fa-solid fa-shield-slash', // Custom concept - requires icon
        stacking: false,
        durationBased: true,
        persists: false
    },
    'Poison': {
        id: 'Poison',
        name: 'Poison',
        type: 'debuff',
        description: 'At the start of turn, takes damage equal to the amount, then decreases amount by 1.',
        icon: 'fa-solid fa-skull-crossbones',
        stacking: true, // Amount stacks
        durationBased: false, // Effect based on amount, not turns directly
        persists: false
    },
    'Burn': {
         id: 'Burn',
         name: 'Burn',
         type: 'debuff',
         description: 'At the start of turn, takes damage equal to the amount.',
         icon: 'fa-solid fa-fire',
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
         icon: 'fa-solid fa-link-slash', // Custom concept
         stacking: true, // Amount stacks
         durationBased: true,
         persists: false
     },
     'Stunned': { // Example for skipping turn
          id: 'Stunned',
          name: 'Stunned',
          type: 'debuff',
          description: 'Cannot perform actions for 1 turn.',
          icon: 'fa-solid fa-star-half-stroke', // Example icon
          stacking: false,
          durationBased: true, // Lasts 1 turn, removed after skipping
          persists: false
      },

    // Add more status effects as needed...
};

/**
 * Optional: Utility function to get status effect definition.
 * @param {string} statusId - The ID of the status effect.
 * @returns {object | null} The status effect definition or null if not found.
 */
export function getStatusEffectDefinition(statusId) {
    return STATUS_EFFECTS[statusId] || null;
}

// Optional: Functions to calculate modified damage/block based on statuses
// These are currently implemented within Player/Enemy applyModifiers, but could be centralized here.
/*
export function calculateModifiedDamage(baseDamage, activeStatuses) {
    let modified = baseDamage;
    if (activeStatuses.some(s => s.id === 'Weak')) modified = Math.floor(modified * 0.75);
    if (activeStatuses.some(s => s.id === 'Strength')) {
        const str = activeStatuses.find(s => s.id === 'Strength');
        modified += str?.amount || 0;
    }
    return Math.max(0, modified);
}
*/
