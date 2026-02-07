// js/main.js - Main Game Initialization and Flow (v5.1 - Mirror Quiz Integration)

// --- Core Imports ---
import { GameState } from './core/GameState.js';
import { MetaProgression } from './meta/MetaProgression.js';
import { UIManager } from './ui/UIManager.js';
import { QuizManager } from './core/QuizManager.js'; // NEW: Import QuizManager

// Import data - Needed early for defaults maybe, or passed down
import * as Data from '../data.js'; // Correct path: up from js/ to root

// --- Global Game Object (for state management and debugging) ---
const personaLabyrinth = {
    gameState: null,
    uiManager: null,
    metaProgression: null,
    quizManager: null, // Optional: Keep reference if needed outside run start
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const slots = ["3:30 PM", "4:30 PM", "5:30 PM"];
const takenSlots = ["Tuesday-4:30 PM", "Thursday-3:30 PM"];

const studio = {
  students: [
    {
      id: "ava",
      name: "Ava",
      age: 9,
      instruments: ["Piano", "Singing"],
      levels: { Piano: "Beginner 2", Singing: "Grade 1" },
      learned: ["Twinkle Variations", "Ode to Joy"],
      current: ["Minuet in G"],
      future: ["Let It Go"],
      events: ["Piano Mock Exam - 22 Jul", "Studio Performance - 3 Aug"],
      notes: ["Posture improved, keep curved fingers.", "Practice 15 min daily."],
      files: ["Ava-Minute-Waltz.pdf", "Ava-practice-week3.mp3"],
      fees: 320,
      paid: 220,
    },
    {
      id: "liam",
      name: "Liam",
      age: 12,
      instruments: ["Flute", "Saxophone"],
      levels: { Flute: "Grade 2", Saxophone: "Beginner 1" },
      learned: ["Amazing Grace"],
      current: ["Greensleeves"],
      future: ["Pink Panther Theme"],
      events: ["Flute Exam - 18 Sep"],
      notes: ["Focus on controlled breathing.", "Rhythm reading is improving."],
      files: ["Liam-breathing-notes.pdf"],
      fees: 280,
      paid: 280,
    },
  ],
  transactions: [
    { type: "fee", student: "Ava", instrument: "Piano", amount: 160, date: "2026-06-02" },
    { type: "fee", student: "Ava", instrument: "Singing", amount: 160, date: "2026-06-02" },
    { type: "payment", student: "Ava", amount: 220, date: "2026-06-16" },
    { type: "fee", student: "Liam", instrument: "Flute", amount: 140, date: "2026-06-01" },
    { type: "fee", student: "Liam", instrument: "Saxophone", amount: 140, date: "2026-06-01" },
    { type: "payment", student: "Liam", amount: 280, date: "2026-06-15" },
  ],
};
window.personaLabyrinth = personaLabyrinth; // Make accessible in browser console

// --- Initialization Function ---
function initGame() {
    console.log("Persona Labyrinth: Initializing Game...");

    try {
        // 1. Initialize Meta Progression (Loads saved data or sets defaults)
        personaLabyrinth.metaProgression = new MetaProgression();

        // 2. Initialize UI Manager (Finds elements, sets up common listeners)
        personaLabyrinth.uiManager = new UIManager('gameContainer');

        // 3. Setup Main Menu Listeners (Done AFTER UIManager is created)
        setupMainMenuListeners();

        // 4. Show Main Menu initially
        personaLabyrinth.uiManager.showScreen('mainMenuScreen');

        console.log("Persona Labyrinth: Initialization Complete. Ready.");

    } catch (error) {
        console.error("FATAL ERROR during game initialization:", error);
        const container = document.getElementById('gameContainer');
        if (container) {
            container.innerHTML = `<div style="padding: 30px; text-align: center; color: red;">
                <h1>Initialization Error</h1>
                <p>Persona Labyrinth could not start. Please check the console (F12) for details.</p>
                <p>${error.message}</p>
            </div>`;
        }
        document.getElementById('mainMenuScreen')?.classList?.add('active');
    }
}

// --- Game Start Function (Modified for Mirror Quiz) ---
function startNewRun() {
    console.log("Attempting to start new run...");
    if (!personaLabyrinth.uiManager || !personaLabyrinth.metaProgression) {
        console.error("Cannot start run: UIManager or MetaProgression not initialized.");
        alert("Error: Core managers not ready. Cannot start run.");
        return;
    }
    if (personaLabyrinth.gameState && personaLabyrinth.gameState.runActive) {
         if (!confirm("A run is currently active. Starting a new run will abandon the current one. Continue?")) {
              return; // Abort if user cancels
         }
         console.warn("Abandoning active run to start a new one.");
         personaLabyrinth.gameState.cleanupRun(); // Clean up the old state
         personaLabyrinth.gameState = null; // Clear reference
    }

    // --- Mirror Quiz Logic ---
    // Create a QuizManager instance for this run attempt
    const quizManager = new QuizManager();
    personaLabyrinth.quizManager = quizManager; // Store globally if needed for debugging

    // Define the function that proceeds *after* the quiz is done (or skipped)
    const proceedToRun = (quizResult) => {
        console.log("Proceeding to start run...");
        let playerData = {}; // Base player data for GameState

        // Apply quiz results if they exist
        if (quizResult) {
            console.log("Applying Quiz Result to Player Data for GameState:", quizResult);
            // These will be used by the Player constructor via GameState
            playerData.startingDeck = quizResult.startingDeckIds;
            playerData.attunements = quizResult.attunementBonus;
        } else {
            console.log("Starting run without quiz results (skipped or error). Using defaults.");
            // Player constructor will use defaults if playerData lacks these keys
        }

        const selectedAscension = personaLabyrinth.metaProgression.currentAscension || 0;
        // Note: Ascension level isn't passed directly to GameState/Player constructor currently,
        // MetaProgression holds it, and Player/MapManager read from MetaProgression instance.

        try {
            // 1. Create a NEW GameState instance for this run, passing merged player data
            personaLabyrinth.gameState = new GameState(
                playerData, // Contains quiz results (deck, attunements) if completed
                personaLabyrinth.metaProgression,
                personaLabyrinth.uiManager
            );

            // 2. Set references AFTER all core objects are created
            // Link GameState to UI/Meta (already done), link UI back to GameState
            personaLabyrinth.uiManager.setReferences(personaLabyrinth.gameState, personaLabyrinth.metaProgression);

            // 3. Start the run process within GameState
            // This handles Player creation (using playerData), Map generation, UI updates, etc.
            personaLabyrinth.gameState.startRun(playerData, personaLabyrinth.metaProgression, personaLabyrinth.uiManager);

            console.log("Run successfully started.");

        } catch (error) {
             console.error("CRITICAL ERROR during GameState creation or startRun:", error);
             alert("Error starting the run. Please check console and refresh.");
             // Attempt to return to main menu safely
             personaLabyrinth.uiManager?.showScreen('mainMenuScreen');
             personaLabyrinth.gameState?.cleanupRun(); // Clean up potentially partial state
             personaLabyrinth.gameState = null;
        }
    };

    // Show the quiz screen via UIManager, providing the quiz instance and the callback
    console.log("Showing Mirror Quiz...");
    try {
        personaLabyrinth.uiManager.showMirrorQuiz(quizManager, (result) => {
            // This callback function is executed by UIManager when the quiz is finished or cancelled
            proceedToRun(result); // Pass the quiz result (or null if cancelled)
        });
    } catch (error) {
        console.error("Error trying to show Mirror Quiz:", error);
        alert("Could not start the initial reflection quiz. Starting with defaults.");
        proceedToRun(null); // Proceed with default start if quiz fails to show
    }
    // --- End Mirror Quiz Logic ---

    // Note: The actual creation of GameState and starting the run
    // now happens *inside* the `proceedToRun` callback function.
}


// --- Load Game Function (Placeholder) ---
function loadSavedRun() {
    console.log("Load Game button clicked - Functionality not implemented yet.");
    personaLabyrinth.uiManager?.showActionFeedback("Load Game Not Implemented", "warning");
    // TODO: Implement loading saved GameState data from localStorage
const selectedSet = new Set();
const calendarGrid = document.getElementById("calendarGrid");
const selectedSlots = document.getElementById("selectedSlots");
const availabilitySummary = document.getElementById("availabilitySummary");

function renderCalendar() {
  calendarGrid.innerHTML = "";
  days.forEach((day) => {
    const col = document.createElement("div");
    col.className = "day-column";
    col.innerHTML = `<strong>${day}</strong>`;
    slots.forEach((time) => {
      const key = `${day}-${time}`;
      const btn = document.createElement("button");
      btn.className = "slot";
      btn.textContent = time;
      if (takenSlots.includes(key)) btn.classList.add("taken");
      if (selectedSet.has(key)) btn.classList.add("selected");
      btn.disabled = takenSlots.includes(key);
      btn.onclick = () => {
        selectedSet.has(key) ? selectedSet.delete(key) : selectedSet.add(key);
        renderCalendar();
      };
      col.appendChild(btn);
    });
    calendarGrid.appendChild(col);
  });
  selectedSlots.innerHTML = [...selectedSet].map((s) => `<li>${s}</li>`).join("") || "<li>No slots selected yet.</li>";

  availabilitySummary.innerHTML = days
    .map((day) => {
      const free = slots.filter((time) => !takenSlots.includes(`${day}-${time}`)).length;
      return `<li>${day}: ${free} free slot(s)</li>`;
    })
    .join("");
}

// --- Show Meta Screen ---
function showMetaScreen() {
    if (!personaLabyrinth.uiManager) return;
    console.log("Showing Meta Progression Screen...");
    personaLabyrinth.uiManager.showScreen('metaScreen'); // UIManager handles rendering content
const studentSelect = document.getElementById("studentSelect");
const feeStudent = document.getElementById("feeStudent");
const paymentStudent = document.getElementById("paymentStudent");
const feeInstrument = document.getElementById("feeInstrument");
let activeStudent = null;

function populateStudentSelects() {
  const options = studio.students
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join("");
  studentSelect.innerHTML = options;
  feeStudent.innerHTML = options;
  paymentStudent.innerHTML = options;
}

// --- Show Settings Screen (Placeholder) ---
function showSettingsScreen() {
    console.log("Settings button clicked - Functionality not implemented yet.");
    personaLabyrinth.uiManager?.showActionFeedback("Settings Not Implemented", "warning");
    // TODO: Implement settings screen UI and logic
function loadStudent() {
  activeStudent = studio.students.find((s) => s.id === studentSelect.value);
  document.getElementById("studentDashboard").classList.remove("hidden");
  document.getElementById("studentOverview").textContent = `${activeStudent.name}, age ${activeStudent.age}. Instruments: ${activeStudent.instruments.join(", ")}.`;
  document.getElementById("levelsList").innerHTML = Object.entries(activeStudent.levels)
    .map(([inst, level]) => `<li>${inst}: ${level}</li>`)
    .join("");
  document.getElementById("eventsList").innerHTML = activeStudent.events.map((e) => `<li>${e}</li>`).join("");
  document.getElementById("learnedMusic").textContent = activeStudent.learned.join(", ");
  document.getElementById("currentMusic").textContent = activeStudent.current.join(", ");
  document.getElementById("futureMusic").textContent = activeStudent.future.join(", ");
  document.getElementById("lessonNotes").innerHTML = activeStudent.notes.map((n) => `<li>${n}</li>`).join("");
  document.getElementById("privateFiles").innerHTML = activeStudent.files.map((f) => `<li>Private file: ${f}</li>`).join("");

  const outstanding = activeStudent.fees - activeStudent.paid;
  document.getElementById("feeStats").innerHTML = `
    <li>Total owed: $${activeStudent.fees}</li>
    <li>Total paid: $${activeStudent.paid}</li>
    <li><strong>Outstanding: $${outstanding}</strong></li>`;
  document.getElementById("studentPrompt").textContent = outstanding > 0 ? `Payment due: $${outstanding}` : "All fees up to date. Great work!";

  feeInstrument.innerHTML = activeStudent.instruments
    .concat(["Piano", "Flute", "Saxophone", "Singing"])
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .map((i) => `<option value="${i}">${i}</option>`)
    .join("");
}

// --- Setup Main Menu Event Listeners ---
function setupMainMenuListeners() {
    const ui = personaLabyrinth.uiManager;
    if (!ui) return;

    if (ui.startGameButton) {
        ui.startGameButton.onclick = startNewRun;
    } else { console.warn("Start Game button not found."); }

    if (ui.loadGameButton) {
        ui.loadGameButton.onclick = loadSavedRun;
    } else { console.warn("Load Game button not found."); }
function renderFinance() {
  const balancesList = document.getElementById("balancesList");
  balancesList.innerHTML = studio.students
    .map((s) => `<li>${s.name}: paid $${s.paid} / owed $${s.fees} (balance $${s.fees - s.paid})</li>`)
    .join("");

  const byStudent = {};
  const byInstrument = {};
  let totalIncome = 0;
  studio.transactions.forEach((t) => {
    if (t.type === "payment") {
      totalIncome += t.amount;
      byStudent[t.student] = (byStudent[t.student] || 0) + t.amount;
    }
    if (t.type === "fee") {
      byInstrument[t.instrument] = (byInstrument[t.instrument] || 0) + t.amount;
    }
  });

    if (ui.metaProgressionButton) {
        ui.metaProgressionButton.onclick = showMetaScreen;
    } else { console.warn("Meta Progression button not found."); }
  document.getElementById("moneyMovement").innerHTML = `
    <li>Total income received: $${totalIncome}</li>
    ${Object.entries(byStudent).map(([s, amount]) => `<li>Income from ${s}: $${amount}</li>`).join("")}
    ${Object.entries(byInstrument).map(([i, amount]) => `<li>Fees raised for ${i}: $${amount}</li>`).join("")}
  `;
}

    if (ui.settingsButton) {
        ui.settingsButton.onclick = showSettingsScreen;
         ui.settingsButton.disabled = true; // Disable until implemented
    } else { console.warn("Settings button not found."); }
document.getElementById("loadStudent").onclick = loadStudent;
document.getElementById("addSuggestion").onclick = () => {
  if (!activeStudent) return;
  const input = document.getElementById("musicSuggestion");
  if (!input.value.trim()) return;
  activeStudent.future.push(input.value.trim());
  input.value = "";
  loadStudent();
};

    if (ui.backToMenuButton) {
        ui.backToMenuButton.onclick = () => ui.showScreen('mainMenuScreen');
    } else { console.warn("Back to Menu button (Meta Screen) not found."); }
}
document.getElementById("addFee").onclick = () => {
  const student = studio.students.find((s) => s.id === feeStudent.value);
  const amount = Number(document.getElementById("feeAmount").value);
  const instrument = feeInstrument.value;
  if (!student || !amount) return;
  student.fees += amount;
  studio.transactions.push({ type: "fee", student: student.name, instrument, amount, date: new Date().toISOString().slice(0, 10) });
  renderFinance();
  if (activeStudent?.id === student.id) loadStudent();
};

document.getElementById("addPayment").onclick = () => {
  const student = studio.students.find((s) => s.id === paymentStudent.value);
  const amount = Number(document.getElementById("paymentAmount").value);
  if (!student || !amount) return;
  student.paid += amount;
  studio.transactions.push({ type: "payment", student: student.name, amount, date: new Date().toISOString().slice(0, 10) });
  renderFinance();
  if (activeStudent?.id === student.id) loadStudent();
};

// --- Wait for DOM Load & Start Game ---
document.addEventListener('DOMContentLoaded', initGame);
populateStudentSelects();
renderCalendar();
renderFinance();
loadStudent();
