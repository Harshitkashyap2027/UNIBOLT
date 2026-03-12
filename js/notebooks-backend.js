// js/notebooks-backend.js

// 1. DATABASE OF QUESTIONS & HINTS
const dailyTasks = [
    {
        id: 1,
        title: "Day 1: Tensor Basics",
        desc: "Create a PyTorch tensor of size (3,3) filled with ones. Assign it to a variable named `x`.",
        hint: "Use the function torch.ones() and pass the dimensions as arguments.",
        check: (code) => code.includes("torch.ones(3,3)") || code.includes("torch.ones((3,3))")
    },
    {
        id: 2,
        title: "Day 2: Matrix Multiplication",
        desc: "Perform a matrix multiplication between two random tensors `a` and `b` of size (2,2).",
        hint: "You can use torch.matmul(a, b) or the @ operator.",
        check: (code) => code.includes("torch.matmul") || code.includes("@")
    },
    {
        id: 3,
        title: "Day 3: Reshaping",
        desc: "Reshape a 1D tensor `x` of size 16 into a 4x4 matrix using the view method.",
        hint: "The syntax is .view(rows, columns). Make sure 4*4 equals 16.",
        check: (code) => code.includes(".view(4, 4)") || code.includes(".reshape(4, 4)")
    },
    // Add your remaining 17 tasks here...
];

// 2. CONFIGURATION & STATE
const MAX_ATTEMPTS = 5;
const HINT_TRIGGER_ATTEMPT = 3; // Show hint when 3 attempts remain (i.e., after 2 fails)

const todayKey = new Date().toISOString().split('T')[0]; // "2023-10-27"
const storageKey = `unibolt_progress_${todayKey}`;

// DOM Elements
const ui = {
    title: document.getElementById('task-title'),
    desc: document.getElementById('task-desc'),
    editor: document.getElementById('code-editor'),
    btn: document.getElementById('run-btn'),
    console: document.getElementById('console-output'),
    attempts: document.getElementById('attempts-display'),
    modal: document.getElementById('result-modal')
};

// Calculate Task Index (Daily Rotation)
const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
const taskIndex = dayOfYear % dailyTasks.length;
const currentTask = dailyTasks[taskIndex];

// Load State from LocalStorage
let userState = JSON.parse(localStorage.getItem(storageKey)) || {
    completed: false,
    attemptsLeft: MAX_ATTEMPTS,
    locked: false
};

// 3. CORE FUNCTIONS

function init() {
    // Render initial UI
    ui.title.innerText = currentTask.title;
    ui.desc.innerText = currentTask.desc;
    updateStatusDisplay();

    // Check Lock/Complete Status
    if (userState.locked || userState.completed) {
        lockInterface();
    }

    // Event Listeners
    ui.btn.addEventListener('click', handleRunCode);
    document.getElementById('modal-btn').addEventListener('click', () => {
        ui.modal.style.display = 'none';
    });
}

function updateStatusDisplay() {
    ui.attempts.innerText = `Attempts left: ${userState.attemptsLeft}`;
    
    // Change color if low on attempts
    if(userState.attemptsLeft <= 2) {
        ui.attempts.style.color = "#ef4444"; // Red warning
    }
}

function lockInterface() {
    ui.editor.disabled = true;
    ui.btn.disabled = true;
    ui.btn.classList.add('btn-disabled');
    
    if (userState.completed) {
        ui.editor.placeholder = "Task Completed! Great work. See you tomorrow.";
        ui.btn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
    } else {
        ui.editor.placeholder = "System Locked: Maximum attempts reached.";
        ui.btn.innerHTML = '<i class="fa-solid fa-lock"></i> Locked';
    }
}

function handleRunCode() {
    if(userState.locked || userState.completed) return;

    const userCode = ui.editor.value;
    ui.console.innerHTML = "<span style='color: #fff;'> > Running code on GPU instance...</span>";

    setTimeout(() => {
        const isCorrect = currentTask.check(userCode);

        if (isCorrect) {
            handleSuccess();
        } else {
            handleFailure();
        }
    }, 800);
}

function handleSuccess() {
    userState.completed = true;
    saveState();
    
    ui.console.innerHTML += "<br><span style='color: #10b981;'> > Success! Model converged. +10XP</span>";
    showModal(true);
    
    if (window.confetti) {
        window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
    lockInterface();
}

function handleFailure() {
    userState.attemptsLeft--;
    saveState();
    updateStatusDisplay();

    if (userState.attemptsLeft <= 0) {
        // LOCK OUT
        userState.locked = true;
        saveState();
        ui.console.innerHTML += "<br><span style='color: #ef4444;'> > Fatal Error: Maximum attempts reached. Repository locked.</span>";
        showModal(false);
        lockInterface();
    } else {
        // RETRY + HINT LOGIC
        let msg = `<br><span style='color: #ef4444;'> > Error: Output mismatch. ${userState.attemptsLeft} attempts remaining.</span>`;
        
        // Show Hint if attempts are getting low
        if (userState.attemptsLeft <= HINT_TRIGGER_ATTEMPT) {
            msg += `<br><span style='color: #f59e0b;'> > 💡 <b>HINT:</b> ${currentTask.hint}</span>`;
        }

        ui.console.innerHTML += msg;
        
        // Shake animation
        ui.editor.style.border = "1px solid #ef4444";
        setTimeout(() => { ui.editor.style.border = "none"; }, 500);
    }
}

function showModal(isSuccess) {
    const title = document.getElementById('modal-title');
    const msg = document.getElementById('modal-msg');
    const icon = document.getElementById('modal-icon');
    const xp = document.getElementById('xp-container');

    ui.modal.style.display = 'flex';

    if (isSuccess) {
        icon.innerText = "🎉";
        title.innerText = "Task Complete!";
        title.style.color = "#10b981";
        msg.innerText = "Your answer was correct. See you tomorrow!";
        xp.style.display = "block";
    } else {
        icon.innerText = "🔒";
        title.innerText = "System Locked";
        title.style.color = "#ef4444";
        msg.innerText = "You have used all 5 attempts. The module will unlock tomorrow.";
        xp.style.display = "none";
    }
}

function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(userState));
}

// Start App
init();