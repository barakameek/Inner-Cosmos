console.log("data.js starting... Now with RARE lore and shelves!");

const elementDetails = {
    "Attraction": {
        name: "Attraction Focus: The Spark Plug",
        coreQuestion: "Seriously, who or what flips *your* switch?",
        coreConcept: "Think of this as your personal 'Desire Compass'. What actually *points* you towards sexy feelings? It's more than just gender – it could be someone's vibe, a specific situation, a shared brainwave, or even cool objects or ideas.",
        elaboration: "Yeah, it covers the usual suspects (straight, gay, bi, pan), but also the whole amazing Asexuality spectrum (where attraction might be low-key or absent) and Demisexuality (needing that deep connection first). Plus, maybe you're drawn to brainiacs (hello, Sapiosexuals!), certain power vibes, specific looks, or even super specific things like latex or scenarios (sometimes called fetishes – we explore 'em all judgment-free here!).",
        scoreInterpretations: {
            "Very Low": "Your Spark Plug might run cool! Strong Asexual vibes here – maybe attraction isn't really your jam, or it pops up rarely and isn't tied to specific things. Totally cool!",
            "Low": "Less about specific targets, more about the *feeling*. Maybe you need that deep Demisexual bond first, or your desire tends to respond rather than initiate. Your spark is selective!",
            "Moderate": "A pretty common setting! You might vibe with familiar things like gender or style, be open to lots of people (Pan-leaning maybe?), or need *some* connection but not necessarily a soul-bond first.",
            "High": "Ooh, a strong pull! You likely have specific types, dynamics (brains? power?), or even certain objects/materials/situations that really get your engine going. Hello, focused desire!",
            "Very High": "Laser focus! Your attraction might be super specific to a narrow group, OR certain objects, materials, vibes, or scenarios are absolute *must-haves* to light your fire. This is where strong fetishes live!"
        },
        examples: "Think stuff like: Asexuality, Demisexuality, Straight, Gay, Bi, Pan, Sapiosexuals, Fetishes (latex, feet, uniforms – you name it!), digging certain body types, getting turned on by D/s roles.",
        personaConnection: "What this means for *your* unique sexy magic: Defines the 'who' or 'what' gets your attention."
    },
    "Interaction": {
        name: "Interaction Style: The Dance Floor",
        coreQuestion: "How do you like to move and groove during sexy times?",
        coreConcept: "This is all about your preferred 'dance moves' in the bedroom (or wherever!). Are you leading, following, or improvising together? What's the energy like?",
        elaboration: "Covers the whole spectrum from taking charge to happily following along. Do you like things equal, or is a power difference your jam? Includes vibes like being nurturing, playful, commanding, serving, or even putting on a bit of a show. Think: Dom, Sub, Switch, Top, Bottom, Caregiver, etc.",
        scoreInterpretations: {
            "Very Low": "Leaning back feels good! You likely love yielding control, following clear steps, serving, or being totally taken care of. Strong Submissive energy!",
            "Low": "Happy to let others lead the dance! You might prefer supporting roles or focusing on receiving pleasure more than directing it. Submissive or Bottom vibes likely.",
            "Moderate": "Let's dance together! You probably enjoy give-and-take, maybe swapping who leads (hello, Switches!), or keeping things playful and mutual.",
            "High": "Ready to lead! You enjoy taking charge, guiding the flow, dishing out sensation or care, or being the star of the show. Dominant, Top, or Caregiver energy shining through.",
            "Very High": "You *thrive* on being in the driver's seat! Giving clear directions, commanding the scene, or fully embodying a powerful Dominant role feels right. Maybe you love seeing your partner react!"
        },
        examples: "Think stuff like: D/s (Dominance/submission), M/s (Master/slave), Top/Bottom/Versatile, Primal Play (getting growly!), Service stuff, Show-offs & Watchers (Exhibitionism/Voyeurism), Teacher/Student vibes, Caregiver/Little dynamics (DDlg/MDlb).",
        personaConnection: "What this means for *your* unique sexy magic: Defines your favorite way to 'partner up' and share energy."
    },
    "Sensory": {
        name: "Sensory Emphasis: The Feeling Finder",
        coreQuestion: "What physical sensations make you go 'Ooh!' or 'Aah!'?",
        coreConcept: "This is all about how much *physical feeling* matters to you – the type, the intensity, the whole shebang. Touch, temperature, textures, pressure, even sights, sounds, and smells!",
        elaboration: "Covers everything your senses pick up! Light touches, firm grips, maybe even a little impact? Hot wax, cool ice? Smooth silk, rough rope? Tight squeezes, gentle vibrations? Plus, how sights, sounds, or smells play into it. It also includes the whole spectrum from pure pleasure to playing with pain or intensity (like in BDSM).",
        scoreInterpretations: {
            "Very Low": "Feelings are meh? Physical stuff might be way less important than the emotional vibe or the mental game for you. Intense sensations are probably a 'no thanks'.",
            "Low": "Gentle does it! You likely prefer soft, warm, affectionate, or 'vanilla' sensations. Comfort is key, intense stuff is usually off the table.",
            "Moderate": "You enjoy the classics! A good range of pleasant physical feelings is nice. Maybe you're curious about *mild* intensity (a light spank?), but it's not the main event.",
            "High": "Sensation Seeker! You actively look for specific, strong, or unique physical feelings. Think impact play, temperature games, specific textures (latex!), light bondage, or really zoning in on pleasure spots.",
            "Very High": "INTENSITY NOW! You might *need* strong, specific, or even extreme sensations. Heavy BDSM play (impact, needles, wax - handled safely!), tight bondage, sensory overload/deprivation, or a powerful focus on *very* specific triggers could be your jam."
        },
        examples: "Think stuff like: Gentle massage, deep kisses, cuddles, BDSM impact (flogging, caning), wax play, ice cubes, rope bondage (Shibari!), blindfolds, e-stim toys, loving the feel of specific fabrics.",
        personaConnection: "What this means for *your* unique sexy magic: Defines how your body likes to experience pleasure (or interesting intensity!)."
    },
    "Psychological": {
        name: "Psychological Driver: The Heart's Quest",
        coreQuestion: "Beyond the physical, *why* sex? What deep-down need does it scratch?",
        coreConcept: "This digs into the core reasons *behind* the sexy times. What emotional, mental, or even soul-level needs does it help you meet or express?",
        elaboration: "It's about the deeper 'why'. Is it about connection (intimacy, trust, vulnerability)? Power (control, surrender)? Self-expression (creativity, validation)? Changing your state (escape, catharsis, stress relief)? Or finding comfort and security?",
        scoreInterpretations: {
            "Very Low": "Maybe sex is mostly about physical release or just plain fun for you? Deeper psychological itches might get scratched elsewhere.",
            "Low": "The emotional side is nice, but maybe not the main focus. Fun, stress relief, or light connection could be the usual drivers.",
            "Moderate": "A healthy mix! Sex probably ticks several boxes – connection, stress relief, fun, feeling good about yourself – alongside the physical enjoyment.",
            "High": "Sex is a key channel for meeting specific, important inner needs. You might consciously (or unconsciously) seek out intimacy, power exchange, validation, or emotional release through it.",
            "Very High": "Hitting that deep psychological spot is *the point*. If core needs like total surrender, absolute control, deep vulnerability, or escaping reality aren't met, the experience might feel hollow."
        },
        examples: "Think stuff like: Using sex mainly to de-stress (Low/Moderate), building deep emotional bonds through intimacy (High), using BDSM for power exchange or letting off steam (High/Very High), needing to feel desired/validated (High), chasing intense 'out of body' feelings (Very High).",
        personaConnection: "What this means for *your* unique sexy magic: Defines the emotional 'why' behind your sexual expression."
    },
    "Cognitive": {
        name: "Cognitive Engagement: The Mind Palace",
        coreQuestion: "How much headspace does sex take up? Is it all about fantasy, scenarios, and brainpower?",
        coreConcept: "This measures how much your *mind* gets involved. Are you all about being present in the moment, or do fantasies, stories, psychological games, or witty banter fuel your fire?",
        elaboration: "Includes everything from being totally zoned into physical sensations to having elaborate fantasy worlds, playing out detailed roles, loving mind games, or getting turned on by clever talk or the *idea* of a dynamic.",
        scoreInterpretations: {
            "Very Low": "Headspace clear! You prefer being fully present and feeling things physically and emotionally. Complex fantasies or analyzing things might just pull you out of the moment.",
            "Low": "Mostly here and now! You enjoy the immediate sensations. Maybe a light scenario pops into your head, but you're not relying on a big internal movie.",
            "Moderate": "Mind + Body synergy! You can enjoy being present, but also appreciate some mental spice – maybe occasional role-play, dirty talk that paints a picture, or getting into the psychology of it.",
            "High": "Your brain is a major erogenous zone! Detailed fantasies, specific role-play scenarios, playing with power dynamics mentally, or sharp, sexy banter really amps things up for you.",
            "Very High": "Welcome to the Mind Palace! Your arousal might *depend* on intricate scenarios, complex fantasy worlds, intense psychological play (mind games!), or the sheer *concept* of what's happening. The story in your head is key."
        },
        examples: "Think stuff like: Mindful, connected touch (Low), loving descriptive dirty talk (Moderate), detailed D/s scenes with rules (High/Very High), fantasy LARP-style encounters (High/Very High), getting off on writing/reading complex erotica (High/Very High), intense psychological manipulation play (Very High).",
        personaConnection: "What this means for *your* unique sexy magic: Defines how much your thoughts and imagination get in on the action."
    },
    "Relational": {
        name: "Relational Context: The Constellation",
        coreQuestion: "What's your ideal setup? Who do you connect with, and how?",
        coreConcept: "This describes your preferred 'social map' for sex and relationships. How many partners? How much commitment? Strangers or soulmates? One-on-one or group hangs?",
        elaboration: "Covers the whole range: flying solo, traditional monogamy, different flavors of ethical non-monogamy (like polyamory or open relationships), group fun, and everything in between. It's about the structure you thrive in.",
        scoreInterpretations: {
            "Very Low": "Solo voyages or a 'just us two' liftoff! You likely prefer masturbation or a deeply bonded, exclusive partnership. Multiple partners or casual stuff might not appeal.",
            "Low": "Team Monogamy! You generally prefer and seeks monogamous, committed relationships as the ideal context for sexual expression. Casual sex is less appealing or infrequent.",
            "Moderate": "Flexible connections! Maybe you're comfy in a duo but open to possibilities (like swinging sometimes, or dating around before settling down), or value deep bonds without needing strict lifelong exclusivity. Exploring non-monogamy or happy being Solo Poly?",
            "High": "More the merrier (consensually)! You prefer or practice structures involving multiple partners or explicit openness, such as Open Relationships or various forms of Polyamory (hierarchical or not). Communication about connections is key.",
            "Very High": "Charting your own course! You might lean towards Relationship Anarchy (no set rules!), embrace non-hierarchical Polyamory, enjoy group dynamics, or feel comfortable with different levels of commitment and connection across various partners. 'One size fits all' doesn't work for you."
        },
        examples: "Think stuff like: Masturbation, Serial Monogamy, Lifelong Monogamy, Friends With Benefits, Open Relationships, Swinging, Triads/Quads, Hierarchical Polyamory, Egalitarian Polyamory, Solo Polyamory, Relationship Anarchy, Group Sex, Anonymous hookups.",
        personaConnection: "What this means for *your* unique sexy magic: Defines your ideal 'relationship constellation' (or lack thereof!)."
    }
};

// --- SHELF DEFINITIONS ---
// Note: Using 'export const' exports it immediately. No need to list in the final export block.
 const grimoireShelves = [
    { id: "uncategorized", name: "Unsorted Discoveries", description: "Newly added Concepts land here. Drag them to other shelves to organize!" },
    { id: "wantToTry", name: "Curious Experiments", description: "Concepts you're intrigued by and want to explore further in thought or practice." },
    { id: "liked", name: "Resonant Echoes", description: "Concepts you've explored and found enjoyable or affirming." },
    { id: "dislikedLimit", name: "Boundaries Drawn", description: "Concepts that don't resonate, feel uncomfortable, or represent a hard limit." },
    { id: "coreIdentity", name: "Pillars of Self", description: "Concepts that feel fundamental to your current understanding of your persona." }
];
// --- END SHELF DEFINITIONS ---

const concepts = [ // Ensure commas after lore arrays
    // --- Common Concepts ---
  

{
    id: 1, name: "Vanilla Sex", cardType: "Practice/Kink", visualHandle: "common_vanilla.jpg", primaryElement: "S", elementScores: { A: 5, I: 5, S: 3, P: 4, C: 3, R: 4 }, briefDescription: "The usual suspects.", detailedDescription: "Think 'mainstream' sexy times...", relatedIds: [2, 3, 33], rarity: 'common', keywords: ['Conventional', 'Physical', 'Simple', 'Mainstream'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Foundation Stone: Often the starting point, the baseline from which other explorations begin.", unlocked: false },
        { level: 2, insightCost: 7, text: "Comfort's Embrace: Its familiarity can provide comfort, reliability, and a sense of shared 'normalcy'.", unlocked: false }
    ]
},
{
    id: 2, name: "Sensual Touch", cardType: "Practice/Kink", visualHandle: "common_sensual_touch.jpg", primaryElement: "S", elementScores: { A: 4, I: 4, S: 4, P: 5, C: 2, R: 4 }, briefDescription: "Gentle, connected touch.", detailedDescription: "Slow down and *feel*! This is about soft, loving touch...", relatedIds: [1, 15, 31, 3, 80, 102], rarity: 'common', keywords: ['Gentle', 'Affection', 'Connection', 'Sensation', 'Comfort', 'Slow'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Whispers on Skin: Communicates care and presence beyond words.", unlocked: false },
        { level: 2, insightCost: 7, text: "Mindful Moment: Focusing purely on the sensation of touch can be a powerful grounding technique.", unlocked: false }
    ]
},
{
    id: 3, name: "Passionate Kissing", cardType: "Practice/Kink", visualHandle: "common_kissing.jpg", primaryElement: "S", elementScores: { A: 6, I: 5, S: 5, P: 6, C: 3, R: 5 }, briefDescription: "Kissing like you mean it.", detailedDescription: "More than just a peck! This is when kissing becomes a whole conversation...", relatedIds: [1, 2, 15, 47, 66, 85], rarity: 'common', keywords: ['Intensity', 'Emotion', 'Connection', 'Sensation', 'Intimacy', 'Kissing'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "The First Spark: Often the initial gateway to deeper physical and emotional intimacy.", unlocked: false },
        { level: 2, insightCost: 7, text: "Dialogue of Lips: A passionate kiss can convey desire, urgency, tenderness, or dominance without a single word.", unlocked: false }
    ]
},
{
    id: 15, name: "Deep Emotional Intimacy", cardType: "Psychological/Goal", visualHandle: "uncommon_intimacy_art.jpg", primaryElement: "P", elementScores: { A: 7, I: 5, S: 4, P: 9, C: 5, R: 7 }, briefDescription: "Seeking that soul connection.", detailedDescription: "For you, sex might be a powerful way to get *really* close emotionally...", relatedIds: [2, 3, 22, 29, 47, 58, 68, 70, 75, 76, 82, 83, 123, 59], rarity: 'uncommon', // This was uncommon, but adding example lore anyway
    lore: [
        { level: 1, insightCost: 3, text: "Vulnerability as Strength: Sharing deep feelings during intimacy builds profound trust.", unlocked: false },
        { level: 2, insightCost: 7, text: "Soul Gazing: The feeling of being truly 'seen' and accepted by a partner is a powerful psychological reward.", unlocked: false }
    ]
},
{
    id: 22, name: "Monogamy", cardType: "Relationship Style", visualHandle: "common_mono.jpg", primaryElement: "R", elementScores: { A: 5, I: 5, S: 5, P: 6, C: 5, R: 2 }, briefDescription: "One partner at a time.", detailedDescription: "Keeping it exclusive! Preferring or practicing having just one sexual...", relatedIds: [23, 15, 29, 59, 76], rarity: 'common', keywords: ['Structure', 'Exclusivity', 'Commitment', 'Dyad', 'One-on-One'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Focused Flame: Pouring relational energy into a single bond can create intense depth and security.", unlocked: false },
        { level: 2, insightCost: 7, text: "Shared History: The exclusivity allows for the building of a unique shared world and history.", unlocked: false }
    ]
},
{
    id: 23, name: "Serial Monogamy", cardType: "Relationship Style", visualHandle: "common_serialmono.jpg", primaryElement: "R", elementScores: { A: 5, I: 5, S: 5, P: 5, C: 5, R: 3 }, briefDescription: "One exclusive relationship after another.", detailedDescription: "Like monogamy, but in sequence! Engaging in one exclusive relationship...", relatedIds: [22, 24], rarity: 'common', keywords: ['Structure', 'Exclusivity', 'Sequence', 'Relationship'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Chapter by Chapter: Exploring deep connections one at a time, learning and growing with each.", unlocked: false },
        { level: 2, insightCost: 7, text: "Balancing Act: Holds onto the structure of monogamy while allowing for change and new beginnings over time.", unlocked: false }
    ]
},
{
    id: 24, name: "Casual Sex / Hookups", cardType: "Relationship Style", visualHandle: "common_casual.jpg", primaryElement: "R", elementScores: { A: 6, I: 4, S: 6, P: 3, C: 3, R: 5 }, briefDescription: "Sexy times, no strings attached.", detailedDescription: "Getting physical without the relationship label...", relatedIds: [23, 26, 35, 56, 65, 79, 84], rarity: 'common', keywords: ['Fleeting', 'Physical', 'Low-Commitment', 'Exploration', 'Casual', 'NSA'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Freedom & Exploration: Allows for exploring physical chemistry and desire without long-term entanglement.", unlocked: false },
        { level: 2, insightCost: 7, text: "Clarity is Kind: While low-commitment, clear communication about expectations (or lack thereof) is still key.", unlocked: false }
    ]
},
{
    id: 31, name: "Cuddling / Affection", cardType: "Practice/Kink", visualHandle: "common_cuddle.jpg", primaryElement: "P", elementScores: { A: 3, I: 3, S: 3, P: 6, C: 2, R: 4 }, briefDescription: "Just wanna snuggle.", detailedDescription: "Pure physical closeness without the sexy pressure...", relatedIds: [2, 15, 48, 69, 80], rarity: 'common', keywords: ['Comfort', 'Affection', 'Security', 'Connection', 'Gentle', 'Cuddle'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "The Human Need for Touch: Satisfies a fundamental desire for warmth, safety, and non-demanding connection.", unlocked: false },
        { level: 2, insightCost: 7, text: "Silent Language: Cuddling can communicate care, reassurance, and presence when words fail.", unlocked: false }
    ]
},
{
    id: 32, name: "Dirty Talk", cardType: "Practice/Kink", visualHandle: "common_dirtytalk.jpg", primaryElement: "C", elementScores: { A: 5, I: 6, S: 3, P: 5, C: 7, R: 5 }, briefDescription: "Talking the talk.", detailedDescription: "Using your words! Saying sexy things...", relatedIds: [13, 11, 4, 5, 46, 49, 66, 74], rarity: 'common', keywords: ['Language', 'Cognitive', 'Arousal', 'Expression', 'Fantasy', 'Verbal'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Painting Pictures with Words: Can create vivid mental imagery, amplifying arousal and guiding fantasy.", unlocked: false },
        { level: 2, insightCost: 7, text: "Vocal Power: The tone, volume, and specific words used can significantly shape the power dynamic and emotional intensity.", unlocked: false }
    ]
},
{
    id: 33, name: "Mutual Masturbation", cardType: "Practice/Kink", visualHandle: "common_mutualmast.jpg", primaryElement: "I", elementScores: { A: 5, I: 5, S: 6, P: 4, C: 4, R: 5 }, briefDescription: "Getting off together, separately.", detailedDescription: "Partners masturbating at the same time...", relatedIds: [1, 18, 19, 72], rarity: 'common', keywords: ['Shared', 'Physical', 'Visual', 'Sensation', 'Masturbation'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Shared Vulnerability: Witnessing a partner's self-pleasure can be uniquely intimate and informative.", unlocked: false },
        { level: 2, insightCost: 7, text: "Visual Feedback Loop: Watching each other can create a cycle of escalating arousal.", unlocked: false }
    ]
},
{
    id: 46, name: "Compliments / Praise", cardType: "Practice/Kink", visualHandle: "common_praise.jpg", primaryElement: "P", elementScores: { A: 4, I: 5, S: 2, P: 7, C: 4, R: 5 }, briefDescription: "Words that feel good.", detailedDescription: "Using positive words – compliments on looks, skills...", relatedIds: [32, 15, 50], rarity: 'common', keywords: ['Validation', 'Affirmation', 'Psychological', 'Connection', 'Confidence', 'Praise'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Verbal Sunlight: Genuine praise can nourish confidence and deepen feelings of being valued.", unlocked: false },
        { level: 2, insightCost: 7, text: "Specificity Matters: Praising specific actions or qualities often lands with more impact than generic compliments.", unlocked: false }
    ]
},
{
    id: 47, name: "Eye Contact", cardType: "Practice/Kink", visualHandle: "common_eyecontact.jpg", primaryElement: "P", elementScores: { A: 5, I: 6, S: 2, P: 7, C: 3, R: 6 }, briefDescription: "That intense gaze.", detailedDescription: "Locking eyes during sexy times! Can create super intense intimacy...", relatedIds: [3, 15], rarity: 'common', keywords: ['Intimacy', 'Connection', 'Vulnerability', 'Presence', 'Focus', 'Eyes'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Windows to the Soul: Sustained eye contact bypasses defenses, fostering raw connection.", unlocked: false },
        { level: 2, insightCost: 7, text: "The Unblinking Gaze: Can be used to assert dominance, demand attention, or convey unwavering presence.", unlocked: false }
    ]
},
{
    id: 48, name: "Holding Hands", cardType: "Practice/Kink", visualHandle: "common_handholding.jpg", primaryElement: "P", elementScores: { A: 3, I: 4, S: 3, P: 5, C: 1, R: 4 }, briefDescription: "Simple, connected touch.", detailedDescription: "Sometimes the simplest things are the sweetest...", relatedIds: [2, 31, 77], rarity: 'common', keywords: ['Affection', 'Connection', 'Comfort', 'Simple', 'Touch'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Silent Anchor: A simple clasp can convey partnership, reassurance, and belonging.", unlocked: false },
        { level: 2, insightCost: 7, text: "Subtle Pulse: The feeling of another's pulse through held hands is a quiet reminder of shared life.", unlocked: false }
    ]
},
{
    id: 49, name: "Shared Fantasy Talk", cardType: "Practice/Kink", visualHandle: "common_fantasytalk.jpg", primaryElement: "C", elementScores: { A: 5, I: 5, S: 3, P: 6, C: 6, R: 5 }, briefDescription: "Talking through fantasies together.", detailedDescription: "Sharing your secret brain movies! Partners describe their fantasies out loud...", relatedIds: [32, 14], rarity: 'common', keywords: ['Fantasy', 'Cognitive', 'Sharing', 'Arousal', 'Communication', 'Verbal'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Building Worlds Together: Co-creating a fantasy verbally can be a deeply collaborative and intimate act.", unlocked: false },
        { level: 2, insightCost: 7, text: "Testing the Waters: Allows partners to gauge interest in potential scenarios before enacting them.", unlocked: false }
    ]
},
{
    id: 50, name: "Validation Seeking", cardType: "Psychological/Goal", visualHandle: "common_validation.jpg", primaryElement: "P", elementScores: { A: 5, I: 6, S: 5, P: 7, C: 4, R: 5 }, briefDescription: "Needing to feel desired/good.", detailedDescription: "A big motivator for sex might be the need to feel wanted...", relatedIds: [18, 46, 91], rarity: 'common', keywords: ['Validation', 'Psychological', 'Need', 'Desire', 'Performance', 'Approval'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Mirror Gazing: Seeking reflection of one's desirability or skill in a partner's responses.", unlocked: false },
        { level: 2, insightCost: 7, text: "Double-Edged Sword: While understandable, relying heavily on external validation can create pressure or insecurity.", unlocked: false }
    ]
},
{
    id: 51, name: "Stress Relief Focus", cardType: "Psychological/Goal", visualHandle: "common_stressrelief.jpg", primaryElement: "P", elementScores: { A: 4, I: 4, S: 5, P: 6, C: 3, R: 4 }, briefDescription: "Sex as a way to unwind.", detailedDescription: "Feeling stressed? For some, sex (especially orgasm) is a go-to way...", relatedIds: [1], rarity: 'common', keywords: ['Stress Relief', 'Relaxation', 'Physical', 'Catharsis', 'Coping'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "The Body's Reset Button: Orgasm triggers a cascade of relaxing neurochemicals.", unlocked: false },
        { level: 2, insightCost: 7, text: "Temporary Escape: Can provide a welcome distraction and physical release from daily pressures.", unlocked: false }
    ]
},
{
    id: 52, name: "Heterosexuality", cardType: "Orientation", visualHandle: "common_hetero.jpg", primaryElement: "A", elementScores: { A: 7, I: 5, S: 5, P: 5, C: 5, R: 5 }, briefDescription: "Into different gender(s).", detailedDescription: "Primarily feeling sexual and/or romantic attraction to people of a different gender...", relatedIds: [53, 54, 55], rarity: 'common', keywords: ['Orientation', 'Gender', 'Attraction', 'Straight'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Societal Default?: Often assumed, but still a specific constellation of attraction.", unlocked: false },
        { level: 2, insightCost: 7, text: "Internal Compass: Represents a consistent pattern of desire oriented towards different genders.", unlocked: false }
    ]
},
{
    id: 53, name: "Homosexuality", cardType: "Orientation", visualHandle: "common_homo.jpg", primaryElement: "A", elementScores: { A: 7, I: 5, S: 5, P: 5, C: 5, R: 5 }, briefDescription: "Into the same gender(s).", detailedDescription: "Primarily feeling sexual and/or romantic attraction to people of the same gender...", relatedIds: [52, 54, 55], rarity: 'common', keywords: ['Orientation', 'Gender', 'Attraction', 'Gay', 'Lesbian'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Mirror Attraction: Desire directed towards those who share a similar gender identity.", unlocked: false },
        { level: 2, insightCost: 7, text: "Community & Culture: Often associated with specific LGBTQ+ communities and cultural expressions.", unlocked: false }
    ]
},
{
    id: 54, name: "Bisexuality", cardType: "Orientation", visualHandle: "common_bi.jpg", primaryElement: "A", elementScores: { A: 6, I: 5, S: 5, P: 5, C: 5, R: 5 }, briefDescription: "Into two or more genders.", detailedDescription: "Feeling sexual and/or romantic attraction to more than one gender identity...", relatedIds: [52, 53, 55], rarity: 'common', keywords: ['Orientation', 'Gender', 'Attraction', 'Multiple', 'Bi'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Beyond Binary: Attraction isn't limited to just one gender category.", unlocked: false },
        { level: 2, insightCost: 7, text: "Fluid Spectrum: Attraction might lean differently at different times or towards different individuals.", unlocked: false }
    ]
},
{
    id: 55, name: "Pansexuality", cardType: "Orientation", visualHandle: "common_pan.jpg", primaryElement: "A", elementScores: { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5 }, briefDescription: "Attraction beyond gender.", detailedDescription: "Feeling sexual and/or romantic attraction to people *regardless* of their gender...", relatedIds: [52, 53, 54, 103], rarity: 'common', keywords: ['Orientation', 'Attraction', 'Fluidity', 'Personality', 'Pan'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Hearts Not Parts: Focuses on the person, connection, or vibe, rather than gender as a primary factor.", unlocked: false },
        { level: 2, insightCost: 7, text: "Expansive View: Opens the door to attraction across the entire spectrum of gender identity and expression.", unlocked: false }
    ]
},
{
    id: 56, name: "Quickie", cardType: "Practice/Kink", visualHandle: "common_quickie.jpg", primaryElement: "I", elementScores: { A: 6, I: 6, S: 6, P: 3, C: 2, R: 4 }, briefDescription: "Fast and fun!", detailedDescription: "Short, sweet, and to the point! A quick sexual encounter...", relatedIds: [1, 24, 79], rarity: 'common', keywords: ['Brief', 'Spontaneous', 'Physical', 'Goal-Oriented', 'Fast'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Efficiency Expert: Sometimes the goal is simply release, achieved with minimal preamble.", unlocked: false },
        { level: 2, insightCost: 7, text: "Thrill of Speed: The rushed nature itself can add a layer of excitement or urgency.", unlocked: false }
    ]
},
{
    id: 66, name: "Foreplay Focus", cardType: "Practice/Kink", visualHandle: "common_foreplay.jpg", primaryElement: "I", elementScores: { A: 5, I: 6, S: 5, P: 5, C: 4, R: 5 }, briefDescription: "Loving the warm-up.", detailedDescription: "For you, the build-up is just as important...", relatedIds: [1, 2, 3, 32, 67, 83], rarity: 'common', keywords: ['Build-up', 'Arousal', 'Connection', 'Intimacy', 'Anticipation', 'Warm-up'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Savoring the Start: Appreciating the journey of arousal, not just the destination.", unlocked: false },
        { level: 2, insightCost: 7, text: "Building the Foundation: Good foreplay sets the stage for deeper connection and more satisfying climaxes.", unlocked: false }
    ]
},
{
    id: 67, name: "Oral Sex (Giving/Receiving)", cardType: "Practice/Kink", visualHandle: "common_oral.jpg", primaryElement: "S", elementScores: { A: 6, I: 6, S: 7, P: 5, C: 3, R: 5 }, briefDescription: "Using your mouth!", detailedDescription: "Getting busy with mouths and tongues on genitals...", relatedIds: [1, 66, 73, 107], rarity: 'common', keywords: ['Sensation', 'Physical', 'Focus', 'Giving', 'Receiving', 'Oral'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Unique Intimacy: Offers a specific kind of focused pleasure and connection.", unlocked: false },
        { level: 2, insightCost: 7, text: "Versatile Act: Can be a central focus or a delightful part of a larger repertoire.", unlocked: false }
    ]
},
{
    id: 68, name: "Romantic Gestures", cardType: "Psychological/Goal", visualHandle: "common_romantic.jpg", primaryElement: "P", elementScores: { A: 5, I: 5, S: 3, P: 7, C: 4, R: 6 }, briefDescription: "Showing love outside the bedroom.", detailedDescription: "Sweet actions that aren't directly sexual but boost the relationship vibe...", relatedIds: [15, 22, 31, 76], rarity: 'common', keywords: ['Romance', 'Affection', 'Care', 'Relationship', 'Connection', 'Gestures'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Nurturing the Bond: Small acts of thoughtfulness reinforce connection and feelings of being cherished.", unlocked: false },
        { level: 2, insightCost: 7, text: "Setting the Stage: Romantic atmosphere often enhances receptiveness to deeper intimacy.", unlocked: false }
    ]
},
{
    id: 69, name: "Aftercare (Basic)", cardType: "Practice/Kink", visualHandle: "common_aftercare.jpg", primaryElement: "P", elementScores: { A: 4, I: 5, S: 4, P: 6, C: 3, R: 6 }, briefDescription: "Post-play connection & comfort.", detailedDescription: "Checking in after the fun stops! Cuddling, talking...", relatedIds: [31, 15, 70, 80, 123], rarity: 'common', keywords: ['Comfort', 'Connection', 'Care', 'Post-Scene', 'Psychological', 'Aftercare'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Gentle Landing: Helps transition back from heightened states, ensuring emotional well-being.", unlocked: false },
        { level: 2, insightCost: 7, text: "Reinforcing Trust: Demonstrates care for the person beyond the sexual act.", unlocked: false }
    ]
},
{
    id: 70, name: "Pillow Talk", cardType: "Practice/Kink", visualHandle: "common_pillowtalk.jpg", primaryElement: "P", elementScores: { A: 4, I: 4, S: 2, P: 7, C: 4, R: 7 }, briefDescription: "Cozy chats after sex.", detailedDescription: "Those relaxed, intimate, maybe vulnerable conversations...", relatedIds: [69, 15], rarity: 'common', keywords: ['Intimacy', 'Conversation', 'Vulnerability', 'Connection', 'Post-Scene', 'Talk'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Heart Opening: Post-coital hormones can lower defenses, facilitating deeper sharing.", unlocked: false },
        { level: 2, insightCost: 7, text: "Weaving the Narrative: Sharing reflections strengthens the shared story of the relationship.", unlocked: false }
    ]
},
{
    id: 71, name: "Shower/Bath Sex", cardType: "Practice/Kink", visualHandle: "common_showersex.jpg", primaryElement: "S", elementScores: { A: 5, I: 5, S: 6, P: 4, C: 3, R: 5 }, briefDescription: "Getting wet 'n' wild.", detailedDescription: "Taking the fun into the shower or bath!...", relatedIds: [1], rarity: 'common', keywords: ['Sensation', 'Environment', 'Water', 'Playful', 'Shower', 'Bath'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Liquid Sensations: Water adds a unique element of slipperiness and temperature.", unlocked: false },
        { level: 2, insightCost: 7, text: "Logistical Fun: Navigating the practicalities can add a layer of playful challenge.", unlocked: false }
    ]
},
{
    id: 72, name: "Using Sex Toys (Simple)", cardType: "Practice/Kink", visualHandle: "common_toys_simple.jpg", primaryElement: "S", elementScores: { A: 5, I: 5, S: 6, P: 4, C: 3, R: 4 }, briefDescription: "Adding some buzz or bounce.", detailedDescription: "Bringing in the basics! Using common toys like simple vibrators...", relatedIds: [1, 33, 73], rarity: 'common', keywords: ['Toys', 'Sensation', 'Stimulation', 'Physical', 'Vibrator', 'Dildo'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Targeted Pleasure: Toys allow for precise and consistent stimulation difficult to achieve manually.", unlocked: false },
        { level: 2, insightCost: 7, text: "Expanding Options: Introduces new textures, sensations, and possibilities for play.", unlocked: false }
    ]
},
{
    id: 73, name: "Lubricant Use", cardType: "Practice/Kink", visualHandle: "common_lube.jpg", primaryElement: "S", elementScores: { A: 4, I: 4, S: 5, P: 3, C: 2, R: 4 }, briefDescription: "Making things slide.", detailedDescription: "Using lube to make things more comfortable...", relatedIds: [1, 67, 72], rarity: 'common', keywords: ['Comfort', 'Sensation', 'Physical', 'Practical', 'Lube'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Comfort Enhancer: Reduces friction, increasing comfort and allowing for longer or different types of play.", unlocked: false },
        { level: 2, insightCost: 7, text: "Sensation Modifier: Different lubes (warming, cooling, silicone, water-based) offer varied sensory experiences.", unlocked: false }
    ]
},
{
    id: 74, name: "Flirting / Banter", cardType: "Interaction", visualHandle: "common_flirt.jpg", primaryElement: "I", elementScores: { A: 6, I: 7, S: 3, P: 5, C: 6, R: 5 }, briefDescription: "Playful, witty chat.", detailedDescription: "That fun, lighthearted back-and-forth! Using suggestive comments...", relatedIds: [32, 60, 75], rarity: 'common', keywords: ['Playful', 'Communication', 'Cognitive', 'Attraction', 'Rapport', 'Banter', 'Flirt'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Testing the Waters: A low-stakes way to gauge interest and build initial connection.", unlocked: false },
        { level: 2, insightCost: 7, text: "The Art of the Tease: Playful banter builds anticipation and establishes a fun dynamic.", unlocked: false }
    ]
},
{
    id: 75, name: "Shared Humor", cardType: "Psychological/Goal", visualHandle: "common_humor.jpg", primaryElement: "P", elementScores: { A: 5, I: 6, S: 2, P: 6, C: 5, R: 6 }, briefDescription: "Laughing together.", detailedDescription: "Finding connection through giggles! Enjoying shared jokes...", relatedIds: [74, 15], rarity: 'common', keywords: ['Humor', 'Connection', 'Playful', 'Psychological', 'Lightness', 'Laughter'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Instant Icebreaker: Laughter diffuses tension and creates an immediate sense of shared experience.", unlocked: false },
        { level: 2, insightCost: 7, text: "Sign of Compatibility: Sharing a sense of humor often indicates aligned values or perspectives.", unlocked: false }
    ]
},
{
    id: 76, name: "Date Nights", cardType: "Relationship Style", visualHandle: "common_datenight.jpg", primaryElement: "R", elementScores: { A: 4, I: 5, S: 4, P: 6, C: 4, R: 5 }, briefDescription: "Making time for connection.", detailedDescription: "Setting aside specific time just for your partner(s) to connect...", relatedIds: [68, 15, 22], rarity: 'common', keywords: ['Relationship', 'Connection', 'Ritual', 'Intimacy', 'Date'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Intentional Investment: Prioritizing relationship health through dedicated quality time.", unlocked: false },
        { level: 2, insightCost: 7, text: "Creating Shared Memories: Rituals like date nights build a bank of positive shared experiences.", unlocked: false }
    ]
},
{
    id: 77, name: "Public Display Affection (Mild)", cardType: "Practice/Kink", visualHandle: "common_pda.jpg", primaryElement: "R", elementScores: { A: 4, I: 5, S: 3, P: 5, C: 2, R: 5 }, briefDescription: "Subtle affection out and about.", detailedDescription: "Showing you're together in public, but keeping it chill...", relatedIds: [48, 3, 78], rarity: 'common', keywords: ['Public', 'Affection', 'Subtle', 'Relationship', 'PDA'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Quiet Connection: A small gesture affirming the bond even amidst the everyday world.", unlocked: false },
        { level: 2, insightCost: 7, text: "Subtle Signal: Can communicate partnership or belonging without drawing significant attention.", unlocked: false }
    ]
},
{
    id: 79, name: "Spontaneity Seeker", cardType: "Psychological/Goal", visualHandle: "common_spontaneity.jpg", primaryElement: "P", elementScores: { A: 6, I: 6, S: 6, P: 5, C: 3, R: 5 }, briefDescription: "Loving the unexpected!", detailedDescription: "Getting a special kick out of unplanned sexy moments...", relatedIds: [56, 24], rarity: 'common', keywords: ['Spontaneous', 'Excitement', 'Unpredictable', 'Physical', 'Surprise'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "The Thrill of Now: Finds excitement in unplanned moments and deviations from routine.", unlocked: false },
        { level: 2, insightCost: 7, text: "Breaking the Script: Resists predictability, seeking energy in the unexpected.", unlocked: false }
    ]
},
{
    id: 80, name: "Comfort Seeker", cardType: "Psychological/Goal", visualHandle: "common_comfort.jpg", primaryElement: "P", elementScores: { A: 3, I: 3, S: 4, P: 7, C: 2, R: 4 }, briefDescription: "Seeking safety & soothing touch.", detailedDescription: "Craving closeness mostly for that feeling of safety, security...", relatedIds: [31, 2, 69], rarity: 'common', keywords: ['Comfort', 'Security', 'Psychological', 'Affection', 'Soothing', 'Safe'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Safe Harbor: Intimacy provides a refuge, a place to feel secure and emotionally held.", unlocked: false },
        { level: 2, insightCost: 7, text: "Restorative Touch: Physical closeness can regulate the nervous system and provide deep soothing.", unlocked: false }
    ]
},
{
    id: 81, name: "Attraction to Confidence", cardType: "Orientation", visualHandle: "common_attr_conf.jpg", primaryElement: "A", elementScores: { A: 7, I: 6, S: 4, P: 6, C: 5, R: 5 }, briefDescription: "Drawn to self-assuredness.", detailedDescription: "Finding someone who knows what they want and carries themselves with confidence...", relatedIds: [4, 60], rarity: 'common', keywords: ['Attraction', 'Confidence', 'Power', 'Personality', 'Assertive'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Power Signature: Confidence radiates a sense of capability and self-possession.", unlocked: false },
        { level: 2, insightCost: 7, text: "Leading Energy: Often translates into a perceived ability to lead or take initiative.", unlocked: false }
    ]
},
{
    id: 82, name: "Attraction to Kindness", cardType: "Orientation", visualHandle: "common_attr_kind.jpg", primaryElement: "A", elementScores: { A: 5, I: 4, S: 4, P: 7, C: 4, R: 6 }, briefDescription: "A kind heart is hot.", detailedDescription: "Being drawn to people who are genuinely kind, empathetic...", relatedIds: [15, 58], rarity: 'common', keywords: ['Attraction', 'Kindness', 'Empathy', 'Connection', 'Personality', 'Nurturing'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Sign of Safety: Kindness often signals emotional intelligence and the capacity for safe connection.", unlocked: false },
        { level: 2, insightCost: 7, text: "Nurturing Resonance: Appeals to a desire for care, understanding, and gentle interaction.", unlocked: false }
    ]
},
{
    id: 83, name: "Slow Burn", cardType: "Practice/Kink", visualHandle: "common_slowburn.jpg", primaryElement: "P", elementScores: { A: 5, I: 5, S: 5, P: 7, C: 5, R: 6 }, briefDescription: "Enjoying the anticipation.", detailedDescription: "Loving the journey, not just the destination! Preferring a gradual...", relatedIds: [15, 66, 38], rarity: 'common', keywords: ['Anticipation', 'Intimacy', 'Tension', 'Psychological', 'Pacing', 'Build-up'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Savoring the Simmer: Finds pleasure in the mounting tension and gradual unfolding of intimacy.", unlocked: false },
        { level: 2, insightCost: 7, text: "Deepening the Flavor: Allows time for emotional connection and subtle nuances to develop.", unlocked: false }
    ]
},
{
    id: 85, name: "Make-up Sex", cardType: "Psychological/Goal", visualHandle: "common_makeupsex.jpg", primaryElement: "P", elementScores: { A: 6, I: 6, S: 6, P: 7, C: 3, R: 5 }, briefDescription: "Post-argument passion.", detailedDescription: "Getting it on after a fight or disagreement...", relatedIds: [3], rarity: 'common', keywords: ['Emotion', 'Intensity', 'Reconciliation', 'Catharsis', 'Conflict'], // Added comma
    lore: [
        { level: 1, insightCost: 3, text: "Emotional Peak: Heightened emotions from conflict can sometimes translate into intense arousal.", unlocked: false },
        { level: 2, insightCost: 7, text: "Reaffirming the Bond: Can serve as a powerful, physical way to reconnect and reaffirm the relationship after conflict.", unlocked: false }
    ]
},


    // --- Uncommon Concepts ---

{
id: 4, name: "Dominance (Psychological)", cardType: "Identity/Role", visualHandle: "uncommon_dom_art.jpg", primaryElement: "I", elementScores: { A: 6, I: 9, S: 5, P: 8, C: 7, R: 6 }, briefDescription: "Leading with your mind.", detailedDescription: "Being the boss, but mentally! This involves taking charge of the vibe, maybe giving instructions, setting rules, making decisions for your partner, or guiding their whole experience. It's about that feeling of control.", relatedIds: [5, 6, 11, 30, 38, 81, 89, 90, 100, 104, 109, 123], rarity: 'uncommon', keywords: ['Control', 'Power', 'Leading', 'Psychological', 'Rules', 'Structure', 'Dominance'],
lore: [
{ level: 1, insightCost: 3, text: "Fragment: The mind, a willing instrument... to play upon or be played.", unlocked: false },
{ level: 2, insightCost: 7, text: "Alchemist's Query: Is true control about unbreakable will, or about understanding the strings of desire?", unlocked: false }
]
},
// Example for ID 5: Submission (Psychological) - Already provided, included for completeness
{
id: 5, name: "Submission (Psychological)", cardType: "Identity/Role", visualHandle: "uncommon_sub_art.jpg", primaryElement: "I", elementScores: { A: 6, I: 1, S: 5, P: 8, C: 5, R: 6 }, briefDescription: "Happily letting go (mentally).", detailedDescription: "Finding joy or fulfillment in handing over the reins, mentally speaking. This can look like following directions, serving, trusting someone else's decisions, or just enjoying the feeling of letting go of control.", relatedIds: [4, 6, 17, 10, 12, 37, 39, 58, 61, 63, 87, 91, 98, 99, 109, 119, 123], rarity: 'uncommon', keywords: ['Surrender', 'Power', 'Following', 'Psychological', 'Obedience', 'Trust', 'Vulnerability', 'Submission'],
lore: [
{ level: 1, insightCost: 3, text: "Reflection: In yielding, sometimes a different kind of strength is found.", unlocked: false },
{ level: 2, insightCost: 7, text: "Observation: Trust is the currency here. It must be earned before it can be spent on surrender.", unlocked: false }
]
},
// Example for ID 6: Switching - Already provided, included for completeness
{
id: 6, name: "Switching", cardType: "Identity/Role", visualHandle: "uncommon_switch.jpg", primaryElement: "I", elementScores: { A: 6, I: 5, S: 6, P: 7, C: 6, R: 6 }, briefDescription: "Playing both sides of the fence.", detailedDescription: "Why choose? Switches love flipping between leading (Dominant) and following (submissive) roles or energies, enjoying the fun and flexibility of both perspectives.", relatedIds: [4, 5], rarity: 'uncommon', keywords: ['Fluidity', 'Power', 'Interaction', 'Versatility', 'Role', 'Switch'],
lore: [
{ level: 1, insightCost: 3, text: "Maxim: 'Know both sides of the coin to understand its true value.'", unlocked: false },
{ level: 2, insightCost: 7, text: "Dynamic Note: The shift itself can be a source of energy, a playful disruption of expectation.", unlocked: false }
]
},
// Example for ID 7: Impact Play (Light) - Already provided, included for completeness
{
id: 7, name: "Impact Play (Light)", cardType: "Practice/Kink", visualHandle: "uncommon_impact_light_art.jpg", primaryElement: "S", elementScores: { A: 5, I: 6, S: 6, P: 5, C: 4, R: 5 }, briefDescription: "Playful taps and swats.", detailedDescription: "Think spanking, light slapping... More about fun sensation than serious pain.", relatedIds: [8, 9, 4, 5, 40, 57, 93, 96], rarity: 'uncommon', keywords: ['Impact', 'Sensation', 'Physical', 'Playful', 'Rhythm', 'Spanking'],
lore: [
{ level: 1, insightCost: 3, text: "Sensory Note: Sometimes a sharp sting is just the wake-up call the skin needs.", unlocked: false },
{ level: 2, insightCost: 7, text: "Rhythm Focus: Beyond sensation, the cadence of light impact can be hypnotic or grounding.", unlocked: false }
]
},
// ID 10: Service Submission
{
id: 10, name: "Service Submission", cardType: "Psychological/Goal", visualHandle: "uncommon_service.jpg", primaryElement: "I", elementScores: { A: 5, I: 2, S: 4, P: 7, C: 4, R: 6 }, briefDescription: "Joy in taking care of someone.", detailedDescription: "A flavor of submission where the big thrill comes from doing things for your partner...", relatedIds: [5, 4, 11, 58, 61, 98, 109], rarity: 'uncommon', keywords: ['Service', 'Submission', 'Psychological', 'Devotion', 'Power', 'Care'],
lore: [
{ level: 1, insightCost: 3, text: "Devotional Echo: 'My purpose is found in anticipating your need.'", unlocked: false },
{ level: 2, insightCost: 7, text: "Observation: The act of service elevates the Dominant while simultaneously grounding the Submissive in purpose.", unlocked: false }
]
},
// ID 13: Role-Playing (Scenario)
{
id: 13, name: "Role-Playing (Scenario)", cardType: "Practice/Kink", visualHandle: "uncommon_roleplay.jpg", primaryElement: "C", elementScores: { A: 6, I: 6, S: 5, P: 6, C: 8, R: 6 }, briefDescription: "Playing characters in scenes.", detailedDescription: "Let's pretend! Adopting specific roles...", relatedIds: [14, 30, 21, 39, 64, 92, 98, 101, 117, 121, 43], rarity: 'uncommon', keywords: ['Role-Play', 'Cognitive', 'Fantasy', 'Scenario', 'Character', 'Pretend'],
lore: [
{ level: 1, insightCost: 3, text: "Actor's Insight: Stepping into a role allows exploration of desires or facets of self otherwise kept hidden.", unlocked: false },
{ level: 2, insightCost: 7, text: "Narrative Power: The chosen scenario dictates the rules of engagement, creating a contained world for play.", unlocked: false }
]
},
// ID 18: Exhibitionism
{
id: 18, name: "Exhibitionism", cardType: "Identity/Role", visualHandle: "uncommon_exhibit.jpg", primaryElement: "I", elementScores: { A: 6, I: 7, S: 5, P: 7, C: 6, R: 5 }, briefDescription: "Loving an audience.", detailedDescription: "Getting off on being watched! Arousal comes from knowing others are seeing you...", relatedIds: [19, 12, 34, 50, 78, 90, 91, 105, 33], rarity: 'uncommon', keywords: ['Performance', 'Visual', 'Public', 'Arousal', 'Validation', 'Exhibitionist'],
lore: [
{ level: 1, insightCost: 3, text: "Performer's Thrill: The gaze of the other transforms the act, adding a layer of vulnerability and excitement.", unlocked: false },
{ level: 2, insightCost: 7, text: "Mirror Effect: Seeing oneself being seen can amplify self-awareness and intensify the experience.", unlocked: false }
]
},
// ID 19: Voyeurism
{
id: 19, name: "Voyeurism", cardType: "Identity/Role", visualHandle: "uncommon_voyeur.jpg", primaryElement: "A", elementScores: { A: 7, I: 2, S: 3, P: 6, C: 5, R: 3 }, briefDescription: "Loving the view.", detailedDescription: "Getting turned on by watching others get it on...", relatedIds: [18, 12, 34, 105, 118, 33], rarity: 'uncommon', keywords: ['Observation', 'Visual', 'Arousal', 'Distance', 'Secret', 'Watching', 'Voyeur'],
lore: [
{ level: 1, insightCost: 3, text: "Observer's Paradox: There's a unique charge in witnessing intimacy from a distance, unseen and uninvolved.", unlocked: false },
{ level: 2, insightCost: 7, text: "Power in Looking: The act of watching, especially if secret, holds its own subtle form of power and control.", unlocked: false }
]
},
// ID 26: Open Relationship
{
id: 26, name: "Open Relationship", cardType: "Relationship Style", visualHandle: "uncommon_openrel.jpg", primaryElement: "R", elementScores: { A: 6, I: 5, S: 6, P: 5, C: 5, R: 7 }, briefDescription: "Main couple, outside fun allowed.", detailedDescription: "Usually a primary couple agrees that one or both partners can have sexual...", relatedIds: [24, 25, 27, 35], rarity: 'uncommon', keywords: ['Non-Monogamy', 'Structure', 'Rules', 'Openness', 'Dyad', 'CNM'],
lore: [
{ level: 1, insightCost: 3, text: "Agreement Atlas: Success hinges on clear communication and mutually agreed-upon boundaries.", unlocked: false },
{ level: 2, insightCost: 7, text: "Emotional Equation: Navigating feelings like jealousy and compersion becomes an active part of the relationship dynamic.", unlocked: false }
]
},
// ID 28: Asexuality
{
id: 28, name: "Asexuality", cardType: "Orientation", visualHandle: "uncommon_ace.jpg", primaryElement: "A", elementScores: { A: 0, I: 3, S: 2, P: 3, C: 3, R: 4 }, briefDescription: "Little or no sexual pull.", detailedDescription: "Feeling little to no sexual attraction towards anyone...", relatedIds: [29, 36], rarity: 'uncommon', keywords: ['Asexuality', 'Orientation', 'Attraction', 'Spectrum', 'Ace'],
lore: [
{ level: 1, insightCost: 3, text: "Spectrum Study: Asexuality isn't a monolith; it encompasses a wide range of experiences with attraction and desire.", unlocked: false },
{ level: 2, insightCost: 7, text: "Beyond the Binary: Intimacy and connection can flourish profoundly, even without the presence of sexual attraction.", unlocked: false }
]
},
// ID 29: Demisexuality
{
id: 29, name: "Demisexuality", cardType: "Orientation", visualHandle: "uncommon_demi.jpg", primaryElement: "A", elementScores: { A: 3, I: 4, S: 4, P: 8, C: 5, R: 5 }, briefDescription: "Connection first, attraction later.", detailedDescription: "The spark only ignites after a strong emotional bond...", relatedIds: [15, 28, 22, 14], rarity: 'uncommon', keywords: ['Demisexuality', 'Attraction', 'Connection', 'Emotion', 'Intimacy', 'Bond'],
lore: [
{ level: 1, insightCost: 3, text: "Heart's Compass: For the Demisexual, emotional intimacy is the true north guiding attraction.", unlocked: false },
{ level: 2, insightCost: 7, text: "Time and Trust: Building the necessary bond often requires time, patience, and mutual vulnerability.", unlocked: false }
]
},
// ID 34: Group Sex
{
id: 34, name: "Group Sex", cardType: "Practice/Kink", visualHandle: "uncommon_group.jpg", primaryElement: "R", elementScores: { A: 6, I: 6, S: 7, P: 5, C: 4, R: 8 }, briefDescription: "More than two's company!", detailedDescription: "Sexual fun involving three or more people at once...", relatedIds: [18, 19, 25, 26, 27, 35, 65, 105], rarity: 'uncommon', keywords: ['Group', 'Multiple Partners', 'Interaction', 'Shared Experience', 'Threesome', 'Orgy'],
lore: [
{ level: 1, insightCost: 3, text: "Network Effect: The energy in group play can be exponentially different, a complex web of observation and interaction.", unlocked: false },
{ level: 2, insightCost: 7, text: "Logistical Labyrinth: Communication, consent, and managing multiple dynamics simultaneously require significant skill and awareness.", unlocked: false }
]
},
// ID 35: Swinging
{
id: 35, name: "Swinging", cardType: "Relationship Style", visualHandle: "uncommon_swing.jpg", primaryElement: "R", elementScores: { A: 5, I: 5, S: 6, P: 4, C: 4, R: 7 }, briefDescription: "Couples playing with others.", detailedDescription: "A scene where committed couples agree to swap partners...", relatedIds: [26, 24, 34], rarity: 'uncommon', keywords: ['Non-Monogamy', 'Recreation', 'Couple', 'Group', 'Social', 'Swinger'],
lore: [
{ level: 1, insightCost: 3, text: "Social Spice: Often focused on recreational encounters within a specific community or event setting.", unlocked: false },
{ level: 2, insightCost: 7, text: "Couple's Contract: The primary couple's bond often remains central, with clear rules about outside interactions.", unlocked: false }
]
},
// ID 36: Aromanticism
{
id: 36, name: "Aromanticism", cardType: "Orientation", visualHandle: "uncommon_aro.jpg", primaryElement: "A", elementScores: { A: 2, I: 3, S: 3, P: 4, C: 4, R: 3 }, briefDescription: "Romance? No thanks.", detailedDescription: "Feeling little or no romantic attraction...", relatedIds: [28, 27, 59], rarity: 'uncommon', keywords: ['Aromanticism', 'Orientation', 'Romance', 'Spectrum', 'Aro'],
lore: [
{ level: 1, insightCost: 3, text: "Diverse Bonds: Strong, committed relationships (like QPRs) can exist entirely outside romantic frameworks.", unlocked: false },
{ level: 2, insightCost: 7, text: "Attraction Alignment: Aromanticism can exist alongside any sexual orientation (or lack thereof).", unlocked: false }
]
},
// ID 37: Sensory Deprivation (Light)
{
id: 37, name: "Sensory Deprivation (Light)", cardType: "Practice/Kink", visualHandle: "uncommon_sensdep.jpg", primaryElement: "S", elementScores: { A: 4, I: 3, S: 7, P: 6, C: 5, R: 5 }, briefDescription: "Turning down the senses (blindfolds!).", detailedDescription: "Using things like blindfolds, maybe earplugs, to temporarily block out sight or sound...", relatedIds: [9, 17, 5, 57, 44, 86, 124], rarity: 'uncommon', keywords: ['Sensory Deprivation', 'Sensation', 'Focus', 'Vulnerability', 'Psychological', 'Blindfold'],
lore: [
{ level: 1, insightCost: 3, text: "Inner Focus: Removing external stimuli can turn awareness inward, heightening internal sensations and thoughts.", unlocked: false },
{ level: 2, insightCost: 7, text: "Trust Amplified: Relying on a partner while deprived of a key sense significantly deepens the required level of trust.", unlocked: false }
]
},
// ID 39: Age Play
{
id: 39, name: "Age Play", cardType: "Practice/Kink", visualHandle: "uncommon_ageplay.jpg", primaryElement: "C", elementScores: { A: 5, I: 6, S: 4, P: 7, C: 8, R: 6 }, briefDescription: "Playing pretend with age roles.", detailedDescription: "Consensual role-play where people act out different ages...", relatedIds: [13, 4, 5, 10, 58, 92, 98], rarity: 'uncommon', keywords: ['Age Play', 'Role-Play', 'Cognitive', 'Psychological', 'Dynamic', 'CGL'],
lore: [
{ level: 1, insightCost: 3, text: "Persona Portal: Age play can be a gateway to exploring different facets of personality, needs, or desired dynamics.", unlocked: false },
{ level: 2, insightCost: 7, text: "Safety Note: Clear distinctions between the play dynamic and real-life ages/responsibilities are crucial for ethical engagement.", unlocked: false }
]
},
// ID 40: Primal Play
{
id: 40, name: "Primal Play", cardType: "Practice/Kink", visualHandle: "uncommon_primal_art.jpg", primaryElement: "I", elementScores: { A: 5, I: 8, S: 7, P: 6, C: 3, R: 5 }, briefDescription: "Getting wild and instinctive.", detailedDescription: "Tapping into that raw, animal energy! Think less talk, more action...", relatedIds: [4, 5, 9, 7, 8, 97], rarity: 'uncommon', keywords: ['Primal', 'Instinct', 'Interaction', 'Physical', 'Animalistic', 'Non-verbal'],
lore: [
{ level: 1, insightCost: 3, text: "Body Language: Communication shifts from verbal to visceral – growls, nips, chases become the dialogue.", unlocked: false },
{ level: 2, insightCost: 7, text: "Cathartic Release: Can be a powerful way to bypass the thinking mind and release pent-up energy or aggression playfully.", unlocked: false }
]
},
// ID 57: Sensory Enhancement
{
id: 57, name: "Sensory Enhancement", cardType: "Practice/Kink", visualHandle: "uncommon_sensenh.jpg", primaryElement: "S", elementScores: { A: 4, I: 5, S: 7, P: 5, C: 4, R: 5}, briefDescription: "Turning up the volume on feelings.", detailedDescription: "Using tools or tricks to make specific sensations pop!...", relatedIds: [2, 37, 7, 9, 86, 88, 102, 112], rarity: 'uncommon', keywords: ['Sensation', 'Focus', 'Enhancement', 'Physical', 'Tools', ' Amplify'],
lore: [
{ level: 1, insightCost: 3, text: "Focus Funnel: By amplifying one sensation (e.g., vibration), attention is naturally drawn, creating intense focus.", unlocked: false },
{ level: 2, insightCost: 7, text: "Contrast Play: Often used alongside sensory deprivation to make the reintroduction of sensation incredibly vivid.", unlocked: false }
]
},
// ID 58: Caregiver/Little Dynamics
{
id: 58, name: "Caregiver/Little Dynamics", cardType: "Psychological/Goal", visualHandle: "uncommon_cglg.jpg", primaryElement: "P", elementScores: { A: 5, I: 7, S: 4, P: 8, C: 6, R: 7 }, briefDescription: "Nurturing/dependent role-play.", detailedDescription: "A dynamic where one person takes on a nurturing, guiding Caregiver role...", relatedIds: [39, 4, 5, 10, 15, 82], rarity: 'uncommon', keywords: ['Caregiver', 'Nurturing', 'Dependence', 'Role-Play', 'Psychological', 'Vulnerability', 'CGL', 'DDlg', 'MDlb'],
lore: [
{ level: 1, insightCost: 3, text: "Core Need: Often meets deep needs for safety, structure, care, or the freedom from adult responsibilities.", unlocked: false },
{ level: 2, insightCost: 7, text: "Beyond Stereotypes: The specific expression varies greatly – can be strict, playful, therapeutic, or simply comforting.", unlocked: false }
]
},
// ID 59: Platonic Partnership / QPR
{
id: 59, name: "Platonic Partnership / QPR", cardType: "Relationship Style", visualHandle: "uncommon_qpr.jpg", primaryElement: "R", elementScores: { A: 3, I: 4, S: 3, P: 7, C: 5, R: 6 }, briefDescription: "Super close, non-romantic bond.", detailedDescription: "Like best friends turned up to 11! Queerplatonic Relationships (QPRs)...", relatedIds: [22, 36, 15, 27, 25], rarity: 'uncommon', keywords: ['Platonic', 'Commitment', 'Intimacy', 'Relationship', 'Non-Romantic', 'QPR'],
lore: [
{ level: 1, insightCost: 3, text: "Defining Connection: Challenges the assumption that romantic/sexual bonds are inherently more valuable than platonic ones.", unlocked: false },
{ level: 2, insightCost: 7, text: "Custom Fit: QPRs are highly individualized, built on the specific needs and agreements of the people involved.", unlocked: false }
]
},
// ID 60: Sapiosexuality
{
id: 60, name: "Sapiosexuality", cardType: "Orientation", visualHandle: "uncommon_sapio.jpg", primaryElement: "A", elementScores: { A: 7, I: 5, S: 3, P: 6, C: 8, R: 5 }, briefDescription: "Brains are sexy!", detailedDescription: "Finding intelligence the hottest thing about someone!...", relatedIds: [49, 74, 81], rarity: 'uncommon', keywords: ['Sapiosexual', 'Attraction', 'Intelligence', 'Cognitive', 'Mind', 'Brains'],
lore: [
{ level: 1, insightCost: 3, text: "Mental Foreplay: For Sapiosexuals, intellectual sparring or deep conversation can be incredibly arousing.", unlocked: false },
{ level: 2, insightCost: 7, text: "More Than IQ: It's often not just raw intelligence, but wit, curiosity, creativity, or how someone uses their mind.", unlocked: false }
]
},
// ID 61: Body Worship
{
id: 61, name: "Body Worship", cardType: "Practice/Kink", visualHandle: "uncommon_bodyworship.jpg", primaryElement: "P", elementScores: { A: 6, I: 4, S: 6, P: 8, C: 3, R: 6 }, briefDescription: "Adoring your partner's form.", detailedDescription: "Showing total appreciation for a partner's body!...", relatedIds: [5, 10, 12, 62, 102], rarity: 'uncommon', keywords: ['Worship', 'Devotion', 'Adoration', 'Psychological', 'Focus', 'Body', 'Appreciation'],
lore: [
{ level: 1, insightCost: 3, text: "Act of Devotion: Can be a powerful way to make a partner feel cherished, seen, and desirable.", unlocked: false },
{ level: 2, insightCost: 7, text: "Focus & Presence: Requires intense focus on the partner's form, often creating a meditative, reverent atmosphere.", unlocked: false }
]
},
// ID 62: Foot Fetish / Podophilia
{
id: 62, name: "Foot Fetish / Podophilia", cardType: "Orientation", visualHandle: "uncommon_footfetish.jpg", primaryElement: "A", elementScores: { A: 8, I: 4, S: 7, P: 5, C: 3, R: 4 }, briefDescription: "Feet are fascinating!", detailedDescription: "A specific interest where feet trigger sexual arousal...", relatedIds: [61, 12, 102], rarity: 'uncommon', keywords: ['Fetish', 'Feet', 'Attraction', 'Focus', 'Sensation', 'Podophilia'],
lore: [
{ level: 1, insightCost: 3, text: "Unexpected Canvas: Feet offer unique textures, shapes, and points for sensory exploration.", unlocked: false },
{ level: 2, insightCost: 7, text: "Symbolic Weight?: For some, feet might symbolize grounding, vulnerability, or service, adding layers to the attraction.", unlocked: false }
]
},
// ID 78: Public Display Affection (Moderate)
{
id: 78, name: "Public Display Affection (Moderate)", cardType: "Practice/Kink", visualHandle: "uncommon_pda_mod.jpg", primaryElement: "R", elementScores: { A: 5, I: 6, S: 4, P: 6, C: 3, R: 6 }, briefDescription: "Getting a little bolder in public.", detailedDescription: "Turning up the heat on public affection!...", relatedIds: [77, 18], rarity: 'uncommon', keywords: ['Public', 'Exhibitionism', 'Risk', 'Thrill', 'Affection', 'PDA'],
lore: [
{ level: 1, insightCost: 3, text: "Thrill of the Near-Miss: The slight risk of being seen adds an edge of excitement for many.", unlocked: false },
{ level: 2, insightCost: 7, text: "Claiming Space: Can also be a way of publicly affirming the connection or relationship.", unlocked: false }
]
},
// ID 84: Solo Polyamory
{
id: 84, name: "Solo Polyamory", cardType: "Relationship Style", visualHandle: "uncommon_solopoly.jpg", primaryElement: "R", elementScores: { A: 5, I: 5, S: 5, P: 6, C: 6, R: 7 }, briefDescription: "Multiple loves, living single.", detailedDescription: "Practicing polyamory (multiple ethical relationships) but choosing to live independently...", relatedIds: [25, 27, 24], rarity: 'uncommon', keywords: ['Polyamory', 'Non-Monogamy', 'Autonomy', 'Independence', 'Structure', 'SoloPoly'],
lore: [
{ level: 1, insightCost: 3, text: "Anchored in Self: Prioritizes personal independence while still building meaningful intimate connections.", unlocked: false },
{ level: 2, insightCost: 7, text: "Escaping the Escalator: Rejects the traditional relationship escalator model (dating -> moving in -> marriage).", unlocked: false }
]
},
// ID 86: Sensory Overload
{
id: 86, name: "Sensory Overload", cardType: "Practice/Kink", visualHandle: "uncommon_sens_overload.jpg", primaryElement: "S", elementScores: { A: 5, I: 6, S: 8, P: 6, C: 4, R: 5 }, briefDescription: "Too much sensation (in a good way?).", detailedDescription: "Intentionally hitting multiple senses... leading to cool altered states...", relatedIds: [37, 57, 8, 124], rarity: 'uncommon', keywords: ['Sensory Overload', 'Intensity', 'Sensation', 'Altered State', 'Psychological', 'Overwhelm'],
lore: [
{ level: 1, insightCost: 3, text: "System Crash: Overwhelming input can short-circuit the thinking mind, leading to purely reactive states.", unlocked: false },
{ level: 2, insightCost: 7, text: "Controlled Chaos: Requires careful calibration by the giver to achieve the desired effect without causing genuine distress.", unlocked: false }
]
},
// ID 87: Light Bondage (Cuffs/Silk)
{
id: 87, name: "Light Bondage (Cuffs/Silk)", cardType: "Practice/Kink", visualHandle: "uncommon_bond_light_art.jpg", primaryElement: "S", elementScores: { A: 5, I: 5, S: 6, P: 6, C: 4, R: 5 }, briefDescription: "Simple, playful tying.", detailedDescription: "Using easy restraints like handcuffs (maybe fuzzy ones!), silk scarves...", relatedIds: [16, 17, 5, 93], rarity: 'uncommon', keywords: ['Bondage', 'Restriction', 'Playful', 'Sensation', 'Power', 'Cuffs', 'Ties'],
lore: [
{ level: 1, insightCost: 3, text: "Symbolic Surrender: Even light restraint signals a shift in power and allows for focused sensation.", unlocked: false },
{ level: 2, insightCost: 7, text: "Aesthetic Element: Often chosen for visual appeal as much as physical sensation.", unlocked: false }
]
},
// ID 89: Power Play (Subtle)
{
id: 89, name: "Power Play (Subtle)", cardType: "Psychological/Goal", visualHandle: "uncommon_power_subtle.jpg", primaryElement: "P", elementScores: { A: 6, I: 7, S: 5, P: 7, C: 7, R: 6 }, briefDescription: "Enjoying the undercurrents of power.", detailedDescription: "Getting a kick out of the subtle shifts and negotiations of power...", relatedIds: [4, 5, 11, 90], rarity: 'uncommon', keywords: ['Power', 'Subtle', 'Psychological', 'Dynamic', 'Negotiation', 'Cognitive', 'Influence'],
lore: [
{ level: 1, insightCost: 3, text: "The Unspoken Dance: Recognizing and playing with influence, suggestion, and unspoken agreements.", unlocked: false },
{ level: 2, insightCost: 7, text: "Constant Negotiation: Power exists in all interactions; this is about consciously engaging with that flow.", unlocked: false }
]
},
// ID 90: Performance Focus (Top)
{
id: 90, name: "Performance Focus (Top)", cardType: "Identity/Role", visualHandle: "uncommon_perf_top.jpg", primaryElement: "I", elementScores: { A: 5, I: 8, S: 6, P: 7, C: 6, R: 5 }, briefDescription: "Love orchestrating pleasure.", detailedDescription: "A Dom/Top style centered on skillfully giving pleasure...", relatedIds: [4, 11, 18, 89], rarity: 'uncommon', keywords: ['Performance', 'Control', 'Pleasure', 'Skill', 'Validation', 'Leading', 'Top'],
lore: [
{ level: 1, insightCost: 3, text: "The Conductor: Enjoys orchestrating the partner's experience, carefully tuning sensations and responses.", unlocked: false },
{ level: 2, insightCost: 7, text: "Reflected Glory: Satisfaction comes not just from giving, but from witnessing the effect of their actions.", unlocked: false }
]
},
// ID 91: Performance Focus (Bottom)
{
id: 91, name: "Performance Focus (Bottom)", cardType: "Identity/Role", visualHandle: "uncommon_perf_bot.jpg", primaryElement: "I", elementScores: { A: 5, I: 3, S: 6, P: 7, C: 5, R: 5 }, briefDescription: "Love showing your pleasure.", detailedDescription: "A Sub/Bottom style where expressing your reactions and pleasure loud and clear...", relatedIds: [5, 18, 50], rarity: 'uncommon', keywords: ['Performance', 'Reaction', 'Expression', 'Pleasure', 'Validation', 'Following', 'Bottom'],
lore: [
{ level: 1, insightCost: 3, text: "The Responsive Canvas: Finds joy in being the focus, showcasing reactions as a form of participation.", unlocked: false },
{ level: 2, insightCost: 7, text: "Amplifying the Scene: Enthusiastic responses can heighten the Top's experience and validate the shared dynamic.", unlocked: false }
]
},
// ID 92: Gender Play
{
id: 92, name: "Gender Play", cardType: "Practice/Kink", visualHandle: "uncommon_genderplay.jpg", primaryElement: "C", elementScores: { A: 6, I: 6, S: 4, P: 6, C: 7, R: 5 }, briefDescription: "Messing with gender roles/looks.", detailedDescription: "Consensually playing with or flipping traditional gender roles...", relatedIds: [13, 39, 103], rarity: 'uncommon', keywords: ['Gender', 'Role-Play', 'Cognitive', 'Expression', 'Fluidity', 'Cross-dressing'],
lore: [
{ level: 1, insightCost: 3, text: "Identity Exploration: Can be a way to explore different facets of identity or challenge societal expectations.", unlocked: false },
{ level: 2, insightCost: 7, text: "The Power of Presentation: Altering appearance can dramatically shift perceived power dynamics and interactions.", unlocked: false }
]
},
// ID 93: Tickling (Erotic)
{
id: 93, name: "Tickling (Erotic)", cardType: "Practice/Kink", visualHandle: "uncommon_tickle.jpg", primaryElement: "S", elementScores: { A: 4, I: 6, S: 6, P: 5, C: 3, R: 5 }, briefDescription: "Tickle torture!", detailedDescription: "Using tickling not just for laughs, but as a form of playful 'torture'...", relatedIds: [7, 38, 87], rarity: 'uncommon', keywords: ['Tickling', 'Playful', 'Sensation', 'Control', 'Teasing', 'Torture'],
lore: [
{ level: 1, insightCost: 3, text: "Involuntary Response: The uncontrollable laughter and squirming is often the core appeal for both parties.", unlocked: false },
{ level: 2, insightCost: 7, text: "Intimate Knowledge: Requires knowing a partner's ticklish spots, adding a layer of playful intimacy.", unlocked: false }
]
},
// ID 94: Leather Fetish
{
id: 94, name: "Leather Fetish", cardType: "Orientation", visualHandle: "uncommon_leather.jpg", primaryElement: "A", elementScores: { A: 8, I: 6, S: 7, P: 6, C: 5, R: 5 }, briefDescription: "Leather just does it.", detailedDescription: "A specific turn-on triggered by the look, smell, sound, or feel of leather...", relatedIds: [20, 21, 4], rarity: 'uncommon', keywords: ['Fetish', 'Leather', 'Material', 'Attraction', 'Sensation', 'Subculture', 'Gear'],
lore: [
{ level: 1, insightCost: 3, text: "Sensory Signature: The unique combination of smell, texture, and sound creates a powerful associative trigger.", unlocked: false },
{ level: 2, insightCost: 7, text: "Cultural Code: Often linked with power, rebellion, or specific subcultures, adding layers of meaning.", unlocked: false }
]
},
// ID 98: Pet Play
{
id: 98, name: "Pet Play", cardType: "Practice/Kink", visualHandle: "uncommon_petplay.jpg", primaryElement: "C", elementScores: { A: 5, I: 6, S: 5, P: 7, C: 7, R: 6 }, briefDescription: "Role-playing as cute critters.", detailedDescription: "Consensual role-play where someone takes on the persona of an animal or pet...", relatedIds: [13, 39, 4, 5, 10, 121], rarity: 'uncommon', keywords: ['Pet Play', 'Role-Play', 'Cognitive', 'Psychological', 'Animalistic', 'Dynamic', 'Kitten', 'Puppy'],
lore: [
{ level: 1, insightCost: 3, text: "Embodied Persona: Allows exploration of different modes of being – playful, dependent, instinctual.", unlocked: false },
{ level: 2, insightCost: 7, text: "Gear & Dynamics: Collars, tails, ears, and specific rules often enhance the immersion and power exchange.", unlocked: false }
]
},
// ID 99: Masochism (Psychological)
{
id: 99, name: "Masochism (Psychological)", cardType: "Psychological/Goal", visualHandle: "uncommon_maso_psych.jpg", primaryElement: "P", elementScores: { A: 5, I: 3, S: 4, P: 8, C: 6, R: 5 }, briefDescription: "Finding pleasure in mental 'ouch'.", detailedDescription: "Getting pleasure or release from consensually experiencing emotional distress...", relatedIds: [5, 17, 45, 100, 120], rarity: 'uncommon', keywords: ['Masochism', 'Psychological', 'Emotion', 'Submission', 'Distress', 'Catharsis', 'Humiliation'],
lore: [
{ level: 1, insightCost: 3, text: "The Cathartic Sting: Facing difficult emotions within a safe container can be strangely cleansing.", unlocked: false },
{ level: 2, insightCost: 7, text: "Trust as the Net: The ability to explore these states hinges entirely on deep trust in the partner causing the distress.", unlocked: false }
]
},
// ID 100: Sadism (Psychological)
{
id: 100, name: "Sadism (Psychological)", cardType: "Psychological/Goal", visualHandle: "uncommon_sad_psych.jpg", primaryElement: "P", elementScores: { A: 5, I: 7, S: 4, P: 8, C: 7, R: 5 }, briefDescription: "Pleasure from causing mental 'ouch'.", detailedDescription: "Finding pleasure or satisfaction from consensually causing emotional distress...", relatedIds: [4, 11, 45, 99, 120], rarity: 'uncommon', keywords: ['Sadism', 'Psychological', 'Emotion', 'Control', 'Distress', 'Humiliation'],
lore: [
{ level: 1, insightCost: 3, text: "The Responsive Spark: Satisfaction often comes from witnessing the partner's genuine emotional reaction.", unlocked: false },
{ level: 2, insightCost: 7, text: "Ethical Edge: Requires careful calibration to push boundaries enjoyably without causing lasting harm.", unlocked: false }
]
},
// ID 102: Sensory Focus (Specific Zone)
{
id: 102, name: "Sensory Focus (Specific Zone)", cardType: "Practice/Kink", visualHandle: "uncommon_sens_zone.jpg", primaryElement: "S", elementScores: { A: 5, I: 6, S: 7, P: 5, C: 4, R: 5 }, briefDescription: "Zooming in on one body part.", detailedDescription: "Giving all the attention to one specific spot!...", relatedIds: [57, 2, 61, 62], rarity: 'uncommon', keywords: ['Sensation', 'Focus', 'Body Part', 'Intensity', 'Physical', 'Zone'],
lore: [
{ level: 1, insightCost: 3, text: "Microcosm of Feeling: Concentrating sensation allows for exquisite awareness of subtle nuances.", unlocked: false },
{ level: 2, insightCost: 7, text: "Anticipation Amplified: Knowing only one area will be stimulated builds intense focus and anticipation.", unlocked: false }
]
},
// ID 103: Androgyny Attraction
{
id: 103, name: "Androgyny Attraction", cardType: "Orientation", visualHandle: "uncommon_andro.jpg", primaryElement: "A", elementScores: { A: 7, I: 5, S: 5, P: 5, C: 5, R: 5 }, briefDescription: "Drawn to gender-blendy looks.", detailedDescription: "Finding people whose gender presentation mixes or blurs traditional...", relatedIds: [55, 92], rarity: 'uncommon', keywords: ['Attraction', 'Androgyny', 'Gender Presentation', 'Aesthetic', 'Non-binary'],
lore: [
{ level: 1, insightCost: 3, text: "Beyond the Binary: Appreciating aesthetics that challenge or play with traditional gender markers.", unlocked: false },
{ level: 2, insightCost: 7, text: "Fluidity Embodied: Can reflect an attraction to ambiguity, fluidity, or the rejection of rigid categories.", unlocked: false }
]
},
// ID 105: Voyeuristic Exhibitionism
{
id: 105, name: "Voyeuristic Exhibitionism", cardType: "Identity/Role", visualHandle: "uncommon_voy_exhib.jpg", primaryElement: "I", elementScores: { A: 7, I: 7, S: 5, P: 7, C: 6, R: 6 }, briefDescription: "Love watching and being watched.", detailedDescription: "Getting turned on by both sides of the gaze...", relatedIds: [18, 19, 34], rarity: 'uncommon', keywords: ['Exhibitionism', 'Voyeurism', 'Visual', 'Performance', 'Shared', 'Group'],
lore: [
{ level: 1, insightCost: 3, text: "The Shared Gaze: A dynamic where the act of watching and being watched becomes a mutual feedback loop.", unlocked: false },
{ level: 2, insightCost: 7, text: "Amplified Energy: The presence of multiple perspectives often intensifies the energy and performance aspects.", unlocked: false }
]
},
// ID 106: Fear Play (Mild)
{
id: 106, name: "Fear Play (Mild)", cardType: "Practice/Kink", visualHandle: "uncommon_fear_mild.jpg", primaryElement: "P", elementScores: { A: 5, I: 6, S: 6, P: 7, C: 5, R: 5 }, briefDescription: "Getting thrills from safe scares.", detailedDescription: "Using surprise, startle moments, or the anticipation of something intense...", relatedIds: [44, 38, 9, 111, 122], rarity: 'uncommon', keywords: ['Fear', 'Anticipation', 'Thrill', 'Psychological', 'Edge', 'Startle'],
lore: [
{ level: 1, insightCost: 3, text: "Adrenaline Rush: Tapping into the body's fight-or-flight response for a jolt of excitement within a safe context.", unlocked: false },
{ level: 2, insightCost: 7, text: "The Power of the Unknown: Anticipation and uncertainty are key ingredients in generating the desired thrill.", unlocked: false }
]
},
// ID 107: Tribadism / Scissoring
{
id: 107, name: "Tribadism / Scissoring", cardType: "Practice/Kink", visualHandle: "uncommon_tribadism.jpg", primaryElement: "S", elementScores: { A: 5, I: 6, S: 7, P: 5, C: 2, R: 5 }, briefDescription: "Vulva-on-vulva friction.", detailedDescription: "A sexual act involving rubbing vulvas together for friction and mutual pleasure...", relatedIds: [1, 67], rarity: 'uncommon', keywords: ['Tribadism', 'Scissoring', 'Physical', 'Sensation', 'Friction', 'Lesbian'],
lore: [
{ level: 1, insightCost: 3, text: "Mutual Grounding: The direct, full-body contact offers a unique blend of friction and intimacy.", unlocked: false },
{ level: 2, insightCost: 7, text: "Rhythmic Synergy: Finding a shared rhythm can create waves of mutual pleasure.", unlocked: false }
]
},
// ID 108: Intercrural Sex (Frotting)
{
id: 108, name: "Intercrural Sex (Frotting)", cardType: "Practice/Kink", visualHandle: "uncommon_frotting.jpg", primaryElement: "S", elementScores: { A: 5, I: 6, S: 7, P: 5, C: 2, R: 5 }, briefDescription: "Penis-on-penis friction.", detailedDescription: "A sexual act involving rubbing penises together for friction...", relatedIds: [1], rarity: 'uncommon', keywords: ['Frotting', 'Intercrural', 'Physical', 'Sensation', 'Friction', 'Gay'],
lore: [
{ level: 1, insightCost: 3, text: "Friction Focus: Provides direct stimulation through rubbing without penetration.", unlocked: false },
{ level: 2, insightCost: 7, text: "Intimate Proximity: The closeness involved fosters a specific kind of connected, mutual sensation.", unlocked: false }
]
},
// ID 110: Figging
{
id: 110, name: "Figging", cardType: "Practice/Kink", visualHandle: "uncommon_figging.jpg", primaryElement: "S", elementScores: { A: 3, I: 6, S: 8, P: 6, C: 3, R: 5 }, briefDescription: "Ginger root = intense sting!", detailedDescription: "An old-school BDSM practice involving inserting peeled ginger...", relatedIds: [9, 8], rarity: 'uncommon', keywords: ['Figging', 'Sensation', 'Intensity', 'Pain Play', 'BDSM', 'Sting'],
lore: [
{ level: 1, insightCost: 3, text: "Alchemical Heat: The chemical reaction creates a unique, inescapable internal warmth or sting.", unlocked: false },
{ level: 2, insightCost: 7, text: "Historical Note: Sometimes used historically as a form of punishment, its BDSM use reclaims it for consensual sensation play.", unlocked: false }
]
},
    // --- Rare Concepts (LORE ADDED - COMMAS CHECKED) ---
    {
        id: 8, name: "Impact Play (Heavy)", cardType: "Practice/Kink", visualHandle: "rare_impact_heavy.jpg", primaryElement: "S", elementScores: { A: 5, I: 7, S: 9, P: 7, C: 4, R: 6 }, briefDescription: "Intense impact, feeling the oomph.", detailedDescription: "Turning up the volume! Using tools like canes, whips, heavy paddles, or even fists for strong, often ouchy-but-good sensations. Could be about testing limits, leaving marks, or the power dynamic involved. Trust and safety first!", relatedIds: [7, 9, 4, 5, 44, 97, 110], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_impact_heavy_art", uniquePromptId: "rP08", keywords: ['Impact', 'Pain Play', 'Intensity', 'Sensation', 'Endurance', 'Marking', 'Control', 'BDSM'],
        lore: [
            { level: 1, insightCost: 8, text: "Alchemist's Journal: 'The resonance of heavy impact lingers, a vibration felt bone-deep. Is it the echo of pain, or the clearing of stagnant energy?'", unlocked: false },
            { level: 2, insightCost: 16, text: "Scrawled Note: 'Some seek the mark not as punishment, but as proof. Proof of endurance, proof of trust, proof of being *truly* affected.'", unlocked: false }
        ]
    },
    {
        id: 9, name: "Pain Play (Non-Impact)", cardType: "Practice/Kink", visualHandle: "rare_pain.jpg", primaryElement: "S", elementScores: { A: 4, I: 6, S: 8, P: 7, C: 5, R: 6 }, briefDescription: "Ouchies beyond hitting.", detailedDescription: "Getting intense feelings without the smackdown. Think pinching, biting, scratching, temperature play (wax, ice), clamps, or even careful needle play (requires serious know-how!). It's all about exploring that pain/pleasure edge.", relatedIds: [7, 8, 16, 17, 37, 44, 63, 88, 96, 97, 110, 111, 112, 106, 124], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_pain_art", uniquePromptId: "rP09", keywords: ['Pain Play', 'Sensation', 'Intensity', 'Focus', 'Body Modification', 'Edge', 'BDSM', 'Clamps', 'Needles'],
        lore: [
            { level: 1, insightCost: 8, text: "Fragment: '...not the blunt force, but the sharp focus. A single point of intense awareness that crowds out all else. A meditation through fire.'", unlocked: false },
            { level: 2, insightCost: 16, text: "Herbalist's Wisdom: 'Like potent herbs, these sensations must be handled with knowledge. Too little is ineffective, too much can poison the well of pleasure.'", unlocked: false }
        ]
    },
    {
        id: 11, name: "Command / Control Dynamics", cardType: "Psychological/Goal", visualHandle: "rare_control.jpg", primaryElement: "I", elementScores: { A: 6, I: 9, S: 5, P: 8, C: 8, R: 6 }, briefDescription: "Giving/following clear orders.", detailedDescription: "This is about clear instructions and happy obedience! One partner gives direct commands or instructions and the other partner deriving pleasure or fulfillment from obeying them precisely. Power exchange made explicit.", relatedIds: [4, 5, 10, 30, 38, 45, 41, 89, 90, 100, 101, 109, 119, 120], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_control_art", uniquePromptId: "rP11", keywords: ['Control', 'Command', 'Obedience', 'Power', 'Structure', 'Psychological', 'Interaction', 'D/s'],
        lore: [
            { level: 1, insightCost: 9, text: "Tattered Scroll: 'The voice that commands shapes reality. The ear that obeys finds its place within it.'", unlocked: false },
            { level: 2, insightCost: 18, text: "Alchemist's Query: Does the thrill lie in the *certainty* of the command, or the *surrender* required by obedience? Or perhaps, the shared focus it demands?", unlocked: false }
        ]
    },
    {
        id: 12, name: "Objectification Play", cardType: "Psychological/Goal", visualHandle: "rare_object.jpg", primaryElement: "P", elementScores: { A: 7, I: 4, S: 6, P: 8, C: 6, R: 5 }, briefDescription: "Playing with being (or using) a 'thing'.", detailedDescription: "A consensual game where someone is treated (or treats someone) more like an object for pleasure or use, focusing on body parts rather than the whole person. Can be about power, focus, or exploring dehumanization themes safely.", relatedIds: [4, 5, 20, 18, 19, 45, 61, 42, 62, 114], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP12", keywords: ['Objectification', 'Power', 'Psychological', 'Focus', 'Body', 'Dehumanization', 'Play'],
        lore: [
            { level: 1, insightCost: 8, text: "Philosophical Fragment: 'To be reduced to pure function, pure sensation... can be strangely liberating from the burdens of self.'", unlocked: false },
            { level: 2, insightCost: 16, text: "Warning Label (Figurative): Requires careful negotiation. The line between playful objectification and harmful dehumanization is drawn only by mutual consent and understanding.", unlocked: false }
        ]
    },
    {
        id: 14, name: "Fantasy Immersion", cardType: "Cognitive", visualHandle: "rare_fantasy.jpg", primaryElement: "C", elementScores: { A: 5, I: 3, S: 4, P: 7, C: 9, R: 3 }, briefDescription: "Living fully in the mind's story.", detailedDescription: "Your imagination is the main stage! Getting lost in complex fantasy worlds, detailed internal narratives, or the *idea* of what's happening is way more important than physical reality. Arousal lives in the brain!", relatedIds: [13, 29, 41, 42, 49], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_fantasy_art", uniquePromptId: "rP14", keywords: ['Fantasy', 'Cognitive', 'Immersion', 'Narrative', 'Mind', 'World-Building', 'Imagination'],
        lore: [
            { level: 1, insightCost: 9, text: "Dream Journal Entry: 'The world outside faded. Only the story mattered. The sensations were echoes of the narrative.'", unlocked: false },
            { level: 2, insightCost: 18, text: "Mapmaker's Note: Some build worlds brick by brick in their minds, finding arousal in the intricate details and consistency of their inner reality.", unlocked: false }
        ]
    },
     {
        id: 16, name: "Rope Bondage (Shibari/Kinbaku)", cardType: "Practice/Kink", visualHandle: "rare_rope.jpg", primaryElement: "S", elementScores: { A: 6, I: 7, S: 8, P: 7, C: 6, R: 6 }, briefDescription: "Artful tying & restriction.", detailedDescription: "It's art you can feel! Using rope to create beautiful patterns on the body, applying pressure strategically, restricting movement, and exploring the unique mental state it creates. Both visual and intensely physical.", relatedIds: [9, 17, 4, 5, 44, 87, 101, 113], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_rope_art", uniquePromptId: "rP16", keywords: ['Restriction', 'Sensation', 'Aesthetic', 'Control', 'Trust', 'Helplessness', 'Rope', 'Shibari', 'Kinbaku'],
        lore: [
            { level: 1, insightCost: 8, text: "Rigger's Maxim: 'The rope only holds what the mind allows.' Trust is the first knot tied.", unlocked: false },
            { level: 2, insightCost: 16, text: "Historical Note: Evolved from methods of restraint, Kinbaku elevated rope into an art form exploring patience, focus, and the beauty of the bound form.", unlocked: false },
            { level: 3, insightCost: 25, text: "Alchemical Secret: When Restriction [17] and Rope Bondage [16] are combined with deep Trust [15], the potential for psychological release (Catharsis?) is amplified.", unlocked: false } // Example of cross-referencing
        ]
    },
    {
        id: 17, name: "Restriction / Helplessness", cardType: "Psychological/Goal", visualHandle: "rare_restrict.jpg", primaryElement: "P", elementScores: { A: 5, I: 3, S: 7, P: 9, C: 5, R: 5 }, briefDescription: "Turned on by being tied up/powerless.", detailedDescription: "The feeling of being physically restrained (ropes, cuffs, whatever works!) and the resulting mental space of helplessness or total surrender is a major turn-on. It's often less about the ropes, more about the *feeling*.", relatedIds: [16, 5, 9, 37, 44, 63, 64, 87, 99, 113, 117, 118, 125, 43], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP17", keywords: ['Helplessness', 'Surrender', 'Restriction', 'Psychological', 'Power', 'Vulnerability', 'Bondage'],
        lore: [
            { level: 1, insightCost: 8, text: "Inner Monologue Snippet: '...can't move...don't *have* to move...just feel...'", unlocked: false },
            { level: 2, insightCost: 16, text: "Philosopher's Query: Is the appeal the removal of responsibility, the heightened sensory focus, or the profound vulnerability offered to another?", unlocked: false }
        ]
    },
    {
        id: 20, name: "Latex / Material Fetish", cardType: "Orientation", visualHandle: "rare_latex.jpg", primaryElement: "A", elementScores: { A: 9, I: 5, S: 8, P: 6, C: 5, R: 4 }, briefDescription: "Shiny, squeaky, sexy!", detailedDescription: "It's all about the material! A strong, primary attraction triggered by the sight, feel, sound, or smell of specific stuff like latex, leather, PVC, rubber, silk, etc. The material itself is the magic.", relatedIds: [12, 21, 42, 94], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_latex_art", uniquePromptId: "rP20", keywords: ['Fetish', 'Material', 'Latex', 'Leather', 'PVC', 'Attraction', 'Sensation', 'Focus'],
        lore: [
            { level: 1, insightCost: 9, text: "Texture Note: 'Like a second skin, it transforms. The reflection, the scent, the sound... it engages senses often ignored.'", unlocked: false },
            { level: 2, insightCost: 18, text: "Alchemist's Insight: The material becomes a catalyst, altering the wearer's perceived essence or unlocking a specific persona, both for wearer and observer.", unlocked: false }
        ]
    },
    {
        id: 21, name: "Uniform / Clothing Fetish", cardType: "Orientation", visualHandle: "rare_uniform.jpg", primaryElement: "A", elementScores: { A: 8, I: 6, S: 4, P: 6, C: 6, R: 5 }, briefDescription: "Specific clothing as arousal trigger.", detailedDescription: "A fetish where sexual arousal is significantly and primarily triggered by specific types of clothing, such as uniforms (military, medical, school), costumes, or specific garments (lingerie, suits).", relatedIds: [13, 20, 12, 94, 95, 104], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP21", keywords: ['Fetish', 'Clothing', 'Uniform', 'Attraction', 'Role-Play', 'Visual', 'Costume'],
        lore: [
            { level: 1, insightCost: 8, text: "Costumer's Thread: 'A uniform is a story worn on the body - authority, service, innocence, rebellion. The story is the spark.'", unlocked: false },
            { level: 2, insightCost: 16, text: "Psychological Note: The clothing acts as a powerful signifier, instantly invoking associated roles, power dynamics, and fantasies.", unlocked: false }
        ]
    },
    {
        id: 25, name: "Polyamory", cardType: "Relationship Style", visualHandle: "rare_poly.jpg", primaryElement: "R", elementScores: { A: 6, I: 6, S: 5, P: 7, C: 6, R: 8 }, briefDescription: "Loving more than one.", detailedDescription: "Ethically loving and being intimate with multiple partners, where everyone involved knows and consents. Often involves deep emotional connections with several people.", relatedIds: [15, 26, 27, 34, 59, 84], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_poly_art", uniquePromptId: "rP25", keywords: ['Polyamory', 'Non-Monogamy', 'Multiple Partners', 'Intimacy', 'Connection', 'Structure', 'CNM'],
        lore: [
             { level: 1, insightCost: 9, text: "Core Tenet: Based on the idea that love isn't finite and connections don't need to be zero-sum.", unlocked: false },
             { level: 2, insightCost: 18, text: "Common Challenge: Requires exceptional communication, boundary setting, and managing complex emotions like jealousy and compersion.", unlocked: false }
        ]
     },
     {
        id: 27, name: "Relationship Anarchy", cardType: "Relationship Style", visualHandle: "rare_ra.jpg", primaryElement: "R", elementScores: { A: 6, I: 5, S: 5, P: 6, C: 7, R: 9 }, briefDescription: "Rejects rules/hierarchies.", detailedDescription: "A philosophy and relationship style that rejects societal norms and imposed rules regarding relationships. Each relationship is unique and defined by the individuals involved, without inherent hierarchy.", relatedIds: [25, 26, 36, 59, 84], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP27", keywords: ['Relationship Anarchy', 'Autonomy', 'Fluidity', 'Anti-Hierarchy', 'Structure', 'Philosophy', 'Freedom', 'RA'],
        lore: [
             { level: 1, insightCost: 10, text: "RA Manifesto Snippet: 'Define your own connections based on trust and communication, not pre-written scripts.'", unlocked: false },
             { level: 2, insightCost: 20, text: "Alchemist's Query: If every relationship is built from scratch, what are the essential 'elements' needed for stability and joy?", unlocked: false }
        ]
     },
     {
        id: 30, name: "High Protocol D/s", cardType: "Practice/Kink", visualHandle: "rare_protocol.jpg", primaryElement: "I", elementScores: { A: 6, I: 8, S: 6, P: 8, C: 9, R: 7 }, briefDescription: "Highly structured power exchange.", detailedDescription: "A style of Dominance and submission characterized by significant structure, formal rules, rituals, specific forms of address, and often pre-negotiated expectations for behavior within the dynamic.", relatedIds: [4, 5, 11, 13, 38, 101, 109], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_protocol_art", uniquePromptId: "rP30", keywords: ['Protocol', 'Structure', 'Rules', 'Power', 'Cognitive', 'Ritual', 'D/s', 'Formal'],
        lore: [
             { level: 1, insightCost: 9, text: "From an Old Text: 'Order illuminates power. Structure provides the chalice into which devotion can be poured.'", unlocked: false },
             { level: 2, insightCost: 18, text: "Consideration: Does the detailed structure enhance the power dynamic, provide safety through clarity, or become a performance in itself?", unlocked: false }
        ]
     },
     {
        id: 41, name: "Erotic Hypnosis / Mind Control Play", cardType: "Practice/Kink", visualHandle: "rare_hypno.jpg", primaryElement: "C", elementScores: { A: 5, I: 7, S: 3, P: 8, C: 9, R: 6 }, briefDescription: "Using suggestion/perceived control.", detailedDescription: "Consensual play involving altered states of consciousness, hypnotic suggestion, triggers, or the *illusion* of one partner controlling the other's mind or actions for erotic purposes. Safety and consent are paramount.", relatedIds: [14, 4, 5, 11, 45, 42, 120, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP41", keywords: ['Hypnosis', 'Mind Control', 'Cognitive', 'Power', 'Suggestion', 'Altered State', 'Psychological', 'Consent'],
        lore: [
             { level: 1, insightCost: 10, text: "Whispered Secret: 'The suggestion, once planted, blossoms in the fertile ground of willingness...'", unlocked: false },
             { level: 2, insightCost: 20, text: "Ethical Consideration: The perceived power is immense. Consent must be ongoing, enthusiastic, and revocable, even (especially) when playing with its absence.", unlocked: false }
        ]
     },
     {
        id: 42, name: "Transformation Fetish", cardType: "Orientation", visualHandle: "rare_transform.jpg", primaryElement: "C", elementScores: { A: 7, I: 4, S: 5, P: 7, C: 8, R: 4 }, briefDescription: "Arousal from transformation themes.", detailedDescription: "A fetish centered on the concept of transformation, which can include physical changes (e.g., into animals, objects, different genders), mental changes (e.g., bimbofication, personality alteration), or forced changes within a power dynamic.", relatedIds: [20, 21, 12, 41, 14, 121], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP42", keywords: ['Transformation', 'Fetish', 'Cognitive', 'Fantasy', 'Change', 'Identity', 'TF'],
        lore: [
             { level: 1, insightCost: 9, text: "Metaphysical Musings: 'To become *other*... Does it reveal a hidden self, or offer escape from the current one?'", unlocked: false },
             { level: 2, insightCost: 18, text: "Symbolic Link: Transformation often touches on themes of identity fluidity, powerlessness, wish fulfillment, or the exploration of the 'monstrous' within.", unlocked: false }
        ]
     },
     {
        id: 43, name: "Medical Play", cardType: "Practice/Kink", visualHandle: "rare_medical.jpg", primaryElement: "C", elementScores: { A: 5, I: 6, S: 7, P: 7, C: 7, R: 6 }, briefDescription: "Role-playing medical scenarios.", detailedDescription: "Consensual role-playing involving medical themes, settings, or equipment. Can range from simple doctor/patient scenarios to more clinical interactions involving mock examinations, implements (speculums, needles - potentially real/blunt), restraints, or power dynamics inherent in medical settings.", relatedIds: [13, 9, 17, 4, 5], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP43", keywords: ['Medical Play', 'Role-Play', 'Scenario', 'Power', 'Clinical', 'Sensation', 'Exam'],
        lore: [
             { level: 1, insightCost: 8, text: "Scenario Note: The clinical setting often heightens feelings of vulnerability and surrender to perceived authority.", unlocked: false },
             { level: 2, insightCost: 16, text: "Safety First: Real medical knowledge is crucial if using actual implements. Play safe, play informed.", unlocked: false }
        ]
     },
     {
        id: 44, name: "Edge Play", cardType: "Practice/Kink", visualHandle: "rare_edge.jpg", primaryElement: "S", elementScores: { A: 5, I: 6, S: 9, P: 8, C: 5, R: 6 }, briefDescription: "Pushing boundaries near limits.", detailedDescription: "Activities that intentionally push physical, psychological, or emotional boundaries close to perceived limits. Often involves negotiation, high trust, and managing real or perceived risk (e.g., breath play, knife play, extreme sensation, fear play). Requires significant caution, expertise, and communication.", relatedIds: [8, 9, 16, 17, 37, 38, 41, 63, 64, 65, 106, 111, 113, 116, 122, 125], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP44", keywords: ['Edge Play', 'Risk', 'Intensity', 'Sensation', 'Psychological', 'Trust', 'Boundary', 'Safety'],
        lore: [
             { level: 1, insightCost: 10, text: "Adage: 'The edge is where sensation is sharpest, and trust is tested most profoundly.'", unlocked: false },
             { level: 2, insightCost: 20, text: "Alchemist's Caution: This is not mere thrill-seeking. True edge play demands meticulous planning, deep partner knowledge, and unwavering attention to safety and consent.", unlocked: false }
        ]
     },
     {
        id: 45, name: "Humiliation / Degradation", cardType: "Psychological/Goal", visualHandle: "rare_humiliation.jpg", primaryElement: "P", elementScores: { A: 5, I: 7, S: 4, P: 9, C: 6, R: 6 }, briefDescription: "Pleasure from embarrassment/degradation.", detailedDescription: "Consensual play where one partner derives pleasure from performing or receiving acts or words intended to cause embarrassment, shame, or degradation. Can range from light teasing to intense psychological scenarios. Consent and aftercare are critical.", relatedIds: [4, 5, 10, 11, 12, 38, 41, 99, 100, 114, 115, 120], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP45", keywords: ['Humiliation', 'Degradation', 'Psychological', 'Power', 'Emotion', 'Shame', 'Taboo', 'Consent'],
        lore: [
             { level: 1, insightCost: 9, text: "Observation: The power lies in the shared understanding that the 'degradation' is a performance, a peeling away of ego within a trusted space.", unlocked: false },
             { level: 2, insightCost: 18, text: "Psychological Reflection: Often taps into complex feelings about worthiness, control, and the catharsis of confronting perceived flaws.", unlocked: false }
        ]
     },
     {
        id: 63, name: "Breath Play", cardType: "Practice/Kink", visualHandle: "rare_breath.jpg", primaryElement: "S", elementScores: { A: 4, I: 7, S: 9, P: 8, C: 4, R: 6 }, briefDescription: "Restricting airflow for sensation.", detailedDescription: "Consensual practice involving the restriction of airflow (erotic asphyxiation) to create intense physical sensations and altered mental states. Carries significant risks and requires extreme caution, knowledge, and trust.", relatedIds: [44, 17, 9, 5, 125], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP63", keywords: ['Breath Play', 'Asphyxiation', 'Risk', 'Edge Play', 'Sensation', 'Altered State', 'Trust', 'Safety'],
        lore: [
            { level: 1, insightCost: 10, text: "**Safety Advisory:** This is inherently risky. Education, clear communication, and never playing alone are paramount. Mistakes can be fatal.", unlocked: false },
            { level: 2, insightCost: 20, text: "Subjective Report: 'The world narrows, sensations sharpen... a surrender not just of will, but of the body's most basic need.' Requires absolute trust.", unlocked: false }
        ]
    },
    {
        id: 64, name: "CNC (Consensual Non-Consent)", cardType: "Practice/Kink", visualHandle: "rare_cnc.jpg", primaryElement: "C", elementScores: { A: 6, I: 7, S: 7, P: 8, C: 9, R: 6 }, briefDescription: "Role-playing lack of consent.", detailedDescription: "Consensual role-playing scenarios where participants act out a scene involving simulated non-consent or coercion (e.g., simulated rape fantasy, abduction). Requires meticulous negotiation, clear boundaries, safewords, and trust.", relatedIds: [13, 4, 5, 17, 44, 117, 118], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP64", keywords: ['CNC', 'Role-Play', 'Fantasy', 'Cognitive', 'Power', 'Taboo', 'Consent', 'Safety'],
        lore: [
            { level: 1, insightCost: 10, text: "Ethical Imperative: The 'Consensual' part is everything. Negotiation must be explicit, boundaries crystal clear, and safewords honored instantly.", unlocked: false },
            { level: 2, insightCost: 20, text: "Psychological Exploration: CNC often allows exploration of taboo fantasies, intense power dynamics, or processing complex feelings in a controlled environment.", unlocked: false }
        ]
    },
     {
        id: 65, name: "Chemsex / Party & Play (PnP)", cardType: "Practice/Kink", visualHandle: "rare_chemsex.jpg", primaryElement: "S", elementScores: { A: 6, I: 6, S: 8, P: 7, C: 3, R: 7 }, briefDescription: "Using drugs to enhance sex.", detailedDescription: "Intentionally combining sexual activity with the use of psychoactive drugs (like methamphetamine, GHB, mephedrone) to sustain activity, reduce inhibitions, or intensify sensations. Carries health risks and potential for addiction.", relatedIds: [34, 24, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP65", keywords: ['Chemsex', 'PnP', 'Drugs', 'Sensation', 'Endurance', 'Risk', 'Social', 'Party'],
        lore: [
             { level: 1, insightCost: 8, text: "Harm Reduction Note: Combining substances and sex carries unique risks (overdose, consent issues, STIs). Awareness and safety strategies are crucial.", unlocked: false },
             { level: 2, insightCost: 16, text: "Motivations Vary: Can be sought for enhanced pleasure, extended endurance, lowered inhibitions, or social bonding within specific scenes.", unlocked: false }
        ]
     },
     {
        id: 109, name: "Master / slave Dynamic (M/s)", cardType: "Relationship Style", visualHandle: "rare_ms.jpg", primaryElement: "I", elementScores: { A: 6, I: 9, S: 6, P: 9, C: 8, R: 7 }, briefDescription: "Total power exchange relationship.", detailedDescription: "A specific, high-intensity form of D/s relationship involving a deep level of commitment and power exchange, often encompassing many aspects of life beyond the bedroom. Uses specific titles.", relatedIds: [4, 5, 11, 30, 10], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP109", keywords: ['M/s', 'Power', 'Total Power Exchange', 'Commitment', 'Structure', 'D/s', 'Lifestyle', 'TPE'],
        lore: [
             { level: 1, insightCost: 10, text: "Defining Feature: Often distinguished by its 24/7 nature and the concept of 'ownership' or total authority, willingly given and received.", unlocked: false },
             { level: 2, insightCost: 20, text: "Alchemist's Analogy: Forging such a bond is like creating a philosopher's stone – requires immense dedication, understanding, and the transmutation of base desires into profound connection.", unlocked: false }
        ]
     },
     {
        id: 111, name: "Knife Play / Edge Play (Sharp)", cardType: "Practice/Kink", visualHandle: "rare_knife.jpg", primaryElement: "S", elementScores: { A: 5, I: 7, S: 9, P: 8, C: 6, R: 6 }, briefDescription: "Using blades for sensation/fear.", detailedDescription: "Edge play involving the use of knives or other sharp objects against the skin for sensation, psychological fear, or light marking (drawing blood is extremely risky and requires advanced knowledge). Intense focus on control and trust.", relatedIds: [44, 9, 106, 4, 116], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP111", keywords: ['Knife Play', 'Edge Play', 'Risk', 'Fear', 'Sensation', 'Control', 'Trust', 'Sharp', 'Safety'],
        lore: [
             { level: 1, insightCost: 10, text: "**Safety Advisory:** Playing with sharps carries inherent risks. Sterilization, knowledge of anatomy, and precise control are critical. Never play impaired.", unlocked: false },
             { level: 2, insightCost: 20, text: "Symbolic Weight: The blade often represents ultimate power, control, and the potential for harm, making the act of trust incredibly potent.", unlocked: false }
        ]
     },
     {
        id: 112, name: "Electrostimulation (E-Stim)", cardType: "Practice/Kink", visualHandle: "rare_estim.jpg", primaryElement: "S", elementScores: { A: 4, I: 6, S: 9, P: 6, C: 4, R: 5 }, briefDescription: "Buzz buzz! Electrical sensations.", detailedDescription: "Using specialized devices (like TENS units adapted or purpose-built) to pass mild electrical currents through the body for unique tingling, buzzing, or contracting sensations.", relatedIds: [9, 57, 119], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_estim_art", uniquePromptId: "rP112", keywords: ['E-Stim', 'Electrostimulation', 'Sensation', 'Intensity', 'Involuntary', 'Technology', 'Violet Wand'],
        lore: [
             { level: 1, insightCost: 9, text: "Techno-Kink Note: A modern marvel of sensation play, offering feelings unobtainable through purely manual means. Body conductivity varies!", unlocked: false },
             { level: 2, insightCost: 18, text: "Control Aspect: The involuntary muscle contractions add a fascinating layer to power exchange and helplessness dynamics.", unlocked: false }
        ]
     },
     {
        id: 113, name: "Suspension Bondage", cardType: "Practice/Kink", visualHandle: "rare_suspension.jpg", primaryElement: "S", elementScores: { A: 5, I: 7, S: 9, P: 8, C: 6, R: 6 }, briefDescription: "Hanging out (literally!).", detailedDescription: "A form of bondage where a person is partially or fully suspended off the ground using ropes, chains, or other equipment. Looks amazing, feels intense, but requires serious technical skill, rigging knowledge, and safety focus.", relatedIds: [16, 17, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP113", keywords: ['Suspension', 'Bondage', 'Rope', 'Risk', 'Skill', 'Helplessness', 'Intensity', 'Rigging'],
        lore: [
             { level: 1, insightCost: 10, text: "**Safety Advisory:** Suspension rigging is complex and carries high risks if done improperly (nerve damage, positional asphyxia). Seek experienced mentorship.", unlocked: false },
             { level: 2, insightCost: 20, text: "Rigger's Perspective: 'It's engineering and art. Every knot, every angle matters. You hold their safety and their experience in your hands.'", unlocked: false }
        ]
     },
     {
        id: 114, name: "Water Sports / Urolagnia", cardType: "Practice/Kink", visualHandle: "rare_watersports.jpg", primaryElement: "S", elementScores: { A: 6, I: 6, S: 7, P: 7, C: 4, R: 5 }, briefDescription: "Playing with pee.", detailedDescription: "Sexual arousal or activity involving urine (also known as golden showers). Can range from watching urination to being urinated on or drinking urine. Consent and hygiene are key considerations.", relatedIds: [45, 12, 115], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP114", keywords: ['Watersports', 'Urolagnia', 'Taboo', 'Humiliation', 'Bodily Fluids', 'Piss Play'],
        lore: [
             { level: 1, insightCost: 8, text: "Taboo Transgression: Part of the allure often lies in breaking societal norms around bodily fluids and perceived 'cleanliness'.", unlocked: false },
             { level: 2, insightCost: 16, text: "Context Note: Can be incorporated into dynamics of humiliation, worship, marking, or simply enjoyed for the unique sensation and intimacy.", unlocked: false }
        ]
     },
     {
        id: 115, name: "Scat Play / Coprophilia", cardType: "Practice/Kink", visualHandle: "rare_scat.jpg", primaryElement: "S", elementScores: { A: 5, I: 5, S: 6, P: 8, C: 3, R: 4 }, briefDescription: "Playing with poo (Extreme!).", detailedDescription: "Sexual arousal or activity involving feces. This is an extreme fetish with significant health risks and social stigma. Requires extreme care regarding hygiene and enthusiastic consent.", relatedIds: [114, 45], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP115", keywords: ['Scat', 'Coprophilia', 'Taboo', 'Extreme', 'Risk', 'Bodily Fluids'],
        lore: [
             { level: 1, insightCost: 12, text: "**Health Warning:** This practice carries significant health risks due to bacteria. Extreme hygiene protocols and understanding risks are non-negotiable.", unlocked: false },
             { level: 2, insightCost: 24, text: "Psychological Edge: Often considered one of the ultimate taboos, exploring scat can involve deep themes of degradation, power, or the primal.", unlocked: false }
        ]
     },
     {
        id: 116, name: "Blood Play (Intentional)", cardType: "Practice/Kink", visualHandle: "rare_bloodplay.jpg", primaryElement: "S", elementScores: { A: 5, I: 7, S: 8, P: 8, C: 5, R: 6 }, briefDescription: "Using blood in scenes (HIGH RISK!).", detailedDescription: "Consensually incorporating *small*, safely drawn amounts of blood (e.g., with a sterile lancet) into sexual or ritualistic scenes. Carries **major health risks** (bloodborne pathogens!). Requires strict safety knowledge and protocols.", relatedIds: [44, 111, 101], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP116", keywords: ['Blood Play', 'Risk', 'Edge Play', 'Ritual', 'Intensity', 'Taboo', 'Safety'],
        lore: [
             { level: 1, insightCost: 11, text: "**Safety Advisory:** Risk of bloodborne pathogens is extremely high. Assume all partners may carry something. Use universal precautions, sterile single-use tools, and educate yourself thoroughly.", unlocked: false },
             { level: 2, insightCost: 22, text: "Symbolic Power: Blood carries deep cultural weight – life force, sacrifice, connection, danger. Its intentional use often taps into intense ritualistic or primal feelings.", unlocked: false }
        ]
     },
     {
        id: 117, name: "Abduction / Capture Fantasy", cardType: "Practice/Kink", visualHandle: "rare_abduction.jpg", primaryElement: "C", elementScores: { A: 6, I: 7, S: 7, P: 8, C: 9, R: 6 }, briefDescription: "Role-playing non-consensual capture.", detailedDescription: "A specific type of CNC role-play focusing on the scenario of being abducted, captured, or held against one's will within a pre-negotiated, safe container.", relatedIds: [64, 13, 17, 44, 122], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP117", keywords: ['Abduction', 'Capture', 'CNC', 'Role-Play', 'Fantasy', 'Fear', 'Power', 'Consent'],
        lore: [
             { level: 1, insightCost: 9, text: "Narrative Core: Explores themes of powerlessness, struggle, fear, and eventual surrender or escape, all within the safety of negotiated consent.", unlocked: false },
             { level: 2, insightCost: 18, text: "Psychological Depth: Can be a way to process feelings about control, safety, or societal fears, or simply enjoy the high-stakes thrill of the story.", unlocked: false }
        ]
     },
     {
        id: 118, name: "Somnophilia / Sleep Play", cardType: "Practice/Kink", visualHandle: "rare_somno.jpg", primaryElement: "C", elementScores: { A: 7, I: 3, S: 6, P: 7, C: 7, R: 4 }, briefDescription: "Arousal related to sleep/unawareness.", detailedDescription: "Sexual arousal derived from interacting with or observing someone who is asleep or feigning sleep. Often involves themes of vulnerability and voyeurism. Consent when awake is paramount for ethical play.", relatedIds: [19, 17, 64], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP118", keywords: ['Somnophilia', 'Sleep Play', 'Vulnerability', 'Voyeurism', 'Consent', 'Fantasy', 'Unaware'],
        lore: [
             { level: 1, insightCost: 8, text: "Ethical Tightrope: The line between this fantasy and non-consent is critical. Play requires explicit, enthusiastic consent negotiated beforehand.", unlocked: false },
             { level: 2, insightCost: 16, text: "Core Appeal: Often centers on the perceived vulnerability and peacefulness of the 'sleeping' partner, or the transgressive thrill of observation.", unlocked: false }
        ]
     },
     {
        id: 119, name: "Forced Orgasm / Orgasm Control", cardType: "Practice/Kink", visualHandle: "rare_forceorgasm.jpg", primaryElement: "I", elementScores: { A: 5, I: 8, S: 8, P: 8, C: 7, R: 6 }, briefDescription: "Controlling partner's orgasm.", detailedDescription: "A power dynamic where one partner controls if, when, and how the other partner experiences orgasm, potentially pushing them past limits or denying it completely.", relatedIds: [38, 11, 4, 5, 112], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP119", keywords: ['Orgasm Control', 'Forced Orgasm', 'Power', 'Control', 'Denial', 'Pleasure', 'Intensity', 'BDSM'],
        lore: [
             { level: 1, insightCost: 9, text: "The Ultimate Control?: Manipulating the body's most intense pleasure/release cycle is a profound expression of power exchange.", unlocked: false },
             { level: 2, insightCost: 18, text: "Receiver's Experience: Can range from frustrating denial to ecstatic surrender, depending on negotiation and the specific dynamic sought.", unlocked: false }
        ]
     },
     {
        id: 120, name: "Psychological Torture Play", cardType: "Practice/Kink", visualHandle: "rare_psychtorture.jpg", primaryElement: "P", elementScores: { A: 4, I: 7, S: 4, P: 9, C: 8, R: 6 }, briefDescription: "Intense mind games & manipulation.", detailedDescription: "Consensual play involving intense psychological manipulation, mind games, gaslighting (within agreed limits), or emotional challenges designed to push mental boundaries. Requires extreme trust and aftercare.", relatedIds: [45, 41, 100, 99, 11], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP120", keywords: ['Psychological Torture', 'Mind Games', 'Manipulation', 'Emotion', 'Power', 'Edge Play', 'Trust', 'Consent'],
        lore: [
             { level: 1, insightCost: 11, text: "Mind Maze: This play delves deep into the psyche. Boundaries must be exceptionally clear, and aftercare robust, focusing on reassurance and reality checks.", unlocked: false },
             { level: 2, insightCost: 22, text: "Potential Goals: May explore themes of breaking/rebuilding, resilience testing, confronting fears, or the intense intimacy forged through shared psychological journeys.", unlocked: false }
        ]
     },
     {
        id: 121, name: "Furry Fandom Sexuality", cardType: "Identity/Role", visualHandle: "rare_furrysex.jpg", primaryElement: "C", elementScores: { A: 6, I: 6, S: 5, P: 6, C: 7, R: 6 }, briefDescription: "Sexy times with fursonas!", detailedDescription: "Expressing sexuality through or within the context of the furry fandom, which may involve anthropomorphic characters (fursonas), costumes (fursuits), role-play, and specific community norms.", relatedIds: [13, 98, 42], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP121", keywords: ['Furry', 'Fandom', 'Identity', 'Role-Play', 'Community', 'Anthropomorphic', 'Fursona'],
        lore: [
             { level: 1, insightCost: 7, text: "Beyond the Suit: For many, the 'fursona' is a way to express a truer self, explore identity, or engage playfully without human inhibitions.", unlocked: false },
             { level: 2, insightCost: 14, text: "Community Context: Sexuality within the fandom (often called 'yiff') has its own culture, etiquette, and artistic expressions.", unlocked: false }
        ]
     },
     {
        id: 122, name: "Autassassinophilia", cardType: "Orientation", visualHandle: "rare_autassass.jpg", primaryElement: "P", elementScores: { A: 5, I: 2, S: 7, P: 8, C: 6, R: 3 }, briefDescription: "Arousal from *staged* mortal danger.", detailedDescription: "A specific paraphilia finding arousal in the fantasy or *staged* scenario of being hunted, stalked, or put at risk of being killed (within a safe, consensual context!). It's about the thrill of simulated danger.", relatedIds: [44, 106, 117], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP122", keywords: ['Autassassinophilia', 'Risk', 'Fear', 'Edge Play', 'Fantasy', 'Thrill', 'Paraphilia'],
        lore: [
             { level: 1, insightCost: 10, text: "The Ultimate Edge?: This paraphilia takes risk-play fantasy to an extreme, focusing on the adrenaline of simulated life-or-death stakes.", unlocked: false },
             { level: 2, insightCost: 20, text: "Safety is Simulation: Real danger is *not* the goal. The arousal comes from the *idea* and *performance* of risk within a controlled fantasy.", unlocked: false }
        ]
     },
     {
        id: 123, name: "Exposure Therapy Play", cardType: "Psychological/Goal", visualHandle: "rare_exposure.jpg", primaryElement: "P", elementScores: { A: 4, I: 6, S: 5, P: 8, C: 7, R: 7 }, briefDescription: "Using scenes to process fears/trauma (Carefully!).", detailedDescription: "Carefully negotiated scenes designed to gently revisit or process past trauma or fears in a supportive BDSM setting. Needs immense trust, potentially professional guidance, and a focus on healing, not re-traumatizing.", relatedIds: [15, 69, 4, 5], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP123", keywords: ['Exposure Therapy', 'Trauma', 'Healing', 'Psychological', 'Trust', 'Safety', 'BDSM', 'Therapeutic'],
        lore: [
             { level: 1, insightCost: 11, text: "Disclaimer: This is *not* a replacement for professional therapy, but can be a *complementary* tool for some, *if* handled with extreme care and awareness.", unlocked: false },
             { level: 2, insightCost: 22, text: "Alchemist's Goal: To use the controlled intensity and trust of a scene to re-contextualize difficult memories or fears, allowing for agency and integration.", unlocked: false }
        ]
     },
     {
        id: 124, name: "Sensory Overstimulation Torture", cardType: "Practice/Kink", visualHandle: "rare_sens_torture.jpg", primaryElement: "S", elementScores: { A: 4, I: 7, S: 9, P: 7, C: 5, R: 6 }, briefDescription: "Intentional sensory overload as 'torture'.", detailedDescription: "Using prolonged, inescapable, or intensely unpleasant sensory input (e.g., specific sounds, lights, textures, smells) as a form of consensual 'torture' play.", relatedIds: [86, 37, 9, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP124", keywords: ['Sensory Overload', 'Torture', 'Intensity', 'Sensation', 'Endurance', 'Control', 'Overstimulation'],
        lore: [
             { level: 1, insightCost: 9, text: "The Goal?: Often aims for disorientation, breaking down mental defenses through sheer sensory assault, or testing endurance.", unlocked: false },
             { level: 2, insightCost: 18, text: "Rhythm & Relief: Contrast is key. Periods of intense overstimulation are often followed by quiet or deprivation to maximize the impact.", unlocked: false }
        ]
     },
     {
        id: 125, name: "Breath Control (Advanced)", cardType: "Practice/Kink", visualHandle: "rare_breath_adv.jpg", primaryElement: "S", elementScores: { A: 4, I: 7, S: 9, P: 8, C: 4, R: 6 }, briefDescription: "Precise breathing manipulation (HIGH RISK!).", detailedDescription: "Advanced forms of breath play involving more precise control over inhalation/exhalation, potentially using bags or masks under highly controlled and knowledgeable conditions. **Extremely high risk.**", relatedIds: [63, 44, 17], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP125", keywords: ['Breath Play', 'Asphyxiation', 'Risk', 'Edge Play', 'Control', 'Intensity', 'Skill', 'Safety'],
        lore: [
             { level: 1, insightCost: 10, text: "**Safety Advisory:** Lethal risks are severe. Never practice alone. Requires expert knowledge, rigorous safety protocols, and immediate emergency readiness.", unlocked: false },
             { level: 2, insightCost: 20, text: "The Allure: For experienced practitioners, it can represent the ultimate edge, pushing boundaries of sensation, trust, and altered states.", unlocked: false }
        ] // NO comma needed after the last item in the array
     }
];
// --- Utility Maps & Arrays ---
const elementKeyToFullName = { A: "Attraction", I: "Interaction", S: "Sensory", P: "Psychological", C: "Cognitive", R: "Relational" };
const elementNameToKey = Object.fromEntries(Object.entries(elementKeyToFullName).map(([key, value]) => [value, key]));
const cardTypeKeys = ["Orientation", "Identity/Role", "Practice/Kink", "Psychological/Goal", "Relationship Style"];
const elementNames = ["Attraction", "Interaction", "Sensory", "Psychological", "Cognitive", "Relational"];
// --- Questionnaire Data --- (Keep as is)
const questionnaireGuided = {
    "Attraction": [ { qId: "a1", type: "slider", text: "How specific are the triggers for your sexual attraction? (e.g., Very broad vs. Very specific types/situations)", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Very Broad / Few Specifics", maxLabel: "Very Specific / Narrow Focus", scoreWeight: 1.0 }, { qId: "a2", type: "checkbox", text: "Which factors significantly contribute to your initial attraction? (Select up to 2)", options: [ { value: "Physical Appearance/Body Type", points: 0.5 }, { value: "Gender Identity/Presentation", points: 0.5 }, { value: "Personality/Demeanor", points: 0.0 }, { value: "Intellect/Wit", points: 0.5 }, { value: "Signs of Power/Confidence", points: 1.0 }, { value: "Signs of Vulnerability/Submissiveness", points: 1.0 }, { value: "Emotional Connection (Pre-existing)", points: -1.0 }, { value: "Specific Clothing/Materials", points: 1.5 }, { value: "Context/Situation (e.g., role-play)", points: 1.0 } ], scoreWeight: 1.0, maxChoices: 2 }, { qId: "a3", type: "radio", text: "How important is an emotional bond BEFORE feeling sexual attraction?", options: [ { value: "Essential", points: -2.0 }, { value: "Helpful, but not required", points: -0.5 }, { value: "Neutral / Varies", points: 0 }, { value: "Generally unimportant", points: 1.0 } ], scoreWeight: 1.0 } ],
    "Interaction": [ { qId: "i1", type: "slider", text: "In sexual interactions, where do you naturally find yourself on the spectrum of leading vs. following?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Strongly Following / Receiving", maxLabel: "Strongly Leading / Directing", scoreWeight: 1.0 }, { qId: "i2", type: "checkbox", text: "Which interaction styles or roles feel most appealing? (Select up to 2)", options: [ { value: "Taking Charge / Dominating", points: 1.5 }, { value: "Guiding / Being Attentive (Top/Caregiver)", points: 1.0 }, { value: "Collaborating / Switching Roles", points: 0 }, { value: "Following Directions / Submitting", points: -1.5 }, { value: "Serving / Pleasing Partner", points: -1.0 }, { value: "Performing / Being Watched", points: 0.5 }, { value: "Playful / Teasing", points: 0.0 } ], scoreWeight: 1.0, maxChoices: 2 }, { qId: "i3", type: "radio", text: "Do you prefer clear power dynamics or more equal footing?", options: [ { value: "Clear Power Difference (D/s)", points: 1.5 }, { value: "Subtle Power Dynamics", points: 0.5 }, { value: "Equal Footing / Collaborative", points: -1.0 }, { value: "Varies Greatly / No Preference", points: 0 } ], scoreWeight: 1.0 } ],
    "Sensory": [ { qId: "s1", type: "slider", text: "How important is the intensity and variety of physical sensation to your arousal?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Low Importance / Subtle Preferred", maxLabel: "High Importance / Intensity Craved", scoreWeight: 1.0 }, { qId: "s2", type: "checkbox", text: "Which types of physical sensations are particularly appealing? (Select up to 2)", options: [ { value: "Gentle Touch / Caressing / Warmth", points: -1.0 }, { value: "Firm Pressure / Massage / Hugging", points: 0.0 }, { value: "Sharp / Stinging (Spanking, Biting)", points: 1.5 }, { value: "Burning / Temperature Play (Wax, Ice)", points: 1.5 }, { value: "Restriction / Binding / Helplessness", points: 1.0 }, { value: "Specific Textures (Latex, Silk, Rope)", points: 1.0 }, { value: "Vibration / Electrostimulation", points: 1.5 } ], scoreWeight: 1.0, maxChoices: 2 }, { qId: "s3", type: "radio", text: "How do you feel about incorporating pain or extreme sensations?", options: [ { value: "Strongly Drawn To It", points: 2.0 }, { value: "Open To Exploring It", points: 1.0 }, { value: "Neutral / Indifferent", points: 0 }, { value: "Prefer to Avoid It", points: -1.0 }, { value: "Strongly Averse To It", points: -2.0 } ], scoreWeight: 1.0 } ],
    "Psychological": [ { qId: "p1", type: "slider", text: "How much is your sexuality tied to fulfilling deeper emotional or psychological needs (beyond physical pleasure)?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Very Little / Primarily Physical", maxLabel: "Very Much / Primary Driver", scoreWeight: 1.0 }, { qId: "p2", type: "checkbox", text: "Which psychological needs does sex MOST effectively help you meet? (Select up to 2)", options: [ { value: "Deep Connection / Intimacy / Trust", points: 1.5 }, { value: "Power / Control (Giving or Receiving)", points: 1.5 }, { value: "Validation / Feeling Desired", points: 1.0 }, { value: "Escape / Stress Relief / Forgetting", points: 0.5 }, { value: "Catharsis / Emotional Release", points: 1.0 }, { value: "Self-Exploration / Identity Expression", points: 0.5 }, { value: "Security / Comfort / Nurturing", points: 0.0 }, { value: "Simple Fun / Recreation", points: -1.0 } ], scoreWeight: 1.0, maxChoices: 2 }, { qId: "p3", type: "radio", text: "Does sex feel incomplete if a specific psychological need isn't addressed?", options: [ { value: "Yes, Often", points: 1.5 }, { value: "Sometimes", points: 0.5 }, { value: "Rarely", points: -0.5 }, { value: "Never", points: -1.5 } ], scoreWeight: 1.0 } ],
    "Cognitive": [ { qId: "c1", type: "slider", text: "How important is mental engagement (fantasy, scenarios, intellect) during sex?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Not Important / Prefer Presence", maxLabel: "Very Important / Mentally Driven", scoreWeight: 1.0 }, { qId: "c2", type: "checkbox", text: "Which mental aspects significantly enhance your arousal? (Select up to 2)", options: [ { value: "Detailed Internal Fantasies", points: 1.5 }, { value: "Specific Role-Playing Scenarios", points: 1.5 }, { value: "Dirty Talk / Erotic Language", points: 1.0 }, { value: "Intellectual Banter / Mind Games", points: 1.0 }, { value: "Understanding Partner's Psychology", points: 0.5 }, { value: "Anticipation / Pre-Planned Scenes", points: 1.0 }, { value: "Being Fully 'In the Moment'", points: -1.5 } ], scoreWeight: 1.0, maxChoices: 2 }, { qId: "c3", type: "radio", text: "Do you prefer spontaneous encounters or more planned/scripted ones?", options: [ { value: "Strongly Prefer Planned/Scripted", points: 1.5 }, { value: "Lean Towards Planned", points: 0.5 }, { value: "No Real Preference / Mix", points: 0 }, { value: "Lean Towards Spontaneous", points: -0.5 }, { value: "Strongly Prefer Spontaneous", points: -1.5 } ], scoreWeight: 1.0 } ],
    "Relational": [ { qId: "r1", type: "slider", text: "What is your ideal relationship structure regarding number of partners?", minValue: 0, maxValue: 10, defaultValue: 3, minLabel: "Strictly One (Monogamy) / Solitary", maxLabel: "Multiple Partners / Fluidity", scoreWeight: 1.0 }, { qId: "r2", type: "checkbox", text: "Which relationship contexts feel most comfortable or desirable? (Select up to 2)", options: [ { value: "Solitary / Self-Exploration", points: -1.5 }, { value: "Deeply Committed Monogamous Pair", points: -1.0 }, { value: "Casual Dating / Friends With Benefits", points: 0.5 }, { value: "Open Relationship (Primary + Others)", points: 1.0 }, { value: "Polyamory (Multiple Equal Relationships)", points: 1.5 }, { value: "Group Sex Scenarios", points: 1.0 }, { value: "Anonymous Encounters", points: 0.5 } ], scoreWeight: 1.0, maxChoices: 2 }, { qId: "r3", type: "radio", text: "How important is relationship 'hierarchy' (e.g., having a 'primary' partner)?", options: [ { value: "Very Important / Need a Primary", points: -1.0 }, { value: "Somewhat Important / Prefer Hierarchy", points: -0.5 }, { value: "Neutral / Depends on Relationship", points: 0 }, { value: "Prefer Non-Hierarchical", points: 1.0 }, { value: "Strongly Against Hierarchy (Anarchy)", points: 1.5 } ], scoreWeight: 1.0 } ]
};

// --- Reflection Prompts --- (Keep rewritten prompts)
const reflectionPrompts = {
    "Attraction": [ { id: "pA1", text: "Think about someone (or something!) that recently made you go 'whoa, hello there!' What exactly was it about them/it that caught your eye or sparked your interest?" }, { id: "pA2", text: "Remember a time your attraction compass seemed totally haywire or pointed somewhere unexpected? What was *that* about, and what did you figure out?" }, { id: "pA3", text: "Does feeling emotionally close to someone crank up the sexy feelings dial for you, or is it separate? Spill the tea!" }, { id: "pA4", text: "Ever had a major crush fizzle out? What changed? Was it them? You? The situation? Ponder the fade..." }, ],
    "Interaction": [ { id: "pI1", text: "Picture your most *comfortable* sexy time. Were you the director, the happy follower, or was it a team effort? What made it feel so 'right'?" }, { id: "pI2", text: "Dream up your ideal encounter... What's the energy like? Playful and light? Intense and focused? Nurturing and soft? Commanding? Yielding? Describe the vibe!" }, { id: "pI3", text: "Words or vibes? How much do you rely on talking versus just *feeling* the energy flow when you're getting down to it?" }, { id: "pI4", text: "If power dynamics are your thing... what's the juicy part about being in charge? And what's the appeal of letting someone else take the wheel?" }, ],
    "Sensory": [ { id: "pS1", text: "Forget orgasm for a sec. What kind of *touch* itself feels amazing to you? Light and feathery? Firm and grounding? A little rough? Specific fabrics?" }, { id: "pS2", text: "Are there specific sensations – hot/cold, tight squeezes, sharp stings, certain sounds or smells – that totally amp up your arousal? Or any that are instant mood killers?" }, { id: "pS3", text: "Does what feels good change based on your mood that day, or who you're with? How flexible is your 'Feeling Finder'?" }, { id: "pS4", text: "Think of a purely sensory moment (sexy or not!) that felt incredibly satisfying or made you feel totally blissed out. What made it so good?" }, ],
    "Psychological": [ { id: "pP1", text: "Beyond just feeling good physically, what deep-down *need* does sex often fulfill for you? Is it connection? Feeling powerful? Stress relief? Escape? Validation?" }, { id: "pP2", text: "Remember a time sex felt *really* satisfying on a deeper level. What core need got met in that moment?" }, { id: "pP3", text: "Now, think about a time it felt kinda 'meh' psychologically, even if it was physically okay. What felt like it was missing on that deeper level?" }, { id: "pP4", text: "How does letting your guard down (vulnerability) play into your most psychologically rewarding sexy experiences?" }, ],
    "Cognitive": [ { id: "pC1", text: "How much of your sexy time happens in your head? Are you lost in fantasy, or totally tuned into the physical moment? Or somewhere in between?" }, { id: "pC2", text: "Dish (even vaguely!) about a fantasy or scenario that really gets your brain buzzing. What's the secret ingredient that makes it work?" }, { id: "pC3", text: "Does the mental game – witty banter, understanding the power dynamic, figuring someone out – turn you on as much (or more than) the physical stuff?" }, { id: "pC4", text: "How do waiting for something (anticipation) or remembering past fun times spice up your current experiences?" }, ],
    "Relational": [ { id: "pR1", text: "Where do you feel the most *free* to be your fully sexy self? Alone? With one committed partner? Casual dates? Group fun?" }, { id: "pR2", text: "Rules vs. Vibes: How important are clear agreements about exclusivity or openness in your ideal relationship(s)?" }, { id: "pR3", text: "What's your sweet spot for emotional closeness in sexual connections? Deep and soulful, fun and light, or does it vary?" }, { id: "pR4", text: "Let's talk feelings! How do things like jealousy or compersion (feeling happy for a partner's happiness with others) show up for you, if at all?" }, ],
    "Dissonance": [ { id: "pD1", text: "Okay, this Concept feels a bit different from your usual vibe! What part of it, even if it's weird, makes you tilt your head and go 'Huh, interesting...'?" }, { id: "pD2", text: "Exploring the unfamiliar can be wild! Even if this feels challenging, what *potential* new insight or experience might it offer if you leaned into it just a tiny bit?" }, { id: "pD3", text: "Sometimes the things we push away have something to teach us. Does this concept maybe poke at an underlying desire or need you haven't fully explored yet?" }, { id: "pD4", text: "How could just *understanding* this different perspective, even if it's not 'for you', broaden your view of your own awesome complexity or the sheer variety of human desire?" } ],
    "Guided": { "LowAttunement": [ { id: "gLA1", text: "Just starting your alchemical journey! Which of the core Elements feels most mysterious or exciting right now? Let's ponder that first step." }, { id: "gLA2", text: "Look back at those initial scores. Any surprises? How does it feel seeing these parts of yourself mapped out, even roughly?" } ], "HighAttunementElement": [ { id: "gHE1", text: "You're really vibing with [Element Name]! How does this energy show up in your daydreams or real-life moments? What specific flavors of it are you noticing?" }, { id: "gHE2", text: "Even strong affinities have shadows. Where might the challenge or growth edge be in your deep connection to [Element Name]?" } ], "ConceptSynergy": [ { id: "gCS1", text: "Hmm, focusing on both [Concept A] and [Concept B]... interesting combo! How do you imagine these two ideas playing together or changing each other?" }, { id: "gCS2", text: "What cool new flavor or dynamic might bubble up when you mix the essence of [Concept A] with [Concept B]? Think like a potion master!" } ] },
    "RareConcept": { "rP08": { id: "rP08", text: "Heavy Impact: It's intense! What's the core appeal of that deep thud or sting? The feeling itself, the marks left behind, the trust, the power, or something else entirely?" }, "rP09": { id: "rP09", text: "Non-Impact Pain: Clamps, wax, needles... different flavors of intensity. What specific quality of *this kind* of 'ouch' resonates? Is there a mental game alongside the physical?" }, "rP11": { id: "rP11", text: "Command & Control: Following orders precisely can be powerful. What's the satisfying click for you – giving the command, or the feeling of perfect obedience?" }, "rP12": { id: "rP12", text: "Objectification Play: A tricky concept! Within safe consent, what need or fantasy does playing with 'thing-ness' (giving or receiving) actually touch upon for you?" }, "rP14": { id: "rP14", text: "Fantasy Immersion: If your mind is the main stage, what ingredients make a fantasy feel absolutely real and captivating? What pulls you in completely?" }, "rP16": { id: "rP16", text: "Rope Bondage: Art meets restriction! Are you drawn more to the beautiful patterns, the unique pressure of the ropes, the feeling of being held, or the connection with the person tying?" }, "rP17": { id: "rP17", text: "Restriction/Helplessness: That feeling of being totally bound... what emotions bubble up? Surrender? Excitement? Vulnerability? Peace? Something unexpected?" }, "rP20": { id: "rP20", text: "Material Focus (Latex etc.): When a fabric or material itself is the turn-on, what sense is most engaged? The sleek look? The specific smell? The sound it makes? The way it feels?" }, "rP21": { id: "rP21", text: "Uniform Fetish: Clothes make the fantasy! Which specific uniform/outfit sparks things, and what story, role, or power does it instantly bring to mind?" }, "rP25": { id: "rP25", text: "Polyamory: Juggling multiple deep connections takes skill! What are the biggest joys you find (or imagine) in this style? What are the trickiest parts to navigate?" }, "rP27": { id: "rP27", text: "Relationship Anarchy: No rules but the ones you make! How do you build trust and define connections when you throw out the traditional playbook entirely?" }, "rP30": { id: "rP30", text: "High Protocol: So many rules and rituals! What's the appeal of this deep structure in D/s? Is it the clarity? The challenge of perfection? The transformation it allows?" }, "rP41": { id: "rP41", text: "Mind Control Play: Playing with suggestion and perceived control is a deep head game. What clear boundaries feel absolutely essential to explore this safely and ethically?" }, "rP42": { id: "rP42", text: "Transformation: Changing form (physically, mentally) is a potent fantasy. What *kind* of change is most intriguing, and what deeper desire might it represent?" }, "rP43": { id: "rP43", text: "Medical Play: The clinic can be clinical... or kinky! What's the core draw? The vulnerability? The implied authority? The specific tools? The power dynamic?" }, "rP44": { id: "rP44", text: "Edge Play: Pushing limits requires care. When playing close to boundaries (physical or mental), what safety chats and check-ins feel absolutely non-negotiable for you?" }, "rP45": { id: "rP45", text: "Humiliation/Degradation: This can stir up intense feelings! Where's the line for you between fun, consensual embarrassment and something that genuinely hurts? How do you know?" }, "rP63": { id: "rP63", text: "Breath Play: Altering breath alters consciousness. What specific feeling or mental shift are you seeking with this intense practice, and how is safety *always* the top priority?" }, "rP64": { id: "rP64", text: "CNC: Simulating non-consent needs rock-solid real consent. How do you and your partner(s) ensure everyone feels genuinely enthusiastic and safe *before* diving into such a scene?" }, "rP65": { id: "rP65", text: "Chemsex: Adding substances changes the game. Be honest with yourself: what are the real motivations (sensation? inhibition? social ease?) and are you aware of the risks involved?" }, "rP109": { id: "rP109", text: "M/s Dynamics: This often implies a profound power exchange beyond typical D/s. How does the idea of 'ownership' or total authority/surrender feel different to you?" }, "rP111": { id: "rP111", text: "Knife Play: The sharp edge adds undeniable intensity. Is the thrill about the visual threat, the focused sensation, the implied danger, or the deep trust required?" }, "rP112": { id: "rP112", text: "E-Stim: That electric buzz! How does the often involuntary nature of electro-sensations compare to other kinds of touch or pain for you?" }, "rP113": { id: "rP113", text: "Suspension: Being lifted and helpless... Is the main appeal the stunning visual, the physical strain and unique sensations, or that ultimate feeling of vulnerability?" }, "rP114": { id: "rP114", text: "Watersports: Playing with pee definitely pushes societal buttons! What taboos or feelings about the body does this activity bring up for you?" }, "rP115": { id: "rP115", text: "Scat Play: Deeply taboo for many. If this resonates, what complex psychological themes or power dynamics might be involved? (Safety and hygiene are paramount.)" }, "rP116": { id: "rP116", text: "Blood Play: Using blood adds a primal, ritualistic vibe. What symbolic weight or gut reaction does blood have in your erotic world? (Remember: Safety first, always!)" }, "rP117": { id: "rP117", text: "Abduction Fantasies: Being 'taken' within a safe game... What specific parts of the capture/captivity story hold the most charge for you?" }, "rP118": { id: "rP118", text: "Sleep Play: Involving someone unaware (even if pretending) touches on vulnerability. What ethical lines feel crucial to uphold, even in fantasy, around consent?" }, "rP119": { id: "rP119", text: "Orgasm Control/Forced Orgasm: Directly controlling release is potent. How does this feel different from teasing/denial? What does it say about power and pleasure?" }, "rP120": { id: "rP120", text: "Psychological 'Torture': Navigating intense mind games requires care. What kind of soothing or reconnection (aftercare) feels most needed after play that messes with your head?" }, "rP121": { id: "rP121", text: "Furry Sexuality: Expressing yourself through a fursona or within the fandom context... How does this unique blend of identity, community, and fantasy shape your desires?" }, "rP122": { id: "rP122", text: "Autassassinophilia: Arousal from *staged* mortal danger is extreme edge play. What deep psychological thrill might be found in flirting with this ultimate 'threat'?" }, "rP123": { id: "rP123", text: "Using BDSM for exposure therapy requires careful navigation. How can scene work facilitate processing trauma without re-traumatizing, and what professional support might be needed?" }, "rP124": { id: "rP124", text: "Sensory Overstimulation 'Torture': Drowning in sensation! Is the goal disorientation? Pushing endurance limits? Breaking down defenses? Or something else?" }, "rP125": { id: "rP125", text: "Advanced Breath Control: This takes breath play to another level of risk and precision. What deeper state or sensation is the goal when playing this close to the edge? (Reflect intensely on safety!)" } },
    "SceneMeditation": { "scnP001": { id: "scnP001", text: "Imagine the 'Blindfolded Tasting'... Taste, texture, trust. What other senses wake up when sight is gone? What feelings arise being fed?" }, "scnP002": { id: "scnP002", text: "Picture the 'Negotiated Power Shift'. What does that pause feel like? How does openly talking about control mid-flow change the energy or intimacy?" }, "scnP003": { id: "scnP003", text: "Feel the 'Sensory Storytelling'. How does hearing a story while feeling related touches blur the lines between mind and body? What tale would hook you in?"}, "scnP004": { id: "scnP004", text: "Sink into 'Mirror Gazing Intimacy'. Just eyes meeting eyes. What flickers of emotion, shared thoughts, or raw vulnerability pass between you in that silent space?"}, "scnP005": { id: "scnP005", text: "Consider 'Precision Sensation'. Bound, waiting... How does focusing *only* on that one point of contact change your awareness? What does that focused vulnerability feel like?" } }
};

// --- Element Deep Dive Content (Rewritten Titles & Tone) ---
const elementDeepDive = {
    "A": [
        {
            level: 1,
            title: "Level 1: What Ignites the Spark?",
            insightCost: 10,
            content: "<p>Attraction is the compass pointing towards desire. Often, it starts with the familiar: physical appearance, gender presentation, maybe a certain energy. But sometimes, it's less defined, or absent altogether (as on the Asexuality spectrum). What patterns do you notice in your *initial* pull towards others or even concepts? Is it consistent, or does it shift?</p>"
        },
        {
            level: 2,
            title: "Level 2: Beyond the Surface",
            insightCost: 25,
            content: "<p>Let's dig deeper. Is it a sharp mind (Sapiosexuality) that truly captivates you? Or perhaps a specific dynamic of power or vulnerability? Sometimes, attraction isn't about a *person* at all, but a specific object, material, or situation (a fetish). Consider: What 'unconventional' triggers might secretly (or not so secretly) flip your switch? How does needing an emotional connection *first* (Demisexuality) change the nature of the spark?</p>"
        },
        {
            level: 3,
            title: "Level 3: From Spark to Flame",
            insightCost: 50,
            content: "<p>Attraction doesn't always equal arousal. What bridges that gap for you? Is your desire often ready and waiting (spontaneous), or does it need coaxing (responsive)? Think about context: does a safe, trusting environment make the flame brighter? Does stress or disconnect dampen it? How fixed is your compass – could its true north change over time or with different partners?</p>"
        }
    ],
    "I": [
        {
            level: 1,
            title: "Level 1: The Dance of Connection",
            insightCost: 10,
            content: "<p>Interaction is about the energy exchange. Do you naturally step forward to lead the dance (Dominant/Top leaning)? Or find joy in following your partner's rhythm (Submissive/Bottom leaning)? Perhaps you flow between roles (Switch)? Reflect on your most satisfying interactions: what was the balance of giving and receiving energy?</p>"
        },
        {
            level: 2,
            title: "Level 2: Styles of Engagement",
            insightCost: 25,
            content: "<p>Beyond leading/following, what's the *flavor* of your interaction? Is it about meticulous control or profound service? Maybe it's raw and instinctive (Primal Play), or tender and nurturing (Caregiver)? Do you shine in the spotlight (Exhibitionism) or prefer observing from the shadows (Voyeurism)? Where does your unique style find its most fulfilling expression?</p>"
        },
        {
            level: 3,
            title: "Level 3: The Language of Play",
            insightCost: 50,
            content: "<p>How do you communicate desires and boundaries within the dance? Is it through clear verbal negotiation and commands? Or more through subtle cues and intuitive responses? How crucial are safety tools like safewords? Consider the importance of 'aftercare' – the reconnection and grounding after the intensity fades. How do you ensure everyone feels safe and valued throughout the entire interaction?</p>"
        }
    ],
    "S": [
        {
            level: 1,
            title: "Level 1: The Body's Alphabet",
            insightCost: 10,
            content: "<p>Your skin speaks a language. What dialects does it prefer? Gentle whispers (caresses, warmth)? Firm pronouncements (pressure, massage)? Does temperature play a role (cool sheets, hot breath)? What textures feel like poetry (silk, rough cotton)? Consider the simple, fundamental sensations that bring you comfort or initial sparks of pleasure.</p>"
        },
        {
            level: 2,
            title: "Level 2: Amplifying Sensation",
            insightCost: 25,
            content: "<p>Sometimes, a whisper isn't enough. Where does intensity enter your sensory world? Does the sharp focus of a pinch, the rhythmic punctuation of impact, or the sting of wax hold appeal? What about the feeling of being bound, the world reduced to the pressure of rope or cuffs? How does your body negotiate the fascinating edge where pleasure meets pain?</p>"
        },
        {
            level: 3,
            title: "Level 3: A Symphony for the Senses",
            insightCost: 50,
            content: "<p>Beyond touch, how do other senses weave into your experience? Does a particular scent transport you? Can certain sounds (music, a voice, a gasp) heighten everything? What role does the visual play – aesthetics, light, darkness? Explore how engaging (or depriving) multiple senses can create complex, sometimes overwhelming, and deeply personal states of arousal or focus.</p>"
        }
    ],
    "P": [
        {
            level: 1,
            title: "Level 1: The Why Behind the Wow",
            insightCost: 10,
            content: "<p>Sex is rarely just physical. What deeper currents pull you in? Is it the profound merging of souls in intimacy? The thrill of wielding power, or the liberation of surrendering it? Perhaps it's the need to feel utterly desired, or simply a way to escape the noise of the world? Identify the core psychological 'itches' that intimacy helps you scratch.</p>"
        },
        {
            level: 2,
            title: "Level 2: Emotional Landscapes",
            insightCost: 25,
            content: "<p>Vulnerability can be scary, but it's often the key to trust and deeper connection. How comfortable are you with being truly 'seen' during intimate moments? Can intensity bring release (catharsis)? Have you experienced 'flow states' or 'subspace' where the thinking mind quiets down? What makes you feel psychologically *safe* enough to explore these states?</p>"
        },
        {
            level: 3,
            title: "Level 3: Inner Alchemy",
            insightCost: 50,
            content: "<p>Our intimate lives often reflect our inner world, including hidden desires or unresolved patterns. Can consciously engaging in specific dynamics or fantasies help you understand or integrate these 'shadow' parts? Or do you sometimes find yourself repeating patterns unconsciously? Consider the potential for intentional play to be a tool for self-discovery (used wisely, perhaps alongside other support like therapy).</p>"
        }
    ],
    "C": [
        {
            level: 1,
            title: "Level 1: The Theater of the Mind",
            insightCost: 10,
            content: "<p>How active is your inner world during intimacy? Are elaborate fantasies playing out, or are you fully absorbed in the present moment? Explore the power of imagination: how can simply thinking about something, or hearing it described, spark arousal? What are the recurring themes or images that populate your mental theater?</p>"
        },
        {
            level: 2,
            title: "Level 2: Scripts and Scenarios",
            insightCost: 25,
            content: "<p>Do you enjoy stepping into a role? What kind of scenarios appeal – forbidden encounters, power dynamics, specific character archetypes? How much detail do you prefer? Is the 'story' more important than the physical act itself sometimes? Reflect on the difference between a loosely guided improv scene and a meticulously planned one.</p>"
        },
        {
            level: 3,
            title: "Level 3: The Intellectual Spark",
            insightCost: 50,
            content: "<p>For some, the mind is the primary erogenous zone. Does witty banter or intellectual sparring turn you on (Sapiosexuality)? Do you get satisfaction from understanding the psychological motivations within a dynamic? Can symbolic actions or rituals elevate an experience beyond the physical? Explore how thought, meaning, and mental games fuel your fire.</p>"
        }
    ],
    "R": [
        {
            level: 1,
            title: "Level 1: Mapping Your Connections",
            insightCost: 10,
            content: "<p>How do you structure your intimate world? Does the deep focus of a monogamous partnership feel most fulfilling? Or does the freedom of solo exploration resonate more? Perhaps the idea of multiple connections (Consensual Non-Monogamy) calls to you? Consider the basic blueprint of how many people feel 'right' in your intimate sphere.</p>"
        },
        {
            level: 2,
            title: "Level 2: Defining the Bonds",
            insightCost: 25,
            content: "<p>What depth of connection do you seek? Is deep emotional intimacy a prerequisite for physical intimacy? Or are you comfortable with connections based primarily on fun, shared interests, or physical chemistry (like Friends With Benefits or casual encounters)? How does commitment factor in? Can you have different levels of commitment with different people?</p>"
        },
        {
            level: 3,
            title: "Level 3: Navigating the Constellation",
            insightCost: 50,
            content: "<p>If exploring multiple connections, how do you navigate? Do you prefer clear rules and hierarchy (like some Open Relationships or Polyamory models)? Or does the idea of letting each relationship define itself without comparison appeal more (Relationship Anarchy)? How do you handle complex emotions like jealousy or compersion (finding joy in a partner's other connections)? What communication skills are essential?</p>"
        }
    ]
};

// --- Focus Rituals Data (Keep rewritten descriptions) ---
const focusRituals = [
     { id: "fr01", requiredFocusIds: [4], description: "Focus Ritual: Ponder a moment you felt confidently in charge (Dom Energy).", reward: { type: "insight", amount: 3 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr01" } },
    { id: "fr02", requiredFocusIds: [5], description: "Focus Ritual: Meditate on the delicious feeling of trusting someone enough to surrender control.", reward: { type: "insight", amount: 3 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr02" } },
    { id: "fr03", requiredFocusIds: [15], description: "Focus Ritual: Think of one small way to be more open or vulnerable with someone you trust.", reward: { type: "attunement", element: "P", amount: 0.5 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr03" } },
    { id: "fr04", requiredFocusIds: [16, 17], description: "Focus Ritual: Consider the beauty in restriction - how can limits create interesting sensations?", reward: { type: "insight", amount: 5 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr04" } }
];

// --- Repository Item Data (Keep rewritten descriptions) ---
const sceneBlueprints = [
    { id: "SCN001", name: "Blindfolded Tasting", element: "S", description: "One partner, blindfolded, explores tastes and textures fed by another. Heightens non-visual senses, builds trust and intimacy.", meditationCost: 10, reflectionPromptId: "scnP001" },
    { id: "SCN002", name: "Negotiated Power Shift", element: "I", description: "Mid-scene, pause and explicitly discuss swapping roles or shifting the power dynamic. Explores communication and flexibility.", meditationCost: 10, reflectionPromptId: "scnP002" },
    { id: "SCN003", name: "Sensory Storytelling", element: "C", description: "Weave an erotic tale while matching actions to words (a breeze = feather touch). Blurs the line between mind and body.", meditationCost: 10, reflectionPromptId: "scnP003" },
    { id: "SCN004", name: "Mirror Gazing Intimacy", element: "P", description: "Partners sit close, holding silent eye contact. A powerful exercise in raw connection, vulnerability, and non-verbal communication.", meditationCost: 8, reflectionPromptId: "scnP004" },
    { id: "SCN005", name: "Precision Sensation", element: "S", description: "Focus intense, specific sensations (temp, texture, light pinch) on one area, often with restriction, amplifying awareness and vulnerability.", meditationCost: 12, reflectionPromptId: "scnP005"}
];
const alchemicalExperiments = [
    { id: "EXP01", name: "Sensory Amplification Brew", requiredElement: "S", requiredAttunement: 75, insightCost: 30, requiredFocusConceptTypes: ["Practice/Kink"], description: "Attempt to brew a state of heightened senses via focused meditation and stimulation. Risk: Overload! Reward: Sharpened awareness.", successReward: { type: "attunement", element: "S", amount: 5 }, failureConsequence: "Slight sensory fuzziness for a bit.", successRate: 0.6 },
    { id: "EXP02", name: "Command Resonance Field", requiredElement: "I", requiredAttunement: 80, insightCost: 40, requiredFocusConceptIds: [11], description: "Channel intense will into command/obedience, seeking perfect sync within a power dynamic. Success boosts clarity, failure causes temporary static.", successReward: { type: "insight", amount: 20 }, failureConsequence: "Temporary inability to focus Interaction concepts.", successRate: 0.5 },
    { id: "EXP03", name: "Intimacy Catalyst Ritual", requiredElement: "P", requiredAttunement: 85, insightCost: 50, requiredFocusConceptIds: [15], description: "A risky ritual sharing deep vulnerabilities to rapidly forge connection. Success deepens bonds, failure might cause awkwardness.", successReward: { type: "attunement", element: "P", amount: 6 }, failureConsequence: "Increased feeling of psychological dissonance.", successRate: 0.4 },
    { id: "EXP04", name: "Conceptual Weaving Loom", requiredElement: "C", requiredAttunement: 70, insightCost: 35, requiredFocusConceptTypes: ["Cognitive"], description: "Mentally blend two focused Cognitive concepts into a new fantasy thread. May reveal insights or just give you a headache.", successReward: { type: "insightFragment", id: "IFC01", element: "C", text:"Weaving thoughts yields unexpected threads."}, failureConsequence: "Mental fatigue, slight Insight loss (1-2).", successRate: 0.55 },
    { id: "EXP05", name: "Persona Integration Test", requiredElement: "C", requiredAttunement: 70, insightCost: 40, requiredFocusConceptIds: [13, 21], description: "Can you seamlessly blend a role-play persona with symbolic attire? Success clarifies Cognitive links, failure creates temporary identity blur.", successReward: { type: "attunement", element: "C", amount: 4 }, failureConsequence: "Temporary confusion, slight Cognitive dip.", successRate: 0.5 }
];

const elementalInsights = [ // Making these a bit more evocative/poetic
    { id: "EI_A01", element: "A", text: "Attraction's arrow doesn't always fly straight." }, { id: "EI_A02", element: "A", text: "What makes you recoil also defines your desire." }, { id: "EI_A03", element: "A", text: "Sometimes the strongest gravity pulls towards the unknown." }, { id: "EI_A04", element: "A", text: "A shared glance, a certain scent... the universe conspires." },
    { id: "EI_I01", element: "I", text: "Every touch, every word, a silent negotiation." }, { id: "EI_I02", element: "I", text: "Even stillness speaks volumes in the dance." }, { id: "EI_I03", element: "I", text: "True power isn't taken, it's willingly given." }, { id: "EI_I04", element: "I", text: "The rhythm flows in the breath between giving and receiving." },
    { id: "EI_S01", element: "S", text: "Skin keeps score long after the mind moves on." }, { id: "EI_S02", element: "S", text: "Pain is just sensation knocking loudly; you decide if you answer." }, { id: "EI_S03", element: "S", text: "Muffle one sense, the others throw a party." }, { id: "EI_S04", element: "S", text: "Awareness sharpens on the whetstone of contrast." },
    { id: "EI_P01", element: "P", text: "Need is the river carving the canyon of desire." }, { id: "EI_P02", element: "P", text: "To be truly seen, vulnerable, is a kind of superpower." }, { id: "EI_P03", element: "P", text: "Catharsis: sometimes you have to burn it down to feel clean." }, { id: "EI_P04", element: "P", text: "Trust is the cup; intimacy, the wine poured within." },
    { id: "EI_C01", element: "C", text: "The mind: the ultimate playground, the first frontier." }, { id: "EI_C02", element: "C", text: "Every scene is built twice: first in thought, then in flesh." }, { id: "EI_C03", element: "C", text: "Meaning adds spice to sensation; intellect hones the edge." }, { id: "EI_C04", element: "C", text: "Waiting for it... sometimes the best part of getting it." },
    { id: "EI_R01", element: "R", text: "Two hearts, a universe. Many hearts, a nebula." }, { id: "EI_R02", element: "R", text: "Rules build fences; agreements build bridges." }, { id: "EI_R03", element: "R", text: "Exclusivity: a choice made, not a rule inherited." }, { id: "EI_R04", element: "R", text: "Compersion: finding joy in their joy, even beyond you." },
    { id: "IFC01", element: "C", text:"Weaving thoughts yields unexpected threads... and sometimes knots."}, // From EXP04
    { id: "EI_P05", element: "P", text: "Binding the body can free the heart, but only if trust holds the knot tight." } // From FDU002
];

// --- Focus-Driven Unlocks Data (Descriptions Rewritten) ---
const focusDrivenUnlocks = [
    { id: "FDU001", requiredFocusIds: [4, 9], unlocks: { type: "scene", id: "SCN005", name: "Precision Sensation Scene" }, description: "Aha! Focusing on Control & Pain Play unlocked the 'Precision Sensation' Scene Blueprint!" },
    { id: "FDU002", requiredFocusIds: [15, 16], unlocks: { type: "insightFragment", id: "EI_P05", element: "P", text: "Binding the body can free the heart, if trust holds the knot." }, description: "Synergy! Focusing on Intimacy & Rope revealed a deep Psychological Insight!" },
    { id: "FDU003", requiredFocusIds: [13, 21], unlocks: { type: "experiment", id: "EXP05", name: "Persona Integration Test" }, description: "Interesting combo! Role-Play + Uniform Focus unlocked the 'Persona Integration Test' Experiment!" }
];

// --- ** NEW: Category-Driven Unlocks Data ** ---
const categoryDrivenUnlocks = [
    {
        id: "CDU001",
        requiredInSameCategory: [16, 17], // Rope Bondage & Restriction/Helplessness
        categoryRequired: "liked", // Must be in the "Liked" category
        unlocks: { type: "lore", targetConceptId: 16, loreLevelToUnlock: 3 }, // Unlock Level 3 lore
        description: "Organizing Rope Bondage and Restriction/Helplessness as 'Liked' revealed deeper lore for Rope Bondage!"
    },
    {
        id: "CDU002",
        requiredInSameCategory: [4, 11], // Dominance (Psych) & Command/Control
        categoryRequired: "coreIdentity",
        unlocks: { type: "insight", amount: 5 },
        description: "Acknowledging Dominance and Command/Control as 'Pillars of Self' granted bonus Insight!"
    }
    // Add more category-based unlocks here
];
// --- ** END Category-Driven Unlocks ** ---


// --- Rituals & Milestones Data (Descriptions Rewritten) ---
const dailyRituals = [
    { id: "dr01", description: "Daily Zen: Perform Free Meditation Research.", reward: { type: "insight", amount: 2 }, track: { action: "freeResearch", count: 1, period: "daily" } },
    { id: "dr02", description: "Curate Your Collection: Add 1 Concept to the Grimoire.", reward: { type: "insight", amount: 3 }, track: { action: "addToGrimoire", count: 1, period: "daily" } },
    { id: "dr03", description: "A Moment's Pause: Complete a Reflection.", reward: { type: "insight", amount: 5 }, track: { action: "completeReflection", count: 1, period: "daily" } },
    { id: "dr04", description: "Shift Your Focus: Mark a new Concept as Focus.", reward: { type: "insight", amount: 4 }, track: { action: "markFocus", count: 1, period: "daily" } },
    { id: "dr05", description: "Invest in Knowledge: Conduct paid Research.", reward: { type: "attunement", element: "All", amount: 0.2 }, track: { action: "conductResearch", count: 1, period: "daily" } },
    { id: "dr06", description: "Deepen Understanding: Unlock an Element Insight Level.", reward: { type: "attunement", element: "All", amount: 0.5 }, track: { action: "unlockLibrary", count: 1, period: "daily"} }
];

const milestones = [
    { id: "ms01", description: "First Concept Claimed! Welcome, Collector!", reward: { type: "insight", amount: 5 }, track: { state: "discoveredConcepts.size", threshold: 1 } },
    { id: "ms02", description: "Budding Curator: 5 Concepts in the Grimoire!", reward: { type: "insight", amount: 10 }, track: { state: "discoveredConcepts.size", threshold: 5 } },
    { id: "ms15", description: "Growing Collection: 15 Concepts Added!", reward: { type: "insight", amount: 15 }, track: { state: "discoveredConcepts.size", threshold: 15 } },
    { id: "ms25", description: "Serious Collector: 25 Concepts! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "discoveredConcepts.size", threshold: 25 } },
    { id: "ms40", description: "Impressive Archive: 40 Concepts Gathered!", reward: { type: "insight", amount: 25 }, track: { state: "discoveredConcepts.size", threshold: 40 } },
    { id: "ms55", description: "Master Curator: 55 Concepts! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "discoveredConcepts.size", threshold: 55 } },
    { id: "ms75", description: "The Grand Archive: 75 Concepts Collected!", reward: { type: "insight", amount: 40 }, track: { state: "discoveredConcepts.size", threshold: 75 } },
    { id: "ms03", description: "First Focus! Your Tapestry Begins.", reward: { type: "insight", amount: 8 }, track: { state: "focusedConcepts.size", threshold: 1 } },
    { id: "ms04", description: "Tapestry Weaver: 3 Concepts Focused!", reward: { type: "attunement", element: "All", amount: 1 }, track: { state: "focusedConcepts.size", threshold: 3 } },
    { id: "ms08", description: "Expanding Focus: 5 Concepts Focused! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "focusedConcepts.size", threshold: 5 } },
    { id: "ms18", description: "Intricate Weaving: 7 Focus Slots Filled!", reward: { type: "insight", amount: 25 }, track: { state: "focusedConcepts.size", threshold: 7 } },
    { id: "ms35", description: "Complex Patterns: 9 Focus Slots Filled! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "focusedConcepts.size", threshold: 9 } },
    { id: "ms48", description: "Tapestry Master: All 12 Focus Slots Filled!", reward: { type: "insight", amount: 50 }, track: { state: "focusedConcepts.size", threshold: 12 } },
    { id: "ms05", description: "Into the Study: First Research Conducted!", reward: { type: "insight", amount: 5 }, track: { action: "conductResearch", count: 1 } },
    { id: "ms06", description: "Elemental Spark: Attunement 10+ in One Element!", reward: { type: "insight", amount: 15 }, track: { state: "elementAttunement", threshold: 10, condition: "any" } },
    { id: "ms13", description: "Balanced Flow: Attunement 5+ in ALL Elements!", reward: { type: "insight", amount: 20 }, track: { state: "elementAttunement", threshold: 5, condition: "all" } },
    { id: "ms20", description: "Elemental Adept: Attunement 50+ in One! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "elementAttunement", threshold: 50, condition: "any" } },
    { id: "ms30", description: "Elemental Master: Attunement 90+ in One Element!", reward: { type: "insight", amount: 40 }, track: { state: "elementAttunement", threshold: 90, condition: "any" } },
    { id: "ms45", description: "Harmonious Core: Attunement 25+ in ALL! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "elementAttunement", threshold: 25, condition: "all" } },
    { id: "ms07", description: "Inner Gaze: First Reflection Completed!", reward: { type: "insight", amount: 5 }, track: { action: "completeReflection", count: 1 } },
    { id: "ms12", description: "Facing Shadows: Embraced a Dissonant Reflection!", reward: { type: "attunement", element: "All", amount: 1.5 }, track: { action: "completeReflectionDissonance", count: 1 } },
    { id: "ms22", description: "Introspective Soul: Completed 5 Reflections.", reward: { type: "insight", amount: 20 }, track: { action: "completeReflection", count: 5 } },
    { id: "ms23", description: "Open Mind: Allowed Reflection to Nudge Your Scores!", reward: { type: "insight", amount: 10 }, track: { action: "scoreNudgeApplied", count: 1 } },
    { id: "ms38", description: "Seasoned Reflector: Completed 10 Reflections! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { action: "completeReflection", count: 10 } },
    { id: "ms09", description: "Dance Master: Interaction Attunement 20+! (Concept Gift!)", reward: { type: "discoverCard", cardId: 6 }, track: { state: "elementAttunement", element: "I", threshold: 20 } },
    { id: "ms10", description: "Mind Palace Explorer: Cognitive Attunement 20+! (Concept Gift!)", reward: { type: "discoverCard", cardId: 14 }, track: { state: "elementAttunement", element: "C", threshold: 20 } },
    { id: "ms11", description: "Awakened Art: First Concept Art Evolved!", reward: { type: "insight", amount: 20 }, track: { action: "evolveArt", count: 1 } },
    { id: "ms21", description: "Rare Jewel: Discovered a Rare Concept!", reward: { type: "insight", amount: 15 }, track: { action: "discoverRareCard", count: 1 } },
    { id: "ms33", description: "Sensory Savant: Sensory Attunement 30+! (Concept Gift!)", reward: { type: "discoverCard", cardId: 88 }, track: { state: "elementAttunement", element: "S", threshold: 30 } },
    { id: "ms42", description: "Art Connoisseur: Evolved Art for 3 Concepts!", reward: { type: "insight", amount: 30 }, track: { action: "evolveArt", count: 3 } },
    { id: "ms50", description: "Lab Notes Complete: Initial Experiment Done!", reward: { type: "insight", amount: 10 }, track: { action: "completeQuestionnaire", count: 1 } },
    { id: "ms60", description: "Page Turner: Unlocked First Element Insight!", reward: { type: "insight", amount: 5 }, track: { action: "unlockLibrary", count: 1} },
    { id: "ms61", description: "Elemental Initiate: Reached Insight Level 2 in One Element.", reward: { type: "insight", amount: 10 }, track: { state: "unlockedDeepDiveLevels", threshold: 2, condition: "any"} },
    { id: "ms62", description: "Elemental Adept: Reached Insight Level 3 in One Element!", reward: { type: "insight", amount: 15 }, track: { state: "unlockedDeepDiveLevels", threshold: 3, condition: "any"} },
    { id: "ms63", description: "Broad Knowledge: Unlocked Level 1 Insight for ALL Elements! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "unlockedDeepDiveLevels", threshold: 1, condition: "all"} },
    { id: "ms70", description: "Scene Scholar: Meditated on a Scene Blueprint.", reward: { type: "insight", amount: 10 }, track: { action: "meditateScene", count: 1 } },
    { id: "ms71", description: "Bold Alchemist: Attempted an Experiment!", reward: { type: "insight", amount: 15 }, track: { action: "attemptExperiment", count: 1 } },
    { id: "ms72", description: "Fragment Finder: Collected 3 Elemental Insights!", reward: { type: "attunement", element: "All", amount: 1.0 }, track: { state: "repositoryInsightsCount", threshold: 3 } },
    { id: "ms73", description: "Repository Rummager: Found 1 of Each Item Type!", reward: { type: "insight", amount: 20 }, track: { state: "repositoryContents", condition: "allTypesPresent" } },
    { id: "ms80", description: "Savvy Seller: Sold Your First Concept Card!", reward: { type: "insight", amount: 5 }, track: { action: "sellConcept", count: 1 } },
    { id: "ms90", description: "Lore Seeker: Unlocked First Lore Level!", reward: { type: "insight", amount: 5 }, track: { action: "unlockLore", condition: "anyLevel", threshold: 1 } } // Added Lore Milestone
];


// --- Data for Tapestry Narrative Generation (Structure kept, used by logic) ---
const elementInteractionThemes = {
    "AI": "a dynamic blend of specific Attraction triggers and a focus on Interaction roles, suggesting interest in how desire plays out in social dynamics.",
    "AS": "a focus where specific Attraction cues are strongly linked to Sensory experiences, emphasizing the physical manifestation of desire.",
    "AP": "an exploration linking Attraction triggers to deeper Psychological needs, perhaps seeking specific dynamics to fulfill emotional goals.",
    "AC": "a combination where Attraction is filtered through a Cognitive lens, suggesting interest in the 'idea' of a person/dynamic or enjoying intellectual sparks.",
    "AR": "a pairing where specific Attractions are considered within defined Relationship structures, exploring how desires fit into commitments or fluid connections.",
    "IS": "a strong emphasis on the physical feeling and flow of Interaction, where Sensory input heavily defines the quality of the power exchange or role-play.",
    "IP": "a focus on the Psychological underpinnings of Interaction styles, exploring the 'why' behind dominance, submission, or collaboration.",
    "IC": "an Interaction style heavily influenced by Cognitive elements like scenarios, rules, or psychological analysis within the dynamic.",
    "IR": "an interest in how different Interaction styles manifest within various Relationship structures, from dyads to groups.",
    "SP": "a deep connection between Sensory experience and Psychological fulfillment, perhaps using sensation for catharsis, grounding, or exploring vulnerability.",
    "SC": "where Sensory experiences are framed or enhanced by Cognitive elements like fantasy, anticipation, or specific mental states.",
    "SR": "exploring how different Sensory preferences play out across various Relationship contexts or numbers of partners.",
    "PC": "a highly introspective focus, blending Psychological drives with Cognitive exploration through fantasy, analysis, or meaning-making.",
    "PR": "where Psychological needs are explored or met through specific Relationship configurations or dynamics.",
    "CR": "a focus on the mental frameworks and structures of Relationships, perhaps enjoying negotiation, defining roles intellectually, or exploring theoretical models.",
    // Add more complex 3-element themes if desired
    "AIS": "a highly embodied experience focused on the interplay of desire, physical sensation, and interactive roles."
};

const cardTypeThemes = {
    "Orientation": "defining the 'who' or 'what' sparks desire is central to this focus.",
    "Identity/Role": "exploring 'who you are' within intimacy or specific power dynamics seems key.",
    "Practice/Kink": "the 'how' and 'what' of sexual expression, the specific actions and sensations, are prominent.",
    "Psychological/Goal": "understanding the 'why' – the underlying emotional needs and motivations – drives this focus.",
    "Relationship Style": "the 'structure' and context of connection, how relationships are formed and navigated, is a major theme."
};

// --- Onboarding Tasks --- (Keep rewritten descriptions/hints)
 const onboardingTasks = [
    { id: 'task01', phaseRequired: 1, description: "Peek at Your Grimoire", reward: { type: 'insight', amount: 1 }, track: { action: 'showScreen', value: 'grimoireScreen' }, hint: "Check out the 'Grimoire' tab up top! It's where your discovered Concepts live." },
    { id: 'task02', phaseRequired: 1, description: "Focus on a Feeling", reward: { type: 'insight', amount: 2 }, track: { action: 'markFocus', count: 1 }, hint: "Click a Concept card (Grimoire/Research), hit 'Mark as Focus'. Or just tap the ☆ star on the card in the Grimoire!" },
    { id: 'task03', phaseRequired: 2, description: "Do Some Research!", reward: { type: 'insight', amount: 2 }, track: { action: 'conductResearch', count: 1 }, hint: "Head to the 'Study' tab and click an Element button to see what you find (uses Insight or Free Research)." },
    { id: 'task04', phaseRequired: 2, description: "Keep What You Find", reward: { type: 'insight', amount: 1 }, track: { action: 'addToGrimoireFromResearch', count: 1 }, hint: "After Researching, hit 'Add to Grimoire' on a cool Concept card in the 'Research Discoveries' area below." },
    { id: 'task05', phaseRequired: 3, description: "Ponder a Prompt", reward: { type: 'insight', amount: 3 }, track: { action: 'completeReflection', count: 1 }, hint: "Sometimes Reflections pop up automatically. Or, visit the Study and 'Seek Guidance'!" },
    { id: 'task06', phaseRequired: 4, description: "Explore the Repository", reward: { type: 'insight', amount: 1 }, track: { action: 'showScreen', value: 'repositoryScreen' }, hint: "Check the 'Repository' tab for cool unlocked stuff like Scenes, Experiments, and Insights!" }
];

 const elementalDilemmas = [ // Add 'export' keyword here
    
    // --- Attraction Focused ---
    {
        id: "ED_A01", elementFocus: ["A", "P"],
        situation: "You feel an intense, almost purely physical attraction (a specific fetish or look) towards someone, but sense a lack of deeper psychological connection or compatibility.",
        question: "How strongly do you pursue this connection?",
        sliderMinLabel: "Prioritize Potential Psychological Depth (Psychological Focus)",
        sliderMaxLabel: "Follow the Intense Attraction Trigger (Attraction Focus)",
        elementKeyMin: "P",
        elementKeyMax: "A"
    },
    {
        id: "ED_A02", elementFocus: ["A", "R"],
        situation: "A new person enters your social circle who strongly matches your 'type' or attraction patterns, potentially creating friction within your existing relationship structure or agreements.",
        question: "Your primary leaning is towards:",
        sliderMinLabel: "Upholding Existing Relationship Stability/Agreements (Relational Focus)",
        sliderMaxLabel: "Exploring or Acknowledging the New Attraction (Attraction Focus)",
        elementKeyMin: "R",
        elementKeyMax: "A"
    },
    {
        id: "ED_A03", elementFocus: ["A", "C"],
        situation: "You meet someone incredibly stimulating intellectually (Sapiosexual trigger), but their physical appearance or presentation doesn't align with your usual visual attraction patterns.",
        question: "How likely are you to initiate or pursue intimacy?",
        sliderMinLabel: "Less Likely; Visual Cues Are Primary (Attraction Focus)",
        sliderMaxLabel: "More Likely; Mental Spark Overrides Visuals (Cognitive/Attraction Blend)",
        elementKeyMin: "A", // Leaning towards typical A focus
        elementKeyMax: "C"  // Leaning towards the Cognitive override
    },
       {
        id: "ED04", elementFocus: ["P", "R"],
        situation: "A long-term partner reveals a secret desire that clashes significantly...",
        question: "Your primary internal guide in responding is:",
        sliderMinLabel: "Your Partner's Happiness (Relational Focus)",
        sliderMaxLabel: "Your Own Boundaries/Comfort (Psychological Focus)",
        elementKeyMin: "R",
        elementKeyMax: "P"
    },
    // --- Interaction Focused ---
    {
        id: "ED_I01", elementFocus: ["I", "S"],
        situation: "During a scene, your partner (in the submissive/bottom role) requests a specific, intense sensation you're unfamiliar or slightly uncomfortable delivering, though it fits the established power dynamic.",
        question: "Your inclination is to:",
        sliderMinLabel: "Prioritize Your Comfort/Familiarity with the Sensation (Sensory Focus)",
        sliderMaxLabel: "Fulfill the Role/Dynamic Expectation (Interaction Focus)",
        elementKeyMin: "S",
        elementKeyMax: "I"
    },
    {
        id: "ED_I02", elementFocus: ["I", "P"],
        situation: "You prefer a highly structured, commanding interaction style (High I), but sense your partner deeply needs more nurturing and psychological reassurance (High P need).",
        question: "How do you adapt your interaction?",
        sliderMinLabel: "Shift Towards Nurturing/Reassurance (Psychological Focus)",
        sliderMaxLabel: "Maintain Your Preferred Interaction Structure (Interaction Focus)",
        elementKeyMin: "P",
        elementKeyMax: "I"
    },
    {
        id: "ED_I03", elementFocus: ["I", "C"],
        situation: "You enjoy spontaneous, intuitive interaction, letting the energy flow (Mid I), but your partner wants to meticulously plan out a complex role-play scenario beforehand (High C).",
        question: "Your preference leans towards:",
        sliderMinLabel: "Embracing the Detailed Cognitive Planning (Cognitive Focus)",
        sliderMaxLabel: "Favoring Spontaneous Energetic Flow (Interaction Focus)",
        elementKeyMin: "C",
        elementKeyMax: "I"
    },

    // --- Sensory Focused ---
    {
        id: "ED_S01", elementFocus: ["S", "P"],
        situation: "You crave intense physical sensation for stress relief or catharsis, but your partner is feeling vulnerable and primarily desires gentle, comforting touch.",
        question: "Tonight, you prioritize:",
        sliderMinLabel: "Providing Gentle Comfort & Psychological Safety (Psychological Focus)",
        sliderMaxLabel: "Seeking Your Desired Intense Sensation (Sensory Focus)",
        elementKeyMin: "P",
        elementKeyMax: "S"
    },
    {
        id: "ED_S02", elementFocus: ["S", "R"],
        situation: "An opportunity arises for an exciting, high-sensation group play scenario, but participating might strain the agreements or comfort levels within your primary relationship(s).",
        question: "Your decision is weighted towards:",
        sliderMinLabel: "Protecting Existing Relationship Harmony/Agreements (Relational Focus)",
        sliderMaxLabel: "Pursuing the Novel Sensory Experience (Sensory Focus)",
        elementKeyMin: "R",
        elementKeyMax: "S"
    },
    {
        id: "ED_S03", elementFocus: ["S", "I"],
        situation: "You enjoy receiving specific impact play (High S), but your partner is hesitant to deliver it with the force/intensity you desire, feeling it conflicts with their nurturing interaction style (Lower I/Dom).",
        question: "The focus should be on:",
        sliderMinLabel: "Respecting Partner's Interaction Comfort Zone (Interaction Focus)",
        sliderMaxLabel: "Guiding Towards Your Desired Sensation Level (Sensory Focus)",
        elementKeyMin: "I",
        elementKeyMax: "S"
    },

    // --- Psychological Focused ---
    {
        id: "ED_P01", elementFocus: ["P", "I"],
        situation: "You have a deep psychological need for surrender and helplessness (High P-Sub), but your current partner prefers a very egalitarian, non-hierarchical interaction style (Mid I).",
        question: "You are more likely to:",
        sliderMinLabel: "Adapt to the Egalitarian Interaction Style (Interaction Focus)",
        sliderMaxLabel: "Find Ways to Express/Fulfill Your Need for Surrender (Psychological Focus)",
        elementKeyMin: "I",
        elementKeyMax: "P"
    },
    {
        id: "ED_P02", elementFocus: ["P", "C"],
        situation: "Engaging in a specific fantasy scenario is crucial for your psychological fulfillment (e.g., feeling truly desired), but your partner finds detailed fantasy immersion difficult or distracting.",
        question: "The priority becomes:",
        sliderMinLabel: "Focusing on Shared Reality & Cognitive Connection (Cognitive Focus)",
        sliderMaxLabel: "Ensuring Your Core Psychological Need is Met (Psychological Focus)",
        elementKeyMin: "C",
        elementKeyMax: "P"
    },
    {
        id: "ED_P03", elementFocus: ["P", "A"],
        situation: "You need deep emotional validation (High P) from intimacy, but find yourself overwhelmingly attracted (High A) to someone emotionally unavailable or purely focused on the physical.",
        question: "Your inclination is to lean towards:",
        sliderMinLabel: "Pursuing the Intense Attraction, Despite Need Mismatch (Attraction Focus)",
        sliderMaxLabel: "Prioritizing Partners/Situations Meeting Your Validation Need (Psychological Focus)",
        elementKeyMin: "A",
        elementKeyMax: "P"
    },

    // --- Cognitive Focused ---
    {
        id: "ED_C01", elementFocus: ["C", "S"],
        situation: "Your elaborate fantasy requires specific, perhaps slightly uncomfortable or awkward, physical actions or props to feel 'right', potentially disrupting smooth sensory flow.",
        question: "You prioritize:",
        sliderMinLabel: "Maintaining Comfortable Sensory Flow & Presence (Sensory Focus)",
        sliderMaxLabel: "Executing the Cognitive Fantasy Accurately (Cognitive Focus)",
        elementKeyMin: "S",
        elementKeyMax: "C"
    },
    {
        id: "ED_C02", elementFocus: ["C", "R"],
        situation: "You thrive on complex rules and negotiated scenarios (High C), but your partner(s) prefer a more fluid, less defined relational approach (High R-Anarchy leaning).",
        question: "In navigating interactions, you emphasize:",
        sliderMinLabel: "Flexibility & Adapting to Relational Flow (Relational Focus)",
        sliderMaxLabel: "Establishing Clear Structures & Shared Understanding (Cognitive Focus)",
        elementKeyMin: "R",
        elementKeyMax: "C"
    },
    {
        id: "ED_C03", elementFocus: ["C", "P"],
        situation: "You enjoy detached, analytical mind games or psychological sparring during play (High C), but sense it might be causing genuine emotional distress or insecurity for your partner (Low P comfort).",
        question: "Your approach tends towards:",
        sliderMinLabel: "Prioritizing Partner's Emotional Safety & Comfort (Psychological Focus)",
        sliderMaxLabel: "Engaging in the Stimulating Cognitive Game (Cognitive Focus)",
        elementKeyMin: "P",
        elementKeyMax: "C"
    },

    // --- Relational Focused ---
    {
        id: "ED_R01", elementFocus: ["R", "A"],
        situation: "You are in a happily monogamous relationship (Low R score area) but develop a strong, unexpected attraction to a close friend.",
        question: "Your primary internal conflict centers on:",
        sliderMinLabel: "Navigating the Feelings Within Your Attraction Patterns (Attraction Focus)",
        sliderMaxLabel: "Honoring Your Commitment & Relationship Structure (Relational Focus)",
        elementKeyMin: "A",
        elementKeyMax: "R"
    },
    {
        id: "ED_R02", elementFocus: ["R", "I"],
        situation: "You practice Relationship Anarchy (High R), valuing autonomy, but a partner expresses a desire for a more defined D/s dynamic with specific protocols (High I).",
        question: "Your response prioritizes:",
        sliderMinLabel: "Exploring the Desired Interaction Dynamic (Interaction Focus)",
        sliderMaxLabel: "Maintaining Core Principles of Relational Autonomy/Fluidity (Relational Focus)",
        elementKeyMin: "I",
        elementKeyMax: "R"
    },
    {
        id: "ED_R03", elementFocus: ["R", "S"],
        situation: "Your polyamorous constellation (High R) includes partners with vastly different sensory preferences, making group encounters complex to satisfy everyone physically.",
        question: "When planning group time, you focus more on:",
        sliderMinLabel: "Maximizing Potential Sensory Fulfillment for Individuals (Sensory Focus)",
        sliderMaxLabel: "Facilitating Group Connection & Relational Dynamics (Relational Focus)",
        elementKeyMin: "S",
        elementKeyMax: "R"
    }
];

// You would likely add this export to the end of your data.js if it's not already there:
// export { elementalDilemmas };



// --- FINAL EXPORT BLOCK ---
export {
    // Core Data
    elementDetails,
    concepts, // Make sure this is here
    elementKeyToFullName,
    elementNameToKey,
    cardTypeKeys,
    elementNames,
    // Gameplay Data
    questionnaireGuided,
    reflectionPrompts,
    elementDeepDive,
    focusRituals,
    dailyRituals,
    milestones,
    // Repository Items
    sceneBlueprints,
    alchemicalExperiments,
    elementalInsights,
    // Unlock Mechanisms
    focusDrivenUnlocks,
    categoryDrivenUnlocks, // Ensure this is here if you added it
    // UI/Config Helpers
    // onboardingTasks, // Removed if you deleted onboarding
    elementInteractionThemes,
    cardTypeThemes,
    grimoireShelves, // Ensure this is here
    elementalDilemmas // <-- ADD THIS LINE
};

console.log("data.js exports defined... RARE lore added, shelves defined, category unlocks added, dilemmas added!"); // Optional: Update log
console.log("data.js finished.");
