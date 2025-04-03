// data.js - Centralized Game Data (Keywords added, content NOT yet rewritten for Inner Cosmos)
// Terminology Mapping:
// Concept -> Star
// Element -> Force
// Grimoire -> Catalog
// Focus -> Align
// Study -> Observatory
// Research -> Scan
// Repository -> Cartography
// Milestone -> Legendary Alignment
// Ritual -> Stellar Harmonic

console.log("data.js starting...");

// Core Forces (Elements) Details
const elementDetails = {
    "Attraction": {
        name: "Attraction Focus", // UI: Attraction Force
        coreQuestion: "Who or What sparks your interest and arousal?", // UI: What celestial bodies or phenomena draw your cosmic attention?
        coreConcept: "This Force defines the primary target, nature, or necessary conditions for your attraction.", // UI: ... for your cosmic resonance.
        elaboration: "It encompasses orientations, attraction to aesthetics, dynamics, concepts, objects, situations, or emotional connection requirements.", // UI: ... attraction to specific stellar aesthetics, gravitational dynamics...
        scoreInterpretations: { // UI: Force Strength Readings
            "Very Low": "Suggests very little specific attraction (Asexuality spectrum alignment). Resonance might be absent or non-specific.",
            "Low": "Indicates less emphasis on specific external targets; attraction might be infrequent, require strong connection (Demisexual leaning), or be primarily responsive.",
            "Moderate": "Represents a common balance. Attraction might follow familiar patterns or be broad (Pansexual leaning) without intense focus.",
            "High": "Suggests a strong pull towards particular targets, dynamics, or specific objects/situations (Fetishistic leaning).",
            "Very High": "Indicates a very strong, potentially primary focus on specific triggers (strong orientation, fetishistic, or paraphilic focus)."
        },
        examples: "Asexuality, Demisexuality, Heterosexuality, Homosexuality, Bisexuality, Pansexuality, Sapiosexuality, Fetishes (e.g., specific materials, appearances), attraction to specific dynamics.",
        personaConnection: "Defines the fundamental 'target' or condition of your cosmic resonance." // UI: Defines the fundamental 'target' or condition of your cosmic resonance.
    },
    "Interaction": {
        name: "Interaction Style", // UI: Interaction Dynamics
        coreQuestion: "How do you prefer to engage and exchange energy during encounters?", // UI: How do you prefer to orbit or interact within a system?
        coreConcept: "This Force describes your preferred behavioral dynamics, roles, and energy flow when interacting.", // UI: ... your preferred orbital dynamics, roles, and energy flow...
        elaboration: "Covers leading/following, collaboration vs. power differentials, and energetic expressions like nurturing, service, playfulness, or performance (Dominant, Submissive, Switch, etc.).",
        scoreInterpretations: {
            "Very Low": "Strong preference for yielding control, following direction, serving (Strongly Submissive leaning). Comfort in passive orbit.",
            "Low": "General comfort letting others lead, supportive roles, receiving energy more than directing (Submissive or Bottom leaning).",
            "Moderate": "Prefers collaborative, egalitarian dynamics with mutual influence. May enjoy switching roles (Switch identity).",
            "High": "Enjoys taking initiative, guiding encounters, providing energy/care, or being the central 'star' (Dominant, Top, or Caregiver leaning).",
            "Very High": "Strong preference or need to be in control, direct the interaction explicitly, command, or embody a significantly Dominant role."
        },
        examples: "Dominance/submission (D/s), Master/slave (M/s), Top/Bottom/Versatile roles, Primal play, Service dynamics, Exhibitionism/Voyeurism, Teacher/student roles, Caregiver/Little dynamics (DDlg, MDlb).",
        personaConnection: "Defines your preferred cosmic 'dance' and power exchange." // UI: Defines your preferred cosmic 'dance' and gravitational influence.
    },
    "Sensory": {
        name: "Sensory Emphasis", // UI: Signal Reception
        coreQuestion: "What physical signals or stimuli are most important or sought after?", // UI: What cosmic signals or energetic frequencies are most important?
        coreConcept: "This Force relates to the significance, type, and intensity of physical or energetic input in arousal and fulfillment.", // UI: ... significance, type, and intensity of energetic input...
        elaboration: "Includes touch, temperature, texture, pressure, vibration, internal sensations, visual, auditory, olfactory input. Includes pleasure-to-pain spectrum (Sadomasochism).",
        scoreInterpretations: {
            "Very Low": "Physical/energetic input is largely secondary. Strong aversion to intense stimuli likely.",
            "Low": "Prefers subtle, gentle, affectionate signals. Comfort, warmth prioritized. Intense signals generally avoided.",
            "Moderate": "Enjoys a broad range of common pleasurable signals. May be open to mild intensity but not driven by it.",
            "High": "Actively seeks distinct, strong, or specific types of input as key to resonance. Includes impact, temperature, specific textures, light restriction.",
            "Very High": "Strongly driven by, or requires, intense, specific, or extreme signals. Includes significant pain/pleasure dynamics, intense restriction, sensory overload/deprivation, edge play."
        },
        examples: "Gentle massage, kissing, BDSM impact play, wax play, ice play, rope bondage, sensory deprivation, electrostimulation, specific material focus.",
        personaConnection: "Defines how your being interfaces with external signals and what input it craves or avoids." // UI: Defines how your being interfaces with cosmic signals...
    },
    "Psychological": {
        name: "Psychological Driver", // UI: Motivational Core
        coreQuestion: "Why do you engage? What underlying needs are fulfilled?", // UI: What core needs or states does your cosmic expression fulfill?
        coreConcept: "This Force explores the core emotional, psychological, or existential motivations and needs that expression helps access or satisfy.", // UI: ...motivations and needs that your cosmic expression helps access...
        elaboration: "Includes needs for connection (intimacy, trust), power dynamics (control, surrender), self-expression (creativity, validation), state change (escape, transcendence, catharsis), and comfort.",
        scoreInterpretations: {
            "Very Low": "Expression primarily serves simple release or recreation. Deep needs met elsewhere or not strongly linked.",
            "Low": "Emotional/psychological aspects present but secondary. Focus on fun, physical release, light connection.",
            "Moderate": "A balanced approach where expression often fulfills connection, stress relief, fun, validation.",
            "High": "Expression is a significant channel for fulfilling specific core needs (Intimacy, Power, Validation, Catharsis).",
            "Very High": "Fulfilling profound needs (total surrender, absolute control, deep vulnerability, transcendence) is the primary driver."
        },
        examples: "Using expression for stress relief, seeking deep emotional intimacy, using BDSM for catharsis/power exchange, seeking validation, using intensity for transcendence.",
        personaConnection: "Defines the motivational core of your expression – its deeper purpose." // UI: Defines the motivational core of your cosmic expression...
    },
    "Cognitive": {
        name: "Cognitive Engagement", // UI: Mental Landscape
        coreQuestion: "How important is the Mind – fantasy, intellect, scenarios – in your experience?", // UI: How important is the mental map – fantasy, intellect, scenarios – in your cosmic experience?
        coreConcept: "This Force measures the degree and style of mental involvement preferred or required.", // UI: ... degree and style of mental mapping preferred...
        elaboration: "Includes being 'in the moment' vs. elaborate fantasy, narrative, psychological complexity, or intellectual stimulation.",
        scoreInterpretations: {
            "Very Low": "Strong preference for being fully present and embodied. Finds elaborate fantasy or analysis distracting. Focus on physical/immediate connection.",
            "Low": "Primarily enjoys immediate experience. Mental constructs minimal.",
            "Moderate": "Appreciates some mental engagement (occasional role-play, fantasy enhancement) but can enjoy purely present experiences.",
            "High": "Arousal significantly enhanced by mental elements (detailed fantasies, role-playing, psychological dynamics, banter).",
            "Very High": "Deeply reliant on the mind. Involves intricate scenarios, world-building, intense psychological play, or finding the conceptual aspect paramount."
        },
        examples: "Mindful presence, enjoying descriptive language, D/s protocol scenes, LARP-style interactions, erotica focus, psychological edge play.",
        personaConnection: "Defines how your thoughts, imagination, and intellect shape your experience." // UI: Defines how your thoughts, imagination, and intellect map your cosmic experience.
    },
    "Relational": {
        name: "Relational Context", // UI: Constellation Structure
        coreQuestion: "In what Structure or with whom do you ideally express yourself?", // UI: In what configuration or with which celestial bodies do you ideally interact?
        coreConcept: "This Force describes your preferred social structure and context for connection and expression.", // UI: ... your preferred configuration and context for cosmic connection...
        elaboration: "Considers number of partners, commitment level, intimacy level, familiarity vs. anonymity, dyadic vs. group interaction. Covers solitary, monogamy, CNM.",
        scoreInterpretations: {
            "Very Low": "Strong preference for solitary expression or strictly exclusive lifelong partnership (Traditional Monogamy). Discomfort with multiple partners/casual encounters.",
            "Low": "Generally prefers/seeks monogamous, committed relationships. Casual connection less appealing.",
            "Moderate": "Comfortable with committed dyads but potentially open to flexibility (swinging, casual dating) or values deep connection without strict exclusivity (Solo Poly leaning).",
            "High": "Prefers or practices structures involving multiple partners/openness (Open Relationships, Polyamory). Values communication around multiple connections.",
            "Very High": "Strong preference for highly fluid, non-traditional structures (Relationship Anarchy, non-hierarchical Polyamory, group dynamics). Rejects rigid rules."
        },
        examples: "Solitary practice, Serial Monogamy, Lifelong Monogamy, Friends With Benefits, Open Relationships, Swinging, Triads/Quads, Hierarchical Polyamory, Egalitarian Polyamory, Solo Polyamory, Relationship Anarchy, Group interactions, Anonymous encounters.",
        personaConnection: "Defines the preferred social constellation for your connections." // UI: Defines the preferred social constellation for your cosmic connections.
    }
};

// Star (Concept) Data - Keywords added, content not rewritten yet
const concepts = [
    // --- Common Concepts ---
    { id: 1, name: "Vanilla Sex", cardType: "Practice/Kink", visualHandle: "common_vanilla", primaryElement: "S", elementScores: { A: 5, I: 5, S: 3, P: 4, C: 3, R: 4 }, briefDescription: "Conventional activity.", detailedDescription: "Refers to expression generally considered within conventional norms...", relatedIds: [2, 3, 33], rarity: 'common', canUnlockArt: false, keywords: ['Conventional', 'Physical', 'Simple', 'Mainstream'] },
    { id: 2, name: "Sensual Touch", cardType: "Practice/Kink", visualHandle: "common_sensual", primaryElement: "S", elementScores: { A: 4, I: 4, S: 4, P: 5, C: 2, R: 4 }, briefDescription: "Gentle, affectionate touch.", detailedDescription: "Focus on gentle, affectionate, and pleasurable touch...", relatedIds: [1, 15, 31, 3, 80, 102], rarity: 'common', canUnlockArt: true, visualHandleUnlocked: "common_sensual_art", keywords: ['Gentle', 'Affection', 'Connection', 'Sensation', 'Comfort', 'Touch'] },
    { id: 3, name: "Passionate Kissing", cardType: "Practice/Kink", visualHandle: "common_kissing", primaryElement: "S", elementScores: { A: 6, I: 5, S: 5, P: 6, C: 3, R: 5 }, briefDescription: "Intense, emotional kissing.", detailedDescription: "Intense and emotionally charged kissing...", relatedIds: [1, 2, 15, 47, 66, 85], rarity: 'common', canUnlockArt: false, keywords: ['Intensity', 'Emotion', 'Connection', 'Sensation', 'Intimacy', 'Kissing'] },
    { id: 22, name: "Monogamy", cardType: "Relationship Style", visualHandle: "common_mono", primaryElement: "R", elementScores: { A: 5, I: 5, S: 5, P: 6, C: 5, R: 2 }, briefDescription: "One partner at a time.", detailedDescription: "The practice or preference for having only one partner...", relatedIds: [23, 15, 29, 59, 76], rarity: 'common', canUnlockArt: true, visualHandleUnlocked: "common_mono_art", keywords: ['Structure', 'Exclusivity', 'Commitment', 'Dyad', 'One Partner'] },
    { id: 4, name: "Dominance (Psychological)", cardType: "Identity/Role", visualHandle: "uncommon_dom", primaryElement: "I", elementScores: { A: 6, I: 9, S: 5, P: 8, C: 7, R: 6 }, briefDescription: "Taking psychological control.", detailedDescription: "Focuses on the mental and emotional aspects of control...", relatedIds: [5, 6, 11, 30, 38, 81, 89, 90, 100, 104, 109, 123], rarity: 'uncommon', canUnlockArt: true, visualHandleUnlocked: "uncommon_dom_art", keywords: ['Control', 'Power', 'Leading', 'Psychological', 'Rules', 'Structure', 'Dominant'] },
    { id: 5, name: "Submission (Psychological)", cardType: "Identity/Role", visualHandle: "uncommon_sub", primaryElement: "I", elementScores: { A: 6, I: 1, S: 5, P: 8, C: 5, R: 6 }, briefDescription: "Yielding psychological control.", detailedDescription: "Focuses on the mental and emotional aspects of yielding control...", relatedIds: [4, 6, 17, 10, 12, 37, 39, 58, 61, 63, 87, 91, 98, 99, 109, 119, 123], rarity: 'uncommon', canUnlockArt: true, visualHandleUnlocked: "uncommon_sub_art", keywords: ['Surrender', 'Power', 'Following', 'Psychological', 'Obedience', 'Trust', 'Vulnerability', 'Submissive'] },
    // ... (Continue adding keywords to ALL concepts) ...
    // --- Make sure ALL concepts from the previous version are here ---
    // --- Remember to add the `keywords` array to each one ---
];

// --- Utility Maps & Arrays ---
const elementKeyToFullName = { A: "Attraction", I: "Interaction", S: "Sensory", P: "Psychological", C: "Cognitive", R: "Relational" };
const elementNameToKey = Object.fromEntries(Object.entries(elementKeyToFullName).map(([key, value]) => [value, key]));
const cardTypeKeys = ["Orientation", "Identity/Role", "Practice/Kink", "Psychological/Goal", "Relationship Style"];
const elementNames = ["Attraction", "Interaction", "Sensory", "Psychological", "Cognitive", "Relational"];

// --- Charting (Questionnaire) Data ---
// Content NOT rewritten for theme yet
const questionnaireGuided = { /* ... Keep existing data structure ... */ };

// --- Reflection Prompts ---
// Content NOT rewritten for theme yet
const reflectionPrompts = { /* ... Keep existing data structure ... */ };

// --- Force Insight (Element Deep Dive) Content ---
// Content NOT rewritten for theme yet
const elementDeepDive = { /* ... Keep existing data structure ... */ };

// --- Stellar Harmonics (Rituals) Data ---
// Content NOT rewritten for theme yet
const dailyRituals = [ /* ... Keep existing data structure ... */ ];
const focusRituals = [ /* ... Keep existing data structure ... */ ];

// --- Cartography (Repository) Item Data ---
// Content NOT rewritten for theme yet
const sceneBlueprints = [ /* ... Keep existing data structure ... */ ];
const alchemicalExperiments = [ /* ... Keep existing data structure ... */ ];
const elementalInsights = [ /* ... Keep existing data structure ... */ ];

// --- Synergy (Focus-Driven) Unlocks Data ---
// Content NOT rewritten for theme yet
const focusDrivenUnlocks = [ /* ... Keep existing data structure ... */ ];

// --- Legendary Alignments (Milestones) Data ---
// Content NOT rewritten for theme yet
const milestones = [ /* ... Keep existing data structure ... */ ];

// --- Constellation Narrative Theme Data (NEW) ---
// Renamed elementInteractionThemes -> forceInteractionThemes
const forceInteractionThemes = { /* ... Keep existing structure, maybe update text later ... */ };
// Renamed cardTypeThemes -> starTypeThemes
const starTypeThemes = { /* ... Keep existing structure, maybe update text later ... */ };

// Ensure all original exports are kept, maybe rename for clarity if desired later
export {
    elementDetails, // Force Details
    concepts, // Star Data
    questionnaireGuided, // Charting Questions
    reflectionPrompts, // Reflection Signals
    elementDeepDive, // Force Insights Levels
    focusRituals, // Alignment Harmonics?
    sceneBlueprints, // Nebula Blueprints
    alchemicalExperiments, // Stable Orbits Data
    elementalInsights, // Cosmic Whispers
    focusDrivenUnlocks, // Synergy Unlock Data
    dailyRituals, // Daily Harmonics?
    milestones, // Legendary Alignments Data
    elementKeyToFullName, // Force Key -> Name map
    elementNameToKey,     // Force Name -> Key map
    cardTypeKeys,         // Star Type Keys
    elementNames,         // Force Names Array
    forceInteractionThemes, // Renamed
    starTypeThemes          // Renamed
};

console.log("data.js exports defined.");
console.log("data.js finished.");
