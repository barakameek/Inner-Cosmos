function handleToggleAlignment() {
    if (currentlyDisplayedStarId === null) return;
    const starId = currentlyDisplayedStarId;
    const initialFocusCount = State.getFocusedConcepts().size;
    const result = State.toggleFocusConcept(starId);

    const starName = State.getDiscoveredConceptData(starId)?.concept?.name || `Star ID ${starId}`;
    if (result === 'not_discovered' || result === 'slots_full') {
        // ... (error messages if not discovered or no slots) ...
    } else {
        // Prepare star data for attunement update
        const star = State.getDiscoveredConceptData(starId)?.concept;
        gainAttunementForAction('alignStar', star?.primaryElement, 1.0);
        // --- Update UI ---
        UI.updateAlignStarButtonStatus(starId);
        UI.displayAlignedStars();
        UI.updateConstellationResonance();
        calculateConstellationNarrative(true);
        UI.displayConstellationNarrative();
        UI.displayConstellationThemes();
        checkForSynergyUnlocks();
        UI.refreshStarCatalogDisplay();
        UI.updateConstellationExploreButton();
        UI.updateSuggestBlueprintButtonState();
        …
    }
}
…
// --- Constellation Calculation Logic Helpers ---
function calculateAlignmentScores() {
    const scores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
    State.getFocusedConcepts().forEach(id => {
        const data = State.getDiscoveredConceptData(id);
        if (data?.concept?.elementScores) {
            for (const key in scores) {
                if (Object.hasOwn(data.concept.elementScores, key)) {
                    scores[key] += data.concept.elementScores[key];
                }
            }
        }
    });
    return { focusScores: scores };
}

function calculateConstellationNarrative(forceRecalculate = false) {
    if (forceRecalculate || !currentConstellationAnalysis) {
        const focused = State.getFocusedConcepts();
        if (focused.size === 0) {
            currentConstellationAnalysis = null;
            return "";
        }
        // Sum element scores of all aligned stars
        const totalScores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
        focused.forEach(id => {
            const data = State.getDiscoveredConceptData(id);
            if (data?.concept?.elementScores) {
                for (const key in totalScores) {
                    if (Object.hasOwn(data.concept.elementScores, key)) {
                        totalScores[key] += data.concept.elementScores[key];
                    }
                }
            }
        });
        // Identify top one or two forces
        const sorted = Object.entries(totalScores)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, sum]) => sum > 0);
        let narrative = "";
        if (sorted.length === 0) {
            narrative = "Your focused stars show a balanced, subtle essence.";
        } else {
            const [topKey] = sorted[0];
            const topForceName = elementKeyToFullName[topKey] || topKey;
            // Find an aligned star representing the top force
            let topConceptName = "";
            for (let id of focused) {
                const concept = State.getDiscoveredConceptData(id)?.concept;
                if (concept?.primaryElement === topKey) {
                    topConceptName = concept.name;
                    break;
                }
            }
            narrative = `Your constellation resonates strongly with <strong>${topForceName}</strong>`;
            narrative += topConceptName 
                ? `, reflected in your focus on <strong>${topConceptName}</strong>. ` 
                : ". ";
            if (sorted.length > 1) {
                const [secondKey] = sorted[1];
                const secondForceName = elementKeyToFullName[secondKey] || secondKey;
                let secondConceptName = "";
                for (let id of focused) {
                    const concept = State.getDiscoveredConceptData(id)?.concept;
                    if (concept?.primaryElement === secondKey) {
                        secondConceptName = concept.name;
                        break;
                    }
                }
                narrative += `Undercurrents of <strong>${secondForceName}</strong> add complexity`;
                narrative += secondConceptName 
                    ? ` through <strong>${secondConceptName}</strong>.` 
                    : ".";
            }
        }
        currentConstellationAnalysis = { fullNarrativeHTML: narrative };
    }
    return currentConstellationAnalysis?.fullNarrativeHTML || "";
}

function calculateDominantForces() {
    const focused = State.getFocusedConcepts();
    if (focused.size === 0) return [];
    const counts = {};
    focused.forEach(id => {
        const concept = State.getDiscoveredConceptData(id)?.concept;
        if (concept?.primaryElement) {
            counts[concept.primaryElement] = (counts[concept.primaryElement] || 0) + 1;
        }
    });
    return Object.entries(counts)
        .map(([key, count]) => ({
            key,
            name: elementKeyToFullName[key] || key,
            count
        }))
        .sort((a, b) => b.count - a.count);
}
