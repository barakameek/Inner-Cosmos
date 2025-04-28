// js/core/QuizManager.js

// Import quiz data from data.js
import * as Data from '../../data.js'; // Adjust path as needed from js/core to root

/**
 * Manages the state and logic for the pre-run Mirror Quiz.
 */
export class QuizManager {
    constructor() {
        if (!Data.quizQuestions || !Data.QUIZ_MAP) {
            throw new Error("QuizManager Error: Quiz questions or mapping data not found in data.js!");
        }
        this.questions = Data.quizQuestions;
        this.questionMap = Data.QUIZ_MAP;
        this.currentIndex = 0;
        this.answers = {}; // Stores { questionId: choiceValue }

        console.log("QuizManager initialized with", this.questions.length, "questions.");
    }

    /**
     * Gets the current question object based on the internal index.
     * @returns {object | null} The current question object or null if quiz is done.
     */
    getCurrentQuestion() {
        if (this.isComplete()) {
            return null;
        }
        return this.questions[this.currentIndex];
    }

    /**
     * Records the player's answer for the current question and advances the index.
     * @param {string} choiceValue - The 'value' string associated with the chosen answer.
     */
    answerCurrentQuestion(choiceValue) {
        const currentQ = this.getCurrentQuestion();
        if (currentQ) {
            // Validate choiceValue against available choices (optional but good practice)
            const isValidChoice = currentQ.choices.some(choice => choice.value === choiceValue);
            if (!isValidChoice) {
                console.error(`QuizManager Error: Invalid choice value '${choiceValue}' for question ID '${currentQ.id}'.`);
                return; // Don't record invalid choice
            }

            this.answers[currentQ.id] = choiceValue;
            this.currentIndex++;
            console.log(`Quiz: Answered ${currentQ.id} with '${choiceValue}'. Progress: ${this.currentIndex} / ${this.questions.length}`);
        } else {
            console.warn("QuizManager: Tried to answer question when quiz is already complete.");
        }
    }

    /**
     * Checks if all questions in the quiz have been answered.
     * @returns {boolean} True if the quiz is complete, false otherwise.
     */
    isComplete() {
        return this.currentIndex >= this.questions.length;
    }

    /**
     * Calculates the starting deck modifications and attunement bonuses based on stored answers.
     * Should only be called after isComplete() returns true.
     * @returns {{ startingDeckIds: number[], attunementBonus: object } | null} An object containing the results, or null if the quiz is not complete.
     */
    getDraftResult() {
        if (!this.isComplete()) {
            console.warn("QuizManager: Cannot get draft result, quiz is not complete.");
            return null;
        }

        // Define base starter cards (should match Player defaults ideally)
        let startingDeckIds = [10001, 10002, 10003]; // Basic Strike, Defend, Clarity
        // Initialize base attunement bonuses (all zero)
        let attunementBonus = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 };

        console.log("QuizManager: Calculating draft result from answers:", this.answers);

        // Iterate through the recorded answers
        for (const questionId in this.answers) {
            const choiceValue = this.answers[questionId];
            const questionMapping = this.questionMap[questionId];

            if (questionMapping && questionMapping[choiceValue]) {
                const reward = questionMapping[choiceValue];

                // Add awarded card IDs
                if (reward.cards && Array.isArray(reward.cards)) {
                    reward.cards.forEach(cardId => {
                        // Basic check if cardId is a number
                        if (typeof cardId === 'number') {
                            startingDeckIds.push(cardId);
                        } else {
                            console.warn(`QuizMap Error: Invalid card ID found for ${questionId} -> ${choiceValue}:`, cardId);
                        }
                    });
                }

                // Add attunement points
                if (reward.att && Array.isArray(reward.att)) {
                    reward.att.forEach(elementKey => {
                        if (attunementBonus.hasOwnProperty(elementKey)) {
                            attunementBonus[elementKey]++;
                        } else {
                            console.warn(`QuizMap Error: Invalid element key '${elementKey}' found for ${questionId} -> ${choiceValue}.`);
                        }
                    });
                }
            } else {
                // This indicates an issue with the QUIZ_MAP structure in data.js
                console.warn(`QuizMap Warning: No mapping found for question '${questionId}', choice '${choiceValue}'. Check data.js.`);
            }
        }

        // Post-processing (optional):
        // - Ensure deck size limits? (Probably not needed for starting draft)
        // - Ensure card ID uniqueness? (Probably not needed for starting draft)
        // - Validate that resulting card IDs exist in Data.concepts? (Good idea, but maybe handle in GameState/Player)

        const result = { startingDeckIds, attunementBonus };
        console.log("QuizManager: Final Draft Result:", result);
        return result;
    }

    /**
     * Resets the quiz state to start over (e.g., if the player backs out).
     */
    resetQuiz() {
        this.currentIndex = 0;
        this.answers = {};
        console.log("QuizManager: Quiz state reset.");
    }
}
// --- END OF FILE QuizManager.js ---
