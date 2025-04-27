// js/data.js - Core Game Data for Persona Labyrinth Roguelite (v5.0 - Roguelite Overhaul - Part 1)

console.log("data.js loading... (v5.0 - Roguelite Overhaul)");

// --- Element Definitions (Trimmed for Roguelite Focus) ---
// Descriptions shortened for potential in-game codex/tooltips. Score interpretations removed.
const elementDetails = {
    "Attraction": { // Key: A
        name: "Attraction",
        coreQuestion: "Who or what sparks your initial desire?",
        coreConcept: "Your 'Desire Compass,' reacting to people, vibes, ideas, or aesthetics. It defines the 'who' or 'what' that initiates intrigue. Covers orientation, specific types, and demisexuality/asexuality.",
        // elaboration: "...", // Removed for brevity, could be added to a Codex later
        examples: "Orientation (Straight, Gay, Bi, Pan, Ace, Demi), Sapiosexuality, Fetishes (Latex, Uniforms), Body Type preferences, Vibe/Energy.",
        // scoreInterpretations removed
    },
    "Interaction": { // Key: I
        name: "Interaction",
        coreQuestion: "How do you engage in the energetic dance of intimacy?",
        coreConcept: "The flow of energy and control between partners. Includes leading/following, giving/receiving, specific interaction styles (e.g., teasing, commanding), and communication within the dynamic.",
        examples: "Leading/Following, Top/Bottom/Versatile, Teasing, Commanding, Service, Communication Style, Primal Play.",
    },
    "Sensory": { // Key: S
        name: "Sensory",
        coreQuestion: "What physical sensations resonate most strongly?",
        coreConcept: "Your 'Feeling Finder,' tuning into physical input. Covers quality of touch, temperature, texture, pressure, intensity, pain/pleasure spectrum, and influence of sight/sound/smell.",
        examples: "Gentle Touch, Firm Grip, Impact (Spanking/Flogging), Temperature (Wax/Ice), Textures (Latex/Silk/Rope), Bondage, Scents, Sounds.",
    },
    "Psychological": { // Key: P
        name: "Psychological",
        coreQuestion: "What deeper 'why' fuels your intimate connections?",
        coreConcept: "The core motivations and emotional quests behind intimacy. Includes seeking connection, exploring power, self-expression, validation, stress relief, catharsis, or comfort/safety.",
        examples: "Seeking Connection, Power Exchange (Emotional Core), Validation Needs, Stress Relief, Catharsis, Vulnerability, Trust Building, Comfort/Security.",
    },
    "Cognitive": { // Key: C
        name: "Cognitive",
        coreQuestion: "How much does your mind shape the experience?",
        coreConcept: "Your 'Mind Palace' engagement. Measures mental involvement: fantasy, scenarios, strategy, analysis, wordplay, or focus on abstract concepts versus pure presence.",
        examples: "Fantasy Immersion, Role-Playing, Dirty Talk, Banter, Strategy/Mind Games, Anticipation, Ritual/Protocol Focus, Presence/Mindfulness.",
    },
    "Relational": { // Key: R
        name: "Relational",
        coreQuestion: "What relationship structure feels most authentic?",
        coreConcept: "Your preferred 'Constellation' for intimacy. Defines comfort with number of partners, commitment levels, and relationship styles (monogamy, polyamory, casual, etc.).",
        examples: "Monogamy, Polyamory, Open Relationships, Swinging, Casual Sex, Hookups, Solo Polyamory, Relationship Anarchy, Platonic Partnerships.",
    },
    "RoleFocus": { // Key: RF
        name: "RoleFocus",
        coreQuestion: "How important are defined D/s roles to your satisfaction?",
        coreConcept: "The 'Intensity Dial' for power dynamics. Measures the *salience* of Dominant/submissive/Switch roles versus other factors. High scores indicate roles are central; low scores suggest egalitarian preference.",
        examples: "Preference for D/s, Indifference to Roles, Egalitarian Focus, Needing Specific Role (Dom/Sub/Switch), Enjoying Power Exchange Intensity.",
    }
};

// --- Utility Maps & Arrays (Includes RoleFocus) ---
const elementKeyToFullName = { A: "Attraction", I: "Interaction", S: "Sensory", P: "Psychological", C: "Cognitive", R: "Relational", RF: "RoleFocus" };
// Refined Card Types for clarity in Roguelite context
const cardTypeKeys = ["Attack", "Skill", "Power", "Status", "Curse"]; // Simplified from Lab version
const elementNames = ["Attraction", "Interaction", "Sensory", "Psychological", "Cognitive", "Relational", "RoleFocus"]; // Used for ordering etc.

// --- Concepts Data (Mapped to Cards) ---
// Rarity: 'starter', 'common', 'uncommon', 'rare', 'special' (for curses/status)
// Keywords: Standardized for gameplay (Attack, Block, Draw, Exhaust, Ethereal, Retain, Debuff, Buff, AOE, Unplayable, etc.) + Thematic (Simple, Intensity, Control, etc.)
// briefDescription: Short text for card display.
// detailedDescription: Longer text for tooltip/expanded view.
// elementScores: Drive dynamic generation in Card.js. RF score added.
// primaryElement: Used for potential resonance effects.
const concepts = [
    // --- STARTER CARDS ---
    {
        id: 10001, // Unique ID for Starter Strike
        name: "Basic Strike",
        cardType: "Attack", // Clearly an Attack
        visualHandle: "starter_strike.png",
        primaryElement: "I", // Interaction - basic assertion
        elementScores: { A: 2, I: 5, S: 4, P: 1, C: 1, R: 1, RF: 2 }, // Low scores, I focused
        briefDescription: "Deal 6 damage.", // Effects calculated by Card.js based on scores/keywords
        detailedDescription: "A simple, direct assertion of intent or force. Deals minor physical or metaphorical damage.",
        relatedIds: [10002],
        rarity: 'starter',
        keywords: ['Attack', 'Simple'],
        lore: [ { level: 1, insightCost: 0, text: "The first step: Direct assertion.", unlocked: true } ] // Free lore
    },
    {
        id: 10002, // Unique ID for Starter Defend
        name: "Basic Defend",
        cardType: "Skill", // Clearly a Skill
        visualHandle: "starter_defend.png",
        primaryElement: "P", // Psychological - bracing oneself
        elementScores: { A: 1, I: 2, S: 3, P: 5, C: 2, R: 2, RF: 1 }, // Low scores, P focused
        briefDescription: "Gain 5 Block.", // Effects calculated by Card.js
        detailedDescription: "Bracing oneself, creating a small buffer against incoming negativity or impact.",
        relatedIds: [10001],
        rarity: 'starter',
        keywords: ['Block', 'Simple'],
        lore: [ { level: 1, insightCost: 0, text: "The shield raised: Basic protection.", unlocked: true } ] // Free lore
    },
     {
        id: 10003, // Example Starter - Minor Buff/Utility
        name: "Moment's Clarity",
        cardType: "Skill",
        visualHandle: "starter_clarity.png", // Placeholder
        primaryElement: "C", // Cognitive
        elementScores: { A: 1, I: 1, S: 1, P: 3, C: 5, R: 1, RF: 1 },
        briefDescription: "Draw 1 card.", // Calculated effect
        detailedDescription: "A brief flash of insight, allowing you to grasp another thought or potential action.",
        relatedIds: [10001, 10002],
        rarity: 'starter',
        keywords: ['Draw', 'Simple'],
        lore: [ { level: 1, insightCost: 0, text: "A fleeting thought, grasped.", unlocked: true } ]
    },

    // --- STATUS / CURSE CARDS --- (Needed for mechanics)
    {
        id: 20001,
        name: "Static", // Generic unplayable card added by some effects
        cardType: "Status",
        visualHandle: "status_static.png", // Placeholder art
        primaryElement: null, // Neutral
        elementScores: {},
        briefDescription: "Unplayable.",
        detailedDescription: "Represents mental noise or interference. Cannot be played.",
        relatedIds: [],
        rarity: 'special',
        keywords: ['Unplayable'], // Core keyword
        lore: []
    },
    {
        id: 20002,
        name: "Dazed", // Common status added to deck
        cardType: "Status",
        visualHandle: "status_dazed.png", // Placeholder art
        primaryElement: null,
        elementScores: {},
        briefDescription: "Unplayable. Ethereal.", // Disappears end of turn if not drawn/discarded
        detailedDescription: "A temporary state of disorientation. Cannot be played and vanishes at end of turn.",
        relatedIds: [],
        rarity: 'special',
        keywords: ['Unplayable', 'Ethereal'], // Core keywords
        lore: []
    },
    {
        id: 20003,
        name: "Heavy Heart", // Example Curse
        cardType: "Curse",
        visualHandle: "curse_heavy_heart.png", // Placeholder art
        primaryElement: null,
        elementScores: {},
        briefDescription: "Unplayable.", // Passive effect handled elsewhere
        detailedDescription: "A persistent burden. Cannot be played. Reduces Focus gained while in hand (Requires specific game logic).",
        relatedIds: [],
        rarity: 'special',
        keywords: ['Unplayable', 'Curse'], // Core keywords
        // Passive effect needs specific handling in Player logic based on presence in hand
        lore: []
    },


    // --- REGULAR CONCEPTS (Mapped to Roguelite Cards) ---
    // Descriptions revised for brevity. Keywords aligned with game mechanics.
    // Effects are *examples* of what Card.js *should* calculate based on scores/keywords.
    // Lore remains. RF score added.
    {
        id: 1, name: "Vanilla Sex", cardType: "Attack", visualHandle: "common_vanilla.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 5, S: 3, P: 4, C: 3, R: 4, RF: 1 },
        briefDescription: "Deal 6 damage.", // Simple damage
        detailedDescription: "Widely accepted intimate actions. Comfortable baseline.",
        relatedIds: [2, 3, 33, 67, 71], rarity: 'common', keywords: ['Attack', 'Simple', 'Familiar'],
        lore: [
            { level: 1, insightCost: 3, text: "Foundation Stone: The common ground language learned before exploring personalized dialects.", unlocked: false },
            { level: 2, insightCost: 7, text: "Comfort's Embrace: Its familiarity offers predictability and a sense of shared 'normalcy'.", unlocked: false },
            { level: 3, insightCost: 12, text: "Hidden Depths: Subtle shifts in presence [P] or sensory focus [S] transform the experience.", unlocked: false}
        ]
    },
    {
        id: 2, name: "Sensual Touch", cardType: "Skill", visualHandle: "common_sensual_touch.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 4, S: 4, P: 5, C: 2, R: 4, RF: 2 },
        briefDescription: "Gain 5 Block. Heal 1.", // Block + minor heal
        detailedDescription: "Gentle, deliberate, mindful touch focused on connection and sensation.",
        relatedIds: [1, 15, 31, 3, 80, 102, 48], rarity: 'common', keywords: ['Block', 'Heal', 'Gentle', 'Comfort'],
        lore: [
            { level: 1, insightCost: 3, text: "Whispers on Skin: Communicates care and presence beyond words.", unlocked: false },
            { level: 2, insightCost: 7, text: "Mindful Moment: Focusing purely on touch can ground and heighten sensitivity.", unlocked: false },
            { level: 3, insightCost: 12, text: "Foundation of Trust: Gentle, attuned touch builds safety [P] crucial for exploration.", unlocked: false}
        ]
    },
     {
        id: 3, name: "Passionate Kissing", cardType: "Attack", visualHandle: "common_kissing.jpg", primaryElement: "S",
        elementScores: { A: 6, I: 5, S: 5, P: 6, C: 3, R: 5, RF: 3 },
        briefDescription: "Deal 4 damage. Apply 1 Weak.", // Minor damage + debuff
        detailedDescription: "Deep engagement conveying desire or intensity. Blends sensation [S] and connection [P].",
        relatedIds: [1, 2, 15, 47, 66, 85], rarity: 'common', keywords: ['Attack', 'Debuff', 'Weak', 'Intensity'],
        lore: [
            { level: 1, insightCost: 3, text: "The First Spark: Often the gateway to deeper intimacy, setting the tone.", unlocked: false },
            { level: 2, insightCost: 7, text: "Dialogue of Lips: Can communicate desire, urgency, or tenderness without words.", unlocked: false },
            { level: 3, insightCost: 12, text: "Taste of Chemistry: The close exchange creates a unique sensory [S] feedback loop.", unlocked: false}
        ]
    },
    {
        id: 4, name: "Dominance (Psych)", cardType: "Power", visualHandle: "uncommon_dom_art.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 9, S: 5, P: 8, C: 7, R: 6, RF: 9 },
        briefDescription: "Start of turn: Apply 1 Vulnerable to a random enemy.", // Example power effect
        detailedDescription: "Embodying authority or leadership. Taking charge energetically or mentally.",
        relatedIds: [5, 6, 11, 30, 38, 81, 89, 90, 100, 104, 109, 123, 131, 137, 139], rarity: 'uncommon', keywords: ['Power', 'Control', 'Debuff', 'Vulnerable', 'Exhaust'], // Powers often exhaust
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Fragment: The mind, a powerful instrument...", unlocked: false }, { level: 2, insightCost: 7, text: "Alchemist's Query: Is true dominance about will, presence, or understanding?", unlocked: false }, { level: 3, insightCost: 15, text: "The Weight of Responsibility: Ethical dominance requires care and honoring trust.", unlocked: false } ]
    },
    {
        id: 5, name: "Submission (Psych)", cardType: "Power", visualHandle: "uncommon_sub_art.jpg", primaryElement: "P", // Psychological focus
        elementScores: { A: 6, I: 1, S: 5, P: 8, C: 5, R: 6, RF: 9 },
        briefDescription: "Start of turn: If taking unblocked damage last turn, gain 3 Block.", // Example power effect
        detailedDescription: "Finding joy or release in willingly yielding control, mentally or energetically.",
        relatedIds: [4, 6, 17, 10, 12, 37, 39, 58, 61, 63, 87, 91, 98, 99, 109, 119, 123, 132], rarity: 'uncommon', keywords: ['Power', 'Surrender', 'Block', 'Exhaust'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Reflection: In yielding, profound strength or liberation is found.", unlocked: false }, { level: 2, insightCost: 7, text: "Observation: Trust [P] is the essential currency here.", unlocked: false }, { level: 3, insightCost: 15, text: "Active Choice, Not Weakness: A courageous choice to explore vulnerability.", unlocked: false } ]
    },
    {
        id: 6, name: "Switching", cardType: "Power", visualHandle: "uncommon_switch.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 5, S: 6, P: 7, C: 6, R: 6, RF: 8 },
        briefDescription: "Start of turn: Gain 1 Strength and 1 Dexterity for this turn.", // Example power effect
        detailedDescription: "Delighting in fluidity, comfortably embodying both Dominant and submissive energies.",
        relatedIds: [4, 5, 89], rarity: 'uncommon', keywords: ['Power', 'Fluidity', 'Buff', 'Strength', 'Dexterity', 'Exhaust'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Maxim: 'Know both sides of the coin...'", unlocked: false }, { level: 2, insightCost: 7, text: "Dynamic Note: The *shift* itself can be erotically energizing.", unlocked: false }, { level: 3, insightCost: 15, text: "Requires Communication: Often necessitates clear communication about desires.", unlocked: false } ]
    },
    {
        id: 7, name: "Impact Play (Light)", cardType: "Attack", visualHandle: "uncommon_impact_light.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 6, S: 6, P: 5, C: 4, R: 5, RF: 6 },
        briefDescription: "Deal 4 damage. Apply 1 Vulnerable.", // Damage + Setup debuff
        detailedDescription: "Playful spanking or gentle slapping. Focus on rhythmic sensation [S] or establishing control [I].",
        relatedIds: [8, 9, 4, 5, 40, 57, 93, 96, 97, 139], rarity: 'uncommon', keywords: ['Attack', 'Impact', 'Debuff', 'Vulnerable', 'Playful'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Sensory Note: A light sting as a wake-up call.", unlocked: false }, { level: 2, insightCost: 7, text: "Rhythm Focus: The *cadence* can be hypnotic or playful.", unlocked: false }, { level: 3, insightCost: 15, text: "Gateway to Intensity: Often an entry point to heavier impact [8] or pain [9].", unlocked: false } ]
    },
     {
        id: 8, name: "Impact Play (Heavy)", cardType: "Attack", visualHandle: "rare_impact_heavy.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 7, S: 9, P: 7, C: 4, R: 6, RF: 8 },
        briefDescription: "Deal 12 damage. Apply 1 Weak.", // High damage + minor debuff
        detailedDescription: "Intense impact using canes, whips, heavy paddles. Tests limits [P], leaves marks [97], involves power [I] or catharsis.",
        relatedIds: [7, 9, 4, 5, 44, 97, 110, 128, 135, 138, 139], rarity: 'rare', keywords: ['Attack', 'Impact', 'Intensity', 'Pain', 'Debuff', 'Weak'], // Add Pain keyword?
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 8, text: "Alchemist's Journal: 'The resonance lingers... echo of pain, or clearing of energy?'", unlocked: false }, { level: 2, insightCost: 16, text: "Scrawled Note: 'The mark as proof... of endurance, trust, being *truly* affected.'", unlocked: false }, { level: 3, insightCost: 25, text: "Requires Skill & Calibration: Delivering heavy impact safely requires skill and communication.", unlocked: false } ]
    },
    {
        id: 9, name: "Sensation Play (Pain/Intensity Focus)", cardType: "Skill", // Often setup/utility rather than direct attack
        visualHandle: "rare_pain.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 6, S: 8, P: 7, C: 5, R: 6, RF: 8 },
        briefDescription: "Apply 2 Vulnerable. Gain 1 Focus.", // Setup Debuff + resource gain
        detailedDescription: "Exploring intense sensations beyond impact: pinching, biting [97], temperature [88], clamps, electrostim [112]. Focuses on pain/pleasure edge [S/P].",
        relatedIds: [7, 8, 16, 17, 37, 44, 63, 88, 96, 97, 110, 111, 112, 106, 124, 128, 135], rarity: 'rare', keywords: ['Skill', 'Debuff', 'Vulnerable', 'Focus', 'Intensity', 'Pain'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 8, text: "Fragment: '...not blunt force, but sharp focus... a meditation through fire.'", unlocked: false }, { level: 2, insightCost: 16, text: "Herbalist's Wisdom: 'Like potent herbs... handle with knowledge.' Requires control [I].", unlocked: false }, { level: 3, insightCost: 25, text: "Psychological Landscape: Tied to limits, endurance, focus, trust, altered states [P/C].", unlocked: false } ]
    },
    {
        id: 10, name: "Service Submission", cardType: "Skill", visualHandle: "uncommon_service.jpg", primaryElement: "I", // Interaction - performing service
        elementScores: { A: 5, I: 2, S: 4, P: 7, C: 4, R: 6, RF: 8 },
        briefDescription: "Gain 6 Block. Next turn, gain 1 Focus.", // Defensive + delayed resource
        detailedDescription: "Submission [5] where fulfillment comes from performing acts of service. Driven by devotion or desire to please [I/P].",
        relatedIds: [5, 4, 11, 58, 61, 98, 109, 46, 132], rarity: 'uncommon', keywords: ['Skill', 'Block', 'Focus', 'Service', 'Submission'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Devotional Echo: 'My purpose is found in fulfilling your need.'", unlocked: false }, { level: 2, insightCost: 7, text: "Observation: Service elevates the Dom [4] while grounding the Sub [5] in purpose.", unlocked: false }, { level: 3, insightCost: 15, text: "Requires Clear Expectations: Works best when tasks are clearly defined.", unlocked: false } ]
    },
    {
        id: 11, name: "Command / Control Dynamics", cardType: "Power", visualHandle: "rare_control.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 9, S: 5, P: 8, C: 8, R: 6, RF: 10 },
        briefDescription: "Start of Turn: Gain 1 Focus. Attacks deal +2 damage this turn.", // Example Power
        detailedDescription: "Dynamic thriving on explicit instructions and willing obedience [I/P/C]. Power exchange manifest.",
        relatedIds: [4, 5, 10, 30, 38, 45, 41, 89, 90, 100, 101, 109, 119, 120, 131, 132, 136], rarity: 'rare', keywords: ['Power', 'Control', 'Command', 'Focus', 'Buff', 'Exhaust'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 9, text: "Tattered Scroll: 'The voice that commands shapes reality...'", unlocked: false }, { level: 2, insightCost: 18, text: "Alchemist's Query: Is the thrill in certainty, surrender, or shared focus?", unlocked: false }, { level: 3, insightCost: 28, text: "Foundation of Trust: Requires absolute trust that commands are ethical.", unlocked: false } ]
    },
     {
        id: 12, name: "Objectification Play", cardType: "Skill", visualHandle: "rare_object.jpg", primaryElement: "P", // Psych focus
        elementScores: { A: 7, I: 4, S: 6, P: 8, C: 6, R: 5, RF: 8 },
        briefDescription: "Target loses 2 Strength. Gain 8 Block.", // Debuff + Block
        detailedDescription: "Consensual dynamic treating someone like an object for use/display [I/P]. Explores dehumanization, utility, focus.",
        relatedIds: [4, 5, 20, 18, 19, 45, 61, 42, 62, 114], rarity: 'rare', keywords: ['Skill', 'Debuff', 'Strength', 'Block', 'Objectification', 'Control'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 8, text: "Philosophical Fragment: 'To be reduced, consensually... strangely liberating.'", unlocked: false }, { level: 2, insightCost: 16, text: "Warning Label: Requires meticulous negotiation. Line between play and harm is consent.", unlocked: false }, { level: 3, insightCost: 25, text: "Can Be Both Ways: One can enjoy objectifying or being objectified.", unlocked: false } ]
    },
    {
        id: 13, name: "Role-Playing (Scenario)", cardType: "Skill", visualHandle: "uncommon_roleplay.jpg", primaryElement: "C",
        elementScores: { A: 6, I: 6, S: 5, P: 6, C: 8, R: 6, RF: 5 },
        briefDescription: "Gain 1 Focus. Draw 2 cards.", // Resource + Draw
        detailedDescription: "Adopting specific characters or personas in a defined scenario (doctor/patient [43]). Engages cognitive [C] and interactional [I] elements.",
        relatedIds: [14, 30, 21, 39, 64, 92, 98, 101, 117, 121, 43], rarity: 'uncommon', keywords: ['Skill', 'Focus', 'Draw', 'RolePlay', 'Cognitive'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Actor's Insight: Allows exploration of hidden desires or facets of self.", unlocked: false }, { level: 2, insightCost: 7, text: "Narrative Power: The scenario dictates rules, creating a world for exploration.", unlocked: false }, { level: 3, insightCost: 15, text: "Improvisation vs. Script: Ranges from loose play to detailed scripts.", unlocked: false } ]
    },
    {
        id: 14, name: "Fantasy Immersion", cardType: "Power", visualHandle: "rare_fantasy.jpg", primaryElement: "C",
        elementScores: { A: 5, I: 3, S: 4, P: 7, C: 9, R: 3, RF: 3 },
        briefDescription: "At the start of your turn, gain 5 Block if your hand is full.", // Conditional defensive power
        detailedDescription: "Imagination is the main stage! Lost in complex internal fantasy worlds [C/P]. Physical reality may be secondary.",
        relatedIds: [13, 29, 41, 42, 49], rarity: 'rare', keywords: ['Power', 'Fantasy', 'Cognitive', 'Block', 'Conditional', 'Exhaust'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 9, text: "Dream Journal: 'The world outside faded. Only the story mattered.'", unlocked: false }, { level: 2, insightCost: 18, text: "Mapmaker's Note: Building intricate worlds, arousal in details.", unlocked: false }, { level: 3, insightCost: 28, text: "Can Be Shared or Solo: Can be personal or shared via language [49].", unlocked: false } ]
    },
     {
        id: 15, name: "Deep Emotional Intimacy", cardType: "Power", // Changed to Power for persistent effect
        visualHandle: "uncommon_intimacy_art.jpg", primaryElement: "P",
        elementScores: { A: 7, I: 5, S: 4, P: 9, C: 5, R: 7, RF: 2 },
        briefDescription: "At the end of your turn, gain 2 Regen.", // Persistent healing effect
        detailedDescription: "Sex as a pathway to profound emotional closeness, vulnerability, and understanding [P]. Focus on forging deep bonds [R].",
        relatedIds: [2, 3, 22, 29, 47, 58, 68, 70, 75, 76, 82, 83, 123, 59, 69, 80], rarity: 'uncommon', keywords: ['Power', 'Heal', 'Regen', 'Connection', 'Exhaust'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Vulnerability as Strength: Sharing deep feelings builds profound trust.", unlocked: false }, { level: 2, insightCost: 7, text: "Soul Gazing: Feeling truly 'seen' is a powerful psychological reward.", unlocked: false }, { level: 3, insightCost: 15, text: "Foundation for Exploration: Deep trust creates safety for exploring kinks.", unlocked: false } ]
    },
    {
        id: 16, name: "Rope Bondage (Shibari/Kinbaku)", cardType: "Skill", visualHandle: "rare_rope.jpg", primaryElement: "S",
        elementScores: { A: 6, I: 7, S: 8, P: 7, C: 6, R: 6, RF: 8 },
        briefDescription: "Apply 2 Weak and 2 Frail to target enemy.", // Heavy debuff skill
        detailedDescription: "Functional art using rope for intricate patterns, pressure, restriction [17]. Explores unique mental [P] and physical [S] states.",
        relatedIds: [9, 17, 4, 5, 44, 87, 101, 113, 130, 134], rarity: 'rare', keywords: ['Skill', 'Debuff', 'Weak', 'Frail', 'Control', 'Restriction'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 8, text: "Rigger's Maxim: 'The rope only holds what the mind allows.' Trust [15] is the first knot.", unlocked: false }, { level: 2, insightCost: 16, text: "Historical Note: Evolved from samurai restraint (hojojutsu) into an art form.", unlocked: false }, { level: 3, insightCost: 25, text: "Energetic Exchange: Intense focus can create a shared meditative state.", unlocked: false } ]
    },
     {
        id: 17, name: "Restriction / Helplessness", cardType: "Skill", visualHandle: "rare_restrict.jpg", primaryElement: "P",
        elementScores: { A: 5, I: 3, S: 7, P: 9, C: 5, R: 5, RF: 8 },
        briefDescription: "Gain 12 Block. Cannot be targeted by enemies next turn.", // Defensive + Evasion (needs mechanic)
        detailedDescription: "Arousal [P] from the psychological feeling of physical restraint (ropes [16], cuffs [87]) and resulting helplessness/surrender [5].",
        relatedIds: [16, 5, 9, 37, 44, 63, 64, 87, 99, 113, 117, 118, 125, 43, 134], rarity: 'rare', keywords: ['Skill', 'Block', 'Evasion', 'Helplessness', 'Surrender', 'Exhaust'], // Evasion might need keyword/status
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 8, text: "Inner Monologue: '...can't move...just *be*... just receive...'", unlocked: false }, { level: 2, insightCost: 16, text: "Philosopher's Query: Appeal in removed responsibility, heightened focus [S], or vulnerability [P]?", unlocked: false }, { level: 3, insightCost: 25, text: "Requires Deep Trust: Feeling safe enough to embrace helplessness requires immense faith.", unlocked: false } ]
    },
    {
        id: 18, name: "Exhibitionism", cardType: "Skill", // Changed from Identity/Role
        visualHandle: "uncommon_exhibit.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 7, S: 5, P: 7, C: 6, R: 5, RF: 5 },
        briefDescription: "Deal 3 damage to ALL enemies. Gain 1 Strength.", // AOE + Buff
        detailedDescription: "Arousal from being watched during intimate moments [I/P]. Stems from vulnerability, performance, or potential validation [50].",
        relatedIds: [19, 12, 34, 50, 78, 90, 91, 105, 33], rarity: 'uncommon', keywords: ['Attack', 'AOE', 'Buff', 'Strength', 'Performance', 'Exhibitionist'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Performer's Thrill: The gaze transforms the act, adding vulnerability and excitement.", unlocked: false }, { level: 2, insightCost: 7, text: "Mirror Effect: Seeing oneself being seen amplifies intensity.", unlocked: false }, { level: 3, insightCost: 15, text: "Consent is Key: Non-consensual exhibitionism is harmful; play requires clear agreement.", unlocked: false } ]
    },
    {
        id: 19, name: "Voyeurism", cardType: "Skill", // Changed from Identity/Role
        visualHandle: "uncommon_voyeur.jpg", primaryElement: "A",
        elementScores: { A: 7, I: 2, S: 3, P: 6, C: 5, R: 3, RF: 2 },
        briefDescription: "Gain 5 Block. Draw 1 card.", // Utility/Defense
        detailedDescription: "Arousal [A] from watching others engage sexually, often without participating [Low I]. Secrecy or detachment can be part of the appeal [P/C].",
        relatedIds: [18, 12, 34, 105, 118, 33], rarity: 'uncommon', keywords: ['Skill', 'Block', 'Draw', 'Observation', 'Voyeur'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 3, text: "Observer's Paradox: Unique charge in witnessing intimacy from a distance.", unlocked: false }, { level: 2, insightCost: 7, text: "Power in Looking: Watching holds its own subtle form of control or participation.", unlocked: false }, { level: 3, insightCost: 15, text: "Consent Matters Here Too: Watching unsuspecting people is unethical.", unlocked: false } ]
    },
    {
        id: 20, name: "Latex / Material Fetish", cardType: "Skill", // Changed from Orientation
        visualHandle: "rare_latex.jpg", primaryElement: "A",
        elementScores: { A: 9, I: 5, S: 8, P: 6, C: 5, R: 4, RF: 5 },
        briefDescription: "Gain 8 Block and 1 Dexterity.", // Defensive + Buff
        detailedDescription: "Primary attraction [A] triggered by sensory qualities (sight, feel, sound, smell [S]) of materials like latex, leather [94], PVC. Material holds inherent erotic power.",
        relatedIds: [12, 21, 42, 94], rarity: 'rare', keywords: ['Skill', 'Block', 'Buff', 'Dexterity', 'Fetish', 'Material', 'Latex', 'Exhaust'], // Rare skill exhausts
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 9, text: "Texture Note: 'Like a second skin, it transforms perception...'", unlocked: false }, { level: 2, insightCost: 18, text: "Alchemist's Insight: The material becomes a catalyst, altering essence or energy.", unlocked: false }, { level: 3, insightCost: 28, text: "Sensory Immersion: Encasing the body can drastically alter sensory input.", unlocked: false } ]
    },

    // --- Continue adding/revising concepts here ---
    // Ensure briefDescription is suitable for card text
    // Ensure keywords support the intended mechanics
    // Add RF scores to all concepts
    // Review cardType mappings

    // Example: Revising ID 21
    {
        id: 21, name: "Uniform / Clothing Fetish", cardType: "Power", // Power makes more sense for persistent effect
        visualHandle: "rare_uniform.jpg", primaryElement: "A",
        elementScores: { A: 8, I: 6, S: 4, P: 6, C: 6, R: 5, RF: 5 },
        briefDescription: "While equipped, Interaction cards cost 1 less Focus (min 0).", // Example power effect
        detailedDescription: "Arousal [A] significantly triggered by specific clothing (uniforms, costumes). Clothing acts as a powerful symbol [C].",
        relatedIds: [13, 20, 12, 94, 95, 104, 43], rarity: 'rare', keywords: ['Power', 'Fetish', 'Clothing', 'Uniform', 'CostReduction', 'Exhaust'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 8, text: "Costumer's Thread: 'A uniform is a pre-packaged story worn on the body...'", unlocked: false }, { level: 2, insightCost: 16, text: "Psychological Note: Clothing acts as signifier, invoking roles, power dynamics [I].", unlocked: false }, { level: 3, insightCost: 25, text: "Beyond the Look: Often involves the *idea* of the role, not just the visual.", unlocked: false } ]
    },

    // ... (Continue revising existing concepts 22 through 139 similarly) ...
    // ... (Ensure concepts like M/s, Rigger, Slave, Brat etc. have appropriate cardType/keywords/effects) ...

    // Example: Revising ID 109 (M/s Dynamic) -> High Cost Power
     {
        id: 109, name: "Master / slave Dynamic (M/s)", cardType: "Power",
        visualHandle: "rare_ms.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 9, S: 6, P: 9, C: 8, R: 7, RF: 10 },
        briefDescription: "Start of Turn: Gain 1 Focus. Apply 1 Vulnerable to ALL enemies.", // Powerful recurring effect
        detailedDescription: "High-intensity D/s relationship involving deep commitment and power exchange [I/R], potentially Total Power Exchange (TPE).",
        relatedIds: [4, 5, 11, 30, 10, 101, 131, 132], rarity: 'rare', keywords: ['Power', 'Control', 'Debuff', 'Vulnerable', 'AOE', 'Focus', 'TPE', 'Exhaust'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 10, text: "Defining Feature: Often involves 'ownership' or total authority.", unlocked: false }, { level: 2, insightCost: 20, text: "Alchemist's Analogy: Requires immense dedication, trust, communication.", unlocked: false }, { level: 3, insightCost: 30, text: "Requires Deep Compatibility: Finding a partner is rare and crucial.", unlocked: false } ]
     },

     // Example: Revising ID 135 (Painslut) -> Skill focused on self-buff via damage?
      {
        id: 135, name: "Painslut", cardType: "Skill",
        visualHandle: "painslut.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 2, S: 9, P: 8, C: 4, R: 5, RF: 8 },
        briefDescription: "Take 3 damage. Gain 2 Strength. Draw 1 card.", // Self-damage for reward
        detailedDescription: "Actively craving intense physical sensation [S], pushing boundaries [44], finding validation [P] or release through enduring pain.",
        relatedIds: [5, 9, 8, 128, 44, 99, 38, 119, 138], rarity: 'rare', keywords: ['Skill', 'Pain', 'Buff', 'Strength', 'Draw', 'SelfDamage'],
        lore: [ /* Keep existing lore */ { level: 1, insightCost: 5, text: "Core Traits: Active Pain Seeking, Endurance Display, Sensation Craving.", unlocked: false }, { level: 2, insightCost: 10, text: "Spectrum: Ranges from requesting intense sensations to needing extreme input.", unlocked: false }, { level: 3, insightCost: 20, text: "Safety Imperative: Requires extreme trust, limits, experienced partners, aftercare [69].", unlocked: false } ]
      },


]; // END OF CONCEPTS ARRAY


// --- Milestones (Overhauled for Roguelite Gameplay) ---
const milestones = [
    // --- Run Progression ---
    { id: "msR001", description: "First Step Taken: Started your first Labyrinth run.", reward: { type: "insight", amount: 10 }, track: { action: "startRun", count: 1 } },
    { id: "msR002", description: "Combat Initiate: Won your first Combat encounter.", reward: { type: "insight", amount: 15 }, track: { action: "winCombat", count: 1 } },
    { id: "msR003", description: "Elite Challenger: Defeated your first Elite foe.", reward: { type: "unlockArtifact", artifactId: 'resonant_echo_s' }, track: { action: "winElite", count: 1 } }, // Unlock uncommon artifact
    { id: "msR004", description: "Floor 1 Cleared: Defeated the Floor 1 Boss.", reward: { type: "increaseMaxIntegrity", amount: 5 }, track: { action: "victory_floor_1", count: 1 } },
    { id: "msR005", description: "Deep Insight: Reached Floor 2.", reward: { type: "insight", amount: 30 }, track: { action: "reachFloor", value: 2 } }, // Need action "reachFloor"
    { id: "msR006", description: "Floor 2 Cleared: Defeated the Floor 2 Boss.", reward: { type: "increaseStartingFocus", amount: 1 }, track: { action: "victory_floor_2", count: 1 } },
    { id: "msR007", description: "Heart of the Labyrinth: Reached Floor 3.", reward: { type: "insight", amount: 50 }, track: { action: "reachFloor", value: 3 } },
    { id: "msR008", description: "Labyrinth Conquered!: Defeated the Final Boss!", reward: { type: "unlockArtifact", artifactId: 'alchemists_stone_x' }, track: { action: "runVictory", count: 1 } },
    { id: "msR009", description: "Persistent Explorer: Completed 5 runs (win or lose).", reward: { type: "increaseStartingInsight", amount: 10 }, track: { action: "runCompleted", count: 5 } },
    { id: "msR010", description: "Seasoned Veteran: Completed 15 runs.", reward: { type: "unlockCard", cardId: 101 }, track: { action: "runCompleted", count: 15 } }, // Unlock Ritualistic Play

    // --- Combat Milestones ---
    { id: "msC001", description: "Flawless Victory: Won a combat without taking HP damage.", reward: { type: "insight", amount: 20 }, track: { action: "winCombatFlawless", count: 1 } }, // Needs tracking
    { id: "msC002", description: "Overkill: Dealt 50+ damage in a single attack.", reward: { type: "insight", amount: 15 }, track: { action: "dealHighDamageAttack", value: 50 } }, // Needs tracking
    { id: "msC003", description: "Impenetrable: Had 30+ Block at the end of your turn.", reward: { type: "insight", amount: 10 }, track: { action: "endTurnHighBlock", value: 30 } }, // Needs tracking
    { id: "msC004", description: "Combo Master: Played 8+ cards in a single turn.", reward: { type: "unlockCard", cardId: 74 }, track: { action: "playManyCardsTurn", value: 8 } }, // Needs tracking (use turnState.cardsPlayedThisTurn)
    { id: "msC005", description: "Debilitator: Defeated an enemy with 3+ unique debuffs.", reward: { type: "insight", amount: 25 }, track: { action: "defeatEnemyWithDebuffs", value: 3 } }, // Needs tracking

    // --- Resource Milestones ---
    { id: "msRes01", description: "Focused Mind: Reached 10 Max Focus.", reward: { type: "unlockArtifact", artifactId: 'focus_lens_c' }, track: { state: "playerMaxFocus", threshold: 10 } }, // Needs state tracking
    { id: "msRes02", description: "Resilient Form: Reached 100 Max Integrity.", reward: { type: "unlockCard", cardId: 15 }, track: { state: "playerMaxIntegrity", threshold: 100 } }, // Needs state tracking
    { id: "msRes03", description: "Insight Hoarder: Held 200+ Insight during a run.", reward: { type: "insight", amount: 25 }, track: { action: "holdHighInsight", value: 200 } }, // Needs tracking

    // --- Node Interaction Milestones ---
    { id: "msN001", description: "Wise Choice: Resolved 5 Dilemmas.", reward: { type: "insight", amount: 20 }, track: { action: "resolveDilemma", count: 5 } },
    { id: "msN002", description: "Eventful Journey: Encountered 10 Events/Reflections.", reward: { type: "unlockCard", cardId: 13 }, track: { action: "completeReflection", count: 10 } }, // Use reflection count
    { id: "msN003", description: "Savvy Shopper: Purchased 5 items from the Shop (total).", reward: { type: "increaseShopArtifactChoices", amount: 1 }, track: { action: "buyAnyShopItem", count: 5 } }, // Needs combined tracking
    { id: "msN004", description: "Well Rested: Used Rest Site actions 10 times (total).", reward: { type: "increaseStartingInsight", amount: 5 }, track: { action: "useAnyRestAction", count: 10 } }, // Needs combined tracking
    { id: "msN005", description: "Deck Refiner: Removed 5 cards via Shop/Rest Site (total).", reward: { type: "unlockArtifact", artifactId: 'cartographers_pen_r' }, track: { action: "removeCard", count: 5 } }, // Needs combined tracking

    // --- Collection Milestones ---
    { id: "msCol01", description: "Collector: Unlocked 25 Concepts.", reward: { type: "increaseCardRewardChoices", amount: 1 }, track: { state: "unlockedConcepts.size", threshold: 25 } },
    { id: "msCol02", description: "Archivist: Unlocked 50 Concepts.", reward: { type: "insight", amount: 50 }, track: { state: "unlockedConcepts.size", threshold: 50 } },
    { id: "msCol03", description: "Relic Hunter: Unlocked 10 Artifacts.", reward: { type: "insight", amount: 30 }, track: { state: "unlockedArtifacts.size", threshold: 10 } },
    { id: "msCol04", description: "Master Librarian: Unlocked 75 Concepts.", reward: { type: "insight", amount: 75 }, track: { state: "unlockedConcepts.size", threshold: 75 } },
    { id: "msCol05", description: "Artifact Master: Unlocked 20 Artifacts.", reward: { type: "unlockArtifact", artifactId: 'philosophers_catalyst_p' }, track: { state: "unlockedArtifacts.size", threshold: 20 } },

    // --- Ascension Milestones ---
    { id: "msA001", description: "First Ascent: Won a run on Ascension 1.", reward: { type: "insight", amount: 50 }, track: { action: "winAscension", value: 1 } }, // Needs tracking
    { id: "msA005", description: "Steadfast Climb: Won a run on Ascension 5.", reward: { type: "increaseMaxIntegrity", amount: 10 }, track: { action: "winAscension", value: 5 } },
    { id: "msA010", description: "Peak Performer: Won a run on Ascension 10.", reward: { type: "unlockArtifact", artifactId: 'labyrinth_map_r' }, track: { action: "winAscension", value: 10 } },

];

// --- Elemental Dilemmas (Suitable for Event Nodes) ---
 const elementalDilemmas = [
    // Add more Dilemmas - Ensure IDs are unique and consequences make sense
    { id: "ED_A01", elementFocus: ["A", "P"], situation: "An intense, purely physical attraction [A] sparks towards someone, but they seem incompatible for the deeper connection [P] you usually need.", question: "Where does your energy flow: towards the spark or the need for depth?", sliderMinLabel: "Prioritize Psychological Depth (P)", sliderMaxLabel: "Follow Intense Attraction (A)", elementKeyMin: "P", elementKeyMax: "A" },
    { id: "ED_A02", elementFocus: ["A", "R"], situation: "Someone matching your specific attraction patterns [A] enters your sphere, potentially causing friction within your established relationship structure [R].", question: "Your primary leaning is towards:", sliderMinLabel: "Upholding Relationship Stability (R)", sliderMaxLabel: "Acknowledging New Attraction (A)", elementKeyMin: "R", elementKeyMax: "A" },
    // ... (Keep other dilemmas, review/revise text slightly for clarity if needed) ...
     { id: "ED_I03", elementFocus: ["I", "RF"], situation: "You enjoy fluid Interaction [I], but a partner desires you commit fully to one Dominant or submissive Role [High/Low RF] for a scene.", question: "Your response leans towards:", sliderMinLabel: "Commit Fully to Defined Role (RF)", sliderMaxLabel: "Negotiate for Fluidity (I)", elementKeyMin: "RF", elementKeyMax: "I" },
     { id: "ED_P01", elementFocus: ["P", "RF"], situation: "You need psychological surrender [P-Sub], but your Dominant partner [High RF] dislikes helplessness themes.", question: "When negotiating, you focus on:", sliderMinLabel: "Finding Scenarios within Partner's Comfort (RF)", sliderMaxLabel: "Seeking Your Specific Need (P)", elementKeyMin: "RF", elementKeyMax: "P" },
     { id: "ED_RF01", elementFocus: ["RF", "P"], situation: "You identify as Dominant [High RF]. A partner needs to playfully challenge [P] authority to feel engaged.", question: "Your internal reaction is primarily:", sliderMinLabel: "Appreciating Partner's Need (P)", sliderMaxLabel: "Asserting Authority (RF)", elementKeyMin: "P", elementKeyMax: "RF" },
     { id: "ED_RF02", elementFocus: ["RF", "S"], situation: "As someone submissive [Low RF], you crave intense sensation [High S]. Your Dominant partner prefers psychological control.", question: "You advocate more strongly for:", sliderMinLabel: "Aligning with Partner's Style (RF)", sliderMaxLabel: "Incorporating Intense Sensations (S)", elementKeyMin: "RF", elementKeyMax: "S" }
 ];


// --- Reflection Prompts (Suitable for Event Nodes or Post-Combat contemplation) ---
// Keeping prompts mostly as-is, they provide good flavor. Trimmed unused categories.
const reflectionPrompts = {
    "Attraction": [ /* Keep existing A prompts */ { id: "pA1", text: "Recall someone (or something!) that recently sparked that 'whoa!' feeling. Pinpoint *exactly* what element(s) resonated so strongly?" }, { id: "pA2", text: "Think about a time your 'Desire Compass' pointed somewhere unexpected. What was that detour about? What insight did you glean?" }, { id: "pA3", text: "How does feeling emotionally close/safe impact your sexual attraction dial? Does trust turn up the volume, or are they separate frequencies?" }, { id: "pA4", text: "Ever had a powerful attraction fizzle out? What changed? Them, you, the situation, or the magic completing its cycle?" } ],
    "Interaction": [ /* Keep existing I prompts */ { id: "pI1", text: "Picture your most satisfying intimate dance. Were you leading, following, or in fluid improv? What made it feel 'right'?" }, { id: "pI2", text: "Conjure your ideal encounter vibe... Playful? Intense? Tender? Authoritative? Yielding? Describe the essential energy." }, { id: "pI3", text: "Words or vibes? How much do you rely on explicit communication versus intuitively sensing energy shifts and unspoken cues?" }, { id: "pI4", text: "If exploring power dynamics... what's the juicy part about being in charge? What's the appeal or release in yielding?" } ],
    "Sensory": [ /* Keep existing S prompts */ { id: "pS1", text: "Beyond orgasm, what pure *touch* feels amazing? Light? Firm? Rough? Specific fabrics or temperatures?" }, { id: "pS2", text: "Any highly specific sensations – heat, pressure, sting, sounds, smells – that reliably amplify arousal? Any instant 'no-gos'?" }, { id: "pS3", text: "Does your 'Feeling Finder' preference change significantly based on mood, stress, or partner? How flexible is your sensory map?" }, { id: "pS4", text: "Recall a purely sensory moment (intimate or not!) that felt incredibly satisfying or present. What ingredients made it potent?" } ],
    "Psychological": [ /* Keep existing P prompts */ { id: "pP1", text: "Beyond physical pleasure, what deep-down core *need* does intimacy most often fulfill? Connection? Power? Validation? Escape? Comfort? Name the quest." }, { id: "pP2", text: "Remember an intimacy that felt *profoundly* satisfying on a soul level. What core need felt truly met or seen?" }, { id: "pP3", text: "Contrast with a time intimacy felt 'meh' psychologically, even if physically okay. What essential ingredient was missing?" }, { id: "pP4", text: "How does choosing to lower your guard, embrace vulnerability, and be truly 'seen' play into your most rewarding connections?" } ],
    "Cognitive": [ /* Keep existing C prompts */ { id: "pC1", text: "How much happens in your mind's theater? Detailed fantasy? Analysis? Or grounded in the present moment's sensations/emotions?" }, { id: "pC2", text: "Dish on a specific fantasy, scenario, or mental play that reliably gets your brain buzzing. What's the secret ingredient?" }, { id: "pC3", text: "Does the mental game – banter, strategy, intellectual challenge – turn you on as much (or more than) the purely physical?" }, { id: "pC4", text: "How do *anticipation* (planned scenes) or *memory* (replaying moments) enhance or spice up your current experiences?" } ],
    "Relational": [ /* Keep existing R prompts */ { id: "pR1", text: "In which context (solitude, dyad, casual, group) do you feel most free and authentic in expressing your full sexy self?" }, { id: "pR2", text: "Rules vs. Vibes vs. Anarchy: How important are clear agreements, exclusivity rules, or hierarchies? Or do you prefer organic evolution?" }, { id: "pR3", text: "What's your sweet spot for emotional closeness and vulnerability in sexual connections? Deep? Light? Does it vary?" }, { id: "pR4", text: "If non-monogamous (or considering): How do jealousy/insecurity show up? How do you experience/cultivate compersion (joy in partner's joy)?" } ],
    "RoleFocus": [ /* Keep existing RF prompts */ { id: "pRF1", text: "Consider feeling powerfully 'in charge' (sexual or not). What did that feel like physically/mentally? Where did confidence stem from?" }, { id: "pRF2", text: "Recall willingly, trustingly following another's lead. What was the emotional quality? Relief, vulnerability, excitement, peace?" }, { id: "pRF3", text: "If a Switch, what triggers the desire to shift polarity? Internal? External? What's enjoyable about the shift itself?" }, { id: "pRF4", text: "How does your Role Focus (D/s/W/Neutral) interact with other elements? High RF + High Control [I]? Low RF + seeking Comfort [P]?" } ],
    "Dissonance": [ // Triggered when player encounters concept far from their profile? Needs game logic.
        // Prompts seem suitable for game context
        { id: "pD1", text: "This Concept feels like static compared to your usual frequency! Acknowledge discomfort, then lean in: What specific *part* makes you tilt your head and go 'Huh, unexpectedly interesting...'?" },
        { id: "pD2", text: "Exploring unfamiliar map edges! Even if this feels challenging, what *potential* new insight or unexpected pleasure might hypothetically leaning into it (in thought/fantasy) offer?" },
        { id: "pD3", text: "Sometimes things we push away mirror something within. Does this poke at a fear, taboo, or hidden desire/need you haven't fully acknowledged?" },
        { id: "pD4", text: "How could simply *understanding* this different perspective, even if 'not for you' in practice, broaden appreciation for your own complexity or the dazzling variety of human desire?" }
    ],
    "RareConcept": { // Prompts triggered on discovering a rare card? Needs game logic. Map by ID.
        // Keep existing prompts, ensure IDs match rare concept IDs (e.g., rP08 -> concept 8)
        "rP08": { id: "rP08", text: "Heavy Impact: Intense! What's the core allure? Raw sensation? Visual proof? Power dynamic? Psychological release? Or something else?" },
        "rP09": { id: "rP09", text: "Non-Impact Pain: Clamps, wax, needles... What *quality* of *this kind* of 'ouch' resonates? Focus? Vulnerability? Pleasure contrast? Mental game?" },
        "rP11": { id: "rP11", text: "Command & Control: Following orders... Thrill in the authority's certainty? The trusting obedience? The shared focus/structure?" },
        "rP12": { id: "rP12", text: "Objectification Play: Tricky! Within safe consent, what need/fantasy does playing with 'thing-ness' touch? Focus? Power? Dehumanization themes?" },
        "rP14": { id: "rP14", text: "Fantasy Immersion: Mind as main stage! What ingredients make a fantasy captivating? Narrative? Characters? Emotional tone?" },
        "rP16": { id: "rP16", text: "Rope Bondage: Art, sensation, trust! Drawn to the patterns? Rope pressure? Restricted stillness? Energetic connection?" },
        "rP17": { id: "rP17", text: "Restriction/Helplessness: Being bound... What emotions surface most strongly? Surrender? Excitement? Vulnerability? Peace?" },
        "rP20": { id: "rP20", text: "Material Focus (Latex/Leather): Which sense is most powerful? Sight? Smell? Sound? Feel?" },
        "rP21": { id: "rP21", text: "Uniform/Clothing Fetish: Which outfit sparks most? What story, role, or power dynamic does it instantly invoke?" },
        "rP25": { id: "rP25", text: "Polyamory: Multiple ethical connections! Biggest joys/rewards? Trickiest emotional/logistical challenges?" },
        "rP27": { id: "rP27", text: "Relationship Anarchy: No rules but yours! How do you build trust, define commitment, navigate intimacy without traditional blueprints?" },
        "rP30": { id: "rP30", text: "High Protocol D/s: Intricate rules! Deep appeal in the clarity? Challenge of perfection? Transformation of self?" },
        "rP38": { id: "rP38", text: "Tease & Denial: Riding the pleasure edge... Most potent part: Physical tension? Mental test? Surrender to control?" },
        "rP41": { id: "rP41", text: "Erotic Hypnosis/Mind Control: Deep head game! What boundaries, communication, aftercare feel essential for safety/ethics?" },
        "rP42": { id: "rP42", text: "Transformation Fetish: Changing form... What *kind* of transformation intrigues most? What desire/fear/identity exploration might it represent?" },
        "rP43": { id: "rP43", text: "Medical Play: Clinical kink! Core draw: Vulnerability? Authority? Tools/procedures? Power dynamic?" },
        "rP44": { id: "rP44", text: "Edge Play: Playing near limits... What safety negotiations, check-ins, contingency plans feel non-negotiable?" },
        "rP45": { id: "rP45", text: "Humiliation/Degradation: Intense feelings! Where's *your* line between fun power play and unwanted hurt? How communicate/respect it?" },
        "rP63": { id: "rP63", text: "Breath Play: Altering breathing = altered states. Specific feeling/shift/surrender sought? How is rigorous safety *always* top priority?" },
        "rP64": { id: "rP64", text: "CNC: Simulated non-consent needs rock-solid *real* consent. How ensure safety, clarity, boundaries, safewords *before* the scene?" },
        "rP65": { id: "rP65", text: "Chemsex/PnP: Adding substances... Radically honest: True motivations? Aware of/managing health & consent risks?" },
        "rP109": { id: "rP109", text: "M/s Dynamic: Profound power exchange. How does 'ownership' or total authority/surrender feel different/more significant than other D/s?" },
        "rP111": { id: "rP111", text: "Knife Play: Sharp edge = intensity/control. Thrill in visual threat? Sensation? Implied danger? Profound trust demo?" },
        "rP112": { id: "rP112", text: "E-Stim: Electric buzz! How does the involuntary nature compare to other touch/pressure/pain? What makes it intriguing?" },
        "rP113": { id: "rP113", text: "Suspension Bondage: Bound against gravity... Appeal in aesthetic? Physical strain? Ultimate vulnerability/surrender? Technical skill/trust?" },
        "rP114": { id: "rP114", text: "Water Sports: Pushes buttons! What specific taboos, body feelings, or power dynamics (marking/humiliation) does this engage?" },
        "rP115": { id: "rP115", text: "Scat Play: Deep taboo/risk. If resonates (conceptually): complex psychological themes (degradation? primal? taboo breaking?) involved? (Safety paramount!)" },
        "rP116": { id: "rP116", text: "Blood Play: Primal/ritualistic/high-risk. What symbolic weight, visceral reaction, cultural association does blood hold for you? (Safety first!)" },
        "rP117": { id: "rP117", text: "Abduction/Capture Fantasy: 'Taken' in a safe game... Most charged part: Surprise/struggle? Captivity/helplessness [17]? Captor dynamic [4/5]? Escape/surrender?" },
        "rP118": { id: "rP118", text: "Somnophilia/Sleep Play: Interacting with seemingly unaware... What ethical lines around consent/awareness feel crucial, even in fantasy?" },
        "rP119": { id: "rP119", text: "Orgasm Control: Controlling pleasure/release... How feels different from tease/denial [38]? What communicates about control/pleasure/surrender?" },
        "rP120": { id: "rP120", text: "Psychological 'Torture': Intense mind games... What specific soothing/reconnection/reality-check (aftercare) feels essential after?" },
        "rP121": { id: "rP121", text: "Furry Sexuality: Intimacy via fursonas/community... How does this blend of identity, role-play [13], community [R], fantasy shape desire?" },
        "rP122": { id: "rP122", text: "Autassassinophilia: Arousal from *staged* mortal danger... What thrill/adrenaline/mortality confrontation found in flirting (safely!) with this simulated threat?" },
        "rP123": { id: "rP123", text: "Exposure Therapy Play: Using scenes to process trauma/fears... How can controlled intensity/trust facilitate processing without re-traumatizing? Crucial safety/support?" },
        "rP124": { id: "rP124", text: "Sensory Overstimulation 'Torture': Drowning the senses... Goal: Disorientation? Pushing limits? Breaking defenses? Testing control? Altered state?" },
        "rP125": { id: "rP125", text: "Advanced Breath Control: High risk/precision. Deeper state/sensation/trust test sought at this edge? (Reflect intensely on safety!)" }
    },
    // Removed "Guided" and "SceneMeditation" prompt categories as they are Lab-specific or unused
};

// js/data.js - Core Game Data for Persona Labyrinth Roguelite (v5.0 - Roguelite Overhaul - Part 2)


// --- Element Deep Dive Content (Potential for in-game Codex/Info) ---
const elementDeepDive = {
    "Attraction": [ // Use short name key
        { level: 1, title: "Level 1: Deciphering the Spark - Your Attraction Compass", insightCost: 10, content: "<p>Attraction: the mysterious force that first draws us in... observe: What patterns do you notice in your *initial* magnetic pull towards certain people, energies, aesthetics, or situations? What's the common thread, if any?</p>" },
        { level: 2, title: "Level 2: Beyond First Sight - Deeper Magnetic Fields", insightCost: 25, content: "<p>Let's dig beneath the surface magnetism. Is it the lightning strike of a sharp mind (Sapiosexuality [60]) that truly captivates? The allure of specific roles or power dynamics [I]? Or a specific object, texture, material, or situation (a fetish [20, 21, 62, 94]) acting as your lodestone? How does needing a deep emotional bond *first* (Demisexuality [29]) change the spark?</p>" },
        { level: 3, title: "Level 3: From Spark to Flame - Cultivating Desire's Fire", insightCost: 50, content: "<p>Attraction is potential, arousal is fire. What bridges the gap? Is your desire spontaneous (ready tinder) or responsive (needs coaxing)? How fixed is your compass, or can attraction bloom unexpectedly? Reflect on how *sustaining* attraction differs from the initial spark.</p>" }
    ],
    "Interaction": [ // Use short name key
        { level: 1, title: "Level 1: The Dance of Connection - Leading, Following, Flowing", insightCost: 10, content: "<p>Interaction is the energetic exchange... the flow between partners. Do you instinctively step forward to lead (Dominant/Top [4])? Find joy in following (Submissive/Bottom [5])? Effortlessly weave between both (Switch [6])? Reflect on your most satisfying interactions - what was the core energy?</p>" },
        { level: 2, title: "Level 2: Styles of Engagement - Finding Your Signature Move", insightCost: 25, content: "<p>Beyond leading/following, what's the *flavor*? Meticulous control [11]? Devoted service [10]? Raw instinct (Primal [40])? Nurturing (Caregiver [58])? Playful teasing [38]? Reflect on the nuances of how you express or receive energy. Where does your style resonate?</p>" },
        { level: 3, title: "Level 3: The Language of Play - Communication & Safety in Motion", insightCost: 50, content: "<p>How do you communicate desires/boundaries during the dance? Verbally? Energetically? How crucial are safewords? Consider aftercare [69] as the final, essential step. How do you ensure safety and respect throughout?</p>" }
    ],
    "Sensory": [ // Use short name key
        { level: 1, title: "Level 1: The Body's Alphabet - Basic Sensory Grammar", insightCost: 10, content: "<p>Your skin... speaks a complex language. Gentle whispers (light caresses [2])? Firm pronouncements (deep pressure)? Temperature? Textures? Consider the fundamental sensations that feel inherently 'good' or 'interesting' to your unique nervous system.</p>" },
        { level: 2, title: "Level 2: Amplifying Sensation - Intensity & Edge", insightCost: 25, content: "<p>Sometimes a whisper isn't enough... the body craves louder messages. Sharp pinch/bite [9]? Rhythmic impact (light [7] / heavy [8])? Hot wax [9]? Binding [16, 87]? Extreme cold [88]? Electrostim [112]? How does your body negotiate the pleasure/pain edge, or sensory overwhelm [86]?</p>" },
        { level: 3, title: "Level 3: A Symphony for the Senses - Beyond Touch", insightCost: 50, content: "<p>How do other senses weave in? Scent (perfume, leather, sweat [A])? Sound (music, voice [32], gasps)? Visuals (aesthetics, candlelight, specific outfits [21])? Explore engaging (or depriving [37]) multiple senses simultaneously. What creates a truly immersive sensory experience?</p>" }
    ],
    "Psychological": [ // Use short name key
        { level: 1, title: "Level 1: The Heart's Compass - Charting Your 'Why'", insightCost: 10, content: "<p>What deeper psychological needs pull you towards connection? Shared vulnerability/trust [15]? Power/control [4/5]? Validation [50]? Escape [51]? Comfort/safety [80]? Primal expression [40]? Catharsis? Name the core quest.</p>" },
        { level: 2, title: "Level 2: Mapping Emotional Landscapes & Inner States", insightCost: 25, content: "<p>Vulnerability... How comfortable are you being witnessed in raw states? Can intensity bring catharsis? Have you touched altered states ('subspace') through psychological means? What creates the essential safety net for deep emotional exploration?</p>" },
        { level: 3, title: "Level 3: Inner Alchemy & Potential for Healing", insightCost: 50, content: "<p>Intimacy as a mirror... reflecting joys, desires, fears, shadows. Can play be a crucible for integration, understanding past wounds, or healing [123]? Or does it sometimes repeat old, unhelpful stories? Consider the potential for conscious self-discovery through psychological engagement.</p>" }
    ],
    "Cognitive": [ // Use short name key
        { level: 1, title: "Level 1: The Theater of the Mind - Imagination's Stage", insightCost: 10, content: "<p>How active is your inner world during intimacy? Elaborate fantasies [14]? Analyzing the dynamic? Grounded purely in sensation [S]? Explore the power of your imagination... What populates your mental theater when desire stirs?</p>" },
        { level: 2, title: "Level 2: Scripts, Scenarios, and Role-Play Realms", insightCost: 25, content: "<p>Do you relish stepping into a role [13]? Specific scenarios (medical [43], capture [117])? Forbidden encounters? Historical settings? Power dynamics [4/5]? Fantastical creatures [121]? Is the 'story' a key ingredient?</p>" },
        { level: 3, title: "Level 3: The Intellectual Spark & Conceptual Fire", insightCost: 50, content: "<p>Is the mind the primary erogenous zone? Witty banter [74]? Understanding motivations [P]? Analyzing interactions [I]? Symbolic actions, complex rules [30], rituals [101]? Explore how thought itself fuels the fire, or how the *idea* of something can be profoundly arousing.</p>" }
    ],
    "Relational": [ // Use short name key
        { level: 1, title: "Level 1: Mapping Your Connections - Constellation Basics", insightCost: 10, content: "<p>How do you structure your intimate world? Monogamy [22]? Solo exploration? Consensual Non-Monogamy (Poly [25], Open [26])? Swinging [23]? Group encounters [34]? Consider the basic blueprint: how many partners, what level of connection feels most authentic?</p>" },
        { level: 2, title: "Level 2: Defining the Bonds - Depth, Commitment, Fluidity", insightCost: 25, content: "<p>Beyond number, what *depth* and *type* of connection do you seek? Deep emotional intimacy [15]? Casual fun [24]? Shared interests? Temporary companionship? How does 'commitment' factor in? Can levels vary drastically between partners?</p>" },
        { level: 3, title: "Level 3: Navigating the Cosmos - Rules, Anarchy, & Emotion", insightCost: 50, content: "<p>If exploring multiple connections, how do you navigate? Clear rules/hierarchy? Or let each define itself (RA [27])? Handling jealousy, compersion? What communication skills are essential? What ethical frameworks guide your choices?</p>" }
    ],
    "RoleFocus": [ // RF DEEP DIVE
        { level: 1, title: "Level 1: Sensing the Current - Your Natural Polarity", insightCost: 10, content: "<p>Role Focus explores your innate energetic leaning in power dynamics... are you more comfortable being the strong current directing the flow (Dominant), the receptive banks guiding the water (submissive), or the eddy that playfully swirls between both (Switch)? Where does your energy naturally settle when power is in play?</p>" },
        { level: 2, title: "Level 2: Embodied Expressions - Dominance, Submission, Switching", insightCost: 25, content: "<p>How does this polarity translate into action or feeling? If Dominant [High RF], does it manifest as decisive control [11], confident guidance, or protective authority? If submissive [Low RF], is it found in trusting obedience [5], joyful service [10], or deep release in surrender? If a Switch [Mid RF], what scenarios invite you to embody each pole? Connect your RF score to specific concepts...</p>" },
        { level: 3, title: "Level 3: The Alchemy of Exchange - Polarity in Relationship", insightCost: 50, content: "<p>Polarity rarely exists in a vacuum. How does your Role Focus interact with your partners' [R]? Do you seek complementary energies (Dom/sub pairing), similar energies (Dom/Dom exploration), or is flexibility key? How do you communicate needs and boundaries around power [C]? How does trust [15] enable deeper exploration of your chosen pole?</p>" }
    ]
};

// --- Elemental Insights (Flavor Text / Small Rewards) ---
// Kept as potential flavor text
const elementalInsights = [
    { id: "EI_A01", element: "A", text: "Attraction's compass needle doesn't always point north; sometimes it spins wildly towards mystery." },
    { id: "EI_A02", element: "A", text: "What makes you recoil in aversion also helps define the precise shape of your desire's edge." },
    { id: "EI_A03", element: "A", text: "Sometimes the strongest gravity pulls not towards the familiar, but towards the utterly unknown potential." },
    { id: "EI_A04", element: "A", text: "A shared glance across a room, a specific haunting scent... the universe conspires in subtle synchronicities of attraction." },
    { id: "EI_A05", element: "A", text: "The absence of attraction (Asexuality) is not an empty space, but a different landscape entirely, with its own unique beauty."},
    { id: "EI_I01", element: "I", text: "Every touch, every word, every silence is a move in the intricate, ongoing dance of interaction." },
    { id: "EI_I02", element: "I", text: "Even perfect stillness, willingly held, speaks volumes of trust or control within the dynamic." },
    { id: "EI_I03", element: "I", text: "True power in relationship isn't seized by force, but is often most potent when willingly, consciously given." },
    { id: "EI_I04", element: "I", text: "The most compelling rhythm often flows in the shared breath between active giving and receptive allowing." },
    { id: "EI_I05", element: "I", text: "Switching roles is not indecision; it is mastery of the full spectrum of the dance."},
    { id: "EI_S01", element: "S", text: "Skin keeps an honest score, remembering sensation long after the conscious mind moves on." },
    { id: "EI_S02", element: "S", text: "Pain is simply intense sensation knocking loudly at awareness's door; you decide whether (and how) to answer." },
    { id: "EI_S03", element: "S", text: "Muffle one sense, and witness how the others awaken, throwing a vibrant, focused party in your awareness." },
    { id: "EI_S04", element: "S", text: "Awareness sharpens itself beautifully on the whetstone of sensory contrast – hot then cold, tight then loose, loud then silent." },
    { id: "EI_S05", element: "S", text: "The line between pleasure and pain is not a wall, but a shimmering, personal, and often shifting veil."},
    { id: "EI_P01", element: "P", text: "Core psychological need is the invisible river patiently carving the deep canyon of desire's landscape." },
    { id: "EI_P02", element: "P", text: "To be truly seen, witnessed, and accepted in one's full vulnerable humanity is a quiet, profound superpower." },
    { id: "EI_P03", element: "P", text: "Catharsis through intensity: sometimes you have to safely burn down the old structures to feel truly clean and reborn." },
    { id: "EI_P04", element: "P", text: "Trust is the sacred cup, painstakingly built; intimacy is the precious wine poured carefully within." },
    { id: "EI_P05", element: "P", text: "Binding the body can paradoxically free the heart or mind, but only if unwavering trust holds the knot secure." },
    { id: "EI_C01", element: "C", text: "The mind: the ultimate playground, the first frontier explored, the final sanctuary found." },
    { id: "EI_C02", element: "C", text: "Every potent scene is built twice: first meticulously crafted in thought and fantasy, then embodied in flesh and feeling." },
    { id: "EI_C03", element: "C", text: "Meaning adds delicious spice to raw sensation; intellect can hone the sharp edge of interaction." },
    { id: "EI_C04", element: "C", text: "Anticipation... savoring the delicious wait for it... sometimes the very best part of eventually getting it." },
    { id: "EI_C05", element: "C", text: "Fantasy allows us to safely explore desires or identities the waking world might judge or forbid."},
    { id: "EI_R01", element: "R", text: "Two hearts entwined, a universe contained. Many hearts connected, a vast, complex nebula." },
    { id: "EI_R02", element: "R", text: "Externally imposed rules often build fences; consciously negotiated agreements build sturdy, trusted bridges." },
    { id: "EI_R03", element: "R", text: "Exclusivity is a deliberate relational choice made, defining a specific energetic focus, not an inherent moral rule passed down." },
    { id: "EI_R04", element: "R", text: "Compersion, the opposite of jealousy: finding genuine, expansive joy in your partner's happiness, even when it exists beyond you." },
    { id: "EI_R05", element: "R", text: "Relationship Anarchy isn't chaos; it's the radical responsibility of defining every connection from scratch, based on mutual desire and respect."},
    { id: "EI_RF01", element: "RF", text: "Dominance is responsibility worn with confidence; Submission is trust given with courage."}, // RF Insight
    { id: "EI_RF02", element: "RF", text: "The true Switch finds power not in either pole, but in the fluid energy of the dance between them."}, // RF Insight
    { id: "EI_RF03", element: "RF", text: "Clarity of role can create profound freedom; ambiguity requires constant negotiation."}, // RF Insight
    // Removed insightFragment IFC01 as Experiments were removed
];


// --- REMOVED SECTIONS ---
// - questionnaireGuided: Lab-specific input.
// - focusRituals: Lab-specific mechanic.
// - dailyRituals: Lab-specific mechanic.
// - sceneBlueprints: Lab-specific mechanic (Scene Meditation).
// - alchemicalExperiments: Lab-specific mechanic.
// - focusDrivenUnlocks: Lab-specific unlock system.
// - categoryDrivenUnlocks: Lab-specific unlock system.
// - elementInteractionThemes: Lab-specific narrative generation helper.
// - cardTypeThemes: Lab-specific narrative generation helper.
// - grimoireShelves: Lab-specific UI element.
// - onboarding... : Lab-specific tutorial data.


// --- FINAL EXPORT BLOCK ---
export {
    // Core Data Structures
    elementDetails,
    concepts, // The primary data source for cards
    elementKeyToFullName,
    cardTypeKeys, // Simplified list for roguelite
    elementNames,

    // Gameplay Data (Events, Info)
    elementalDilemmas, // Used for Event nodes
    reflectionPrompts, // Used for Event nodes
    elementDeepDive, // Potential Codex content
    elementalInsights, // Potential flavor text / minor rewards

    // Roguelite Specific Data
    milestones, // Overhauled for roguelite progression
};

console.log("data.js successfully loaded & revised for Roguelite. (v5.0)");
// --- END OF FILE data.js ---
