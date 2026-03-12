import { auth, db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, setDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. GAME CONFIG ---
const DAILY_LIMIT = 5;
const XP_PER_TASK = 5;
const TOTAL_TASKS = 100; // 20 Days * 5 Tasks

// --- 2. MISSION CURRICULUM (Beginner to Advanced) ---
const missions = [
    // --- DAY 1: HTML Basics ---
    { id: 1, title: "1.1: The Button", desc: "Create a <button>Click Me</button>", starter: "<button>", check: c => c.includes("<button") },
    { id: 2, title: "1.2: Headings", desc: "Create an <h1>Hello</h1>", starter: "<h1>", check: c => c.includes("<h1") },
    { id: 3, title: "1.3: Paragraphs", desc: "Create a <p>Text</p>", starter: "<p>", check: c => c.includes("<p") },
    { id: 4, title: "1.4: Images", desc: "Add an <img src='logo.png'>", starter: "<img>", check: c => c.includes("<img") },
    { id: 5, title: "1.5: Links", desc: "Create an <a href='#'>Link</a>", starter: "<a>", check: c => c.includes("<a") },

    // --- DAY 2: CSS Basics ---
    { id: 6, title: "2.1: Text Color", desc: "Set text color to red.", starter: "<style>body{ color: red; }</style>", check: c => c.includes("color:") },
    { id: 7, title: "2.2: Backgrounds", desc: "Set background to #000.", starter: "<style>body{ background: #000; }</style>", check: c => c.includes("background") },
    { id: 8, title: "2.3: Fonts", desc: "Set font-size to 20px.", starter: "<style>p{ font-size: 20px; }</style>", check: c => c.includes("font-size") },
    { id: 9, title: "2.4: Padding", desc: "Add padding: 10px;", starter: "<style>div{ padding: 10px; }</style>", check: c => c.includes("padding") },
    { id: 10, title: "2.5: Margins", desc: "Add margin: 5px;", starter: "<style>div{ margin: 5px; }</style>", check: c => c.includes("margin") },

    // --- DAY 3-19 (Placeholder Logic for brevity) ---
    // The helper function getMission() below handles gaps up to ID 100.

    // --- DAY 20: Advanced React ---
    { id: 96, title: "20.1: React State", desc: "Use const [val, setVal] = useState(0)", starter: "useState", check: c => c.includes("useState") },
    { id: 97, title: "20.2: useEffect", desc: "Implement useEffect()", starter: "useEffect", check: c => c.includes("useEffect") },
    { id: 98, title: "20.3: Props", desc: "Pass props to a component", starter: "props", check: c => c.includes("props") },
    { id: 99, title: "20.4: Maps", desc: "Use .map() to render list", starter: ".map", check: c => c.includes(".map") },
    { id: 100, title: "20.5: Final Build", desc: "Create a full component export.", starter: "export default", check: c => c.includes("export") },
];

// Helper to find mission by ID (Handles missing middle missions dynamically)
function getMission(index) {
    // If we have a manually defined mission, use it.
    if (missions[index]) return missions[index];
    
    // Generic Generator for tasks not explicitly defined in the array
    return {
        id: index + 1,
        title: `Level ${index + 1}: Practice Drill`,
        desc: "Write a comment with your name to pass.",
        starter: "// Type your name here",
        check: c => c.length > 5
    };
}

// UI Elements
const uiTitle = document.getElementById("task-title");
const uiDesc = document.getElementById("task-desc");
const uiEditor = document.getElementById("code-editor");
const uiConsole = document.getElementById("console-output");
const runBtn = document.getElementById("run-btn");
const badge = document.getElementById("task-badge");
const timerEl = document.getElementById("timer");

// Modal Elements
const modal = document.getElementById("result-modal");
const modalIcon = document.getElementById("modal-icon");
const modalTitle = document.getElementById("modal-title");
const modalMsg = document.getElementById("modal-msg");
const modalXP = document.getElementById("modal-xp");
const modalBtn = document.getElementById("modal-btn");

let currentMissionIndex = 0;
let tasksCompletedToday = 0;
let timerInterval;

// --- 3. LOAD DATA & AUTH STATE ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            let data;

            if (docSnap.exists()) {
                data = docSnap.data();
            } else {
                // Initialize new user profile structure
                data = { name: "Student", xp: 0, dailyCount: 0, lastActiveDate: new Date().toDateString(), completedTasks: [] };
                await setDoc(userRef, data);
            }

            // Check Date Reset (Daily Limit Logic)
            const todayStr = new Date().toDateString();
            if (data.lastActiveDate !== todayStr) {
                tasksCompletedToday = 0;
                await updateDoc(userRef, { lastActiveDate: todayStr, dailyCount: 0 });
            } else {
                tasksCompletedToday = data.dailyCount || 0;
            }

            // Determine Current Level
            const totalFinished = data.completedTasks ? data.completedTasks.length : 0;
            currentMissionIndex = totalFinished;

            // Badge Update
            if (badge) badge.innerText = `Day ${Math.floor(currentMissionIndex/5) + 1} • Task ${tasksCompletedToday + 1}/5`;

            // Lock or Load Logic
            if (currentMissionIndex >= TOTAL_TASKS) {
                lockArena("🎉 Course Completed!");
            } else if (tasksCompletedToday >= DAILY_LIMIT) {
                lockArena("⛔ Daily Limit Reached! Come back tomorrow.");
            } else {
                loadMissionUI(currentMissionIndex);
                startTimer(45 * 60); // 45 Minutes
            }
        } catch (error) { console.error("Error:", error); }
    } else {
        // Fallback for non-logged in users (preview mode)
        loadMissionUI(0);
    }
});

function loadMissionUI(index) {
    const mission = getMission(index);
    if(uiTitle) uiTitle.innerText = mission.title;
    if(uiDesc) uiDesc.innerText = mission.desc;
    if(uiEditor) uiEditor.value = mission.starter;
}

function lockArena(msg) {
    if(uiTitle) uiTitle.innerText = "Locked 🔒";
    if(uiDesc) uiDesc.innerText = msg;
    if(uiEditor) { uiEditor.value = "/* Locked */"; uiEditor.disabled = true; }
    if(runBtn) { runBtn.disabled = true; runBtn.innerText = "Locked"; runBtn.style.background = "#333"; }
    if(timerEl) timerEl.innerText = "--:--";
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        if(timerEl) timerEl.textContent = minutes + ":" + seconds;
        if (--timer < 0) clearInterval(timerInterval);
    }, 1000);
}

// --- 4. POPUP SYSTEM ---
function showResultPopup(isSuccess) {
    modal.classList.remove("hidden");
    
    if (isSuccess) {
        // SUCCESS STATE
        modalIcon.innerText = "🎉";
        modalTitle.innerText = "Mission Complete!";
        modalMsg.innerText = "Great job! You are getting better.";
        modalXP.innerText = `+${XP_PER_TASK} XP`;
        modalXP.style.color = "#10b981"; // Green
        
        // Trigger Confetti
        if (typeof confetti === "function") {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }

        // Button Action: Save & Reload
        modalBtn.onclick = () => {
            modalBtn.innerText = "Saving...";
            const mission = getMission(currentMissionIndex);
            saveProgress(mission.id);
        };
    } else {
        // FAIL STATE
        modalIcon.innerText = "❌";
        modalTitle.innerText = "Incorrect Code";
        modalMsg.innerText = "Double check the requirements and try again.";
        modalXP.innerText = "0 XP";
        modalXP.style.color = "#ef4444"; // Red

        // Button Action: Close & Retry
        modalBtn.onclick = () => {
            modal.classList.add("hidden");
        };
    }
}

// --- 5. RUN CODE ENGINE ---
if(runBtn) {
    runBtn.addEventListener("click", () => {
        if(tasksCompletedToday >= DAILY_LIMIT) return;

        const code = uiEditor.value;
        const frame = document.getElementById("preview-frame");
        // Access iframe document safely
        const doc = frame.contentDocument || frame.contentWindow.document;
        
        doc.open();
        // Inject styles + user code
        doc.write(`<style>body{color:#e0e0e0; font-family:sans-serif; margin:10px;}</style>` + code);
        doc.close();

        uiConsole.innerHTML = "<span style='color: yellow'>Analyzing code...</span>";

        setTimeout(() => {
            const mission = getMission(currentMissionIndex);
            const isCorrect = mission.check(code);

            // Trigger Popup logic
            showResultPopup(isCorrect);
            
            if(isCorrect) {
                uiConsole.innerHTML = "<strong style='color: #10b981'>✅ Passed</strong>";
            } else {
                uiConsole.innerHTML = "<strong style='color: #ef4444'>❌ Failed</strong>";
            }
        }, 800);
    });
}

// --- 6. SAVE TO DB ---
async function saveProgress(taskID) {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const todayStr = new Date().toDateString();

    try {
        await updateDoc(userRef, {
            xp: increment(XP_PER_TASK),
            dailyCount: increment(1),
            lastActiveDate: todayStr,
            completedTasks: arrayUnion(taskID)
        });
        window.location.reload(); 
    } catch (e) {
        console.error("Error saving progress:", e);
    }
}