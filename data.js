// --- START OF CORRECTED data.js (Resumed) ---

console.log("data.js loading... Weaving RoleFocus, Defining Tasks, Refining Lore (v4.3)");

// --- Element Definitions (Now 7 Elements) ---
const elementDetails = {
    "Attraction": {
        name: "Attraction Focus: The Spark Plug",
        coreQuestion: "Seriously, who or what truly flips *your* switch? What unique signal lights that initial pilot light of desire within you?",
        coreConcept: "Think of this as your personal 'Desire Compass,' forged in the heart-fires of *you* and reacting to the world's subtle energies. What genuinely *points* you towards sexy feelings or intimate curiosity? It's way more complex than just gender – it could be the electric hum of someone's specific vibe, a charged situation crackling with potential, a sudden meeting of minds ('brainwave sync!'), or even captivating objects, compelling ideas, or symbolic aesthetics. What makes your compass needle *sing* and spin?",
        elaboration: "Sure, it covers the familiar landmarks on the map – straight, gay, bi, pan attraction patterns based on gender. But our exploration delves into the whole, vibrant Asexuality spectrum (where attraction might whisper softly, appear only under rare cosmic alignments, or be entirely absent, which is perfectly valid!) and the intriguing territory of Demisexuality (where the compass only awakens after forging a deep, resonant emotional connection, like needing a key to unlock the mechanism). Beyond that, maybe your needle leaps for brilliant minds (hello, Sapiosexuals!), quivers in the presence of certain power dynamics (authority or vulnerability?), gets magnetically pulled by specific physical forms or aesthetics, or goes absolutely wild for very particular things like the second-skin gleam of latex, the specific shape of a foot, or intricate scenarios (sometimes called fetishes – we catalogue 'em all here, judgment-free, like curious alchemists documenting magical ingredients!).",
        scoreInterpretations: {
            "Very Low": "Your Spark Plug hums at a cool, steady frequency! Strong Asexual vibrations resonate here – perhaps sexual attraction isn't a major force shaping your interactions, or it manifests as a rare comet, appearing briefly and not tied to predictable orbits. This indicates a self-contained energy, powerful in its own right!",
            "Low": "Less about specific targets, more about the *resonant frequency* or a specific *context*. Maybe you need that deep Demisexual soul-bond before the spark truly ignites, requiring trust and emotional intimacy as fuel. Or perhaps your desire prefers to respond rather than initiate, like a perfectly tuned instrument waiting for the right note from a trusted player. Your spark is discerning and values connection.",
            "Moderate": "A common and incredibly versatile setting for your compass! You might resonate with familiar energies like gender expression or style, find your compass spinning happily for many kinds of people (Pan-curious, perhaps?), or need *some* level of connection or shared vibe, but not necessarily a soul-merging epic before feeling a pull. You navigate the world with a well-rounded map of attraction.",
            "High": "Ooh, a strong magnetic pull towards specific 'true norths'! You likely have clearly defined types, dynamics (brains? authority? artistic flair? vulnerability?), or even certain objects, materials (like leather or lace), or situations that reliably get your inner engine revving. Your desire has clear destinations it wants to explore!",
            "Very High": "Laser focus! Your attraction might be incredibly specific, homing in on a narrow band of individuals defined by unique traits, OR certain objects, materials, vibes, or scenarios are non-negotiable *ley lines* that *must* be present to truly light your fire. This is where potent fetishes often reside, acting as powerful catalysts or essential ingredients in your personal alchemy of desire."
        },
        examples: "Think energies like: Asexuality (Absence/Low intensity/Rare occurrence of sexual attraction), Demisexuality (Emotional bond prerequisite!), Straight, Gay, Bi, Pan (Gender factors in attraction), Sapiosexuals (Intelligence is fire!), Fetishes (Latex allure, Foot focus, Uniform power – endless possibilities!), attraction to specific body types/features, magnetic pull towards certain D/s roles, the captivating nature of Androgyny.",
        personaConnection: "How this shapes *your* unique sexy magic: It fundamentally defines the 'who', 'what', 'when', or 'vibe' that first captures your attention and draws you in, the initial ingredients needed to begin brewing your unique potion of desire."
    },
    "Interaction": {
        name: "Interaction Style: The Dance Floor",
        coreQuestion: "How do you naturally love to move and groove when connecting intimately? What's your signature rhythm, your preferred way of sharing energy?",
        coreConcept: "This explores your preferred 'choreography' in the intimate space (be it a cozy bedroom, a dedicated dungeon, or a sun-dappled forest clearing!). Are you instinctively drawn to leading the dance, setting the pace and guiding the steps with confidence (Dominance)? Or do you find profound bliss in following, surrendering to the music and your partner's lead (Submission)? Perhaps you're a master of improvisation, seamlessly weaving moves together, sometimes leading, sometimes following (Switching)? What's the energetic pulse and structure of your ideal dance?",
        elaboration: "It covers the entire dynamic spectrum, from confidently taking the reins and directing the scene (Dominance) to joyfully yielding control and trusting the flow (Submission). Do you thrive on a sense of equality and perfectly mirrored steps, or does a clear power difference make the music soar and feel more exciting? This includes nuanced energies like being a nurturing Caregiver, a playful Tease, a commanding Presence, a devoted Servant focused on pleasure, or even a dazzling Performer who thrives on being watched. Think: Dom, Sub, Switch, Top, Bottom, Caregiver, Primal Player, Exhibitionist, etc.",
        scoreInterpretations: {
            "Very Low": "Leaning back into the music, feeling supported and guided, feels absolutely divine! You likely adore yielding control, following intricate or clear steps, serving with devotion, or being completely swept off your feet and cared for. Resonant Submissive energy sings strongly here, finding freedom in following.",
            "Low": "Happy to let others lead the choreography! You might find deep satisfaction in supporting roles, focusing intently on the bliss of receiving pleasure, or responding beautifully to clear cues rather than directing the overall flow. Submissive or Bottom vibrations likely feel like comfortable, familiar ground.",
            "Moderate": "Let's improvise a stunning duet! You probably enjoy a fluid give-and-take, perhaps swapping the lead role effortlessly and playfully (hello, versatile Switches!), or keeping the energy collaborative, mutual, and highly responsive. Partnership in motion, co-creating the dance!",
            "High": "Ready to step forward and lead the way! You relish taking charge, guiding the flow of energy and sensation, generously dishing out carefully chosen pleasures or devoted care, or perhaps being the undeniable star of the show, directing the spotlight. Dominant, Top, or Caregiver energy shines brightly through you.",
            "Very High": "You *thrive* being the conductor of this intimate orchestra! Giving precise directions, commanding the entire atmosphere, meticulously crafting the experience, or fully embodying a potent, authoritative Dominant role feels utterly natural and deeply satisfying. Perhaps witnessing your partner's ecstatic reaction is the sweetest music of all!"
        },
        examples: "Think dynamics like: D/s (Dominance/submission power exchange), M/s (Master/slave - often a deeper, lifestyle commitment), Top/Bottom/Versatile (Positional, energetic, or task-oriented roles), Primal Play (getting growly, instinctive!), Service devotion (finding joy in pleasing), Show-offs & Watchers (Exhibitionism/Voyeurism), Teacher/Student dynamics (knowledge exchange play), Caregiver/Little connections (nurturing/dependent roles like DDlg/MDlb etc).",
        personaConnection: "How this shapes *your* unique sexy magic: It defines your favorite way to 'partner up' and engage, how you prefer to share energy, and how you express or experience power, control, and surrender within the dance of intimacy."
    },
    "Sensory": {
        name: "Sensory Emphasis: The Feeling Finder",
        coreQuestion: "What specific physical sensations make your whole being sigh 'Ooh yes!' or gasp 'More!'? What tunes your body's strings to the frequency of pleasure or intense awareness?",
        coreConcept: "This is your personal 'Sensitivity Dial,' measuring how crucial *physical feeling* is in your intimate experiences. We're not just talking about orgasm; we mean the entire sensory symphony – the quality of touch (light vs. firm), temperature contrasts (hot wax, cool metal), intriguing textures (smooth silk, rough rope), specific pressures (tight binds, gentle squeezes), and even the subtle influence of sights, sounds, and smells that weave into the moment and heighten arousal.",
        elaboration: "Covers the entire landscape your physical senses explore! Gossamer-light touches that tease nerve endings, grounding firm grips that convey presence, maybe the resonant thud or sharp sting of impact play? The intriguing contrast of hot wax dripping slowly versus the shocking chill of ice cubes? The glide of smooth silk across skin versus the rough, secure embrace of rope? Tight squeezes that paradoxically feel like safety, gentle vibrations that hum with electric pleasure? Plus, how evocative sights (candlelight, specific aesthetics), resonant sounds (music, breath, words), or specific smells (perfume, leather, clean sweat) play their part. It also explicitly includes the whole spectrum from seeking pure, unadulterated pleasure to intentionally playing with pain or intensity (as in BDSM), finding fascination and release in the body's complex responses.",
        scoreInterpretations: {
            "Very Low": "Feelings are... interesting, but maybe background noise? Direct physical input might be far less important than the emotional resonance, the intricate mental game, or the overall connection for you. Intense or extreme sensations are likely a firm 'thanks, but no thanks' territory. You connect through other channels primarily.",
            "Low": "Gentle currents and soft melodies preferred! You likely favor soft, warm, affectionate, or 'vanilla' sensations where comfort is paramount. Intense physical experiences, pain, or jarring contrasts are usually off the map. You seek solace, connection, and ease through sensation.",
            "Moderate": "You appreciate the well-loved classics and a varied sensory menu! A satisfying range of pleasant physical feelings is definitely welcome and enhances the experience. Maybe you're curious about *mild* intensity (a playful spank? a light scratch? temperature tease?), but it’s not the headliner, just part of the delightful ensemble cast.",
            "High": "Dedicated Sensation Seeker reporting for duty! You actively pursue specific, potent, or unique physical feelings that truly capture your attention. Think deliberate impact play, intriguing temperature games that wake up the skin, the specific allure of textures (hello, latex, velvet, or rope!), light bondage adding focus and vulnerability, or really zoning in on those exquisite pleasure points with dedicated skill.",
            "Very High": "INTENSITY IS THE LANGUAGE YOUR BODY SPEAKS! You might *crave* strong, specific, or even extreme sensations to feel truly engaged, present, and alive. Heavy BDSM play (impact that leaves marks, needle play, hot wax artistry - all practiced with meticulous safety!), constrictive bondage that alters consciousness, deliberate sensory overload/deprivation techniques, or a powerful, unwavering focus on *very* specific physical triggers could be your core pathway to profound experience."
        },
        examples: "Think experiences like: A slow, gentle massage melting away the mundane world, deep soul-searching kisses that taste like forever, cozy cuddles that feel like coming home, BDSM impact (flogging's hypnotic rhythm, caning's sharp declaration), wax play creating temporary art on skin, ice cube trails leaving paths of fire, intricate rope bondage (Shibari!), blindfolds heightening every other nerve ending, e-stim's unique electric tingle, loving the specific feel of certain fabrics (leather, silk, fur, denim) against skin.",
        personaConnection: "How this shapes *your* unique sexy magic: It defines how your physical body deciphers the complex and fascinating language of pleasure, pain, intensity, and pure sensation."
    },
    "Psychological": {
        name: "Psychological Driver: The Heart's Quest",
        coreQuestion: "Beyond the undeniable physical thrill, *why* intimacy for you, truly? What deep-down soul-need does it satisfy, what inner quest does it fuel, what core part of you does it allow to be expressed?",
        coreConcept: "This digs into the resonant core motivations, the profound 'why' *behind* the intimate encounters. What emotional longings, mental explorations, or even soul-level quests does intimacy help you embark on or fulfill? What essential inner landscape does it illuminate, nourish, or allow you to traverse?",
        elaboration: "It's about the deeper purpose, the engine driving the experience. Is it primarily about forging profound <strong>connection</strong> (deep intimacy, unwavering trust, shared vulnerability that builds bridges)? Exploring the fascinating terrain of <strong>power</strong> dynamics (claiming control, finding freedom in surrender, the dance of service)? A vital channel for <strong>self-expression</strong> (unleashing creativity, receiving validation, the relief of being truly *seen*)? A potent way to intentionally <strong>shift your state</strong> (finding escape from stress, experiencing catharsis, achieving blissful release)? Or seeking fundamental <strong>comfort, safety, and security</strong> in the sanctuary of another's presence?",
        scoreInterpretations: {
            "Very Low": "Perhaps sex is primarily about delightful physical release, pure unadulterated fun, or simply scratching a biological or stress-induced itch? Deeper psychological quests and soul-level needs might find their answers, nourishment, or expression primarily in other realms of your life.",
            "Low": "The emotional side provides a pleasant harmony, a lovely background score, but maybe not the main melody driving the experience. Fun, effective stress relief, or light, uncomplicated connection could be the usual drivers, keeping the psychological stakes relatively low.",
            "Moderate": "A healthy, balanced ecosystem where body and mind intertwine! Sex likely fulfills several important needs – fostering connection, melting stress, sparking joy, feeling affirmed – existing comfortably alongside, and enhancing, the pure physical enjoyment. A well-rounded and adaptable 'why'.",
            "High": "Intimacy serves as a key portal, a primary channel for meeting specific, vital inner needs. You might consciously (or unconsciously) seek out situations that offer deep vulnerability, allow for explicit power exchange, provide potent validation, or facilitate significant emotional release primarily through sexual expression and connection.",
            "Very High": "Hitting that profound psychological note, satisfying that core need, is *the entire point*, the absolute heart of the matter. If fundamental requirements like achieving total surrender, wielding absolute (consensual) control, experiencing deep soul-baring vulnerability, or completely escaping the mundane world aren't met, the experience might feel strangely hollow, incomplete, or unsatisfying, regardless of how physically pleasant it was."
        },
        examples: "Think motivations like: Using sex mainly as a reliable tool to de-stress after a demanding week (Low/Moderate), intentionally building unbreakable emotional bonds and trust through shared physical intimacy (High), engaging in specific BDSM practices for cathartic power exchange or profound emotional release (High/Very High), needing potent validation of your desirability, skill, or worthiness through a partner's reaction (High), chasing intense 'out of body' flow states or ego dissolution through sensation and connection (Very High).",
        personaConnection: "How this shapes *your* unique sexy magic: It defines the emotional 'why', the deep-seated motivations, core needs, and soul-level quests that fuel your sexual expression and drive your search for meaningful connection."
    },
    "Cognitive": {
        name: "Cognitive Engagement: The Mind Palace",
        coreQuestion: "How much of the action happens in your headspace? Is your brain a primary erogenous zone, buzzing with elaborate fantasies, strategic scenarios, complex analyses, or witty wordplay?",
        coreConcept: "This measures how much your *mind* actively directs, shapes, or participates in the intimate experience. Are you all about being fully present in the physical moment, lost in the flow of sensation and emotion? Or do vivid internal fantasies, elaborate pre-planned stories, intricate psychological games, sharp and seductive banter, or the sheer abstract *idea* of a dynamic provide the main fuel for your fire?",
        elaboration: "Includes the full spectrum of mental involvement: from being totally grounded in immediate physical sensations and emotional feedback (low cognitive engagement) to inhabiting richly detailed, self-contained fantasy worlds, playing out complex character roles with specific motivations, loving strategic 'mind games' or psychological chess, getting profoundly fired up by clever, evocative language, or being intensely turned on by the *concept*, symbolism, or intellectual framework of a dynamic (high cognitive engagement). Your imagination might be the main stage!",
        scoreInterpretations: {
            "Very Low": "Headspace blissfully clear, focused on the here and now! You prefer being fully present, immersed in the unfolding physical feelings and emotional currents. Complex fantasies or intricate analyses might feel like distractions, pulling you out of the magic of the embodied moment. Presence is paramount.",
            "Low": "Mostly grounded in the present reality! You relish the immediate sensations and the connection happening right now. Maybe a fleeting scenario or image drifts by, but you're not actively directing a major internal movie; the physical reality and emotional exchange are the undisputed stars.",
            "Moderate": "A beautiful synergy between Mind and Body! You can savor being fully present, but also appreciate adding some mental spice to the mix – perhaps enjoying occasional light role-play, responding eagerly to dirty talk that paints a vivid picture, or getting intrigued by the underlying psychology of the interaction and dynamic.",
            "High": "Your brain is undeniably a major erogenous zone! Detailed fantasies running like internal films, specific role-play scenarios that require focus and character work, mentally navigating and playing with power dynamics, or engaging in sharp, seductive banter significantly amps up the arousal and engagement for you. The narrative and mental stimulation matter deeply!",
            "Very High": "Welcome to the grand Mind Palace – the primary theater of your desire! Your arousal might fundamentally *depend* on intricate, detailed scenarios, complex internal fantasy worlds with their own rules, intense psychological play (mind games!), or the sheer intellectual or symbolic *concept* of what's unfolding. The story playing out in your head is the main event, the engine driving the entire experience."
        },
        examples: "Think engagement like: Mindful, connected touch focusing purely on the flow of sensation (Low), loving descriptive dirty talk that builds entire worlds with words (Moderate), detailed D/s scenes with explicit rules, protocols, and assigned roles (High/Very High), immersive fantasy LARP-style encounters (High/Very High), getting deeply aroused by the act of writing or reading complex, psychologically nuanced erotica (High/Very High), engaging in intense, consensual psychological manipulation play based on deep trust and negotiation (Very High).",
        personaConnection: "How this shapes *your* unique sexy magic: It defines how much your thoughts, imagination, intellect, and love of narrative get in on the intimate action, potentially directing the entire show."
    },
    "Relational": {
        name: "Relational Context: The Constellation",
        coreQuestion: "What's your ideal celestial setup for intimacy? Who do you connect with, how many stars are in your sky, and what kind of orbits feel most natural and fulfilling?",
        coreConcept: "This describes your preferred 'social map' or 'constellation' for sex, intimacy, and relationships. How many partners feel right? What level of commitment resonates? Strangers passing like comets, or soulmates like binary stars? One-on-one orbits, or intricate galactic clusters involving multiple connections? It's about the structure where your intimate self thrives.",
        elaboration: "Covers the whole cosmic range of possibilities: navigating solo voyages of self-discovery and pleasure (masturbation), the focused intensity of traditional monogamy's twin stars, the diverse and fascinating flavors of ethical non-monogamy (like polyamory's complex interconnected systems or open relationships' defined freedoms and agreements), thrilling group encounters like temporary nebulae, anonymous sparks like distant supernovae, and everything in between. It's about finding the relational structure where your connections shine brightest and feel most authentic.",
        scoreInterpretations: {
            "Very Low": "Solo voyages or a 'just us two' universe feel most right! You likely prefer the focused intimacy of masturbation or a deeply bonded, exclusive partnership where emotional and sexual energy is intensely concentrated. Multiple partners or casual fly-bys might feel distracting, chaotic, or simply unappealing compared to that deep dyadic bond.",
            "Low": "Team Monogamy! You generally prefer, seek out, and feel most fulfilled within monogamous, committed relationships as the ideal setting for deep sexual and emotional expression. Casual connections are likely less appealing, infrequent, or perhaps seen as stepping stones towards finding that one exclusive partner.",
            "Moderate": "Flexible orbits and adaptable connections! Maybe you're deeply comfortable in a primary duo but remain open to occasional meteor showers (like swinging sometimes, exploring kinks outside the pair, or dating around before settling down). Or perhaps you value deep, meaningful bonds without needing strict lifelong exclusivity. Exploring non-monogamy cautiously, enjoying serial monogamy, or happily orbiting as Solo Poly could fit here.",
            "High": "More stars make a brighter, more complex sky (consensually, of course)! You prefer or actively practice relational structures involving multiple simultaneous partners or explicit openness, such as defined Open Relationships or various forms of Polyamory (which might be hierarchical with a primary, or more egalitarian). Open, honest communication about connections and boundaries is vital navigation equipment.",
            "Very High": "Charting your own unique cosmos, rejecting pre-drawn maps! You might strongly resonate with Relationship Anarchy (rejecting imposed rules and hierarchies, defining each bond uniquely!), embrace fully non-hierarchical Polyamory, delight in the complex energy of group dynamics, or feel comfortable navigating vastly different levels of commitment, intimacy, and entanglement across various partners simultaneously. 'One size fits all' definitely doesn't describe your intricate relational universe."
        },
        examples: "Think structures like: Masturbation (Solo self-discovery journey), Serial Monogamy (Successive chapters of exclusivity), Lifelong Monogamy (Enduring twin-star partnership), Friends With Benefits (Intimacy without romantic commitment), Open Relationships (Primary bond + negotiated freedom), Swinging (Couple-centric recreational play), Polyamorous constellations (Triads/Quads, Hierarchical structures, Egalitarian networks), Solo Polyamory (Independent core with multiple connections), Relationship Anarchy (Building unique connections without rules), Group Sex adventures (Shared momentary experiences), Anonymous encounters (Fleeting, low-stakes sparks).",
        personaConnection: "How this shapes *your* unique sexy magic: It defines your ideal 'relationship constellation' – the structure, number of partners, and types of connections within which your intimate self feels most authentic, expressed, and fulfilled (or if you prefer to shine brightly as a solitary star!)."
    },
    "RoleFocus": {
        name: "Role Focus: Energetic Polarity",
        coreQuestion: "Within power dynamics, where does your energy naturally resonate? Are you drawn to the assertive charge of Leading (Dominance), the receptive flow of Following (submission), or the dynamic interplay of Both (Switch)?",
        coreConcept: "This element explores your inherent energetic leaning within consensual power exchange dynamics. It's not just about specific acts, but about the underlying polarity: do you feel most energized, authentic, or fulfilled when embodying the guiding, initiating, 'yang' energy of Dominance? Or does the yielding, responsive, trusting 'yin' energy of submission feel like coming home? Or perhaps the versatile ability to inhabit both poles, fluidly shifting between them (Switching), is where your truest expression lies?",
        elaboration: "This measures your preference for energetic roles in scenarios involving explicit or implicit power differences. High scores indicate a strong resonance with Dominant/Leading/Giving energy (taking charge, making decisions, setting the pace, orchestrating). Low scores indicate a strong resonance with submissive/Following/Receiving energy (yielding control, trusting guidance, responding to direction, finding freedom in release). Mid-range scores suggest comfort with Switching roles, enjoying both perspectives, preferring egalitarian dynamics, or finding power irrelevant to the core experience.",
        scoreInterpretations: {
            "Very Low": "Profound resonance with submissive energy. You likely find deep satisfaction, freedom, or peace in yielding control, trusting completely, following intricate guidance, serving devotionally, or being the primary recipient of attention/sensation. Submission feels authentic.",
            "Low": "Comfortable in following roles. You may enjoy letting others lead, responding to clear cues, focusing on receiving pleasure, or supporting the dominant energy without needing to direct the flow yourself. Submissive or Bottom roles feel natural.",
            "Moderate": "Adaptable and versatile. You likely enjoy the interplay of giving and receiving, potentially swapping roles fluidly (Switch). Collaboration, egalitarian energy, or finding power dynamics less central to the core enjoyment fit here.",
            "High": "Strong resonance with Dominant energy. You likely enjoy taking initiative, guiding the interaction, setting the scene, generously providing care or sensation from a leading position, or being the clear authority figure. Dominant, Top, or Caregiver roles feel authentic.",
            "Very High": "Thriving in the Dominant pole. You feel most energized and fulfilled when fully embodying confident authority, meticulously controlling the environment and interaction, issuing clear commands, or taking ultimate responsibility for the experience. Leading feels natural and deeply satisfying."
        },
        examples: "Think roles like: Assertive Dominant [4], Devoted Submissive [5], Versatile Switch [6], Authoritative Master/Mistress [109], Obedient slave/pet [109], Skilled Top, Receptive Bottom, Nurturing Caregiver [58], Trusting Little [58], Egalitarian Partner, Primal Leader/Follower [40].",
        personaConnection: "How this shapes *your* unique sexy magic: It defines your preferred energetic polarity within power dynamics, revealing whether you thrive more naturally in the assertive current of Dominance, the receptive flow of submission, or the dynamic balance of Switching."
    }
};

// --- Shelf Definitions ---
const grimoireShelves = [
    { id: "uncategorized", name: "Unsorted Discoveries", description: "Freshly unearthed Concepts land here, shimmering with raw potential like unrefined magical ore. Drag them onto other shelves to categorize them, integrate their energy, and weave them into your Grimoire's evolving story!" },
    { id: "wantToTry", name: "Curious Experiments", description: "Intriguing Concepts whispering tantalizing possibilities, sparking curiosity like nascent spells. What experiments in thought, fantasy, or careful practice might these inspire? Mark your intentions here." },
    { id: "liked", name: "Resonant Echoes", description: "Concepts you've explored and found to harmonize beautifully with your being, like finding a frequency that makes your soul sing. These echoes feel good, affirming, or simply joyful!" },
    { id: "dislikedLimit", name: "Boundaries Drawn", description: "Concepts that strike a discordant note, feel deeply uncomfortable, violate your ethics, or clearly mark the edge of your current map ('Here be dragons!'). Respecting these boundaries is wisdom and self-care." },
    { id: "coreIdentity", name: "Pillars of Self", description: "Concepts feeling absolutely fundamental, like load-bearing pillars in the architecture of your current persona and desires. These feel deeply, undeniably like *you*, shaping how you interact with the world." }
];
// --- Concepts Data (Now includes RF score for ALL) ---
const concepts = [
    // --- Common Concepts ---
    // ... (All Common Concepts from ID 1 to 85) ...
    {
        id: 1, name: "Vanilla Sex", cardType: "Practice/Kink", visualHandle: "common_vanilla.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 5, S: 3, P: 4, C: 3, R: 4, RF: 5 }, // RF Neutral
        briefDescription: "The 'classic hits' repertoire of intimacy.",
        detailedDescription: "Often referring to widely accepted forms of sexual expression, commonly centered around penetrative intercourse (vaginal or anal), kissing, mutual masturbation, and oral sex, typically within a familiar emotional context like romance or affection. It's the comfortable baseline for many, the 'common tongue' of intimacy. However, 'vanilla' doesn't inherently mean boring or lacking depth; passionate, connected vanilla sex can be incredibly fulfilling if it genuinely resonates!",
        relatedIds: [2, 3, 33, 67, 71], rarity: 'common', keywords: ['Conventional', 'Physical', 'Simple', 'Mainstream', 'Comfortable', 'Familiar', 'Baseline'],
        lore: [
            { level: 1, insightCost: 3, text: "Foundation Stone: Often the shared starting point, the common ground language learned before exploring more personalized dialects of desire.", unlocked: false },
            { level: 2, insightCost: 7, text: "Comfort's Embrace: Its widespread familiarity can offer profound comfort, predictability, and a reassuring sense of shared 'normalcy' in a complex intimate world.", unlocked: false },
            { level: 3, insightCost: 12, text: "Hidden Depths & Nuances: Even within 'vanilla' practices, subtle shifts in presence [P], communication [I], sensory focus [S], or emotional intent can transform the experience from routine to sublime ritual.", unlocked: false}
        ]
    },
    // ... Include all other common concepts from the original file here ...
    {
        id: 85, name: "Make-up Sex", cardType: "Psychological/Goal", visualHandle: "common_makeupsex.jpg", primaryElement: "P",
        elementScores: { A: 6, I: 6, S: 6, P: 7, C: 3, R: 5, RF: 6 }, // RF slightly leaning dominant/reconciliatory initiative?
        briefDescription: "Post-argument passion and reconciliation.",
        detailedDescription: "Engaging in passionate sexual activity following a fight, disagreement, or period of conflict. The heightened emotions, adrenaline, and subsequent relief of reconciliation can sometimes translate into unusually intense arousal and a powerful need to reconnect physically.",
        relatedIds: [3], rarity: 'common', keywords: ['Emotion', 'Intensity', 'Reconciliation', 'Catharsis', 'Conflict', 'Passion', 'Reconnection'],
        lore: [
            { level: 1, insightCost: 3, text: "Riding the Emotional Peak & Valley: Heightened emotions (anger, frustration, fear of loss) remaining from conflict can sometimes chemically translate into intense arousal and urgency.", unlocked: false },
            { level: 2, insightCost: 7, text: "Physically Reaffirming the Bond After Rupture: Can serve as a powerful, visceral, non-verbal way to reconnect, reaffirm the relationship [R], and restore closeness after the disruption of conflict.", unlocked: false },
            { level: 3, insightCost: 12, text: "Potential Pitfall: Relying *only* on make-up sex to resolve conflict without addressing the underlying issues can create unhealthy patterns. Ensure genuine resolution happens too.", unlocked: false}
        ]
    },

    // --- Uncommon Concepts ---
    // ... (All Uncommon Concepts from ID 4 to 110) ...
     {
        id: 4, name: "Dominance (Psychological)", cardType: "Identity/Role", visualHandle: "uncommon_dom_art.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 9, S: 5, P: 8, C: 7, R: 6, RF: 9 }, // RF Strong Dominant
        briefDescription: "Leading with confident authority and mental control.",
        detailedDescription: "Being the 'boss,' architect, or director of the intimate experience, primarily through psychological means rather than just physical force. This involves confidently taking charge of the mood and direction, giving clear instructions [11], setting rules or boundaries, making decisions for a willing partner, or skillfully guiding their entire experience from arousal to aftercare. It's fundamentally about the feeling and expression of confident control, presence, and often, responsibility.",
        relatedIds: [5, 6, 11, 30, 38, 81, 89, 90, 100, 104, 109, 123, 120], rarity: 'uncommon', keywords: ['Control', 'Power', 'Leading', 'Psychological', 'Rules', 'Structure', 'Dominance', 'Authority', 'Direction', 'Responsibility', 'Presence'],
        lore: [
            { level: 1, insightCost: 5, text: "Fragment from a Leader's Private Journal: 'The partner's mind, a willing instrument... requires a steady hand, deep listening, and precise intent to play upon, drawing out its most resonant notes of submission, trust, or ecstasy.'", unlocked: false },
            { level: 2, insightCost: 10, text: "Alchemist's Strategic Query: Is true, effective dominance primarily about imposing unbreakable will, or about deeply understanding the intricate strings of a partner's desire [P] and psychology [C] to skillfully guide them towards willingly chosen surrender?", unlocked: false },
            { level: 3, insightCost: 18, text: "The Burden and Joy of Earned Responsibility: True dominance often involves not just wielding power, but embracing a profound sense of responsibility for the submissive's physical and emotional well-being, making unwavering trust [15] the absolute bedrock of the dynamic.", unlocked: false }
        ]
    },
    // ... Include all other uncommon concepts from the original file here ...
    {
        id: 110, name: "Figging", cardType: "Practice/Kink", visualHandle: "uncommon_figging.jpg", primaryElement: "S",
        elementScores: { A: 3, I: 6, S: 8, P: 6, C: 3, R: 5, RF: 7 }, // RF leans dominant (inflicting sensation)
        briefDescription: "Using ginger root for an intense internal sting!",
        detailedDescription: "An old-school BDSM practice involving inserting a piece of peeled ginger root into the anus or vagina. The gingerol compounds react with body heat and moisture, creating an intense, inescapable internal stinging or burning sensation [S] that builds over time. Requires caution and understanding.",
        relatedIds: [9, 8], rarity: 'uncommon', keywords: ['Figging', 'Sensation', 'Intensity', 'Pain Play', 'BDSM', 'Sting', 'Internal', 'Chemical', 'Historical'],
        lore: [
            { level: 1, insightCost: 5, text: "Internal Alchemical Heat Reaction: The chemical reaction between gingerol and the body creates a unique, deep, inescapable internal warmth or intense sting, a sensation quite different from external impact.", unlocked: false },
            { level: 2, insightCost: 10, text: "Historical Note & Reclaiming Sensation: Sometimes used historically as a (cruel) method of punishment or control (e.g., for horses), its modern BDSM use reclaims the potent sensation for consensual exploration of intensity [S] and endurance [P].", unlocked: false },
            { level: 3, insightCost: 18, text: "Requires Preparation & Aftercare Knowledge: Understanding how to prepare the ginger, potential intensity levels, duration, and appropriate aftercare (like removing pieces fully, potential for irritation) is crucial for safe practice.", unlocked: false }
        ]
    },

    // --- Rare Concepts --- (Resuming here)
    {
        id: 8, name: "Impact Play (Heavy)", cardType: "Practice/Kink", visualHandle: "rare_impact_heavy.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 7, S: 9, P: 7, C: 4, R: 6, RF: 8 }, // RF leaning Dom
        briefDescription: "Intense impact, feeling the resonant oomph.", detailedDescription: "Significantly turning up the volume and intensity of impact! Using heavier tools like canes, whips, heavy paddles, floggers, or even fists to deliver strong, often painful but desired sensations [S]. Can be about testing limits [P], the psychological dynamic of enduring/inflicting [I], the visual/physical evidence of marks, achieving altered states [P], or the unique quality of deep, resonant impact. Trust [15] and safety protocols are absolutely paramount.",
        relatedIds: [7, 9, 4, 5, 44, 97, 110, 40], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_impact_heavy_art", uniquePromptId: "rP08", keywords: ['Impact', 'Pain Play', 'Intensity', 'Sensation', 'Endurance', 'Marking', 'Control', 'BDSM', 'Heavy', 'Limits', 'Trust', 'Safety'],
        lore: [
            { level: 1, insightCost: 8, text: "Alchemist's Journal Entry: 'The deep resonance of heavy impact lingers long after the strike, a vibration felt almost bone-deep. Is it merely the echo of pain, or the forceful clearing of stagnant energy, demanding full presence?'", unlocked: false },
            { level: 2, insightCost: 16, text: "Scrawled Note Found in a Dungeon Library: 'Some seek the mark not as shameful punishment, but as visceral proof. Proof of endurance, proof of devotion, proof of trust placed and honored, proof of being *truly* affected and changed by the encounter.'", unlocked: false },
            { level: 3, insightCost: 25, text: "Requires Skill & Attunement from the Top: Delivering heavy impact safely and effectively requires significant skill, knowledge of anatomy (avoiding kidneys/spine!), control [I], and deep attunement [P] to the bottom's state and limits. It's not just about brute force.", unlocked: false }
        ]
    },
    {
        id: 9, name: "Pain Play (Non-Impact)", cardType: "Practice/Kink", visualHandle: "rare_pain.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 6, S: 8, P: 7, C: 5, R: 6, RF: 7 }, // RF leaning Dom (inflicting)
        briefDescription: "Exploring 'ouchies' beyond hitting or spanking.", detailedDescription: "Delving into intense physical sensations [S] through methods other than direct impact. Think focused pinching, biting (carefully!), scratching, extreme temperature play (hot wax, ice [88]), applying clamps (nipple, genital, body), or even careful, sterile needle play (requires serious expertise and safety knowledge!). It's often about exploring the fascinating edge where pain and pleasure blur [P], testing endurance, or achieving specific mental states [C].",
        relatedIds: [7, 8, 16, 17, 37, 44, 63, 88, 96, 97, 110, 111, 112, 106, 124, 116, 43], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_pain_art", uniquePromptId: "rP09", keywords: ['Pain Play', 'Sensation', 'Intensity', 'Focus', 'Body Modification', 'Edge', 'BDSM', 'Clamps', 'Needles', 'Biting', 'Scratching', 'Wax Play', 'Ice Play'],
        lore: [
            { level: 1, insightCost: 8, text: "Fragment from a Sensory Logbook: '...not the blunt force of impact, but the sharp, unwavering focus of the clamp's bite, the needle's kiss. A single point of intense awareness that crowds out all else. A demanding meditation through fire or ice.'", unlocked: false },
            { level: 2, insightCost: 16, text: "Herbalist's Cautionary Wisdom (Applied): 'Like the most potent herbs, these intense sensations must be handled with deep knowledge and respect. Too little is ineffective, achieving nothing. Too much can poison the well of pleasure, causing unintended harm. Dosage and care are everything.'", unlocked: false },
            { level: 3, insightCost: 25, text: "The Psychology of Enduring Focused Pain: Often connects deeply to psychological themes [P] of endurance, surrender [5], testing limits, earning pleasure, or achieving altered states through intense focus, making it more than just physical feeling.", unlocked: false }
        ]
    },
    {
        id: 11, name: "Command / Control Dynamics", cardType: "Psychological/Goal", visualHandle: "rare_control.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 9, S: 5, P: 8, C: 8, R: 6, RF: 9 }, // RF Strong Dom
        briefDescription: "Explicit power exchange through giving/following clear orders.", detailedDescription: "This interaction style [I] is built around clear, explicit instructions and the corresponding act of willing obedience. One partner (Dominant [4]) gives direct commands, sets specific tasks, or issues instructions, and the other partner (submissive [5]) derives pleasure, purpose, or fulfillment [P] from understanding and obeying them precisely. Power exchange made tangible through action and response.",
        relatedIds: [4, 5, 10, 30, 38, 45, 41, 89, 90, 100, 101, 109, 119, 120, 98], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_control_art", uniquePromptId: "rP11", keywords: ['Control', 'Command', 'Obedience', 'Power', 'Structure', 'Psychological', 'Interaction', 'D/s', 'Instructions', 'Direction', 'Compliance'],
        lore: [
             { level: 1, insightCost: 9, text: "Fragment from a Tattered Scroll on Authority: 'The voice that commands with clarity shapes the immediate reality. The ear that obeys with willingness finds its perfect place and purpose within that crafted structure.'", unlocked: false },
             { level: 2, insightCost: 18, text: "Alchemist's Query on the Source of Thrill: Does the deep satisfaction lie primarily in the *certainty* and confidence of the command given, the profound *surrender* required by willing obedience, or perhaps in the intense *shared focus* and clarity the dynamic demands from both partners?", unlocked: false },
             { level: 3, insightCost: 28, text: "Beyond Simple Orders: Effective command dynamics often involve understanding the submissive's psychology [P], using praise [46] or correction appropriately, and ensuring commands serve a purpose within the negotiated dynamic [R], making it a skilled art.", unlocked: false }
        ]
     },
     {
        id: 12, name: "Objectification Play", cardType: "Psychological/Goal", visualHandle: "rare_object.jpg", primaryElement: "P",
        elementScores: { A: 7, I: 4, S: 6, P: 8, C: 6, R: 5, RF: 7 }, // RF leaning Dom (objectifier)
        briefDescription: "Playing with being (or using) a 'thing' for pleasure.", detailedDescription: "A consensual psychological [P] game where one person is intentionally treated, or treats another, more like an object valued primarily for its function, use, or specific body parts, rather than as a whole person with complex emotions in that moment. Can explore themes of power [I], intense focus [S], dehumanization (safely!), service [10], or worship [61], depending on the negotiation.",
        relatedIds: [4, 5, 20, 18, 19, 45, 61, 42, 62, 114, 94, 21], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP12", keywords: ['Objectification', 'Power', 'Psychological', 'Focus', 'Body', 'Dehumanization', 'Play', 'Use', 'Tool', 'Consent', 'Function'],
        lore: [
             { level: 1, insightCost: 8, text: "Philosophical Fragment Found Etched on Metal: 'To be temporarily reduced to pure function, pure sensation, a beautiful tool... can be strangely liberating, a shedding of the heavy burdens of ego, expectation, and complex selfhood.'", unlocked: false },
             { level: 2, insightCost: 16, text: "Figurative Warning Label - Handle With Extreme Care: Requires meticulous negotiation [C] and deep trust [15]. The line between playful, consensual objectification and harmful, unwanted dehumanization is drawn *only* by enthusiastic mutual consent, clear boundaries, and attentive aftercare [69].", unlocked: false },
             { level: 3, insightCost: 25, text: "Spectrum of Application: Can range from focusing worshipfully on one body part [61, 102], using a partner as 'furniture,' referring to them by function rather than name, to more complex scenarios involving specific materials [20] or roles.", unlocked: false }
        ]
     },
     {
        id: 14, name: "Fantasy Immersion", cardType: "Cognitive", visualHandle: "rare_fantasy.jpg", primaryElement: "C",
        elementScores: { A: 5, I: 3, S: 4, P: 7, C: 9, R: 3, RF: 5 }, // RF Neutral
        briefDescription: "Living fully within the mind's detailed story.", detailedDescription: "Your imagination isn't just involved; it *is* the main stage! Getting completely lost in complex, internally generated fantasy worlds, detailed narratives, or the powerful *idea* or symbolism of what's happening is far more crucial and arousing than the immediate physical reality. Arousal lives, breathes, and climaxes primarily within the intricate architecture of the brain [C].",
        relatedIds: [13, 29, 41, 42, 49, 60], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_fantasy_art", uniquePromptId: "rP14", keywords: ['Fantasy', 'Cognitive', 'Immersion', 'Narrative', 'Mind', 'World-Building', 'Imagination', 'Internal', 'Story', 'Arousal Source'],
        lore: [
             { level: 1, insightCost: 9, text: "Entry from a Dreamer's Secret Journal: 'The world outside faded to static. Only the internal story mattered, thrumming with life. The physical sensations were mere echoes, punctuation marks in the narrative unfolding within.'", unlocked: false },
             { level: 2, insightCost: 18, text: "The Mental Mapmaker's Precision: Some individuals build entire worlds, character histories, and complex rules brick by meticulous brick within their minds, finding profound arousal [A] and satisfaction [P] in the intricate details, consistency, and richness of their inner reality.", unlocked: false },
             { level: 3, insightCost: 28, text: "Potential Disconnect & Connection Challenges: While internally rich, deep fantasy immersion can sometimes create a disconnect from a partner's physical presence [S] or emotional cues [P] if not shared or communicated effectively [R]. Finding partners who appreciate or share this cognitive focus is key.", unlocked: false }
        ]
     },
     {
        id: 16, name: "Rope Bondage (Shibari/Kinbaku)", cardType: "Practice/Kink", visualHandle: "rare_rope.jpg", primaryElement: "S",
        elementScores: { A: 6, I: 7, S: 8, P: 7, C: 6, R: 6, RF: 7 }, // RF leaning Dom (rigger)
        briefDescription: "Artful tying, intricate restriction, & deep connection.", detailedDescription: "It's living sculpture, sensory exploration, and psychological [P] journey woven together with rope! Using rope not just to restrain [17], but to create intricate, often aesthetically beautiful patterns on the body ('Shibari' often emphasizes aesthetics), applying pressure strategically to nerves or muscles, altering posture and movement, and inducing unique mental states through the combination of restriction and sensation [S]. A profound dance between the Rigger's skill/intent [I] and the Rope Bunny's trust/surrender [5].",
        relatedIds: [9, 17, 4, 5, 44, 87, 101, 113, 37], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_rope_art", uniquePromptId: "rP16", keywords: ['Restriction', 'Sensation', 'Aesthetic', 'Control', 'Trust', 'Helplessness', 'Rope', 'Shibari', 'Kinbaku', 'Art', 'Presence', 'Bondage', 'Skill'],
        lore: [
             { level: 1, insightCost: 8, text: "Ancient Rigger's Maxim Passed Down: 'The rope only truly holds what the mind allows it to hold.' Trust is the first, invisible knot tied, the essential anchor point for the entire intricate art form.", unlocked: false },
             { level: 2, insightCost: 16, text: "Historical Echoes & Artistic Evolution: Evolved from practical methods of samurai restraint in feudal Japan ('Kinbaku' often implies this lineage), modern rope bondage elevated functional tying into an intimate art form exploring patience, focus [C], aesthetic tension, energetic connection [I], and the vulnerable beauty of the bound human form.", unlocked: false },
             { level: 3, insightCost: 25, text: "Alchemical Vessel of Transformation: When the Artful Restriction of Rope [16] meets the Psychology of Willing Helplessness [17], all held within the crucible of Deep Trust [15], the body can become an alchemical vessel, potentially transmuting physical tension and mental noise into profound psychological release (Catharsis?), heightened awareness, or ecstatic surrender.", unlocked: false }
        ]
     },
     {
        id: 17, name: "Restriction / Helplessness", cardType: "Psychological/Goal", visualHandle: "rare_restrict.jpg", primaryElement: "P",
        elementScores: { A: 5, I: 3, S: 7, P: 9, C: 5, R: 5, RF: 2 }, // RF leaning Sub (desiring helplessness)
        briefDescription: "Finding deep pleasure in being bound/powerless.", detailedDescription: "The *psychological feeling* [P] of being physically restrained (whether by ropes [16], cuffs [87], posture, or other means) and the resulting mental space of surrendered control, helplessness, or profound vulnerability is itself a primary source of arousal or peace. It's often less about the specific method of restraint and more about the potent *internal state* it induces.",
        relatedIds: [16, 5, 9, 37, 44, 63, 64, 87, 99, 113, 117, 118, 125, 43], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP17", keywords: ['Helplessness', 'Surrender', 'Restriction', 'Psychological', 'Power', 'Vulnerability', 'Bondage', 'Immobility', 'Letting Go', 'Trust'],
        lore: [
             { level: 1, insightCost: 8, text: "Inner Monologue Snippet from the Still Point: '...can't move... don't *have* to move... don't have to decide... just feel... just breathe... just be held...'", unlocked: false },
             { level: 2, insightCost: 16, text: "Philosopher's Deep Query on Appeal: Is the core allure the temporary, radical removal of responsibility and choice? The way it forces heightened sensory [S] focus by eliminating other options? Or the profound act of offering ultimate vulnerability and trust [15] to another?", unlocked: false },
             { level: 3, insightCost: 25, text: "Safety Requires Vigilance from Both Sides: While the receiver experiences helplessness, safety relies on the restrainer's constant vigilance regarding circulation, nerve compression, positioning, and emotional state, plus the receiver's ability to communicate limits (safewords!).", unlocked: false }
        ]
     },
     {
        id: 20, name: "Latex / Material Fetish", cardType: "Orientation", visualHandle: "rare_latex.jpg", primaryElement: "A",
        elementScores: { A: 9, I: 5, S: 8, P: 6, C: 5, R: 4, RF: 5 }, // RF Neutral
        briefDescription: "Shiny, squeaky, second-skin sexy!", detailedDescription: "It's all about the specific material! A strong, often primary sexual attraction [A] triggered powerfully by the sight, feel, sound, or even smell of particular materials like latex, rubber, PVC, leather [94], silk, fur, spandex, etc. The material itself, enveloping the body or existing as an object, holds the magical charge and is often essential for arousal.",
        relatedIds: [12, 21, 42, 94, 112], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_latex_art", uniquePromptId: "rP20", keywords: ['Fetish', 'Material', 'Latex', 'Leather', 'PVC', 'Rubber', 'Attraction', 'Sensation', 'Focus', 'Texture', 'Smell', 'Sound', 'Visual'],
        lore: [
             { level: 1, insightCost: 9, text: "Texture & Sensory Overdrive Note: 'Like a second skin, it utterly transforms. The unnatural reflection, the distinctive scent, the unique sound of movement... it engages and heightens senses [S] often ignored in daily life, creating a powerful shift.'", unlocked: false },
             { level: 2, insightCost: 18, text: "Alchemist's Insight into Transformation: The specific material often becomes more than just clothing; it acts as a potent catalyst, altering the wearer's perceived essence, unlocking a specific hidden persona [C], or creating a desired aesthetic distance/objectification [P] for both wearer and observer.", unlocked: false },
             { level: 3, insightCost: 28, text: "Conditioning vs. Innate Preference: The origins of material fetishes are debated – are they innate neurological wiring, early life conditioning, or a blend? Regardless, for the individual, the connection between the material and arousal is deeply ingrained and real.", unlocked: false }
        ]
     },
     {
        id: 21, name: "Uniform / Clothing Fetish", cardType: "Orientation", visualHandle: "rare_uniform.jpg", primaryElement: "A",
        elementScores: { A: 8, I: 6, S: 4, P: 6, C: 6, R: 5, RF: 7 }, // RF leans Dom (attraction to authority symbol)
        briefDescription: "Specific clothing styles as primary arousal trigger.", detailedDescription: "A fetish where sexual arousal [A] is significantly and primarily triggered by specific types of clothing or outfits, such as uniforms (military, medical [43], school, service industry), specific costumes (superhero, historical), or particular garments (formal lingerie, sharp suits, specific dresses). The clothing itself carries powerful symbolic weight [C].",
        relatedIds: [13, 20, 12, 94, 95, 104, 43], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP21", keywords: ['Fetish', 'Clothing', 'Uniform', 'Attraction', 'Role-Play', 'Visual', 'Costume', 'Symbolism', 'Authority', 'Power', 'Archetype'],
        lore: [
             { level: 1, insightCost: 8, text: "The Costumer's Thread of Meaning: 'A uniform is more than fabric; it's a potent story worn visibly on the body - instantly conveying authority, service, innocence, rebellion, competence, or belonging. The symbolic story is the spark.'", unlocked: false },
             { level: 2, insightCost: 16, text: "Psychological Note on Instant Signifiers: The specific clothing acts as a powerful psychological [P] and cognitive [C] signifier, instantly invoking associated roles, power dynamics [I], expectations, and deeply ingrained fantasies or archetypes.", unlocked: false },
             { level: 3, insightCost: 25, text: "Connection to Role-Play [13]: Uniform fetishes often intertwine strongly with role-playing desires, as the clothing provides an immediate, tangible anchor for stepping into a specific character or dynamic.", unlocked: false }
        ]
     },
     {
        id: 25, name: "Polyamory", cardType: "Relationship Style", visualHandle: "rare_poly.jpg", primaryElement: "R",
        elementScores: { A: 6, I: 6, S: 5, P: 7, C: 6, R: 8, RF: 5 }, // RF Neutral
        briefDescription: "Ethically loving and being intimate with multiple partners.", detailedDescription: "The practice, desire, or orientation towards having multiple simultaneous loving, intimate, and/or sexual relationships, where everyone involved knows about the other partners and consents (hence, ethical non-monogamy). Often involves deep emotional connections [15] and varying levels of commitment with several people concurrently.",
        relatedIds: [15, 26, 27, 34, 59, 84], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_poly_art", uniquePromptId: "rP25", keywords: ['Polyamory', 'Non-Monogamy', 'Multiple Partners', 'Intimacy', 'Connection', 'Structure', 'CNM', 'ENM', 'Ethics', 'Communication', 'Love'],
        lore: [
             { level: 1, insightCost: 9, text: "Core Tenet: Abundant Love, Not Scarcity: Often based on the philosophical belief that love, intimacy, and connection are not finite resources that diminish when shared, challenging zero-sum thinking about relationships.", unlocked: false },
             { level: 2, insightCost: 18, text: "The Intricate Dance of Communication & Emotion: Requires exceptional communication skills [C], rigorous honesty, clear boundary setting, advanced time/energy management, and navigating complex emotions [P] like jealousy, insecurity, and compersion (finding joy in a partner's joy).", unlocked: false },
             { level: 3, insightCost: 28, text: "Diverse Structures within Polyamory: Encompasses many forms - from hierarchical models with 'primary' and 'secondary' partners, to egalitarian networks, triads/quads living together, solo poly individuals [84], and more. No single 'right' way.", unlocked: false }
        ]
     },
     {
        id: 27, name: "Relationship Anarchy (RA)", cardType: "Relationship Style", visualHandle: "rare_ra.jpg", primaryElement: "R",
        elementScores: { A: 6, I: 5, S: 5, P: 6, C: 7, R: 9, RF: 5 }, // RF Neutral (rejects hierarchy)
        briefDescription: "Rejecting imposed rules/hierarchies in relationships.", detailedDescription: "A relationship philosophy and practice that actively rejects societal norms, compulsory rules (like monogamy as default), and imposed hierarchies regarding relationships. Each connection is unique and defined entirely by the individuals involved based on their desires, mutual respect, and ongoing communication [C], without inherent ranking (e.g., romantic partner isn't automatically 'above' best friend). Emphasizes autonomy and conscious choice.",
        relatedIds: [25, 26, 36, 59, 84], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP27", keywords: ['Relationship Anarchy', 'Autonomy', 'Fluidity', 'Anti-Hierarchy', 'Structure', 'Philosophy', 'Freedom', 'RA', 'Customization', 'Choice', 'Consent'],
        lore: [
             { level: 1, insightCost: 10, text: "Snippet from the (Informal) RA Manifesto: 'Value each connection for what it is. Define your own commitments based on mutual trust, desire, and communication, not pre-written societal scripts or assumed entitlements.'", unlocked: false },
             { level: 2, insightCost: 20, text: "Alchemist's Query on Foundational Elements: If every relationship is built entirely from scratch, without external blueprints, what become the essential 'elements' or core principles needed for stability, joy, trust, and sustainability within each unique connection?", unlocked: false },
             { level: 3, insightCost: 30, text: "Radical Responsibility & Communication Load: RA requires a high degree of self-awareness [P], personal responsibility, and exceptional, ongoing communication skills [C] to navigate the complexities of multiple, uniquely defined relationships without relying on default rules.", unlocked: false }
        ]
     },
     {
        id: 30, name: "High Protocol D/s", cardType: "Practice/Kink", visualHandle: "rare_protocol.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 8, S: 6, P: 8, C: 9, R: 7, RF: 8 }, // RF leaning Dom (structure emphasis)
        briefDescription: "Highly structured, formal power exchange.", detailedDescription: "A style of Dominance and submission [4/5] characterized by significant, often intricate structure, formal pre-negotiated rules, specific rituals (greetings, specific behaviors), defined forms of address (titles like Sir/Ma'am/Master/slave), and clear expectations for behavior within the dynamic [I]. Often involves a high degree of Cognitive [C] engagement in learning and executing the protocol.",
        relatedIds: [4, 5, 11, 13, 38, 101, 109], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_protocol_art", uniquePromptId: "rP30", keywords: ['Protocol', 'Structure', 'Rules', 'Power', 'Cognitive', 'Ritual', 'D/s', 'Formal', 'Hierarchy', 'Discipline', 'Etiquette'],
        lore: [
             { level: 1, insightCost: 9, text: "From an Old Text on Order & Devotion: 'Explicit Order illuminates the contours of Power. Defined Structure provides the sacred chalice into which willing Devotion can be consciously poured and held.'", unlocked: false },
             { level: 2, insightCost: 18, text: "Psychological Consideration: Does the detailed structure primarily enhance the feeling of power exchange [P]? Provide psychological safety through absolute clarity? Or does the meticulous execution of the protocol become a satisfying performance [C/I] in itself?", unlocked: false },
             { level: 3, insightCost: 28, text: "Beyond the Bedroom: High protocol can extend beyond scenes into daily life interactions (sometimes called 'lifestyle' or part of M/s [109]), requiring significant commitment [R] and integration from both partners.", unlocked: false }
        ]
     },
     {
        id: 38, name: "Tease & Denial / Edging", cardType: "Practice/Kink", visualHandle: "rare_teasedenial_art.jpg", primaryElement: "I", // Added Art Handle
        elementScores: { A: 6, I: 7, S: 7, P: 7, C: 6, R: 6, RF: 8 }, // RF strongly Dom (controlling pleasure)
        briefDescription: "Building intense arousal by denying climax.",
        detailedDescription: "A form of psychological [P] and sensory [S] play where arousal is intentionally built up close to the point of orgasm, but climax is deliberately denied or postponed, often repeatedly ('edging'). Increases sensitivity, prolongs tension, explores endurance, and emphasizes the power dynamic [I] of the person controlling the release.",
        relatedIds: [4, 5, 11, 45, 119, 106, 83, 93], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_teasedenial_art", uniquePromptId: "rP38", // Assuming a prompt ID if needed
        keywords: ['Tease and Denial', 'Edging', 'Orgasm Control', 'Power', 'Anticipation', 'Frustration', 'Intensity', 'Endurance', 'BDSM'],
        lore: [
            { level: 1, insightCost: 8, text: "The Alchemical Art of Prolonged Heat: Holding arousal at the brink, without tipping over, creates a unique, potent energetic charge and heightened sensory [S] awareness throughout the body.", unlocked: false },
            { level: 2, insightCost: 16, text: "Mind Over Body: Mastering Desire's Edge: For the one being denied, it becomes an intense exercise in mental focus [C], physical endurance [S], and psychological surrender [P] to the controller's will [I].", unlocked: false },
            { level: 3, insightCost: 25, text: "Communication is Crucial for Safe Edging: Clear communication about limits, duration, signs of distress, and the eventual 'permission' or release plan is vital to ensure the play remains consensual and enjoyable, not just frustrating.", unlocked: false }
        ]
    },
     {
        id: 41, name: "Erotic Hypnosis / Mind Control Play", cardType: "Practice/Kink", visualHandle: "rare_hypno.jpg", primaryElement: "C",
        elementScores: { A: 5, I: 7, S: 3, P: 8, C: 9, R: 6, RF: 8 }, // RF strongly Dom (hypnotist/controller)
        briefDescription: "Using suggestion & perceived control for arousal.", detailedDescription: "Consensual play involving inducing altered states of consciousness (trance), using hypnotic suggestion, specific trigger words/phrases, or creating the powerful *illusion* that one partner is controlling the other's mind, thoughts, feelings, or actions for erotic purposes [I/P]. Safety, clear negotiation of limits, and enthusiastic consent [C] are absolutely paramount due to the themes involved.",
        relatedIds: [14, 4, 5, 11, 45, 42, 120, 44, 99, 100], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP41", keywords: ['Hypnosis', 'Mind Control', 'Cognitive', 'Power', 'Suggestion', 'Altered State', 'Psychological', 'Consent', 'Trance', 'Illusion', 'Erotic Hypnosis'],
        lore: [
             { level: 1, insightCost: 10, text: "Whispered Secret from the Subconscious Depths: 'The seed of suggestion, once carefully planted in the fertile ground of willingness and trust, can blossom into profound, seemingly involuntary responses... A fascinating cognitive dance.'", unlocked: false },
             { level: 2, insightCost: 20, text: "Critical Ethical Consideration & Safety Net: The *perceived* power differential here is immense. Consent must be explicit, enthusiastic, fully informed, ongoing, and instantly revocable, even (and especially) when playing with themes of its absence. Clear safewords and boundaries are non-negotiable.", unlocked: false },
             { level: 3, insightCost: 30, text: "Spectrum of Play: Can range from light relaxation and suggestion for sensation enhancement [S] to deep trance work involving complex triggers, personality overlays [42], or exploring intense power dynamics [P/I]. Requires skill and responsibility from the hypnotist.", unlocked: false }
        ]
     },
     {
        id: 42, name: "Transformation Fetish (TF)", cardType: "Orientation", visualHandle: "rare_transform.jpg", primaryElement: "C",
        elementScores: { A: 7, I: 4, S: 5, P: 7, C: 8, R: 4, RF: 5 }, // RF neutral, depends on fantasy
        briefDescription: "Arousal strongly linked to transformation themes.", detailedDescription: "A fetish or paraphilia centered on the concept and fantasy [C] of transformation itself. This can encompass a wide range: physical changes (e.g., into animals - zoomorphy, inanimate objects [12], different genders - gender TF), mental/personality changes (e.g., bimbofication, intelligence shifts, personality alteration), or forced/magical changes within a specific power dynamic [I]. The *process* or *idea* of changing state is key.",
        relatedIds: [20, 21, 12, 41, 14, 121, 92], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP42", keywords: ['Transformation', 'Fetish', 'Cognitive', 'Fantasy', 'Change', 'Identity', 'TF', 'Metamorphosis', 'Physical Change', 'Mental Change', 'Shapeshifting'],
        lore: [
             { level: 1, insightCost: 9, text: "Metaphysical Musings on Becoming Other: 'To fundamentally become *other*... does it unlock a hidden, truer self? Offer delicious escape from the mundane? Explore the boundaries of identity? Or tap into ancient myths of metamorphosis?'", unlocked: false },
             { level: 2, insightCost: 18, text: "Deep Symbolic Links & Psychological Exploration: Transformation fantasies often touch upon profound themes of identity fluidity, loss of control [P], power dynamics [I], wish fulfillment, confronting the 'monstrous' within, or exploring existence beyond the human norm.", unlocked: false },
             { level: 3, insightCost: 28, text: "Manifestation in Play: Can be explored through detailed role-play [13], hypnosis [41], specific gear/costumes [20/21], sensory play altering perception [S], or purely through internal fantasy [14].", unlocked: false }
        ]
     },
     {
        id: 43, name: "Medical Play", cardType: "Practice/Kink", visualHandle: "rare_medical.jpg", primaryElement: "C",
        elementScores: { A: 5, I: 6, S: 7, P: 7, C: 7, R: 6, RF: 7 }, // RF leaning Dom (practitioner)
        briefDescription: "Role-playing medical/clinical scenarios for arousal.", detailedDescription: "Consensual role-playing [13] involving medical themes, settings (clinic, hospital), specific roles (doctor, nurse, patient), or equipment. Can range from simple doctor/patient check-up scenarios to more clinical or invasive interactions involving mock (or sometimes real/blunt, with extreme caution) examinations, implements (speculums, thermometers, enemas, needles [9]), restraints [17], and exploration of the inherent power dynamics [I] and vulnerability [P] present in medical settings.",
        relatedIds: [13, 9, 17, 4, 5, 21], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP43", keywords: ['Medical Play', 'Role-Play', 'Scenario', 'Power', 'Clinical', 'Sensation', 'Exam', 'Doctor', 'Nurse', 'Patient', 'Vulnerability', 'Authority'],
        lore: [
             { level: 1, insightCost: 8, text: "Scenario Note: The Clinical Atmosphere's Charge: The often sterile, controlled setting combined with the inherent vulnerability of being a 'patient' can significantly heighten feelings of surrender [5], helplessness [17], and awareness of the practitioner's perceived authority [4].", unlocked: false },
             { level: 2, insightCost: 16, text: "Safety First, Always - Especially with Realism: If using actual medical implements (even blunt/non-functional), knowledge of anatomy, hygiene, and potential risks is crucial. Authenticity should never compromise safety. Play safe, play informed.", unlocked: false },
             { level: 3, insightCost: 25, text: "Diverse Motivations: Can explore themes of care/nurturing [58], fear play [106], non-consensual examination fantasies (within CNC context [64]), trust exercises [15], sensation play [9], or simply the allure of the uniform/role [21].", unlocked: false }
        ]
     },
     {
        id: 44, name: "Edge Play", cardType: "Practice/Kink", visualHandle: "rare_edge.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 6, S: 9, P: 8, C: 5, R: 6, RF: 7 }, // RF leans Dom (managing risk)
        briefDescription: "Intentionally playing near physical or psychological limits.", detailedDescription: "A category of BDSM activities that intentionally push physical, psychological, or emotional boundaries close to perceived or actual limits, often involving real or simulated risk. Examples include breath play [63, 125], knife play [111], gun play (simulated), fire play, suspension [113], extreme sensation [S], intense fear play [106], or deep psychological manipulation [120]. Requires significant caution, expertise, meticulous negotiation [C], high trust [15], and robust safety protocols.",
        relatedIds: [8, 9, 16, 17, 37, 38, 41, 63, 64, 65, 106, 111, 113, 116, 122, 125, 120], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP44", keywords: ['Edge Play', 'Risk', 'Intensity', 'Sensation', 'Psychological', 'Trust', 'Boundary', 'Safety', 'High-Risk', 'Skill', 'Negotiation', 'Limits'],
        lore: [
             { level: 1, insightCost: 10, text: "Adage Whispered Amongst Experienced Players: 'The edge is where sensation is sharpest, awareness is absolute, and trust is tested most profoundly. It demands total presence from everyone involved.'", unlocked: false },
             { level: 2, insightCost: 20, text: "Alchemist's Stern Caution: This is *not* mere reckless thrill-seeking. True, ethical edge play demands meticulous planning, deep partner knowledge and communication, unwavering attention to safety protocols, contingency plans, and instant respect for safewords or signs of genuine distress.", unlocked: false },
             { level: 3, insightCost: 30, text: "The Allure of Transgression & Control: Often involves playing with deep-seated fears (mortality, loss of control), societal taboos, or achieving extreme altered states [P] through carefully managed intensity, making the perceived control (or loss thereof) a key element.", unlocked: false }
        ]
     },
     {
        id: 45, name: "Humiliation / Degradation", cardType: "Psychological/Goal", visualHandle: "rare_humiliation.jpg", primaryElement: "P",
        elementScores: { A: 5, I: 7, S: 4, P: 9, C: 6, R: 6, RF: 7 }, // RF leans Dom (inflicting humiliation)
        briefDescription: "Finding pleasure in consensual embarrassment/degradation.", detailedDescription: "Consensual play where one partner derives erotic pleasure or psychological [P] release from performing or receiving acts or words intentionally designed to cause embarrassment, shame, belittlement, or degradation within a safe, negotiated context. Can range from light teasing and name-calling to intense, elaborate psychological scenarios. Consent, trust [15], and thorough aftercare [69] are absolutely critical.",
        relatedIds: [4, 5, 10, 11, 12, 38, 41, 99, 100, 114, 115, 120], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP45", keywords: ['Humiliation', 'Degradation', 'Psychological', 'Power', 'Emotion', 'Shame', 'Taboo', 'Consent', 'Erotic Humiliation', 'Verbal', 'Scenario'],
        lore: [
             { level: 1, insightCost: 9, text: "Crucial Observation on Consent & Framing: The psychological power lies in the shared understanding that the 'degradation' is a performance, a chosen act within a trusted container, perhaps a deliberate peeling away of ego or social masks, not genuine malice.", unlocked: false },
             { level: 2, insightCost: 18, text: "Deep Psychological Reflection & Catharsis: Often taps into complex, sometimes contradictory feelings about self-worth, control, powerlessness, societal taboos around 'dignity,' and can provide a unique catharsis [P] through confronting or embodying perceived flaws.", unlocked: false },
             { level: 3, insightCost: 28, text: "Negotiation is Key to Safety: Boundaries must be extremely clear. What feels like fun humiliation to one person can be genuinely damaging to another. Limits around specific topics (e.g., appearance, intelligence, past traumas) must be meticulously discussed and respected.", unlocked: false }
        ]
     },
     {
        id: 63, name: "Breath Play", cardType: "Practice/Kink", visualHandle: "rare_breath.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 7, S: 9, P: 8, C: 4, R: 6, RF: 8 }, // RF strongly Dom (controller of breath)
        briefDescription: "Restricting airflow for intense sensation (HIGH RISK!).", detailedDescription: "Consensual practice involving the intentional, temporary restriction of airflow (often called erotic asphyxiation or asphyxiophilia) to create intense physical sensations [S], altered mental states [P/C], and heightened orgasm. Methods can include choking (manual or ligature - EXTREMELY DANGEROUS), bags, masks, or pressure. Carries **significant inherent risks** of injury or death if done incorrectly and requires extreme caution, knowledge, and trust.",
        relatedIds: [44, 17, 9, 5, 125], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP63", keywords: ['Breath Play', 'Asphyxiation', 'Risk', 'Edge Play', 'Sensation', 'Altered State', 'Trust', 'Safety', 'Choking', 'Hypoxia', 'High-Risk'],
        lore: [
             { level: 1, insightCost: 10, text: "**SAFETY ADVISORY: LETHAL RISK IS REAL.** This is inherently dangerous edge play [44]. Education on safe(r) techniques (e.g., avoiding carotid artery pressure, immediate release signals), clear communication, never playing alone, and understanding the signs of danger are paramount. Mistakes can be fatal. Seek experienced guidance.", unlocked: false },
             { level: 2, insightCost: 20, text: "Subjective Report from the Edge: 'The world narrows instantly, sensations sharpen to an impossible degree... a primal surrender not just of will [5], but of the body's most fundamental need. Requires absolute, unwavering trust [15].'", unlocked: false },
             { level: 3, insightCost: 30, text: "The Hypoxic High & Altered States: The physical effects of reduced oxygen (hypoxia) can create lightheadedness, euphoria, intensified orgasm, and profound altered states of consciousness [P/C], which is often the sought-after goal, despite the risks.", unlocked: false }
        ]
    },
    {
        id: 64, name: "CNC (Consensual Non-Consent)", cardType: "Practice/Kink", visualHandle: "rare_cnc.jpg", primaryElement: "C",
        elementScores: { A: 6, I: 7, S: 7, P: 8, C: 9, R: 6, RF: 8 }, // RF strongly Dom (initiator/aggressor role)
        briefDescription: "Safely role-playing scenarios involving lack of consent.", detailedDescription: "A complex form of consensual role-playing [13] where participants intentionally act out a scene involving simulated non-consent, coercion, force, or resistance (e.g., simulated rape fantasy, abduction [117], struggling against bonds [17]). Requires meticulous, enthusiastic prior negotiation [C], crystal-clear boundaries, unambiguous safewords that are instantly honored, and deep trust [15] to ensure the 'non-consent' stays strictly within the fictional frame.",
        relatedIds: [13, 4, 5, 17, 44, 117, 118, 38], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP64", keywords: ['CNC', 'Role-Play', 'Fantasy', 'Cognitive', 'Power', 'Taboo', 'Consent', 'Safety', 'Negotiation', 'Rape Fantasy', 'Simulated', 'Boundaries'],
        lore: [
             { level: 1, insightCost: 10, text: "The Ethical Imperative: The 'Consensual' is EVERYTHING. Negotiation must be explicit, detailed, and enthusiastic *before* play begins. Boundaries must be crystal clear, safewords chosen and practiced, and honored instantly without question. The 'non-consent' is purely fictional.", unlocked: false },
             { level: 2, insightCost: 20, text: "Exploring Taboo & Power Through Narrative: CNC often allows individuals to safely explore taboo fantasies, intense power dynamics [I], complex feelings about control/surrender [P], or process personal themes within a controlled, fictional environment.", unlocked: false },
             { level: 3, insightCost: 30, text: "Aftercare is Non-Negotiable: Due to the potentially intense or triggering nature of CNC themes, thorough, sensitive aftercare [69] focusing on reassurance, grounding, differentiating play from reality, and emotional processing is absolutely essential.", unlocked: false }
        ]
    },
     {
        id: 65, name: "Chemsex / Party & Play (PnP)", cardType: "Practice/Kink", visualHandle: "rare_chemsex.jpg", primaryElement: "S",
        elementScores: { A: 6, I: 6, S: 8, P: 7, C: 3, R: 7, RF: 6 }, // RF leans slightly Dom (facilitator?) or Sub (disinhibition)
        briefDescription: "Intentionally using specific drugs to enhance/prolong sex.", detailedDescription: "The practice of intentionally combining sexual activity, often with multiple partners [34] or over extended periods, with the use of specific psychoactive drugs (commonly methamphetamine, GHB/GBL, mephedrone, ketamine) primarily to enhance sensations [S], reduce inhibitions [P], increase endurance, or facilitate connection [R] within specific social contexts. Carries significant health risks (overdose, addiction, STIs) and potential for impaired consent.",
        relatedIds: [34, 24, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP65", keywords: ['Chemsex', 'PnP', 'Drugs', 'Sensation', 'Endurance', 'Risk', 'Social', 'Party', 'Substance Use', 'Harm Reduction', 'Consent Risk'],
        lore: [
             { level: 1, insightCost: 8, text: "Harm Reduction is Essential Knowledge: Combining specific substances and prolonged sex carries unique risks (overdose due to redosing/mixing, dehydration, drug interactions, impaired consent assessment, increased STI transmission risk). Awareness, planning, and harm reduction strategies are crucial for those who engage.", unlocked: false },
             { level: 2, insightCost: 16, text: "Motivations Can Be Complex: May be sought for intensely enhanced physical pleasure [S], dramatically lowered inhibitions allowing exploration [P], seemingly boundless endurance, intense social bonding within specific scenes [R], or sometimes as a coping mechanism.", unlocked: false },
             { level: 3, insightCost: 25, text: "Consent Challenges & Addiction Potential: Drug effects can significantly impair the ability to give, receive, or assess ongoing consent. Furthermore, the intense pleasure associated can lead to psychological or physical dependence for some individuals. Seek support if needed.", unlocked: false }
        ]
     },
     {
        id: 95, name: "Gerontophilia", cardType: "Orientation", visualHandle: "rare_geronto.jpg", primaryElement: "A",
        elementScores: { A: 8, I: 4, S: 4, P: 6, C: 5, R: 5, RF: 4 }, // RF leans receptive (attracted to age/experience)
        briefDescription: "Primary sexual attraction to elderly individuals.",
        detailedDescription: "A paraphilia characterized by primary and persistent sexual attraction [A] towards significantly older adults (elderly individuals). This goes beyond appreciating maturity; the advanced age itself is the core focus of the attraction.",
        relatedIds: [21], // Limited direct relations in this set
        rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP95",
        keywords: ['Gerontophilia', 'Orientation', 'Attraction', 'Age', 'Elderly', 'Paraphilia', 'Maturity'],
        lore: [
             { level: 1, insightCost: 8, text: "Focus on Age as the Core Attractor: Unlike simply preferring older partners, gerontophilia specifically centers arousal on the characteristics associated with advanced age itself.", unlocked: false },
             { level: 2, insightCost: 16, text: "Psychological Underpinnings (Speculative): Motivations can be complex and varied, potentially relating to themes of wisdom, experience, perceived vulnerability, power dynamics [I], or unique aesthetic preferences [A].", unlocked: false },
             { level: 3, insightCost: 25, text: "Ethical Considerations & Consent: As with any relationship involving potential power imbalances or vulnerability due to age or health, ensuring enthusiastic, ongoing consent and mutual respect is paramount.", unlocked: false }
        ]
     },
     {
        id: 96, name: "Odaxelagnia (Biting Fetish)", cardType: "Practice/Kink", visualHandle: "rare_biting.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 7, S: 8, P: 6, C: 4, R: 5, RF: 7 }, // RF leans Dom (biter)
        briefDescription: "Finding bites (giving or receiving) highly arousing.",
        detailedDescription: "Deriving significant erotic pleasure or arousal specifically from biting or being bitten (Odaxelagnia). Can range from gentle nips to harder, potentially mark-leaving bites (requires careful negotiation). Explores themes of sensation [S], primal energy [40], power/control [I], marking, or the edge between pleasure and pain [9].",
        relatedIds: [9, 40, 7], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP96",
        keywords: ['Biting', 'Odaxelagnia', 'Sensation', 'Pain Play', 'Primal', 'Marking', 'Fetish', 'Intensity', 'Oral'],
        lore: [
             { level: 1, insightCost: 8, text: "Primal Instinct & Possessive Marking: Biting taps into ancient, animalistic instincts [40], often carrying connotations of possession, dominance [I], intense passion, or marking territory.", unlocked: false },
             { level: 2, insightCost: 16, text: "The Unique Sensory Signature of Teeth: Provides a distinct, sharp, focused sensation [S] very different from impact or pressure, engaging pain/pleasure pathways [P] uniquely.", unlocked: false },
             { level: 3, insightCost: 25, text: "Safety & Boundaries are Key: Requires clear communication about pressure, location (avoiding dangerous areas), breaking skin (if intended/agreed upon, with hygiene awareness), and immediate cessation if boundaries are crossed.", unlocked: false }
        ]
     },
     {
        id: 97, name: "Stigmatophilia (Piercings/Tattoos)", cardType: "Orientation", visualHandle: "rare_stigma.jpg", primaryElement: "A",
        elementScores: { A: 8, I: 5, S: 7, P: 6, C: 5, R: 5, RF: 6 }, // RF slight lean towards Dom (associated with edge/control?)
        briefDescription: "Strong attraction focused on body modifications.",
        detailedDescription: "Finding body modifications like piercings, tattoos, scarification, or implants particularly and primarily sexually attractive [A]. The modification itself, its aesthetic, the implication of endurance [P], or the modification process [S] can be the focal point of arousal.",
        relatedIds: [9, 8], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP97",
        keywords: ['Stigmatophilia', 'Attraction', 'Body Modification', 'Piercing', 'Tattoo', 'Scarification', 'Aesthetic', 'Endurance', 'Edge'],
        lore: [
             { level: 1, insightCost: 8, text: "Adornment as Alteration and Statement: Body modifications intentionally alter the physical form, often signaling identity, belonging, rebellion, aesthetic preferences, or tolerance for sensation/pain [S/P].", unlocked: false },
             { level: 2, insightCost: 16, text: "Focus on the Modification Itself: For some with stigmatophilia, the piercing/tattoo/scar is the primary locus of visual [A] and sometimes sensory [S] interest, more so than the unmodified body.", unlocked: false },
             { level: 3, insightCost: 25, text: "Connection to Edge & Pain?: Often overlaps with an appreciation for perceived toughness, edge culture, or the implied story of endurance [P] associated with undergoing modification procedures.", unlocked: false }
        ]
     },
     {
        id: 101, name: "Ritualistic Play", cardType: "Practice/Kink", visualHandle: "rare_ritual.jpg", primaryElement: "C",
        elementScores: { A: 5, I: 7, S: 6, P: 8, C: 8, R: 7, RF: 7 }, // RF often involves Dom leading ritual
        briefDescription: "Using structured rituals to enhance scenes/dynamics.",
        detailedDescription: "Incorporating structured, often symbolic, actions, words, gestures, or sequences (rituals) into intimate play or power dynamics [I]. Adds layers of meaning [C], formality, focus, and psychological weight [P] to the experience. Can involve specific protocols [30], symbolic objects, or prescribed roles.",
        relatedIds: [13, 30, 4, 5, 11, 116], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP101",
        keywords: ['Ritual', 'Structure', 'Symbolism', 'Cognitive', 'Psychological', 'Power', 'Focus', 'Formal', 'Meaning', 'Scene Enhancement'],
        lore: [
             { level: 1, insightCost: 9, text: "Elevating Action Through Intent & Form: Ritual transforms simple actions into meaningful gestures by imbuing them with specific intent, structure, repetition, and often symbolic weight, deepening the cognitive [C] and psychological [P] impact.", unlocked: false },
             { level: 2, insightCost: 18, text: "Creating a Shared Sacred (or Profane) Space: Rituals define boundaries, create focus, mark transitions, and establish a specific atmosphere, effectively creating a temporary 'sacred space' dedicated to the particular dynamic or purpose.", unlocked: false },
             { level: 3, insightCost: 28, text: "Requires Shared Understanding & Belief: For rituals to be potent, all participants usually need to understand and buy into the meaning, symbolism, and structure involved, making shared context [R] essential.", unlocked: false }
        ]
     },
     {
        id: 104, name: "Military / Police Fetish", cardType: "Orientation", visualHandle: "rare_military.jpg", primaryElement: "A",
        elementScores: { A: 8, I: 7, S: 5, P: 7, C: 6, R: 5, RF: 8 }, // RF strong Dom association (authority)
        briefDescription: "Arousal focused on military/police uniforms/authority.",
        detailedDescription: "A specific form of uniform fetish [21] focused intensely on military or law enforcement uniforms, gear, roles, and associated themes of authority, discipline, control [I], order, power, and potentially danger or rescue.",
        relatedIds: [21, 4, 11], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP104",
        keywords: ['Uniform Fetish', 'Military', 'Police', 'Attraction', 'Authority', 'Power', 'Discipline', 'Control', 'Role-Play', 'Gear'],
        lore: [
             { level: 1, insightCost: 8, text: "The Potent Symbolism of Order & Force: These uniforms strongly symbolize societal power, structure, control, the capacity for force, protection, and adherence to strict codes of conduct, tapping into deep psychological [P] archetypes.", unlocked: false },
             { level: 2, insightCost: 16, text: "Interplay with Power Dynamics [I]: Often desired within D/s scenarios, leveraging the inherent authority associated with the uniform for role-playing control [11], discipline, interrogation, or capture fantasies.", unlocked: false },
             { level: 3, insightCost: 25, text: "Focus on Gear & Specifics: Beyond the uniform itself, specific gear (boots, belts, hats, restraints, weapons - even simulated) can become potent focal points for attraction [A] and sensory [S] interest.", unlocked: false }
        ]
     },
     {
        id: 109, name: "Master / slave Dynamic (M/s)", cardType: "Relationship Style", visualHandle: "rare_ms.jpg", primaryElement: "I",
        elementScores: { A: 6, I: 9, S: 6, P: 9, C: 8, R: 7, RF: 9 }, // RF pinnacle of Dom/Sub roles
        briefDescription: "Profound, often total, power exchange relationship.", detailedDescription: "A specific, high-intensity, and deeply committed form of Dominance and submission [4/5] relationship characterized by a significant, often formalized, exchange of power and authority [I]. Often involves the concept of 'ownership' (consensually given), specific titles, high protocol [30], and frequently extends beyond the bedroom to encompass many aspects of daily life ('lifestyle' or TPE - Total Power Exchange). Requires immense trust [15] and communication [C].",
        relatedIds: [4, 5, 11, 30, 10], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP109", keywords: ['M/s', 'Power', 'Total Power Exchange', 'Commitment', 'Structure', 'D/s', 'Lifestyle', 'TPE', 'Ownership', 'Authority', 'Devotion', 'High Protocol'],
        lore: [
             { level: 1, insightCost: 10, text: "Defining Feature: The Depth & Scope of Exchange: Often distinguished from scene-based D/s by its intended longevity, the depth of psychological [P] commitment, its potential 24/7 nature, and sometimes the explicit, consensual transfer of authority symbolized by 'ownership'.", unlocked: false },
             { level: 2, insightCost: 20, text: "Alchemist's Analogy: Forging the Philosopher's Bond: Building and sustaining a healthy M/s dynamic is like the alchemical Great Work – requires immense dedication, deep self-knowledge, profound understanding of the partner, constant communication, and the transmutation of base desires into a profound, unique form of connection [R].", unlocked: false },
             { level: 3, insightCost: 30, text: "Not About Abuse: True M/s is built on enthusiastic consent, deep trust, mutual respect, and shared goals, fundamentally differing from abusive relationships despite the explicit power differential. Safety and the well-being of the slave are paramount responsibilities for the Master.", unlocked: false }
        ]
     },
     {
        id: 111, name: "Knife Play / Edge Play (Sharp)", cardType: "Practice/Kink", visualHandle: "rare_knife.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 7, S: 9, P: 8, C: 6, R: 6, RF: 8 }, // RF strongly Dom (wielder)
        briefDescription: "Using blades for intense sensation/fear (HIGH RISK!).", detailedDescription: "A form of edge play [44] involving the careful, consensual use of knives or other sharp objects against the skin. Can be purely for intense sensation [S] (the cold flat, the sharp edge tracing lines), psychological fear/thrill [P/106], symbolic marking (without cutting deeper than surface layers - cutting carries extreme risks!), or exploring power dynamics [I]. Requires intense focus, control, and absolute trust.",
        relatedIds: [44, 9, 106, 4, 116], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP111", keywords: ['Knife Play', 'Edge Play', 'Risk', 'Fear', 'Sensation', 'Control', 'Trust', 'Sharp', 'Safety', 'Blade', 'High-Risk', 'Psychological'],
        lore: [
             { level: 1, insightCost: 10, text: "**SAFETY ADVISORY: SERIOUS RISK!** Playing with sharps carries inherent, significant risks (accidental cuts, infection, nerve damage). Sterilization of skin and blade (if intended for marking), knowledge of anatomy (avoiding arteries/tendons), precise control, and never playing impaired are critical. Seek experienced guidance.", unlocked: false },
             { level: 2, insightCost: 20, text: "The Potent Symbolic Weight of the Blade: The knife often represents ultimate power, control, the potential for harm, and mortality itself. Using it consensually makes the act of trust [15] incredibly profound and the generated fear/thrill [P] highly potent.", unlocked: false },
             { level: 3, insightCost: 30, text: "Focus & Control Are Paramount: Successful knife play relies heavily on the Top's unwavering focus [C], precise control [I], and constant communication/observation of the Bottom's state [R]. The intensity comes from control, not recklessness.", unlocked: false }
        ]
     },
     {
        id: 112, name: "Electrostimulation (E-Stim)", cardType: "Practice/Kink", visualHandle: "rare_estim.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 6, S: 9, P: 6, C: 4, R: 5, RF: 7 }, // RF leaning Dom (controller of device)
        briefDescription: "Buzz buzz! Using electricity for unique sensations.", detailedDescription: "Using specialized devices (like TENS units adapted for play, Violet Wands, or dedicated erotic e-stim boxes) to pass mild electrical currents through the body via electrodes placed on the skin. Creates unique tingling, buzzing, pulsing, prickling, or contracting sensations [S] unlike manual touch. Intensity and sensation type are highly variable and controllable. Requires understanding of safe placement and device operation.",
        relatedIds: [9, 57, 119, 72], rarity: 'rare', canUnlockArt: true, visualHandleUnlocked: "rare_estim_art", uniquePromptId: "rP112", keywords: ['E-Stim', 'Electrostimulation', 'Sensation', 'Intensity', 'Involuntary', 'Technology', 'Violet Wand', 'TENS', 'Buzzing', 'Electricity', 'Contraction'],
        lore: [
             { level: 1, insightCost: 9, text: "A Modern Marvel of Techno-Kink Sensation: Offers unique feelings unobtainable through purely manual means, directly stimulating nerves in novel ways [S]. Body conductivity and placement dramatically alter the experience!", unlocked: false },
             { level: 2, insightCost: 18, text: "The Fascination of Involuntary Response: The way e-stim can cause involuntary muscle contractions adds a fascinating layer to power exchange [I], control dynamics [4/5], and exploring helplessness [17] themes.", unlocked: false },
             { level: 3, insightCost: 28, text: "Safety First with Electricity!: Understanding safe electrode placement (avoiding head, heart, throat), device limits, and potential risks (like skin irritation or interference with medical devices) is crucial for responsible play. Research is key!", unlocked: false }
        ]
     },
     {
        id: 113, name: "Suspension Bondage", cardType: "Practice/Kink", visualHandle: "rare_suspension.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 7, S: 9, P: 8, C: 6, R: 6, RF: 8 }, // RF strongly Dom (rigger)
        briefDescription: "Being suspended off the ground via ropes/chains (HIGH SKILL!).", detailedDescription: "An advanced form of bondage [16] where a person is partially or fully suspended off the ground using ropes, chains, spreader bars, or other specialized equipment attached to secure rigging points. Creates intense physical sensations [S] (gravity, pressure), profound psychological states [P] (helplessness [17], altered perspective), and striking visual aesthetics [A]. Requires significant technical skill, knowledge of rigging safety, anatomy, and emergency procedures from the rigger.",
        relatedIds: [16, 17, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP113", keywords: ['Suspension', 'Bondage', 'Rope', 'Risk', 'Skill', 'Helplessness', 'Intensity', 'Rigging', 'Edge Play', 'Technical', 'Safety'],
        lore: [
             { level: 1, insightCost: 10, text: "**SAFETY ADVISORY: EXTREME RISK & SKILL REQUIRED!** Improper suspension rigging is extremely dangerous and can lead to severe nerve damage, positional asphyxia, falls, or death. Seek experienced, qualified mentorship and prioritize safety above all else. This is not for beginners.", unlocked: false },
             { level: 2, insightCost: 20, text: "The Rigger's Perspective: Art, Engineering & Responsibility: 'It's a complex blend of physics, anatomy, aesthetics, and deep trust. Every knot, every angle, every point of contact matters. You literally hold their safety and their entire experience in your hands.'", unlocked: false },
             { level: 3, insightCost: 30, text: "Profound States of Surrender & Altered Perception: Being suspended can induce unique altered states [P] due to the combination of helplessness [17], unusual physical pressures [S], sensory shifts, and the intense trust required, making it a powerful (but risky) practice.", unlocked: false }
        ]
     },
     {
        id: 114, name: "Water Sports / Urolagnia", cardType: "Practice/Kink", visualHandle: "rare_watersports.jpg", primaryElement: "S",
        elementScores: { A: 6, I: 6, S: 7, P: 7, C: 4, R: 5, RF: 7 }, // RF often Dom (giver) or Sub (receiver in humiliation)
        briefDescription: "Consensual play involving urine.", detailedDescription: "Sexual arousal or activity involving urine, also known as urolagnia or 'golden showers.' Can range from watching urination, to being urinated on ('showering'), to drinking urine (urophagia - higher risk). Often involves themes of taboo breaking [P], humiliation/degradation [45], marking/possession [I], or simple enjoyment of the warm sensation [S] and intimacy. Consent and discussion of hygiene/health risks are key.",
        relatedIds: [45, 12, 115], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP114", keywords: ['Watersports', 'Urolagnia', 'Taboo', 'Humiliation', 'Bodily Fluids', 'Piss Play', 'Golden Shower', 'Marking', 'Consent'],
        lore: [
             { level: 1, insightCost: 8, text: "Transgressing the Taboo of 'Cleanliness': Part of the psychological [P] allure often lies in deliberately breaking deeply ingrained societal norms and taboos surrounding bodily fluids and perceived 'cleanliness' vs. 'dirtiness'.", unlocked: false },
             { level: 2, insightCost: 16, text: "Context is Key: Multifaceted Meanings: Can be incorporated into dynamics of playful or intense humiliation [45], acts of worship or submission [5], territorial marking [I], objectification [12], or simply enjoyed for the unique warm sensation [S] and raw intimacy.", unlocked: false },
             { level: 3, insightCost: 25, text: "Health & Hygiene Considerations: While generally low risk externally, ingesting urine (urophagia) carries potential health risks. Open communication about health status and hydration levels is advisable for safer play.", unlocked: false }
        ]
     },
     {
        id: 115, name: "Scat Play / Coprophilia", cardType: "Practice/Kink", visualHandle: "rare_scat.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 5, S: 6, P: 8, C: 3, R: 4, RF: 6 }, // RF leans Dom (giver) or Sub (receiver in extreme humiliation)
        briefDescription: "Consensual play involving feces (EXTREME!).", detailedDescription: "Sexual arousal or activity involving feces (poop), also known as coprophilia. This is generally considered an extreme fetish with significant health risks (bacteria, parasites) and strong social stigma. Play can range from observing defecation to direct contact or smearing. Requires extreme caution regarding hygiene, thorough discussion, enthusiastic consent, and awareness of risks.",
        relatedIds: [114, 45], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP115", keywords: ['Scat', 'Coprophilia', 'Taboo', 'Extreme', 'Risk', 'Bodily Fluids', 'Feces', 'Hygiene', 'Consent', 'Stigma'],
        lore: [
             { level: 1, insightCost: 12, text: "**HEALTH WARNING: SIGNIFICANT RISK!** This practice carries substantial health risks due to high bacterial load and potential parasites. Meticulous hygiene protocols (gloves, barriers, immediate cleanup), understanding risks (especially oral contact), and complete honesty about health status are non-negotiable.", unlocked: false },
             { level: 2, insightCost: 24, text: "Confronting the Ultimate Taboo & Primal Edge: Often considered one of society's strongest taboos. Exploring scat play can involve deep psychological [P] themes of extreme degradation [45], power dynamics [I], primal connection/rejection, or confronting societal conditioning head-on.", unlocked: false },
             { level: 3, insightCost: 35, text: "Consent Must Be Explicit & Enthusiastic: Given the risks and stigma, consent for scat play must be exceptionally clear, enthusiastic, specific about limits, and freely given without coercion. Aftercare [69] focusing on hygiene and emotional processing is vital.", unlocked: false }
        ]
     },
     {
        id: 116, name: "Blood Play (Intentional)", cardType: "Practice/Kink", visualHandle: "rare_bloodplay.jpg", primaryElement: "S",
        elementScores: { A: 5, I: 7, S: 8, P: 8, C: 5, R: 6, RF: 8 }, // RF strongly Dom (ritual leader/bloodletter)
        briefDescription: "Consensual use of blood in scenes (EXTREME RISK!).", detailedDescription: "Consensually and intentionally incorporating *small*, safely drawn amounts of blood (e.g., using a sterile, single-use lancet on a prepared site) into sexual, ritualistic, or BDSM scenes. This practice carries **major health risks** due to potential bloodborne pathogens (HIV, Hepatitis, etc.) and requires rigorous, informed safety knowledge, universal precautions, and absolute trust. Often evokes primal, taboo, or deeply symbolic themes.",
        relatedIds: [44, 111, 101, 9], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP116", keywords: ['Blood Play', 'Risk', 'Edge Play', 'Ritual', 'Intensity', 'Taboo', 'Safety', 'Primal', 'Symbolic', 'Fluid Bond', 'High-Risk', 'BBP'],
        lore: [
             { level: 1, insightCost: 11, text: "**SAFETY ADVISORY: NON-NEGOTIABLE!** Risk of transmitting serious bloodborne pathogens (BBP) is extremely high, even with seemingly healthy partners. Assume all partners may carry something infectious. Use universal precautions (gloves, barriers), sterile single-use tools ONLY, proper cleanup/disposal with bleach solution, and educate yourself THOROUGHLY on risks and prevention. Ignorance here can be fatal or life-altering.", unlocked: false },
             { level: 2, insightCost: 22, text: "The Profound Symbolic Power of Lifeblood: Blood carries immense cultural and primal weight – symbolizing life force, vitality, sacrifice, lineage, deep connection ('blood brothers'), mortality, and danger. Its intentional use in consensual play often taps into intense ritualistic, possessive, or primal feelings [P].", unlocked: false },
             { level: 3, insightCost: 35, text: "Edge Play Pinnacle & Trust Testament: For those who engage safely and knowledgeably, it can represent an ultimate edge [44], pushing boundaries of taboo and intensity [S]. The act requires absolute, unwavering trust [15] and meticulous care [I], making the shared risk a potent (though dangerous) bonding agent.", unlocked: false }
        ]
     },
     {
        id: 117, name: "Abduction / Capture Fantasy", cardType: "Practice/Kink", visualHandle: "rare_abduction.jpg", primaryElement: "C",
        elementScores: { A: 6, I: 7, S: 7, P: 8, C: 9, R: 6, RF: 8 }, // RF strongly Dom (captor)
        briefDescription: "Role-playing non-consensual capture within a safe container.", detailedDescription: "A specific type of CNC (Consensual Non-Consent) [64] role-play focusing intensely on the scenario and narrative [C] of being abducted, captured, held against one's simulated will, or hunted [106, 122]. All within a pre-negotiated, safe container with clear boundaries, safewords, and enthusiastic consent for the *play* itself. Explores themes of powerlessness [P], fear [106], struggle, survival, and potential surrender [17].",
        relatedIds: [64, 13, 17, 44, 122, 106, 5], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP117", keywords: ['Abduction', 'Capture', 'CNC', 'Role-Play', 'Fantasy', 'Fear', 'Power', 'Consent', 'Scenario', 'Helplessness', 'Struggle', 'Survival'],
        lore: [
             { level: 1, insightCost: 9, text: "The Narrative Core of Powerlessness & Thrill: Explores potent themes of losing control, facing simulated danger, the dynamics of struggle against a 'captor' [4], the adrenaline of fear [P], and the eventual outcomes of surrender [17] or escape – all safely contained within the fictional narrative.", unlocked: false },
             { level: 2, insightCost: 18, text: "Potential for Deep Psychological Exploration: Can be a complex way to process feelings about control, safety, societal fears, trust, resilience, or simply enjoy the high-stakes thrill and immersion [C] of the story, knowing real safety is assured.", unlocked: false },
             { level: 3, insightCost: 28, text: "Requires Meticulous Scene Design & Communication: Success hinges on detailed negotiation [C] of limits (what kind of force is okay? what themes are off-limits?), clear safewords, understanding triggers, and robust aftercare [69] to reaffirm safety and consent.", unlocked: false }
        ]
     },
     {
        id: 118, name: "Somnophilia / Sleep Play", cardType: "Practice/Kink", visualHandle: "rare_somno.jpg", primaryElement: "C",
        elementScores: { A: 7, I: 3, S: 6, P: 7, C: 7, R: 4, RF: 6 }, // RF slightly Dom (observer/actor)
        briefDescription: "Arousal linked to observing or interacting with someone asleep (or feigning).", detailedDescription: "Sexual arousal or interest derived from interacting with or observing someone who is genuinely asleep or (more commonly in consensual play) *feigning* sleep. Often involves themes of vulnerability [P], taboo, voyeurism [19], and the perceived helplessness [17] or unawareness of the 'sleeping' partner. Enthusiastic consent negotiated *while awake* is absolutely paramount for any ethical exploration.",
        relatedIds: [19, 17, 64], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP118", keywords: ['Somnophilia', 'Sleep Play', 'Vulnerability', 'Voyeurism', 'Consent', 'Fantasy', 'Unaware', 'Taboo', 'Pretend', 'Observation'],
        lore: [
             { level: 1, insightCost: 8, text: "Navigating the Critical Ethical Tightrope: The line between this specific fantasy and actual non-consensual acts is razor thin but absolute. Ethical play requires explicit, enthusiastic consent negotiated beforehand while fully awake and aware, clearly defining boundaries.", unlocked: false },
             { level: 2, insightCost: 16, text: "Core Appeal: Vulnerability & Transgression: Often centers psychologically [P] on the perceived total vulnerability, peacefulness, or innocence of the 'sleeping' partner, or the transgressive thrill [C] of interacting with someone seemingly unaware, crossing a forbidden line within a safe game.", unlocked: false },
             { level: 3, insightCost: 25, text: "Distinction: Fantasy vs. Reality: It's crucial to distinguish between the arousal derived from the *fantasy* or *role-play* of sleep/unawareness and any action towards a genuinely non-consenting sleeping person, which is assault.", unlocked: false }
        ]
     },
     {
        id: 119, name: "Forced Orgasm / Orgasm Control", cardType: "Practice/Kink", visualHandle: "rare_forceorgasm.jpg", primaryElement: "I",
        elementScores: { A: 5, I: 8, S: 8, P: 8, C: 7, R: 6, RF: 8 }, // RF strongly Dom (controller)
        briefDescription: "Dominant partner controlling the timing/occurrence of orgasm.", detailedDescription: "A power dynamic [I] where one partner (Dominant [4]) intentionally controls if, when, how, and sometimes how intensely the other partner (submissive [5]) experiences orgasm. This can involve prolonging stimulation to the edge [38], denying orgasm completely (denial), demanding orgasm on command, or pushing the submissive to orgasm repeatedly, potentially past their usual limits. Explores themes of control [P], endurance [S], and pleasure/frustration.",
        relatedIds: [38, 11, 4, 5, 112, 9], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP119", keywords: ['Orgasm Control', 'Forced Orgasm', 'Power', 'Control', 'Denial', 'Pleasure', 'Intensity', 'BDSM', 'Command', 'Endurance', 'Edge'],
        lore: [
             { level: 1, insightCost: 9, text: "The Ultimate Embodied Control?: Intentionally manipulating the body's most intense pleasure/release cycle and the psychological [P] desire for it represents a profound, visceral expression of power exchange [I] and control.", unlocked: false },
             { level: 2, insightCost: 18, text: "The Receiver's Complex Experience: Can range dramatically from exquisite, frustrating denial that heightens later pleasure, to ecstatic surrender to commanded release, to pushing endurance limits [S], depending entirely on negotiation [C] and the specific dynamic sought.", unlocked: false },
             { level: 3, insightCost: 28, text: "Requires Attunement & Communication: Effective orgasm control requires the Dominant to be highly attuned [P] to the submissive's physical state [S] and communicated limits, knowing when to push, when to deny, and when to grant release for the desired effect.", unlocked: false }
        ]
     },
     {
        id: 120, name: "Psychological Torture Play", cardType: "Practice/Kink", visualHandle: "rare_psychtorture.jpg", primaryElement: "P",
        elementScores: { A: 4, I: 7, S: 4, P: 9, C: 8, R: 6, RF: 8 }, // RF strongly Dom (manipulator)
        briefDescription: "Consensual intense mind games & emotional manipulation.", detailedDescription: "Consensual, ethically navigated play involving intense psychological manipulation, intricate mind games, gaslighting (strictly within pre-agreed limits and themes), emotional challenges, or mental endurance tests designed to push cognitive [C] and emotional [P] boundaries. Requires extreme trust [15], meticulous negotiation, clear safewords, and robust aftercare [69].",
        relatedIds: [45, 41, 100, 99, 11, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP120", keywords: ['Psychological Torture', 'Mind Games', 'Manipulation', 'Emotion', 'Power', 'Edge Play', 'Trust', 'Consent', 'Gaslighting (Consensual)', 'Mental Endurance', 'High Risk'],
        lore: [
             { level: 1, insightCost: 11, text: "Navigating the Deep Mind Maze: This form of play delves profoundly into the psyche, fears, and emotional triggers. Boundaries must be exceptionally clear and specific, safewords instantly honored, and aftercare robust, focusing heavily on reassurance, reality checks, and emotional processing.", unlocked: false },
             { level: 2, insightCost: 22, text: "Potential Goals & Motivations: May be used to explore themes of breaking down and rebuilding the self, testing resilience and mental fortitude, confronting deep-seated fears in a controlled way, or achieving the intense intimacy [15] forged through shared, extreme psychological journeys.", unlocked: false },
             { level: 3, insightCost: 35, text: "High Risk & Skill Demand: Mishandled psychological play can be genuinely damaging. Requires significant emotional intelligence, stability, communication skills [C], and ethical grounding from *both* partners to navigate safely and achieve desired outcomes without causing lasting harm.", unlocked: false }
        ]
     },
     {
        id: 121, name: "Furry Fandom Sexuality", cardType: "Identity/Role", visualHandle: "rare_furrysex.jpg", primaryElement: "C",
        elementScores: { A: 6, I: 6, S: 5, P: 6, C: 7, R: 6, RF: 5 }, // RF Neutral (depends on fursona)
        briefDescription: "Expressing sexuality through anthropomorphic personas/community.", detailedDescription: "Expressing sexuality through or within the specific context of the furry fandom. This often involves anthropomorphic animal characters (fursonas) representing aspects of identity, potentially incorporating fursuits or other costume elements, engaging in role-play [13] based on these personas, creating/consuming furry-themed erotic art ('yiff'), and adhering to specific community norms and etiquette [R].",
        relatedIds: [13, 98, 42], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP121", keywords: ['Furry', 'Fandom', 'Identity', 'Role-Play', 'Community', 'Anthropomorphic', 'Fursona', 'Yiff', 'Costume', 'Persona', 'Subculture'],
        lore: [
             { level: 1, insightCost: 7, text: "Beyond the Suit: The Fursona as True Self: For many within the fandom, the 'fursona' isn't just a costume but a way to express a truer, less inhibited version of themselves, explore different facets of identity [P], or engage playfully [I] without human societal constraints.", unlocked: false },
             { level: 2, insightCost: 14, text: "Community Context & Shared Language: Sexuality within the furry fandom (often termed 'yiff') has its own distinct culture, artistic expressions, online/convention spaces, etiquette, and sometimes specific kinks or themes that resonate within the community [R].", unlocked: false },
             { level: 3, insightCost: 21, text: "Intersection with Transformation [42] & Pet Play [98]: Furry identity often intersects conceptually with transformation fantasies (becoming other) and sometimes overlaps with dynamics found in pet play (adopting animalistic traits/roles), though distinct.", unlocked: false }
        ]
     },
     {
        id: 122, name: "Autassassinophilia", cardType: "Orientation", visualHandle: "rare_autassass.jpg", primaryElement: "P",
        elementScores: { A: 5, I: 2, S: 7, P: 8, C: 6, R: 3, RF: 2 }, // RF strongly submissive (victim role)
        briefDescription: "Arousal derived from *staged* risk of being killed.", detailedDescription: "A specific paraphilia involving deriving sexual arousal from the fantasy [C] or *staged* scenario of being hunted, stalked, attacked, or otherwise put at risk of being killed – all within a carefully controlled, safe, and consensual context. It's about the intense psychological [P] thrill and adrenaline generated by simulating mortal danger, not actual harm.",
        relatedIds: [44, 106, 117], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP122", keywords: ['Autassassinophilia', 'Risk', 'Fear', 'Edge Play', 'Fantasy', 'Thrill', 'Paraphilia', 'Staged Danger', 'Mortality', 'Adrenaline', 'Hunt'],
        lore: [
             { level: 1, insightCost: 10, text: "The Ultimate Psychological Edge?: This complex paraphilia takes risk-play fantasy [44] to an extreme conceptual limit, focusing arousal [A] on the potent adrenaline [S] and psychological [P] intensity generated by simulating life-or-death stakes.", unlocked: false },
             { level: 2, insightCost: 20, text: "Safety is Simulation, Reality is Secure: It is absolutely crucial to understand that real danger or harm is *not* the goal. The arousal comes entirely from the *idea*, the *performance*, and the *simulation* of risk within a meticulously controlled fantasy [C] framework.", unlocked: false },
             { level: 3, insightCost: 30, text: "Connection to Hunt/Predator Fantasies: Often connects to primal predator/prey dynamics explored in fear play [106] or abduction scenarios [117], but specifically focuses the arousal trigger on the perceived risk to one's own 'life' within the game.", unlocked: false }
        ]
     },
     {
        id: 123, name: "Exposure Therapy Play", cardType: "Psychological/Goal", visualHandle: "rare_exposure.jpg", primaryElement: "P",
        elementScores: { A: 4, I: 6, S: 5, P: 8, C: 7, R: 7, RF: 6 }, // RF leans Dom (facilitator) or Sub (client)
        briefDescription: "Using BDSM scenes to process fears/trauma (Requires Care!).", detailedDescription: "Carefully and meticulously negotiated BDSM or role-play scenes intentionally designed to gently revisit, re-contextualize, or process past trauma, triggers, or deep-seated fears in a safe, supportive, and empowering setting [P/R]. Requires immense trust [15], clear communication [C], potentially professional guidance (therapist collaboration), and an unwavering focus on healing and integration, *not* re-traumatization.",
        relatedIds: [15, 69, 4, 5, 58], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP123", keywords: ['Exposure Therapy', 'Trauma', 'Healing', 'Psychological', 'Trust', 'Safety', 'BDSM', 'Therapeutic', 'Processing', 'Integration', 'Empowerment', 'Care'],
        lore: [
             { level: 1, insightCost: 11, text: "**Important Disclaimer:** This is *not* a replacement for professional mental health therapy, but for some individuals, it *can* be a *complementary* tool used alongside therapy, *if* handled with extreme care, self-awareness, and partner attunement.", unlocked: false },
             { level: 2, insightCost: 22, text: "Alchemist's Goal: Reclaiming Agency: Aims to use the controlled intensity [S], explicit consent [C], and deep trust [15] inherent in ethical BDSM to re-approach difficult memories or fears from a position of agency and choice, allowing for potential integration and reframing.", unlocked: false },
             { level: 3, insightCost: 35, text: "Requires Skilled & Sensitive Partners: Both partners, especially the one facilitating the scene [I], need significant emotional intelligence, sensitivity to trauma cues, patience, and robust aftercare [69] skills. Professional consultation is often highly recommended.", unlocked: false }
        ]
     },
     {
        id: 124, name: "Sensory Overstimulation Torture", cardType: "Practice/Kink", visualHandle: "rare_sens_torture.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 7, S: 9, P: 7, C: 5, R: 6, RF: 8 }, // RF strongly Dom (inflicting overload)
        briefDescription: "Intentional, prolonged sensory overload as 'torture'.", detailedDescription: "A form of intense sensation play [S] involving the deliberate use of prolonged, inescapable, or intensely unpleasant sensory input (e.g., specific grating sounds, flashing lights, uncomfortable textures, strong smells, multiple conflicting stimuli) as a form of consensual 'torture' or endurance play. Explores limits [P] and control [I] through sensory assault.",
        relatedIds: [86, 37, 9, 44], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP124", keywords: ['Sensory Overload', 'Torture', 'Intensity', 'Sensation', 'Endurance', 'Control', 'Overstimulation', 'BDSM', 'Limits', 'Assault (Consensual)'],
        lore: [
             { level: 1, insightCost: 9, text: "The Intended Goal?: Often aims for psychological effects like disorientation, breaking down mental defenses through sheer sensory bombardment, testing endurance limits [P], demonstrating control [I], or inducing specific altered states [C] via nervous system overload.", unlocked: false },
             { level: 2, insightCost: 18, text: "Rhythm & Relief as Tools of Intensity: The contrast principle is often key. Periods of intense, perhaps unpleasant overstimulation are frequently followed by sudden quiet, darkness [37], or deprivation to maximize the psychological impact and highlight the return of sensation.", unlocked: false },
             { level: 3, insightCost: 28, text: "Subjectivity is High: What constitutes 'torturous' overstimulation is highly individual. Meticulous negotiation about specific triggers, intensity, duration, and safewords is crucial to keep this within the bounds of consensual play rather than actual abuse.", unlocked: false }
        ]
     },
     {
        id: 125, name: "Breath Control (Advanced)", cardType: "Practice/Kink", visualHandle: "rare_breath_adv.jpg", primaryElement: "S",
        elementScores: { A: 4, I: 7, S: 9, P: 8, C: 4, R: 6, RF: 9 }, // RF strongly Dom (controller)
        briefDescription: "Precise breathing manipulation techniques (EXTREME RISK!).", detailedDescription: "Advanced, highly technical forms of breath play [63] involving more precise control over inhalation/exhalation cycles, potentially using tools like rebreather bags or masks under extremely controlled, knowledgeable, and vigilant conditions. May involve coaching specific breathing patterns to induce altered states. **Carries extreme and potentially lethal risks.** Requires expert knowledge and safety protocols.",
        relatedIds: [63, 44, 17], rarity: 'rare', canUnlockArt: false, uniquePromptId: "rP125", keywords: ['Breath Play', 'Asphyxiation', 'Risk', 'Edge Play', 'Control', 'Intensity', 'Skill', 'Safety', 'Hypoxia', 'Hypercapnia', 'Advanced', 'High-Risk'],
        lore: [
             { level: 1, insightCost: 10, text: "**SAFETY ADVISORY: LETHAL RISKS ARE SEVERE & IMMEDIATE!** This goes beyond basic breath play. Never practice alone. Requires expert knowledge of respiratory physiology, rigorous safety protocols (e.g., pulse oximetry, immediate release mechanisms), and instant emergency readiness. Mistakes are often irreversible.", unlocked: false },
             { level: 2, insightCost: 20, text: "The Allure for Experienced Practitioners: For those with extensive experience and training, it can represent the ultimate edge [44], pushing boundaries of physiological sensation [S], trust [15], psychological surrender [P], and achieving profound altered states through precise manipulation.", unlocked: false },
             { level: 3, insightCost: 30, text: "Requires Calmness & Expertise Under Pressure: The partner controlling the breath (the Top) must remain extremely calm, hyper-vigilant, knowledgeable about warning signs, and capable of making split-second safety decisions [I/C]. Not for casual exploration.", unlocked: false }
        ]
     } // No comma needed after the last item
]; // END OF CONCEPTS ARRAY

// --- Utility Maps & Arrays (Now includes RoleFocus) ---
const elementKeyToFullName = { A: "Attraction", I: "Interaction", S: "Sensory", P: "Psychological", C: "Cognitive", R: "Relational", RF: "RoleFocus" };
const elementNameToKey = Object.fromEntries(Object.entries(elementKeyToFullName).map(([key, value]) => [elementDetails[value]?.name || value, key]));
const cardTypeKeys = ["Orientation", "Identity/Role", "Practice/Kink", "Psychological/Goal", "Relationship Style"];
const elementNames = ["Attraction", "Interaction", "Sensory", "Psychological", "Cognitive", "Relational", "RoleFocus"];
// --- Questionnaire Data (Now includes RoleFocus) ---

const questionnaireGuided = {
    "Attraction": [
        { qId: "a1", type: "slider", text: "How focused is your 'Desire Compass'? Does it swing wide, or point very specifically?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Very Broad / Many Things Spark Interest", maxLabel: "Very Specific / Narrow Triggers", scoreWeight: 1.0 },
        { qId: "a2", type: "checkbox", text: "What ingredients most potently ignite your initial spark of attraction? (Select up to 2)", options: [ { value: "Physical Appearance/Aesthetic", points: 0.5 }, { value: "Gender Identity/Presentation", points: 0.5 }, { value: "Personality/Vibe/Energy", points: 0.0 }, { value: "Intellect/Wit/Cleverness", points: 0.5 }, { value: "Signs of Power/Confidence/Authority", points: 1.0 }, { value: "Signs of Vulnerability/Shyness/Submission", points: 1.0 }, { value: "Deep Emotional Connection (Already established)", points: -1.0 }, { value: "Specific Clothing/Materials/Objects (Fetish element)", points: 1.5 }, { value: "The Specific Context/Situation (e.g., role-play setup)", points: 1.0 } ], scoreWeight: 1.0, maxChoices: 2 },
        { qId: "a3", type: "radio", text: "How vital is a pre-existing emotional bond before sexual attraction can truly bloom?", options: [ { value: "Absolutely Essential (Demisexual leaning)", points: -2.0 }, { value: "Helpful & Preferred, but not strictly required", points: -0.5 }, { value: "Neutral / Varies Greatly depending on person/mood", points: 0 }, { value: "Generally Unimportant for initial spark", points: 1.0 } ], scoreWeight: 1.0 }
    ],
    "Interaction": [
        { qId: "i1", type: "slider", text: "On the 'Dance Floor' of intimacy, where does your energy naturally flow?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Strongly Following / Receiving / Yielding", maxLabel: "Strongly Leading / Directing / Giving", scoreWeight: 1.0 },
        { qId: "i2", type: "checkbox", text: "Which interaction styles or energetic roles feel most satisfying or exciting to embody? (Select up to 2)", options: [ { value: "Taking Confident Charge / Dominating", points: 1.5 }, { value: "Guiding / Orchestrating / Being Attentive (Top/Caregiver)", points: 1.0 }, { value: "Collaborating / Fluidly Switching Roles", points: 0 }, { value: "Following Clear Directions / Submitting", points: -1.5 }, { value: "Devotedly Serving / Focusing on Partner's Pleasure", points: -1.0 }, { value: "Performing / Enjoying Being the Focus/Watched", points: 0.5 }, { value: "Playful / Teasing / Lighthearted", points: 0.0 } ], scoreWeight: 1.0, maxChoices: 2 },
        { qId: "i3", type: "radio", text: "Do you prefer the energy of clear power dynamics or a more egalitarian flow?", options: [ { value: "Clear Power Difference (e.g., D/s, M/s) feels most engaging", points: 1.5 }, { value: "Subtle, shifting power dynamics are intriguing", points: 0.5 }, { value: "Equal Footing / Collaborative energy feels best", points: -1.0 }, { value: "Varies Greatly / No strong preference", points: 0 } ], scoreWeight: 1.0 }
    ],
    "Sensory": [
        { qId: "s1", type: "slider", text: "How crucial are the intensity and variety of physical sensations for your arousal and satisfaction?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Low Importance / Subtle Sensations Preferred", maxLabel: "High Importance / Intensity & Variety Craved", scoreWeight: 1.0 },
        { qId: "s2", type: "checkbox", text: "Which *types* of physical sensations particularly resonate or excite you? (Select up to 2)", options: [ { value: "Gentle Touch / Caressing / Warmth / Softness", points: -1.0 }, { value: "Firm Pressure / Deep Massage / Grounding Hugs", points: 0.0 }, { value: "Sharp / Stinging / Biting (Playful or Intense)", points: 1.5 }, { value: "Burning / Temperature Play (Wax, Ice, Hot/Cold)", points: 1.5 }, { value: "Binding / Restriction / Physical Helplessness", points: 1.0 }, { value: "Specific Textures (Latex, Silk, Rope, Fur, Leather)", points: 1.0 }, { value: "Unique Vibrations / Electrostimulation", points: 1.5 } ], scoreWeight: 1.0, maxChoices: 2 },
        { qId: "s3", type: "radio", text: "How do you feel about intentionally incorporating pain or extreme physical sensations?", options: [ { value: "Strongly Drawn To It / Find it Pleasurable/Cathartic", points: 2.0 }, { value: "Curious / Open To Exploring It Safely", points: 1.0 }, { value: "Neutral / Indifferent / Not a focus", points: 0 }, { value: "Generally Prefer to Avoid It", points: -1.0 }, { value: "Strongly Averse To It / Hard Limit", points: -2.0 } ], scoreWeight: 1.0 }
    ],
    "Psychological": [
        { qId: "p1", type: "slider", text: "How much is your sexuality intertwined with fulfilling deeper emotional or psychological needs (beyond just physical pleasure)?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Very Little / Primarily Physical/Recreational", maxLabel: "Very Much / Core Needs Are Key Driver", scoreWeight: 1.0 },
        { qId: "p2", type: "checkbox", text: "Which core psychological needs does sex or intimacy MOST effectively help you meet or explore? (Select up to 2)", options: [ { value: "Deep Connection / Soul Intimacy / Trust", points: 1.5 }, { value: "Exploring Power / Control (Giving or Receiving)", points: 1.5 }, { value: "Feeling Desired / Validated / Approved Of", points: 1.0 }, { value: "Escape / Stress Relief / Temporary Forgetting", points: 0.5 }, { value: "Catharsis / Intense Emotional Release", points: 1.0 }, { value: "Self-Exploration / Identity Expression / Creativity", points: 0.5 }, { value: "Feeling Safe / Secure / Comforted / Nurtured", points: 0.0 }, { value: "Pure Fun / Recreation / Playfulness", points: -1.0 } ], scoreWeight: 1.0, maxChoices: 2 },
        { qId: "p3", type: "radio", text: "Does intimacy feel 'incomplete' or 'hollow' if a specific psychological need isn't being addressed?", options: [ { value: "Yes, Often / It's the main point", points: 1.5 }, { value: "Sometimes / Depends on the need & context", points: 0.5 }, { value: "Rarely / Physical pleasure is usually enough", points: -0.5 }, { value: "Almost Never / Psychology isn't the focus", points: -1.5 } ], scoreWeight: 1.0 }
    ],
    "Cognitive": [
        { qId: "c1", type: "slider", text: "How vital is mental engagement (fantasy, scenarios, intellect, anticipation) to fueling your desire and enjoyment?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Not Important / Prefer Full Physical Presence", maxLabel: "Very Important / Mentally Driven Arousal", scoreWeight: 1.0 },
        { qId: "c2", type: "checkbox", text: "Which mental activities or states significantly enhance your arousal or intimate experience? (Select up to 2)", options: [ { value: "Detailed Internal Fantasies / Storylines", points: 1.5 }, { value: "Specific Role-Playing Scenarios / Characters", points: 1.5 }, { value: "Evocative Dirty Talk / Erotic Language", points: 1.0 }, { value: "Intellectual Sparring / Witty Banter / Mind Games", points: 1.0 }, { value: "Analyzing / Understanding Partner's Psychology", points: 0.5 }, { value: "Anticipation / Planning / Discussing Scenes Beforehand", points: 1.0 }, { value: "Being Fully 'In the Moment' / Mindful Presence", points: -1.5 } ], scoreWeight: 1.0, maxChoices: 2 },
        { qId: "c3", type: "radio", text: "Do you generally prefer the thrill of spontaneous encounters or the satisfaction of planned/scripted ones?", options: [ { value: "Strongly Prefer Planned/Scripted (Love the detail!)", points: 1.5 }, { value: "Lean Towards Planned (Enjoy anticipation/structure)", points: 0.5 }, { value: "No Real Preference / Enjoy a Mix", points: 0 }, { value: "Lean Towards Spontaneous (Love the surprise!)", points: -0.5 }, { value: "Strongly Prefer Spontaneous (Thrive on impulse!)", points: -1.5 } ], scoreWeight: 1.0 }
    ],
    "Relational": [
        { qId: "r1", type: "slider", text: "What's your ideal 'Constellation' size regarding number of intimate partners?", minValue: 0, maxValue: 10, defaultValue: 3, minLabel: "Strictly One (Monogamy) / Happily Solitary", maxLabel: "Multiple Concurrent Partners / Fluid Connections", scoreWeight: 1.0 },
        { qId: "r2", type: "checkbox", text: "Which relationship contexts or structures feel most comfortable, desirable, or authentic for you? (Select up to 2)", options: [ { value: "Solitary Self-Exploration / Masturbation Focus", points: -1.5 }, { value: "Deeply Committed, Exclusive Monogamous Pair", points: -1.0 }, { value: "Casual Dating / Friends With Benefits / Low Commitment", points: 0.5 }, { value: "Open Relationship (Primary dyad + others)", points: 1.0 }, { value: "Polyamory (Multiple committed/intimate relationships)", points: 1.5 }, { value: "Group Sex Scenarios / Threesomes+", points: 1.0 }, { value: "Anonymous / Brief Encounters", points: 0.5 } ], scoreWeight: 1.0, maxChoices: 2 },
        { qId: "r3", type: "radio", text: "How important is relationship 'hierarchy' (e.g., having one designated 'primary' partner above others)?", options: [ { value: "Very Important / Need a Clear Primary", points: -1.0 }, { value: "Somewhat Important / Prefer Some Hierarchy", points: -0.5 }, { value: "Neutral / Depends Entirely on the Relationship(s)", points: 0 }, { value: "Generally Prefer Non-Hierarchical Connections", points: 1.0 }, { value: "Strongly Against Hierarchy (Relationship Anarchy)", points: 1.5 } ], scoreWeight: 1.0 }
    ],
    "RoleFocus": [ // NEW QUESTIONS
         { qId: "rf1", type: "slider", text: "In interactions involving power dynamics, where does your energy naturally settle?", minValue: 0, maxValue: 10, defaultValue: 5, minLabel: "Strongly Yielding / Following (Submissive)", maxLabel: "Strongly Asserting / Leading (Dominant)", scoreWeight: 1.0 },
        { qId: "rf2", type: "checkbox", text: "Which energetic expressions feel most fulfilling or authentic to you in power-aware contexts? (Select up to 2)", options: [ { value: "Taking Charge / Making Decisions / Controlling", points: 1.5 }, { value: "Guiding / Protecting / Nurturing (from a leading position)", points: 1.0 }, { value: "Adapting / Switching between Leading & Following", points: 0.0 }, { value: "Following Instructions / Trusting Guidance / Obeying", points: -1.5 }, { value: "Serving / Pleasing / Focusing on Partner's Needs (from a following position)", points: -1.0 }, { value: "Resisting / Challenging / Playful Bratting", points: 0.5 }, { value: "Collaborating / Power dynamics feel irrelevant", points: -0.5 } ], scoreWeight: 1.0, maxChoices: 2 },
        { qId: "rf3", type: "radio", text: "Do you feel more energized taking responsibility for a scene/interaction, or letting go of that responsibility?", options: [ { value: "Energized by Taking Responsibility / Leading", points: 1.5 }, { value: "Slightly Prefer Leading / More Comfortable Giving Direction", points: 0.5 }, { value: "Comfortable Either Way / Depends on Partner/Mood", points: 0.0 }, { value: "Slightly Prefer Letting Go / More Comfortable Receiving Direction", points: -0.5 }, { value: "Energized by Letting Go of Responsibility / Following", points: -1.5 } ], scoreWeight: 1.0 }
    ]
};

// --- Reflection Prompts (Now includes RoleFocus) ---
const reflectionPrompts = {
    "Attraction": [
        { id: "pA1", text: "Recall someone (or something, like a specific scene, artwork, or idea!) that recently made you pause and feel that 'whoa, hello there!' spark. Can you pinpoint *exactly* what element(s) caught your attention or resonated so strongly?" },
        { id: "pA2", text: "Think about a time your 'Desire Compass' seemed totally haywire, pointing somewhere unexpected or even confusing. What was *that* fascinating detour about, and what insight did you eventually glean from navigating that unfamiliar territory?" },
        { id: "pA3", text: "How does feeling emotionally close and safe with someone impact the intensity or frequency of your sexual attraction dial? Does trust turn up the volume, or are they separate frequencies for you? Spill the alchemical tea!" },
        { id: "pA4", text: "Ever had a powerful crush or intense attraction slowly fizzle out or abruptly vanish? What changed in the dynamic? Was it something about them, about you, the external situation, or the magic simply completing its cycle? Ponder the fascinating fade..." }
    ],
    "Interaction": [
        { id: "pI1", text: "Picture your most *comfortable* and satisfying intimate dance. Were you confidently leading the choreography, joyfully following the rhythm set by another, or was it a fluid, improvisational duet? What specific elements made it feel so perfectly 'right' and attuned?" },
        { id: "pI2", text: "Conjure your ideal intimate encounter in vivid detail... What's the dominant energy? Playful and light as air? Intensely focused like a laser beam? Tenderly nurturing and soft like moss? Authoritatively commanding? Deeply yielding and receptive? Describe the essential vibe!" },
        { id: "pI3", text: "Words or vibes? When navigating the flow of intimacy, how much do you rely on explicit verbal communication versus intuitively sensing and responding to energy shifts, body language, and unspoken cues?" },
        { id: "pI4", text: "If exploring power dynamics is part of your path... what's the truly juicy, satisfying part about being the one consciously in charge? Conversely, what's the profound appeal or release found in willingly, trustingly letting someone else take the wheel?" }
    ],
    "Sensory": [
        { id: "pS1", text: "Let go of orgasm as the goal for a moment. What kind of pure *touch* itself feels truly amazing, sending shivers or sighs through you? Light and feathery like a butterfly wing? Firm and grounding like roots? A little bit rough and stimulating? Are there specific fabrics or temperatures that are instant bliss?" },
        { id: "pS2", text: "Are there highly specific sensations – maybe the precise heat of wax, the tight squeeze of a cuff, a sharp sting that clears your head, certain resonant sounds or evocative smells – that reliably amplify your arousal? Conversely, any instant mood-killers or sensory 'no-gos'?" },
        { id: "pS3", text: "Does your 'Feeling Finder' preference change significantly based on your mood that day, your stress levels, or the specific partner you're with? How flexible or consistent is your sensory map?" },
        { id: "pS4", text: "Recall a purely sensory moment (intimate or not!) that felt incredibly satisfying, made you feel totally alive, or induced a state of blissed-out presence. Can you dissect what specific sensory ingredients made it so potent and memorable?" }
    ],
    "Psychological": [
        { id: "pP1", text: "Looking beyond the undeniable pleasure of the physical, what deep-down core *need* or *longing* does intimacy most often fulfill for you? Is it the solace of connection? The thrill of power exchange? The relief of stress? The validation of being desired? The freedom of escape? Name the quest." },
        { id: "pP2", text: "Remember a time intimacy felt *profoundly* satisfying on a deeper, soul level. What specific core need felt truly met, seen, or nourished in that particular moment? What made it resonate so deeply?" },
        { id: "pP3", text: "Now, contrast that with a time intimacy felt kinda 'meh' or even empty psychologically, even if it was physically functional or okay. What essential psychological ingredient felt like it was missing from the brew?" },
        { id: "pP4", text: "How does consciously choosing to lower your guard, embrace vulnerability, and allow yourself to be truly 'seen' play into your most psychologically rewarding and connecting intimate experiences?" }
    ],
    "Cognitive": [
        { id: "pC1", text: "How much of your intimate experience happens within the vibrant theater of your mind? Are you lost in detailed fantasy narratives, actively analyzing the dynamic, or fully immersed and grounded in the physical sensations and emotional flow of the present moment? Where does your focus naturally rest?" },
        { id: "pC2", text: "Dish (even vaguely!) about a specific fantasy, scenario structure, or type of mental play that reliably gets your brain buzzing and desire flowing. What's the secret ingredient, the core element, that makes it work so effectively for you?" },
        { id: "pC3", text: "Does the mental game – the witty banter, the strategic power dynamics, the intellectual challenge of figuring someone out, the shared understanding of complex rules – turn you on as much (or potentially even *more* than) the purely physical aspects?" },
        { id: "pC4", text: "How do the cognitive elements of *anticipation* (looking forward to a planned scene) or *memory* (replaying past pleasurable moments in your mind) enhance or spice up your current intimate experiences?" }
    ],
    "Relational": [
        { id: "pR1", text: "In which relational context do you feel the most *free*, authentic, and uninhibited in expressing your full sexy self? Is it in solitude? Deep within a committed dyad? During casual explorations? Within the energy of group play? Or perhaps a unique blend?" },
        { id: "pR2", text: "Rules vs. Vibes vs. Anarchy: How important are clearly defined agreements, explicit rules about exclusivity or openness, or established hierarchies in your ideal relationship structure(s)? Or do you prefer letting connections evolve organically based on communication and feeling?" },
        { id: "pR3", text: "What's your sweet spot for emotional closeness and vulnerability within your various sexual connections? Does it need to be deep and soulful every time, is light and fun sufficient, or does the ideal level vary significantly depending on the specific relationship?" },
        { id: "pR4", text: "Let's talk complex feelings! If you practice or consider non-monogamy, how do challenging emotions like jealousy, envy, or insecurity show up for you? And how do you experience or cultivate compersion (finding joy in a partner's happiness with others), if at all?" }
    ],
    "RoleFocus": [ // NEW PROMPTS
        { id: "pRF1", text: "Consider a situation (sexual or not) where you felt powerfully 'in charge' or confidently leading. What did that energetic state feel like in your body and mind? Where did the confidence stem from?" },
        { id: "pRF2", text: "Recall a time you willingly, trustingly followed someone else's lead or guidance. What was the emotional quality of that experience? Did it feel like relief, vulnerability, excitement, peace, or something else?" },
        { id: "pRF3", text: "If you identify as a Switch, what often triggers the desire to shift from one energetic pole (Dominant/submissive) to the other? Is it internal, external, or a combination? What's enjoyable about the shift itself?" },
        { id: "pRF4", text: "How does your preferred Role Focus (Dominant, submissive, Switch, or perhaps neutral/egalitarian) interact with your other elemental scores? For example, does a high RF score pair with high Control [I] or Cognitive [C] engagement for you? Does a low RF score often link with seeking Comfort [P] or specific Sensations [S]?" }
    ],
    "Dissonance": [
        { id: "pD1", text: "Okay, this Concept feels a bit like static compared to your usual frequency! Acknowledge the discomfort, then lean in with curiosity: What specific *part* of it, even if it feels weird or 'not you,' makes you tilt your head and go 'Huh, that's... unexpectedly interesting...'?" },
        { id: "pD2", text: "Exploring the unfamiliar edges of the map can be wild! Even if this concept feels challenging or pushes buttons, what *potential* new insight, understanding, or even unexpected pleasure might it offer if you hypothetically leaned into it just a tiny, safe bit in thought or fantasy?" },
        { id: "pD3", text: "Sometimes the things we instinctively push away hold a mirror to something within us. Does this concept perhaps poke at an underlying fear, a societal taboo you've internalized, or even a hidden desire or need you haven't fully acknowledged or explored yet?" },
        { id: "pD4", text: "How could simply *understanding* this different perspective on desire or intimacy, even if it remains firmly 'not for you' in practice, broaden your appreciation for your own awesome complexity or the sheer, dazzling variety of the human erotic landscape?" }
    ],
    "Guided": { // Contextual prompts
        "LowAttunement": [
            { id: "gLA1", text: "Just beginning your alchemical journey into self-knowledge! Of the core Elements (Attraction, Interaction, etc., including RoleFocus), which one feels most mysterious, intriguing, or perhaps even slightly intimidating right now? Let's gently ponder that first step." },
            { id: "gLA2", text: "Looking back at those initial elemental scores from the questionnaire... any surprises? How does it feel seeing these fundamental aspects of your intimate self mapped out, even roughly? What questions arise?" }
        ],
        "HighAttunementElement": [ // Will need logic to replace [Element Name]
            { id: "gHE1", text: "You're clearly resonating strongly with the energy of [Element Name]! How does this potent energy manifest in your daydreams, your fantasies, or your real-life intimate moments? What specific flavors or nuances of it are you noticing most vividly?" },
            { id: "gHE2", text: "Even the strongest affinities have shadows or growth edges. Where might the challenge, the potential pitfall, or the next layer of learning be in your deep connection and high attunement to [Element Name]?" }
        ],
        "ConceptSynergy": [ // Will need logic to replace [Concept A/B]
            { id: "gCS1", text: "Hmm, focusing simultaneously on both [Concept A] and [Concept B] creates an interesting alchemical mixture! How do you imagine these two potent ideas playing together? Do they harmonize, contrast, amplify, or perhaps challenge each other in fascinating ways?" },
            { id: "gCS2", text: "What cool new flavor, dynamic, or possibility might bubble up when you consciously blend the essence of [Concept A] with the energy of [Concept B] in thought or practice? Think like a potion master experimenting with powerful ingredients!" }
        ]
        // Potential contexts: FirstRareConcept, HighDissonanceScore, MilestoneReached, RitualCompleted etc.
    },
    "RareConcept": { // Unique prompts tied to specific rare concepts
        "rP08": { id: "rP08", text: "Heavy Impact: It's undeniably intense! What's the core allure of that deep thud, sharp sting, or lasting mark? Is it the raw physical sensation itself, the visual proof of endurance/trust, the clear power dynamic it creates, the psychological release, or something else entirely unique to you?" },
        "rP09": { id: "rP09", text: "Non-Impact Pain: Clamps, wax, needles, pinching... different flavors of intensity beyond hitting. What specific *quality* of *this kind* of 'ouch' resonates most? Is it the focus it demands, the vulnerability it creates, the contrast with pleasure, or perhaps a specific mental game played alongside the physical?" },
        "rP11": { id: "rP11", text: "Command & Control Dynamics: Following precise orders can be incredibly potent. What's the satisfying 'click' for you – the clarity and authority of giving the command, the feeling of perfect, trusting obedience, or the shared focus and structure it provides?" },
        "rP12": { id: "rP12", text: "Objectification Play: A potentially tricky concept requiring immense trust! Within safe consent, what underlying need, fantasy, or psychological exploration does playing with 'thing-ness' (whether giving or receiving that treatment) actually touch upon for you? Is it about focus, power, dehumanization themes, or something else?" },
        "rP14": { id: "rP14", text: "Fantasy Immersion: If your mind is the main stage where arousal truly ignites, what specific ingredients make a fantasy feel absolutely real, captivating, and consuming? What narrative elements, character archetypes, or emotional tones pull you in completely?" },
        "rP16": { id: "rP16", text: "Rope Bondage (Shibari/Kinbaku): Art, sensation, and trust intertwined! Are you drawn more to the beautiful, intricate patterns created, the unique, inescapable pressure of the ropes, the profound mental state of restricted stillness it induces, or the deep energetic connection forged with the person tying/being tied?" },
        "rP17": { id: "rP17", text: "Restriction / Helplessness: That potent psychological feeling of being totally bound, unable to move freely... what specific emotions or states bubble most strongly to the surface for you? Pure surrender? Heightened excitement? Deep vulnerability? Unexpected peace? Or a complex cocktail unique to you?" },
        "rP20": { id: "rP20", text: "Material Focus (Latex, Leather, etc.): When a specific fabric or material itself is the primary turn-on, which sense is most powerfully engaged? Is it the sleek, reflective look? The distinctive smell? The specific sound it makes when moving? The unique way it feels against skin (yours or theirs)?" },
        "rP21": { id: "rP21", text: "Uniform / Clothing Fetish: Clothes make the fantasy potent! Which specific uniform or outfit acts as the strongest spark, and what story, role, power dynamic, or archetype does it instantly bring to mind, setting the stage for desire?" },
        "rP25": { id: "rP25", text: "Polyamory: Navigating multiple deep, ethical connections takes skill and heart! What are the biggest joys and rewards you find (or imagine finding) in this relationship style? Conversely, what are the trickiest emotional or logistical challenges to navigate successfully?" },
        "rP27": { id: "rP27", text: "Relationship Anarchy: No rules but the ones you consciously choose and co-create! How do you build deep trust, define commitments (if any), and navigate the complexities of intimacy when you intentionally throw out the traditional relationship rulebook and hierarchies?" },
        "rP30": { id: "rP30", text: "High Protocol D/s: So many intricate rules, rituals, and formalities! What's the deep appeal of this highly structured approach to power exchange? Is it the absolute clarity it provides? The challenge of achieving perfection? The profound transformation of self it allows within the dynamic?" },
        "rP38": { id: "rP38", text: "Tease & Denial / Edging: Riding that razor's edge of pleasure without release... What is the most potent part of this experience for you? The mounting physical tension? The psychological test of will? The surrender to another's control over your climax?"},
        "rP41": { id: "rP41", text: "Erotic Hypnosis / Mind Control Play: Playing with suggestion, triggers, and perceived control is a deep head game requiring immense trust. What clear boundaries, communication protocols, and aftercare practices feel absolutely essential to explore this fascinating territory safely and ethically?" },
        "rP42": { id: "rP42", text: "Transformation Fetish: Changing form (physically, mentally, symbolically) is a potent and ancient theme in fantasy. What *kind* of transformation holds the most intrigue for you, and what deeper desire, fear, or exploration of identity might it represent?" },
        "rP43": { id: "rP43", text: "Medical Play: The clinical setting can be sterile... or intensely kinky! What's the core draw of this specific role-play genre? The heightened vulnerability? The implied authority and knowledge differential? The specific tools and procedures? The unique power dynamic inherent in examination?" },
        "rP44": { id: "rP44", text: "Edge Play: Intentionally playing close to physical, psychological, or emotional limits requires meticulous care and communication. When engaging in activities with real or perceived risk, what specific safety negotiations, check-ins, and contingency plans feel absolutely non-negotiable for you and your partner(s)?" },
        "rP45": { id: "rP45", text: "Humiliation / Degradation: This type of play can stir up incredibly intense feelings and push societal buttons! Where is the distinct line for *you* between fun, consensual embarrassment or power play, and something that causes genuine, unwanted hurt? How do you clearly communicate and respect that boundary?" },
        "rP63": { id: "rP63", text: "Breath Play: Consciously altering the fundamental act of breathing induces powerful altered states. What specific physical feeling, mental shift, or level of surrender are you seeking with this intense practice? And how is rigorous attention to safety *always* the absolute top priority before, during, and after?" },
        "rP64": { id: "rP64", text: "CNC (Consensual Non-Consent): Role-playing scenarios involving simulated non-consent requires rock-solid, enthusiastic *real* consent beforehand. How do you and your partner(s) ensure everyone feels genuinely safe, informed, and empowered with clear boundaries and instantly respected safewords *before* diving into such potentially triggering scenes?" },
        "rP65": { id: "rP65", text: "Chemsex / Party & Play: Adding psychoactive substances undeniably changes the game. Be radically honest with yourself: what are the true motivations driving this choice (enhanced sensation? lowered inhibition? social connection? extended endurance?) and are you fully aware of, and actively managing, the potential health and consent risks involved?" },
        "rP95": { id: "rP95", text: "Gerontophilia: Attraction to the elderly challenges many societal norms around beauty and desire. What qualities associated with age (experience? wisdom? frailty? specific physical changes?) resonate most strongly for you?"},
        "rP96": { id: "rP96", text: "Odaxelagnia (Biting): The primal act of biting holds a unique charge. Is it the sharp sensation, the potential for marking, the feeling of possession/being possessed, or the instinctive energy that appeals most?"},
        "rP97": { id: "rP97", text: "Stigmatophilia (Body Mods): Tattoos, piercings, scars... What story or feeling does the intentionally altered body evoke for you? Is it aesthetic beauty, rebellion, endurance, identity expression, or something else?"},
        "rP101":{ id: "rP101", text: "Ritualistic Play: Incorporating structure, symbolism, and specific actions can elevate a scene. What makes a ritual feel potent and meaningful versus just going through the motions? How does it deepen the power dynamic or psychological impact for you?"},
        "rP104":{ id: "rP104", text: "Military/Police Fetish: The uniform carries immense symbolic weight. Is it the inherent authority, the implied discipline, the potential for control/rescue, or the specific aesthetic and gear that holds the strongest charge?"},
        "rP109": { id: "rP109", text: "Master / slave Dynamic (M/s): This term often implies a profound, potentially all-encompassing power exchange that goes beyond typical D/s scenes. How does the concept of 'ownership' or total authority/surrender within an M/s framework feel different or more significant to you than other D/s dynamics?" },
        "rP111": { id: "rP111", text: "Knife Play / Edge Play (Sharp): The presence of a sharp edge adds undeniable psychological intensity and requires extreme control. Is the thrill primarily about the visual threat, the focused pinprick sensation, the implied danger and vulnerability, or the profound demonstration of trust required from both partners?" },
        "rP112": { id: "rP112", text: "E-Stim: That unique electric buzz, tingle, or contraction! How does the often involuntary nature of electro-sensations, the way it bypasses conscious control, compare to other kinds of touch, pressure, or pain for you? What makes it intriguing?" },
        "rP113": { id: "rP113", text: "Suspension Bondage: Being lifted, bound, and helpless against gravity... Is the main appeal the stunning visual aesthetic, the intense physical strain and unique bodily sensations, the ultimate feeling of vulnerability and surrender, or the technical skill and trust involved in the rigging?" },
        "rP114": { id: "rP114", text: "Water Sports / Urolagnia: Playing with urine definitely pushes common societal buttons around cleanliness and bodily fluids! What specific taboos, feelings about the body's functions, or power dynamics (like marking or humiliation) does this activity bring up or engage for you?" },
        "rP115": { id: "rP115", text: "Scat Play / Coprophilia: Deeply taboo for most cultures and carrying significant health risks. If this resonates (even just conceptually), what complex psychological themes (extreme degradation? primal connection? ultimate taboo breaking?) or intense power dynamics might be involved? (Safety, hygiene, and enthusiastic consent are paramount.)" },
        "rP116": { id: "rP116", text: "Blood Play (Intentional): Using actual blood adds a primal, ritualistic, and high-risk element. What symbolic weight, visceral reaction, or deep-seated cultural association does blood hold in your personal erotic world? (Remember: Safety first, last, and always!)" },
        "rP117": { id: "rP117", text: "Abduction / Capture Fantasy (CNC): Being 'taken' against your simulated will within a safe, negotiated game... What specific parts of the narrative arc – the initial surprise/struggle, the period of captivity/helplessness [17], the dynamic with the captor [4/5], the potential for escape or surrender – hold the most charge for you?" },
        "rP118": { id: "rP118", text: "Somnophilia / Sleep Play: Interacting with someone seemingly unaware (even if pretending) touches on deep themes of vulnerability, observation [19], and transgression. What ethical lines around consent and awareness feel absolutely crucial to uphold, even within the bounds of fantasy or role-play?" },
        "rP119": { id: "rP119", text: "Orgasm Control / Forced Orgasm: Directly controlling a partner's ultimate pleasure/release cycle is a potent form of power exchange [I]. How does this feel different from simple teasing or denial [38]? What does it communicate about control, pleasure, surrender, or endurance?" },
        "rP120": { id: "rP120", text: "Psychological 'Torture' Play: Navigating intense, consensual mind games, manipulation, or emotional challenges requires extreme trust and robust aftercare [69]. What kind of specific soothing, reconnection, or reality-checking (aftercare) feels most essential after engaging in play that intentionally messes with your head or emotions?" },
        "rP121": { id: "rP121", text: "Furry Sexuality: Expressing intimacy through or within the context of anthropomorphic identities (fursonas) and community norms... How does this unique blend of personal identity, creative role-play [13], community connection [R], and fantasy shape your desires and expression?" },
        "rP122": { id: "rP122", text: "Autassassinophilia: Arousal derived from the *staged* fantasy of being hunted or facing mortal danger represents an extreme form of edge play [44]. What deep psychological thrill, adrenaline rush, or confrontation with mortality might be found in flirting (safely and consensually!) with this ultimate simulated threat?" },
        "rP123": { id: "rP123", text: "Exposure Therapy Play (Therapeutic BDSM): Carefully using scene work to process past trauma or fears requires immense care and often professional guidance. How can the controlled intensity and trust of a scene potentially facilitate processing difficult experiences without re-traumatizing? What specific safety measures and support systems feel crucial?" },
        "rP124": { id: "rP124", text: "Sensory Overstimulation 'Torture': Intentionally drowning the senses in prolonged, inescapable, or unpleasant input! Is the goal disorientation? Pushing endurance limits? Breaking down mental defenses through sheer sensory assault? Testing control? Or achieving a specific altered state?" },
        "rP125": { id: "rP125", text: "Advanced Breath Control: This takes breath play [63] to another level of risk and precision. What deeper altered state, profound sensation, or ultimate test of trust and surrender is the goal when playing this close to the physiological edge? (Reflect intensely and repeatedly on safety protocols!)" }
    },
    "SceneMeditation": {
        "scnP001": { id: "scnP001", text: "Imagine the 'Altar of Taste: Blindfolded Offering' Scene... Feel the anticipation build as sight is removed. Sense the heightened awareness of taste, texture, smell, sound. What unexpected nuances arise? What does the act of being fed, relinquishing control over what enters your body, feel like psychologically? Explore the trust involved.", },
        "scnP002": { id: "scnP002", text: "Picture the deliberate pause within the 'Mid-Dance Accord: Negotiated Power Shift' Scene. What does that specific moment of stopping the flow to explicitly discuss roles feel like? Does openly talking about control mid-action enhance intimacy, disrupt erotic flow, or create a new kind of charged, intentional energy between partners?", },
        "scnP003": { id: "scnP003", text: "Immerse yourself completely in 'Weaving Worlds: Sensory Storytelling'. Feel the way hearing evocative words while simultaneously experiencing related physical touches (a whispered 'crackling fire' accompanied by warm breath or friction) blurs the lines between the cognitive and sensory realms. What kind of narrative, what specific words and touches combined, would completely captivate your imagination and body?" , },
        "scnP004": { id: "scnP004", text: "Sink deeply into the silent, profound intensity of 'Soul Mirror: Silent Gaze Intimacy'. Just eyes meeting eyes, holding the connection, letting social masks fall away. What flickers of raw emotion, unspoken thoughts, shared understanding, profound vulnerability, or even challenge pass between you in that charged, wordless space?", },
        "scnP005": { id: "scnP005", text: "Consider the focused, almost meditative state of 'Focus Point Binding: Precision Sensation'. Perhaps lightly bound [87], waiting in stillness... How does concentrating *all* your awareness onto that one single point of anticipated contact (specific heat, cold, pressure, sting [9]) alter your perception of time, the rest of your body, and your focused vulnerability [P]?" , }
    }
};

// --- Element Deep Dive Content (Now includes RoleFocus) ---
const elementDeepDive = {
    "A": [ /* Attraction content unchanged */
        { level: 1, title: "Level 1: Deciphering the Spark - Your Attraction Compass", insightCost: 10, content: "<p>Attraction: the mysterious force that first draws us in... observe: What patterns do you notice in your *initial* magnetic pull...?</p>" },
        { level: 2, title: "Level 2: Beyond First Sight - Deeper Magnetic Fields", insightCost: 25, content: "<p>Let's dig beneath the surface magnetism. Is it the lightning strike of a sharp mind (Sapiosexuality [60])... or a specific object, texture, material, or situation (a fetish [20, 21, 62, 94])... How does needing a deep emotional bond *first* (Demisexuality [29]) change the spark?</p>" },
        { level: 3, title: "Level 3: From Spark to Flame - Cultivating Desire's Fire", insightCost: 50, content: "<p>Attraction is potential, arousal is fire. What bridges the gap? Spontaneous desire (ready tinder) vs. responsive desire (needs coaxing)?... How fixed is your compass...?</p>" }
    ],
    "I": [ /* Interaction content unchanged */
        { level: 1, title: "Level 1: The Dance of Connection - Leading, Following, Flowing", insightCost: 10, content: "<p>Interaction is the energetic exchange... Leading (Dominant/Top [4])? Following (Submissive/Bottom [5])? Flowing (Switch [6])?... Reflect on your most satisfying interactions...</p>" },
        { level: 2, title: "Level 2: Styles of Engagement - Finding Your Signature Move", insightCost: 25, content: "<p>Beyond leading/following, what's the *flavor*? Meticulous control [11]? Devoted service [10]? Raw instinct (Primal [40])? Nurturing (Caregiver [58])?... Where does your style resonate?</p>" },
        { level: 3, title: "Level 3: The Language of Play - Communication & Safety in Motion", insightCost: 50, content: "<p>How do you communicate desires/boundaries? Verbally? Energetically?... How crucial are safewords? Consider aftercare [69]... How do you ensure safety and respect throughout?</p>" }
    ],
    "S": [ /* Sensory content unchanged */
        { level: 1, title: "Level 1: The Body's Alphabet - Basic Sensory Grammar", insightCost: 10, content: "<p>Your skin... speaks a complex language. Gentle whispers (light caresses [2])? Firm pronouncements (deep pressure)? Temperature? Textures? Consider the fundamental sensations...</p>" },
        { level: 2, title: "Level 2: Amplifying Sensation - Intensity & Edge", insightCost: 25, content: "<p>Sometimes a whisper isn't enough... Sharp pinch/bite [9]? Rhythmic impact (light [7] / heavy [8])? Hot wax [9]? Binding [16, 87]?... How does your body negotiate the pleasure/pain edge, or overwhelm [86]?</p>" },
        { level: 3, title: "Level 3: A Symphony for the Senses - Beyond Touch", insightCost: 50, content: "<p>How do other senses weave in? Scent [A]? Sound (music, voice [32])? Visuals?... Explore engaging (or depriving [37]) multiple senses...</p>" }
    ],
    "P": [ /* Psychological content unchanged */
        { level: 1, title: "Level 1: The Heart's Compass - Charting Your 'Why'", insightCost: 10, content: "<p>What deeper psychological needs pull you towards connection? Shared vulnerability/trust [15]? Power/control [4/5]? Validation [50]? Escape [51]? Comfort/safety [80]? Name the quest.</p>" },
        { level: 2, title: "Level 2: Mapping Emotional Landscapes & Inner States", insightCost: 25, content: "<p>Vulnerability... How comfortable are you being witnessed? Can intensity bring catharsis? Have you touched altered states ('subspace')?... What creates the essential safety net?</p>" },
        { level: 3, title: "Level 3: Inner Alchemy & Potential for Healing", insightCost: 50, content: "<p>Intimacy as a mirror... reflecting joys, desires, fears, shadows. Can play be a crucible for integration, or healing [123]? Or repeat old stories? Consider the potential for self-discovery...</p>" }
    ],
    "C": [ /* Cognitive content unchanged */
        { level: 1, title: "Level 1: The Theater of the Mind - Imagination's Stage", insightCost: 10, content: "<p>How active is your inner world? Elaborate fantasies [14]? Analyzing the dynamic? Grounded in sensation [S]? Explore imagination's power... What populates your mental theater?</p>" },
        { level: 2, title: "Level 2: Scripts, Scenarios, and Role-Play Realms", insightCost: 25, content: "<p>Do you relish stepping into a role [13]? Specific scenarios? Forbidden encounters? Historical settings? Power dynamics [4/5]? Fantastical creatures [121]? Professional roles [43]? Is the 'story' key?</p>" },
        { level: 3, title: "Level 3: The Intellectual Spark & Conceptual Fire", insightCost: 50, content: "<p>Is the mind the primary erogenous zone? Witty banter [74]? Understanding motivations [P]? Analyzing interactions [I]? Symbolic actions, complex rules [30], rituals [101]? Explore how thought fuels fire.</p>" }
    ],
    "R": [ /* Relational content unchanged */
        { level: 1, title: "Level 1: Mapping Your Connections - Constellation Basics", insightCost: 10, content: "<p>How do you structure your intimate world? Monogamy [22]? Solo exploration? Consensual Non-Monogamy [25, 26]? Consider the basic blueprint: how many, what level of connection?</p>" },
        { level: 2, title: "Level 2: Defining the Bonds - Depth, Commitment, Fluidity", insightCost: 25, content: "<p>Beyond number, what *depth* and *type*? Deep emotional intimacy [15]? Casual fun [24]? Shared interests? Temporary companionship? How does 'commitment' factor? Can levels vary?</p>" },
        { level: 3, title: "Level 3: Navigating the Cosmos - Rules, Anarchy, & Emotion", insightCost: 50, content: "<p>If exploring multiple connections (Poly [25], Open [26]), how do you navigate? Clear rules/hierarchy? Or let each define itself (RA [27])? Handling jealousy, compersion? What skills are essential?</p>" }
    ],
    "RF": [ // NEW DEEP DIVE
        { level: 1, title: "Level 1: Sensing the Current - Your Natural Polarity", insightCost: 10, content: "<p>Role Focus explores your innate energetic leaning in power dynamics... are you more comfortable being the strong current directing the flow (Dominant), the receptive banks guiding the water (submissive), or the eddy that playfully swirls between both (Switch)?...</p>" },
        { level: 2, title: "Level 2: Embodied Expressions - Dominance, Submission, Switching", insightCost: 25, content: "<p>How does this polarity translate into action or feeling? If Dominant [High RF], does it manifest as decisive control [11]...? If submissive [Low RF], is it found in trusting obedience [5]...? If a Switch [Mid RF], what scenarios invite you to embody each pole? Connect your RF score to specific concepts...</p>" },
        { level: 3, title: "Level 3: The Alchemy of Exchange - Polarity in Relationship", insightCost: 50, content: "<p>Polarity rarely exists in a vacuum. How does your Role Focus interact with your partners' [R]? Do you seek complementary energies (Dom/sub pairing)...? How do you communicate needs and boundaries around power [C]?...</p>" }
    ]
};
// --- Focus Rituals Data ---
const focusRituals = [
    { id: "fr01", requiredFocusIds: [4], description: "Focus Ritual: Ponder a specific moment you felt confidently, ethically in charge (Dom Energy). What did that feel like physically & mentally?", reward: { type: "insight", amount: 3 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr01" } },
    { id: "fr02", requiredFocusIds: [5], description: "Focus Ritual: Meditate on the delicious vulnerability & release of trusting someone enough to fully surrender control. Where do you feel it in your body?", reward: { type: "insight", amount: 3 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr02" } },
    { id: "fr03", requiredFocusIds: [15], description: "Focus Ritual: Identify one small, safe way you could choose to be slightly more open or vulnerable today with someone you trust (in any context).", reward: { type: "attunement", element: "P", amount: 0.5 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr03" } },
    { id: "fr04", requiredFocusIds: [16, 17], description: "Focus Ritual: Consider the paradox of restriction - how can externally imposed limits (like rope) sometimes create internal freedom or heightened sensation? Explore the feeling.", reward: { type: "insight", amount: 5 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr04" } },
    // Example RF-related Ritual
    { id: "fr05", requiredRoleFocusScore: 8, description: "Focus Ritual (High RF): Reflect on the responsibility inherent in wielding power consensually. How do you balance control with care?", reward: { type: "attunement", element: "RF", amount: 0.5 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr05" }},
    { id: "fr06", requiredRoleFocusScoreBelow: 3, description: "Focus Ritual (Low RF): Reflect on an instance where trust allowed deeper surrender. What built that trust?", reward: { type: "attunement", element: "RF", amount: 0.5 }, track: { action: "completeReflection", count: 1, period: "daily", contextMatch: "FocusRitual_fr06" }},
];

// --- Repository Item Data ---
const sceneBlueprints = [
    { id: "SCN001", name: "Altar of Taste: Blindfolded Offering", element: "S", description: "One partner, blindfolded (sensory deprivation [37]), receives small tastes/textures fed by another. Heightens non-visual senses, builds profound trust [P], explores giving/receiving [I].", meditationCost: 10, reflectionPromptId: "scnP001" },
    { id: "SCN002", name: "Mid-Dance Accord: Negotiated Power Shift", element: "I", description: "Intentionally pause mid-scene to explicitly discuss/negotiate swapping roles (Dom/sub, Top/Bottom) or shifting the power dynamic [I]. Explores verbal communication [C], flexibility, and conscious choice.", meditationCost: 10, reflectionPromptId: "scnP002" },
    { id: "SCN003", name: "Weaving Worlds: Sensory Storytelling", element: "C", description: "One partner weaves an evocative erotic tale [C] while matching physical actions/sensations [S] to the narrative (e.g., a 'cold wind' described = a cool breath on skin). Blurs the line between mind and body, creating deep immersion.", meditationCost: 10, reflectionPromptId: "scnP003" },
    { id: "SCN004", name: "Soul Mirror: Silent Gaze Intimacy", element: "P", description: "Partners sit comfortably close, holding sustained, silent eye contact [47]. A powerful, potentially intense exercise in raw connection, vulnerability, presence, and non-verbal communication [P].", meditationCost: 8, reflectionPromptId: "scnP004" },
    { id: "SCN005", name: "Focus Point Binding: Precision Sensation", element: "S", description: "Often involving light bondage [87] or restriction [17], this focuses intense, specific sensations (temperature, texture, light pinch/impact [7, 9]) onto one deliberately chosen area, amplifying sensory awareness [S] and psychological vulnerability [P].", meditationCost: 12, reflectionPromptId: "scnP005"}
];
const alchemicalExperiments = [
    { id: "EXP01", name: "Distillation of Sensation: Amplification Brew", requiredElement: "S", requiredAttunement: 75, insightCost: 30, requiredFocusConceptTypes: ["Practice/Kink"], description: "Attempt to brew a temporary state of heightened sensory acuity [S] via focused meditation and carefully chosen stimulation. Risk: Sensory overload/fuzziness! Reward: Sharpened physical awareness.", successReward: { type: "attunement", element: "S", amount: 5 }, failureConsequence: "Slight sensory fuzziness or temporary dulling.", successRate: 0.6 },
    { id: "EXP02", name: "Axiom of Authority: Command Resonance Field", requiredElement: "I", requiredAttunement: 80, insightCost: 40, requiredFocusConceptIds: [11], requiredRoleFocusScore: 7, description: "Channel intense will and focus into the energetic field between commander and responder [11], seeking perfect synchronous resonance within the power dynamic [I]. Requires strong Role Focus [RF]. Success boosts clarity & impact, failure causes temporary 'static' in interaction.", successReward: { type: "insight", amount: 20 }, failureConsequence: "Temporary inability to Focus concepts related to Interaction.", successRate: 0.5 },
    { id: "EXP03", name: "Crucible of Connection: Intimacy Catalyst Ritual", requiredElement: "P", requiredAttunement: 85, insightCost: 50, requiredFocusConceptIds: [15], description: "A high-stakes ritual involving the intentional sharing of deep vulnerabilities [P] to attempt rapid forging of profound connection [15]. Success deepens bonds exponentially, failure risks emotional fallout or awkward distance.", successReward: { type: "attunement", element: "P", amount: 6 }, failureConsequence: "Increased feeling of psychological dissonance or vulnerability hangover.", successRate: 0.4 },
    { id: "EXP04", name: "The Mind Weaver's Loom: Conceptual Synthesis", requiredElement: "C", requiredAttunement: 70, insightCost: 35, requiredFocusConceptTypes: ["Cognitive", "Fantasy"], description: "Mentally attempt to blend the core essences of two focused Cognitive concepts (e.g., a fantasy trope + a psychological dynamic) into a novel, coherent imaginative thread [C]. May reveal unexpected insights or just mental knots.", successReward: { type: "insightFragment", id: "IFC01", element: "C", text:"Weaving thoughts yields unexpected threads... and sometimes beautiful tangles."}, failureConsequence: "Mental fatigue, slight Insight loss (1-2 points).", successRate: 0.55 },
    { id: "EXP05", name: "Embodied Archetype: Persona Integration Test", requiredElement: "C", requiredAttunement: 70, insightCost: 40, requiredFocusConceptIds: [13, 21], description: "Can you seamlessly blend a chosen Role-Play persona [13] with symbolic attire (like a Uniform [21] or specific gear [20]) to create a unified, believable presence? Success clarifies Cognitive links & embodiment, failure creates temporary identity blur or awkwardness.", successReward: { type: "attunement", element: "C", amount: 4 }, failureConsequence: "Temporary confusion about self/role, slight Cognitive dip.", successRate: 0.5 },
    { id: "EXP06", name: "Polarity Resonance Tuning", requiredElement: "RF", requiredAttunement: 60, insightCost: 30, requiredFocusConceptIds: [4, 5], description: "Attempt to consciously tune the energetic field between Dominant [4] and submissive [5] roles, seeking a clearer, more resonant polarity [RF]. Success enhances dynamic flow, failure creates temporary role confusion.", successReward: { type: "attunement", element: "RF", amount: 4 }, failureConsequence: "Temporary RF score fluctuation (+/- 1.0).", successRate: 0.6 } // New RF Experiment
];
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
    { id: "EI_RF01", element: "RF", text: "Dominance is responsibility worn with confidence; Submission is trust given with courage."}, // NEW RF Insight
    { id: "EI_RF02", element: "RF", text: "The true Switch finds power not in either pole, but in the fluid energy of the dance between them."}, // NEW RF Insight
    { id: "EI_RF03", element: "RF", text: "Clarity of role can create profound freedom; ambiguity requires constant negotiation."}, // NEW RF Insight
    { id: "IFC01", element: "C", text:"Weaving distinct thoughts yields unexpected threads... and sometimes reveals beautiful, intricate knots worth exploring."}
];

// --- Focus-Driven Unlocks Data ---
const focusDrivenUnlocks = [
    { id: "FDU001", requiredFocusIds: [4, 9], unlocks: { type: "scene", id: "SCN005", name: "Precision Sensation Scene Blueprint" }, description: "Aha! Focusing on the synergy between Dominance [4] & Pain Play [9] has unlocked the 'Precision Sensation' Scene Blueprint! Control meets intense focus." },
    { id: "FDU002", requiredFocusIds: [15, 16], unlocks: { type: "insightFragment", id: "EI_P05", element: "P", text: "Binding the body can free the heart, but only if trust holds the knot tight." }, description: "Synergy Revealed! Focusing on Deep Emotional Intimacy [15] & Rope Bondage [16] uncovered a profound Psychological Insight about trust and surrender!" },
    { id: "FDU003", requiredFocusIds: [13, 21], unlocks: { type: "experiment", id: "EXP05", name: "Embodied Archetype: Persona Integration Test" }, description: "Interesting Combination! Focusing on Role-Play [13] + Uniform Fetish [21] unlocked the 'Persona Integration Test' Experiment! Explore embodying the fantasy." },
    { id: "FDU004", requiredFocusIds: [4, 5], unlocks: { type: "experiment", id: "EXP06", name: "Polarity Resonance Tuning Experiment" }, description: "Polarity Focus! Holding both Dominance [4] & Submission [5] unlocks the 'Polarity Resonance Tuning' Experiment!" } // New FDU for RF Experiment
];

// --- Category-Driven Unlocks Data ---
const categoryDrivenUnlocks = [
    { id: "CDU001", requiredInSameCategory: [16, 17], categoryRequired: "liked", unlocks: { type: "lore", targetConceptId: 16, loreLevelToUnlock: 3 }, description: "Deep Resonance! By categorizing both Rope Bondage [16] and Restriction/Helplessness [17] as 'Resonant Echoes' (Liked), you've unlocked deeper, level 3 lore for Rope Bondage!" },
    { id: "CDU002", requiredInSameCategory: [4, 11], categoryRequired: "coreIdentity", unlocks: { type: "insight", amount: 5 }, description: "Pillar Affirmation! Acknowledging both Psychological Dominance [4] and Command/Control Dynamics [11] as 'Pillars of Self' (Core Identity) has granted you a bonus infusion of 5 Insight!" },
    { id: "CDU003", requiredInSameCategory: [8, 9], categoryRequired: "wantToTry", unlocks: { type: "attunement", element: "S", amount: 2 }, description: "Intriguing Edge! Placing both Heavy Impact [8] and Non-Impact Pain [9] onto the 'Curious Experiments' shelf signals an interest in intense sensation, boosting your Sensory Attunement by 2!" },
    { id: "CDU004", requiredInSameCategory: [45, 114], categoryRequired: "dislikedLimit", unlocks: { type: "insight", amount: 3 }, description: "Boundary Wisdom! Clearly defining both Humiliation [45] and Watersports [114] as 'Boundaries Drawn' (Disliked/Limit) demonstrates self-awareness, granting 3 Insight." }
];

// --- Rituals & Milestones Data ---
const dailyRituals = [
    { id: "dr01", description: "Daily Zen Scribbles: Perform Free Meditation Research (tap ☆ in Workshop).", reward: { type: "insight", amount: 2 }, track: { action: "freeResearch", count: 1, period: "daily" } },
    { id: "dr02", description: "Curate Your Collection: Add 1 newly discovered Concept to your Grimoire.", reward: { type: "insight", amount: 3 }, track: { action: "addToGrimoire", count: 1, period: "daily" } },
    { id: "dr03", description: "A Moment's Reflection: Complete any Reflection prompt.", reward: { type: "insight", amount: 5 }, track: { action: "completeReflection", count: 1, period: "daily" } },
    { id: "dr04", description: "Shift Your Focus: Mark a new Concept as a Focus Thread (tap ☆).", reward: { type: "insight", amount: 4 }, track: { action: "markFocus", count: 1, period: "daily" } },
    { id: "dr05", description: "Invest in Knowledge: Conduct Insight-fueled Research in the Workshop.", reward: { type: "attunement", element: "All", amount: 0.2 }, track: { action: "conductResearch", count: 1, period: "daily" } },
    { id: "dr06", description: "Deepen Understanding: Unlock an Element Insight Level in the Persona Library.", reward: { type: "attunement", element: "All", amount: 0.5 }, track: { action: "unlockLibrary", count: 1, period: "daily"} },
    { id: "dr07", description: "Organize Your Thoughts: Move a Concept to a new Shelf in the Grimoire.", reward: { type: "insight", amount: 1 }, track: { action: "categorizeCard", count: 1, period: "daily"} } // Updated action name
];
const milestones = [
    // Basic Progression
    { id: "ms000", description: "Welcome, Alchemist! Completed the initial assessment.", reward: { type: "insight", amount: 5 }, track: { action: "completeQuestionnaire", count: 1 } },
    { id: "ms001", description: "First Concept Claimed! Your Grimoire opens!", reward: { type: "insight", amount: 5 }, track: { state: "discoveredConcepts.size", threshold: 1 } },
    { id: "ms002", description: "First Focus Thread Chosen! Your Tapestry begins.", reward: { type: "insight", amount: 8 }, track: { state: "focusedConcepts.size", threshold: 1 } },
    { id: "ms003", description: "Gaze Within: First Reflection Completed!", reward: { type: "insight", amount: 5 }, track: { action: "completeReflection", count: 1 } },
    { id: "ms004", description: "Into the Workshop: First Insight-fueled Research!", reward: { type: "insight", amount: 5 }, track: { action: "conductResearch", count: 1 } },
    { id: "ms005", description: "Shelf Sorter: Categorized your first Concept!", reward: { type: "insight", amount: 2 }, track: { action: "categorizeCard", count: 1 } },
    { id: "ms006", description: "Lore Seeker: Unlocked Level 1 Lore!", reward: { type: "insight", amount: 5 }, track: { action: "unlockLore", condition: "anyLevel", threshold: 1 } },

    // Collection Milestones
    { id: "ms010", description: "Budding Curator: 5 Concepts gathered!", reward: { type: "insight", amount: 10 }, track: { state: "discoveredConcepts.size", threshold: 5 } },
    { id: "ms011", description: "Growing Archive: 15 Concepts catalogued!", reward: { type: "insight", amount: 15 }, track: { state: "discoveredConcepts.size", threshold: 15 } },
    { id: "ms012", description: "Rare Jewel Unearthed! Discovered a Rare Concept!", reward: { type: "insight", amount: 15 }, track: { action: "discoverRareCard", count: 1 } },
    { id: "ms013", description: "Serious Collector: 25 Concepts! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "discoveredConcepts.size", threshold: 25 } },
    { id: "ms014", description: "Impressive Compendium: 40 Concepts!", reward: { type: "insight", amount: 25 }, track: { state: "discoveredConcepts.size", threshold: 40 } },
    { id: "ms015", description: "Master Curator: 55 Concepts! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "discoveredConcepts.size", threshold: 55 } },
    { id: "ms016", description: "The Grand Archive: 75 Concepts!", reward: { type: "insight", amount: 40 }, track: { state: "discoveredConcepts.size", threshold: 75 } },
    { id: "ms017", description: "Librarian of Desire: 100 Concepts! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "discoveredConcepts.size", threshold: 100 } },

    // Focus Milestones
    { id: "ms020", description: "Tapestry Weaver: 3 Concepts Focused!", reward: { type: "attunement", element: "All", amount: 1 }, track: { state: "focusedConcepts.size", threshold: 3 } },
    { id: "ms021", description: "Expanding Focus: 5 Concepts Focused! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "focusedConcepts.size", threshold: 5 } },
    { id: "ms022", description: "Intricate Weaving: 7 Focus Slots engaged!", reward: { type: "insight", amount: 25 }, track: { state: "focusedConcepts.size", threshold: 7 } },
    { id: "ms023", description: "Complex Patterns: 9 Focus Slots filled! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "focusedConcepts.size", threshold: 9 } },
    // *** BUG FIX ***: Removed Config dependency from threshold here. Logic updated to check this.
    { id: "ms024", description: "Tapestry Master: Max Focus Slots unlocked!", reward: { type: "insight", amount: 50 }, track: { state: "focusSlotsTotal" /* Threshold removed */ } },

    // Attunement & Research Milestones
    { id: "ms030", description: "Elemental Spark: Attunement 10+ in One Element!", reward: { type: "insight", amount: 15 }, track: { state: "elementAttunement", threshold: 10, condition: "any" } },
    { id: "ms031", description: "Balanced Flow: Attunement 5+ in ALL Seven Elements!", reward: { type: "insight", amount: 20 }, track: { state: "elementAttunement", threshold: 5, condition: "all" } },
    { id: "ms032", description: "Deepening Study: Unlocked Level 1 Insight for an Element.", reward: { type: "insight", amount: 5 }, track: { action: "unlockLibrary", count: 1} },
    { id: "ms033", description: "Elemental Initiate: Reached Level 2 Insight for One Element.", reward: { type: "insight", amount: 10 }, track: { state: "unlockedDeepDiveLevels", threshold: 2, condition: "any"} },
    { id: "ms034", description: "Elemental Adept: Attunement 50+ in One Element! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "elementAttunement", threshold: 50, condition: "any" } },
    { id: "ms035", description: "Elemental Scholar: Reached Level 3 Insight for One Element!", reward: { type: "insight", amount: 15 }, track: { state: "unlockedDeepDiveLevels", threshold: 3, condition: "any"} },
    { id: "ms036", description: "Harmonious Core: Attunement 25+ in ALL Elements! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "elementAttunement", threshold: 25, condition: "all" } },
    { id: "ms037", description: "Elemental Master: Attunement 90+ in One Element!", reward: { type: "insight", amount: 40 }, track: { state: "elementAttunement", threshold: 90, condition: "any" } },
    { id: "ms038", description: "Broad Foundations: Unlocked Level 1 Insight for ALL Seven Elements! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { state: "unlockedDeepDiveLevels", threshold: 1, condition: "all"} },
    // --- Resuming from here ---
    { id: "ms039", description: "Deep Lore Diver: Unlocked Lore Level 3 for any Concept!", reward: { type: "insight", amount: 15 }, track: { action: "unlockLore", condition: "level3", threshold: 1 } },

    // Reflection Milestones
    { id: "ms040", description: "Facing Shadows: Embraced a Dissonant Reflection!", reward: { type: "attunement", element: "All", amount: 1.5 }, track: { action: "completeReflectionDissonance", count: 1 } },
    { id: "ms041", description: "Introspective Soul: Completed 5 Reflections.", reward: { type: "insight", amount: 20 }, track: { action: "completeReflection", count: 5 } },
    { id: "ms042", description: "Open Mind: Allowed a Reflection to Nudge Your Scores!", reward: { type: "insight", amount: 10 }, track: { action: "scoreNudgeApplied", count: 1 } },
    { id: "ms043", description: "Seasoned Reflector: Completed 10 Reflections! (+1 Focus Slot!)", reward: { type: "increaseFocusSlots", amount: 1 }, track: { action: "completeReflection", count: 10 } },
    { id: "ms044", description: "Dedicated Delver: Completed 20 Reflections!", reward: { type: "insight", amount: 30 }, track: { action: "completeReflection", count: 20 } },

    // Repository & Action Milestones
    { id: "ms050", description: "Scene Scholar: Meditated on a Scene Blueprint.", reward: { type: "insight", amount: 10 }, track: { action: "meditateScene", count: 1 } },
    { id: "ms051", description: "Bold Alchemist: Attempted an Experiment!", reward: { type: "insight", amount: 15 }, track: { action: "attemptExperiment", count: 1 } },
    { id: "ms052", description: "Fragment Finder: Collected 3 Elemental Insights!", reward: { type: "attunement", element: "All", amount: 1.0 }, track: { state: "repositoryInsightsCount", threshold: 3 } },
    { id: "ms053", description: "Repository Rummager: Found 1 of Each Item Type!", reward: { type: "insight", amount: 20 }, track: { state: "repositoryContents", condition: "allTypesPresent" } },
    { id: "ms054", description: "Savvy Seller: Sold Your First Concept Card!", reward: { type: "insight", amount: 5 }, track: { action: "sellConcept", count: 1 } },
    { id: "ms055", description: "Shelf Sorter Supreme: Categorized 10 Concepts!", reward: { type: "insight", amount: 10 }, track: { action: "categorizeCard", count: 10 } }, // Changed tracking
    { id: "ms056", description: "Synergy Seeker: Unlocked a Focus-Driven Discovery!", reward: { type: "insight", amount: 15 }, track: { state: "unlockedFocusItems", threshold: 1 } },

    // Discovery Milestones with Rewards
    { id: "ms100", description: "Master of the Dance: Interaction Attunement 20+! (Gift: Concept 'Switching' [6] discovered!)", reward: { type: "discoverCard", cardId: 6 }, track: { state: "elementAttunement", element: "I", threshold: 20 } },
    { id: "ms101", description: "Mind Palace Explorer: Cognitive Attunement 20+! (Gift: Concept 'Fantasy Immersion' [14] discovered!)", reward: { type: "discoverCard", cardId: 14 }, track: { state: "elementAttunement", element: "C", threshold: 20 } },
    { id: "ms102", description: "Sensory Savant: Sensory Attunement 30+! (Gift: Concept 'Temperature Play' [88] discovered!)", reward: { type: "discoverCard", cardId: 88 }, track: { state: "elementAttunement", element: "S", threshold: 30 } },
    { id: "ms103", description: "Polarity Explorer: RoleFocus Attunement 20+! (Gift: Concepts 'Dominance (Psych)' [4] & 'Submission (Psych)' [5] discovered!)", reward: { type: "discoverMultipleCards", cardIds: [4, 5] }, track: { state: "elementAttunement", element: "RF", threshold: 20 } }, // RF Reward

    // Deprecated / Review
    // { id: "ms11", description: "Awakened Art! A Concept's deeper visual essence revealed!", reward: { type: "insight", amount: 20 }, track: { action: "evolveArt", count: 1 } },
    // { id: "ms42", description: "Art Connoisseur: Evolved Art for 3 Concepts!", reward: { type: "insight", amount: 30 }, track: { action: "evolveArt", count: 3 } },
];

// --- Data for Tapestry Narrative Generation ---
const elementInteractionThemes = { // Updated to potentially include RF
    "AI": "a dynamic blend where specific Attraction triggers strongly influence preferred Interaction roles, suggesting a focus on how desire plays out in explicit social dynamics or power exchanges.",
    "AS": "a focus where specific Attraction cues are powerfully linked to sought-after Sensory experiences, emphasizing the direct physical manifestation and feeling of desire.",
    "AP": "an exploration deeply linking Attraction triggers to fulfilling core Psychological needs, perhaps seeking specific relationship dynamics or partners to achieve emotional goals or security.",
    "AC": "a combination where Attraction is heavily filtered through a Cognitive lens, suggesting fascination with the 'idea' of a person/dynamic, enjoyment of intellectual sparks, or attraction driven by fantasy.",
    "AR": "a pairing where specific Attractions are carefully considered within defined (or desired) Relationship structures, exploring how potent desires fit into commitments, ethics, or fluid connections.",
    "ARF": "an attraction profile keenly aware of Role Focus dynamics, seeking partners or scenarios that match a desired energetic polarity.", // A + RF
    "IS": "a highly embodied focus on the physical feeling, rhythm, and flow of Interaction, where Sensory input (pleasure, pain, texture) heavily defines the quality of the power exchange, role-play, or connection.",
    "IP": "a significant focus on the Psychological underpinnings and motivations behind Interaction styles, exploring the 'why' of dominance, submission, caregiving, or collaboration, seeking emotional depth in the dance.",
    "IC": "an Interaction style heavily influenced and potentially directed by Cognitive elements like detailed scenarios, explicit rules, strategic mind games, or psychological analysis within the dynamic.",
    "IR": "a keen interest in how different Interaction styles (D/s, egalitarian, etc.) manifest, adapt, or are negotiated within various Relationship structures, from monogamous dyads to polyamorous networks or group play.",
    "IRF": "a strong emphasis on how Interaction styles directly map onto specific Role Focus polarities (Dominant, submissive, Switch).", // I + RF
    "SP": "a deep, often intense connection between specific Sensory experiences and Psychological fulfillment, perhaps using sensation for catharsis, grounding, testing trust, achieving release, or exploring vulnerability.",
    "SC": "where potent Sensory experiences are framed, enhanced, anticipated, or interpreted through Cognitive elements like detailed fantasy, specific mental states (subspace), anticipation, or ritualistic meaning.",
    "SR": "exploring how diverse Sensory preferences and practices (kinks, intensity levels) play out, are negotiated, or accommodated across various Relationship contexts, numbers of partners, or community norms.",
    "SRF": "using Sensory input as a primary tool or expression within specific Role Focus dynamics (e.g., sensation for control/submission).", // S + RF
    "PC": "a highly introspective and often complex focus, blending deep Psychological drives and needs with Cognitive exploration through intricate fantasy, self-analysis, meaning-making, or symbolic representation.",
    "PR": "where core Psychological needs (for intimacy, power, validation, security) are primarily sought, explored, or met through specific Relationship configurations, dynamics, or levels of commitment.",
    "PRF": "a deep Psychological need or drive manifesting strongly through a specific Role Focus (e.g., needing control, needing surrender).", // P + RF
    "CR": "a focus on the mental frameworks, agreements, negotiations, and intellectual structures of Relationships, perhaps enjoying defining terms, crafting detailed agreements, exploring theoretical models, or analyzing relational dynamics.",
    "CRF": "using Cognitive tools like rules, scenarios, or analysis to define and explore Role Focus dynamics.", // C + RF
    "RRF": "exploring how different Role Focus expressions (D/s/W) function or are navigated within various Relationship structures.", // R + RF
    // Add more complex 3-element themes if desired
    "AIS": "a highly embodied experience where specific Attractions trigger desired Interactions that are deeply felt through intense or specific Sensations.",
    "IPC": "a focus on Interaction dynamics driven by Psychological needs and explored through Cognitive frameworks like role-play or rules.",
    "PSR": "seeking Psychological safety and specific Sensory experiences within carefully chosen Relational structures.",
    "IRF": "an emphasis on Interaction styles directly mapping onto Role Focus polarities within specific Relationship contexts."
};

const cardTypeThemes = { // Slightly enhanced
    "Orientation": "defining the fundamental 'who' or 'what' naturally sparks your desire, shaping the initial vector of connection.",
    "Identity/Role": "exploring 'who you become' or 'how you embody energy' within intimacy, revealing core facets of self through dynamic expression.",
    "Practice/Kink": "the 'how' and 'what' of intimate expression – specific actions, techniques, and sensations – forming the vibrant palette of your desires.",
    "Psychological/Goal": "understanding the deeper 'why' – the underlying emotional needs and core motivations – driving your quest for connection and fulfillment.",
    "Relationship Style": "the 'structure' and context of connection – how bonds are formed, defined, and navigated – serving as the architecture of your intimate world."
};

// --- Onboarding Tasks (Now defined) ---
 const onboardingTasks = [
    { id: 'task01', phaseRequired: 1, title: "Step 1: Your Persona", description: "This is your <strong>Persona</strong> screen. It shows your core elemental scores (like Attraction, Interaction) based on the initial Experimentation. These scores reflect your innate tendencies.", hint: "Tap 'Persona' in the top navigation.", highlightElementId: "personaScreen" },
    { id: 'task02', phaseRequired: 2, title: "Step 2: The Workshop", description: "Now, let's visit the <strong>Workshop</strong>. This is your lab! Here you'll manage your discovered <strong>Concepts</strong> (in the Grimoire Library) and conduct <strong>Research</strong> to find new ones.", hint: "Tap 'Workshop' in the top navigation.", highlightElementId: "workshopScreen" },
    { id: 'task03', phaseRequired: 3, title: "Step 3: Research", description: "Under 'Research Bench', click any Element button (like <i class='fa-solid fa-magnet'></i> Attraction) to start. You have <strong>3 FREE</strong> research attempts!", hint: "Click an element button in the 'Research Bench' area.", highlightElementId: "element-research-buttons" },
    { id: 'task04', phaseRequired: 4, title: "Step 4: Your Grimoire", description: "Research results appear in a popup. Choose 'Keep' to add a Concept to your permanent <strong>Grimoire Library</strong> below. Selling gives you Insight <i class='fas fa-brain insight-icon'></i>, the main currency.", hint: "Click 'Keep' or 'Sell' on a discovered Concept card in the popup.", highlightElementId: "researchResultsPopup" }, // Highlight popup if possible, else workshop
    { id: 'task05', phaseRequired: 5, title: "Step 5: Focus Concepts", description: "In the Grimoire Library, click the ☆ star icon on a card (or 'Mark as Focus' in its detail popup) to add it to your <strong>Persona Tapestry</strong>. Focused Concepts shape your narrative.", hint: "Find a card in the 'Grimoire Library' grid and click its star ☆ icon.", highlightElementId: "grimoire-grid-workshop" },
    { id: 'task06', phaseRequired: 6, title: "Step 6: Weave Your Tapestry", description: "Return to the <strong>Persona</strong> screen. Notice how your 'Focused Concepts', 'Focus Themes', and 'Tapestry Narrative' have updated based on your choice!", hint: "Tap 'Persona' in the top navigation again.", highlightElementId: "personaScreen" },
    { id: 'task07', phaseRequired: 7, title: "Step 7: Seek Insight", description: "Adding concepts and other actions sometimes trigger <strong>Reflections</strong> (like this tutorial!). Confirming reflections grants Insight <i class='fas fa-brain insight-icon'></i> and Attunement. You can also 'Seek Guidance' in the Workshop.", hint: "Reflections appear in popups like this. Confirm when ready.", highlightElementId: "reflectionModal" }, // Highlight reflection modal if possible
    // Corrected Phase 8 text - No Config reference here! The number of phases is handled by logic.
    { id: 'task08', phaseRequired: 8, title: "Step 8: The Repository", description: "The <strong>Repository</strong> tracks Milestones, Daily Rituals, and special discoveries like Scene Blueprints or Experiments. Check back often! You're now ready to explore the Lab!", hint: "Tap 'Repository' in the top navigation.", highlightElementId: "repositoryScreen" }
 ];



// --- Elemental Dilemmas (Now includes RF) ---
 const elementalDilemmas = [
    // --- Attraction Focused ---
    { id: "ED_A01", elementFocus: ["A", "P"], situation: "An intense, almost purely physical or fetish-driven attraction [A] sparks towards someone. However, initial interactions suggest a significant lack of compatible values or potential for the deeper psychological connection [P] you typically need to feel truly fulfilled.", question: "Where does your energy naturally flow in deciding whether to pursue this connection further?", sliderMinLabel: "Prioritize Potential for Psychological Depth/Compatibility (Psychological Focus)", sliderMaxLabel: "Follow the Intense, Compelling Attraction Trigger (Attraction Focus)", elementKeyMin: "P", elementKeyMax: "A" },
    { id: "ED_A02", elementFocus: ["A", "R"], situation: "A new person enters your social sphere who strongly matches your specific 'type' or core attraction patterns [A]. Engaging with them, even platonically at first, feels like it could potentially create friction, jealousy, or violate agreements within your existing committed relationship structure [R].", question: "Your primary internal leaning is towards:", sliderMinLabel: "Prioritizing & Upholding Existing Relationship Stability/Agreements (Relational Focus)", sliderMaxLabel: "Exploring or Acknowledging the Potent New Attraction (Attraction Focus)", elementKeyMin: "R", elementKeyMax: "A" },
    { id: "ED_A03", elementFocus: ["A", "C"], situation: "You connect with someone whose mind is incredibly stimulating – their wit, intelligence, or creativity sets off major Sapiosexual sparks [A/C]. However, their physical appearance or self-presentation doesn't align with your usual visual attraction patterns or aesthetic preferences [A].", question: "How likely are you to initiate or pursue potential intimacy based on this?", sliderMinLabel: "Less Likely; Visual Cues/Aesthetics Remain Primary Gatekeepers (Attraction Focus)", sliderMaxLabel: "More Likely; The Powerful Mental/Cognitive Spark Overrides Visual Preferences (Cognitive/Attraction Blend)", elementKeyMin: "A", elementKeyMax: "C" },
    // --- Interaction Focused ---
    { id: "ED_I01", elementFocus: ["I", "S"], situation: "During an established D/s scene where you are Dominant [I], your submissive partner requests a specific, intense sensation [S] (e.g., heavier impact, a type of pain play) that you are unfamiliar with or slightly uncomfortable delivering, though it technically fits the dynamic.", question: "Your immediate inclination in that moment is to:", sliderMinLabel: "Prioritize Your Comfort/Familiarity with Delivering the Sensation (Sensory/Self Focus)", sliderMaxLabel: "Fulfill the Role/Dynamic Expectation & Partner's Request (Interaction Focus)", elementKeyMin: "S", elementKeyMax: "I" },
    { id: "ED_I02", elementFocus: ["I", "P"], situation: "You naturally gravitate towards a highly structured, commanding, or protocol-heavy interaction style [High I]. However, you sense your current partner deeply needs more overt nurturing, reassurance, and psychological validation [High P need] in this moment to feel safe and connected.", question: "How do you adapt your interaction style right now?", sliderMinLabel: "Intentionally Shift Towards Nurturing & Providing Reassurance (Psychological Focus)", sliderMaxLabel: "Maintain Your Preferred Interaction Structure/Role Integrity (Interaction Focus)", elementKeyMin: "P", elementKeyMax: "I" },
    { id: "ED_I03", elementFocus: ["I", "RF"], situation: "You strongly identify as a Switch [Mid RF], enjoying fluidity. Your partner expresses a desire for a scene where you commit *fully* to either a Dominant or submissive role [High/Low RF] for the entire duration, without switching.", question: "Your response leans towards:", sliderMinLabel: "Committing Fully to One Defined Role for the Scene (Role Focus Alignment with Partner)", sliderMaxLabel: "Negotiating for Moments of Fluidity/Switching Within the Scene (Interaction/Self Focus)", elementKeyMin: "RF", elementKeyMax: "I" }, // RF Dilemma
    // --- Sensory Focused ---
    { id: "ED_S01", elementFocus: ["S", "P"], situation: "You have a strong craving for intense physical sensation [High S], perhaps for stress relief [P] or catharsis. However, your partner is feeling emotionally vulnerable and primarily expresses a need for gentle, comforting touch [Low S] and psychological safety [High P].", question: "For this specific encounter, you choose to prioritize:", sliderMinLabel: "Providing Gentle Comfort & Prioritizing Partner's Psychological Safety (Psychological Focus)", sliderMaxLabel: "Finding a way (perhaps solo later?) to Seek Your Desired Intense Sensation (Sensory Focus)", elementKeyMin: "P", elementKeyMax: "S" },
    { id: "ED_S02", elementFocus: ["S", "R"], situation: "An exciting opportunity arises for a high-sensation group play scenario (e.g., a BDSM play party) that promises novel sensory experiences [High S]. However, participating might push the boundaries of agreements or cause discomfort within your primary relationship(s) [R].", question: "Your decision-making process is most heavily weighted towards:", sliderMinLabel: "Protecting Existing Relationship Harmony & Honoring Agreements (Relational Focus)", sliderMaxLabel: "Pursuing the Novel and Exciting Sensory Experience Opportunity (Sensory Focus)", elementKeyMin: "R", elementKeyMax: "S" },
    // --- Psychological Focused ---
    { id: "ED_P01", elementFocus: ["P", "RF"], situation: "You harbor a deep psychological need for experiences involving surrender and vulnerability [High P-Sub]. Your partner, while caring, identifies strongly as Dominant [High RF] but expresses discomfort with scenarios that feel overly 'helpless' or 'infantilizing' for you.", question: "When negotiating scenes, you tend to focus on:", sliderMinLabel: "Finding Surrender Scenarios that Align with Partner's Dominant Comfort Zone (RoleFocus Harmony)", sliderMaxLabel: "Seeking Ways to Explore the Specific Quality of Helplessness You Need (Psychological Focus)", elementKeyMin: "RF", elementKeyMax: "P" }, // RF Dilemma
    { id: "ED_P02", elementFocus: ["P", "C"], situation: "Engaging in a specific, detailed fantasy scenario [C] is crucial for your psychological fulfillment—perhaps it makes you feel truly desired, powerful, or allows exploration of a core theme [P]. Your partner, however, finds deep fantasy immersion difficult, distracting, or prefers staying present.", question: "When seeking satisfaction, the priority becomes:", sliderMinLabel: "Focusing on Shared Reality & Finding Connection in Present Cognitive/Emotional Exchange (Cognitive/Presence Focus)", sliderMaxLabel: "Ensuring Your Core Psychological Need is Met, Likely Through the Fantasy (Psychological Focus)", elementKeyMin: "C", elementKeyMax: "P" },
    // --- Cognitive Focused ---
    { id: "ED_C01", elementFocus: ["C", "S"], situation: "Your intricately planned fantasy or role-play scenario [High C] requires specific physical actions, props, or positioning that might be slightly uncomfortable, awkward, or disrupt a smooth, flowing sensory [S] experience for one or both partners.", question: "In executing the scene, you find yourself prioritizing:", sliderMinLabel: "Maintaining Comfortable Sensory Flow, Physical Presence & Adaptability (Sensory Focus)", sliderMaxLabel: "Executing the Cognitive Fantasy Accurately for Maximum Mental Immersion (Cognitive Focus)", elementKeyMin: "S", elementKeyMax: "C" },
    { id: "ED_C02", elementFocus: ["C", "RF"], situation: "You enjoy crafting complex, rule-heavy scenarios [High C]. A partner who identifies as submissive [Low RF] expresses feeling overwhelmed by the cognitive load of remembering all the protocols, finding it hinders their ability to relax into the role.", question: "To enhance the experience for both, you are more inclined to:", sliderMinLabel: "Simplify the Rules/Protocols to Facilitate Deeper Role Embodiment (Role Focus Support)", sliderMaxLabel: "Maintain the Cognitive Complexity, Perhaps Offering More Guidance/Reminders (Cognitive Focus)", elementKeyMin: "RF", elementKeyMax: "C" }, // RF Dilemma
    // --- Relational Focused ---
    { id: "ED_R01", elementFocus: ["R", "A"], situation: "You are content and committed within a happily monogamous relationship structure [Low R score area]. Unexpectedly, you develop a strong, persistent, and potentially disruptive romantic or sexual attraction [A] towards a close friend or colleague.", question: "Your primary internal conflict and focus centers on:", sliderMinLabel: "Understanding & Navigating the Nature of These New Feelings/Attraction Patterns (Attraction Focus)", sliderMaxLabel: "Honoring Your Existing Commitment & Maintaining the Integrity of Your Relationship Structure (Relational Focus)", elementKeyMin: "A", elementKeyMax: "R" },
    { id: "ED_R02", elementFocus: ["R", "I"], situation: "You actively practice Relationship Anarchy [High R], deeply valuing autonomy and rejecting pre-defined roles or hierarchies. However, a partner expresses a strong desire for a more defined, perhaps traditional, D/s dynamic involving specific protocols and titles [High I].", question: "Your response prioritizes finding a path that emphasizes:", sliderMinLabel: "Exploring and Accommodating the Desired Interaction Dynamic Within Your Connection (Interaction Focus)", sliderMaxLabel: "Maintaining Your Core Principles of Relational Autonomy & Resisting Imposed Structures (Relational Focus)", elementKeyMin: "I", elementKeyMax: "R" },
     // --- RoleFocus Focused ---
    { id: "ED_RF01", elementFocus: ["RF", "P"], situation: "You strongly identify as Dominant [High RF] and derive satisfaction from control. A partner expresses a deep psychological need [P] to occasionally challenge your authority playfully ('bratting') to feel engaged and test boundaries.", question: "Your internal reaction to this challenge is primarily:", sliderMinLabel: "Appreciation for the Engagement & Understanding the Partner's Need (Psychological Attunement)", sliderMaxLabel: "Assertion of Authority & Maintaining the Defined Power Structure (Role Focus Integrity)", elementKeyMin: "P", elementKeyMax: "RF" },
    { id: "ED_RF02", elementFocus: ["RF", "S"], situation: "As someone who leans submissive [Low RF], you find deep release in intense sensation [High S]. Your Dominant partner, however, prefers scenes focused more on psychological control, service, or restriction, rather than heavy sensation play.", question: "When negotiating, you find yourself advocating more strongly for:", sliderMinLabel: "Aligning with the Partner's Preferred Dominant Style (Role Focus Alignment)", sliderMaxLabel: "Incorporating the Intense Sensations You Crave (Sensory Focus)", elementKeyMin: "RF", elementKeyMax: "S" }
];


// --- FINAL EXPORT BLOCK ---
export {
    // Core Data
    elementDetails, concepts, elementKeyToFullName, elementNameToKey, cardTypeKeys, elementNames,
    // Gameplay Data
    questionnaireGuided, reflectionPrompts, elementDeepDive, focusRituals, dailyRituals, milestones,
    // Repository Items
    sceneBlueprints, alchemicalExperiments, elementalInsights,
    // Unlock Mechanisms
    focusDrivenUnlocks, categoryDrivenUnlocks,
    // UI/Config Helpers
    onboardingTasks, elementInteractionThemes, cardTypeThemes, grimoireShelves, elementalDilemmas
};

console.log("data.js FULLY loaded... RoleFocus integrated, concepts updated, tasks defined! (v4.3)");
// --- END OF CORRECTED data.js (v4.3) ---
