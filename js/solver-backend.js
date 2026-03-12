/* UniBolt Solver Backend */

// --- CONFIGURATION ---
const TASK_CONFIG = {
    duration: 45 * 60 * 1000, // 45 Mins
    maxAttempts: 5,
    xpReward: 15
};

// --- HINT DATABASE ---
const HINT_DB = {
    "Python Core": [
        "💡 Check your syntax for missing colons `:` or indentation errors.",
        "💡 Verify variable types (int vs string).",
        "💡 Use print() to debug values."
    ],
    "Data Structs": [
        "💡 Lists are ordered and mutable.",
        "💡 Dictionaries look up values by Key.",
        "💡 Check index range bounds."
    ],
    "NumPy/Pandas": [
        "💡 Use .shape to check dimensions.",
        "💡 Check for NaN values.",
        "💡 Pandas filtering requires boolean indexing."
    ],
    "Data Viz": [
        "💡 Ensure you called plt.show().",
        "💡 Check X and Y axis lengths match."
    ],
    "ML Algorithms": [
        "💡 Did you split Train/Test data?",
        "💡 Check for data leakage.",
        "💡 Normalize input features."
    ],
    "Project Lab": [
        "💡 Break problem into small functions.",
        "💡 Check input/output shapes."
    ]
};

// Get Task ID (e.g., ?task=day1-sec2)
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('task');

let taskCategory = "Python Core";
let taskTitle = "Loading...";

document.addEventListener('DOMContentLoaded', () => {
    if (!taskId) {
        alert("No task selected. Returning to hub.");
        window.location.href = "datasets.html";
        return;
    }

    parseTaskDetails();
    checkCompletionStatus();
    initTimer();
    updateAttemptsUI();

    document.getElementById('run-btn').addEventListener('click', runCode);
});

// --- PARSE TASK ---
function parseTaskDetails() {
    const parts = taskId.split('-'); // ["day1", "sec2"]
    const day = parts[0].replace('day', '');
    const sec = parts[1].replace('sec', '');

    const categories = ["Python Core", "Data Structs", "NumPy/Pandas", "Data Viz", "ML Algorithms", "Project Lab"];
    taskCategory = categories[parseInt(sec) - 1] || "Python Core";

    // Reconstruct Title
    const topics = {
        1: ["Variables", "Lists", "Arrays", "Line Plots", "Linear Reg", "Setup"],
        2: ["Loops", "Dicts", "Indexing", "Bar Charts", "Logistic Reg", "Cleaning"],
        3: ["Functions", "Sets", "Slicing", "Scatter Plots", "KNN", "EDA"],
        4: ["Classes", "Tuples", "Broadcasting", "Histograms", "Decision Trees", "Feature Eng"],
        5: ["Modules", "Stacks", "Filtering", "Box Plots", "Random Forest", "Pipeline"]
    };
    
    let specificTopic = "Advanced Concepts";
    if (topics[day]) specificTopic = topics[day][parseInt(sec) - 1];

    taskTitle = `Day ${day}: ${specificTopic}`;
    
    // Update UI
    document.getElementById('task-cat').innerText = taskCategory;
    document.getElementById('task-title').innerText = taskTitle;
    document.getElementById('header-title').innerText = taskTitle;
    document.getElementById('task-desc').innerText = `Write a solution for ${taskCategory} on Day ${day}. Solve the problem regarding '${specificTopic}'. Ensure output is formatted correctly.`;
}

// --- CHECK COMPLETION ---
function checkCompletionStatus() {
    if (localStorage.getItem(`unibolt_done_${taskId}`)) {
        disableEditor("Task Already Completed");
        const btn = document.getElementById('run-btn');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Completed';
        btn.style.background = "#10b981";
        document.getElementById('timer').style.display = 'none';
    }
}

// --- TIMER ---
function initTimer() {
    if (localStorage.getItem(`unibolt_done_${taskId}`)) return;

    const storageKey = `unibolt_timer_${taskId}`;
    let endTime = localStorage.getItem(storageKey);

    if (!endTime) {
        endTime = Date.now() + TASK_CONFIG.duration;
        localStorage.setItem(storageKey, endTime);
    }

    const timerElem = document.getElementById('timer');
    
    const interval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(interval);
            timerElem.innerText = "00:00";
            disableEditor("Time Expired");
        } else {
            const m = Math.floor(remaining / 60000);
            const s = Math.floor((remaining % 60000) / 1000);
            timerElem.innerText = `${m}:${s.toString().padStart(2, '0')}`;
            if(m < 5) timerElem.style.color = "#ef4444";
        }
    }, 1000);
}

// --- ATTEMPTS & HINTS ---
function updateAttemptsUI() {
    const storageKey = `unibolt_attempts_${taskId}`;
    let attempts = localStorage.getItem(storageKey);
    if (attempts === null) {
        attempts = TASK_CONFIG.maxAttempts;
        localStorage.setItem(storageKey, attempts);
    }
    
    document.getElementById('attempts-display').innerText = attempts;

    if (parseInt(attempts) <= 0 && !localStorage.getItem(`unibolt_done_${taskId}`)) {
        disableEditor("No Attempts Left");
    }
}

function runCode() {
    const storageKey = `unibolt_attempts_${taskId}`;
    let attempts = parseInt(localStorage.getItem(storageKey));
    if (attempts <= 0) return;

    const runBtn = document.getElementById('run-btn');
    const consoleOut = document.getElementById('console-output');

    // Loading State
    runBtn.disabled = true;
    runBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
    consoleOut.innerHTML = `<span style="color:#fbbf24">> Compiling code...</span><br>`;

    // Mock Execution
    setTimeout(() => {
        const isSuccess = Math.random() > 0.8; // 20% Success Chance (Simulated)

        if (isSuccess) {
            handleSuccess();
        } else {
            // FAIL
            attempts--;
            localStorage.setItem(storageKey, attempts);
            updateAttemptsUI();

            const hints = HINT_DB[taskCategory] || HINT_DB["Python Core"];
            const hintIndex = (5 - attempts) - 1; 
            const hintMsg = hints[hintIndex] || "💡 Hint: Review your logic step-by-step.";

            consoleOut.innerHTML += `<span style="color:#ef4444">> Error: Runtime Exception or Output Mismatch.</span><br>`;
            consoleOut.innerHTML += `<span style="color:#fbbf24; font-weight:bold; margin-top:5px; display:block;">${hintMsg}</span><br>`;
            
            runBtn.disabled = false;
            runBtn.innerHTML = `<i class="fa-solid fa-play"></i> Run Solution`;
        }
    }, 1500);
}

function handleSuccess() {
    const runBtn = document.getElementById('run-btn');
    const consoleOut = document.getElementById('console-output');

    localStorage.setItem(`unibolt_done_${taskId}`, "true");
    
    // Update XP globally
    let currentXP = parseInt(localStorage.getItem('unibolt_user_xp') || 0);
    localStorage.setItem('unibolt_user_xp', currentXP + TASK_CONFIG.xpReward);

    consoleOut.innerHTML += `<span style="color:#10b981">> Success! All test cases passed.</span>`;
    runBtn.innerHTML = `<i class="fa-solid fa-check"></i> Completed`;
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
        document.getElementById('result-modal').style.display = 'flex';
    }, 1000);
}

function disableEditor(msg) {
    const runBtn = document.getElementById('run-btn');
    const editor = document.getElementById('code-editor');
    if(runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = `<i class="fa-solid fa-lock"></i> ${msg}`;
        runBtn.style.background = "#333";
    }
    if(editor) editor.disabled = true;
}