import { auth, db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. CONFIGURATION ---
const QUIZ_XP_REWARD = 5;       
const QUIZ_DAILY_CAP = 50;
const MASTERY_CAP = 20; // 20 Correct Answers = 100% Skill

// --- 2. DATA LIBRARY (20 DAYS OF BUGS) ---
// I have expanded this list to support a 20-day cycle.
const BUG_CHALLENGES = [
    { id: 1, title: "Day 1: Infinite Loop", desc: "Which line causes the crash?", code: "for (let i = 0; i < 10; i--) { console.log(i) }", options: ["i < 10", "i-- (Decrementing instead of incrementing)", "console.log"], correct: 1 },
    { id: 2, title: "Day 2: CSS Centering", desc: "Why isn't it centered?", code: ".box { display: flex; justify-content: center; }", options: ["Missing align-items: center", "Wrong justify-content", "Needs float: center"], correct: 0 },
    { id: 3, title: "Day 3: React State", desc: "Which update is unsafe?", code: "1. setCount(c + 1)\n2. setCount(prev => prev + 1)", options: ["Line 1 (Direct State)", "Line 2 (Callback)", "Both are fine"], correct: 0 },
    { id: 4, title: "Day 4: Array Index", desc: "Accessing last item of arr[5]", code: "let last = arr[5];", options: ["arr[5]", "arr[4]", "arr.length"], correct: 1 },
    { id: 5, title: "Day 5: Const Reassignment", desc: "What throws an error?", code: "const x = 10; x = 20;", options: ["Declaring const", "Reassigning x", "Value 20"], correct: 1 },
    { id: 6, title: "Day 6: HTML Attributes", desc: "Wrong attribute for image?", code: "<img href='pic.jpg' />", options: ["href should be src", "Self-closing tag", "Quotes"], correct: 0 },
    { id: 7, title: "Day 7: String Math", desc: "What is '5' + 3?", code: "console.log('5' + 3)", options: ["8", "53", "Error"], correct: 1 },
    { id: 8, title: "Day 8: CSS ID vs Class", desc: "Select ID 'header'?", code: "CSS Selector?", options: [".header", "#header", "header"], correct: 1 },
    { id: 9, title: "Day 9: Return Statement", desc: "What does this return?", code: "return\n{ id: 1 }", options: ["The object", "Undefined (ASI inserts semicolon)", "Error"], correct: 1 },
    { id: 10, title: "Day 10: Null vs Undefined", desc: "Type of null?", code: "typeof null", options: ["'null'", "'undefined'", "'object'"], correct: 2 },
    // ... Placeholders for Days 11-20 (You can fill these with specific code questions)
    { id: 11, title: "Day 11: Flex Direction", desc: "Default flex direction?", code: "display: flex;", options: ["column", "row", "grid"], correct: 1 },
    { id: 12, title: "Day 12: Event Listeners", desc: "Correct syntax?", code: "btn.onClick = func", options: ["onClick", "onclick (lowercase)", "click()"], correct: 1 },
    { id: 13, title: "Day 13: Z-Index", desc: "Why is z-index failing?", code: "div { z-index: 99; }", options: ["Value too high", "Missing position: relative/absolute", "Wrong unit"], correct: 1 },
    { id: 14, title: "Day 14: LocalStorage", desc: "Storage limit?", code: "localStorage", options: ["5MB", "Unlimited", "50MB"], correct: 0 },
    { id: 15, title: "Day 15: Promises", desc: "Keyword to wait?", code: "async function() { ... }", options: ["stop", "wait", "await"], correct: 2 },
    { id: 16, title: "Day 16: CSS Box Model", desc: "Total width?", code: "w:100px; p:10px; border:5px;", options: ["100px", "115px", "130px"], correct: 2 },
    { id: 17, title: "Day 17: Map Key", desc: "React List Error?", code: "arr.map(i => <div>{i}</div>)", options: ["Missing key prop", "Wrong brackets", "Map returns void"], correct: 0 },
    { id: 18, title: "Day 18: Equality", desc: "0 == '0' vs 0 === '0'", code: "console.log(0 === '0')", options: ["true", "false", "undefined"], correct: 1 },
    { id: 19, title: "Day 19: Grid", desc: "Define columns?", code: "display: grid;", options: ["grid-template-columns", "grid-cols", "columns"], correct: 0 },
    { id: 20, title: "Day 20: Git", desc: "Save changes?", code: "git save", options: ["git commit", "git push", "git add"], correct: 0 },
];

// --- QUIZ DATA (With Unique IDs) ---
const QUIZ_QUESTIONS = {
    html: [
        { id: "h1", q: "Tag for largest heading?", options: ["<head>", "<h6>", "<h1>"], ans: 2 },
        { id: "h2", q: "Tag for numbered list?", options: ["<ul>", "<ol>", "<li>"], ans: 1 },
        { id: "h3", q: "Correct HTML5 tag for sidebar?", options: ["<sidebar>", "<aside>", "<div>"], ans: 1 },
        { id: "h4", q: "Which tag defines a table cell?", options: ["<tr>", "<td>", "<tc>"], ans: 1 },
        { id: "h5", q: "HTML is standard for?", options: ["Scripting", "Structure", "Styling"], ans: 1 }
    ],
    css: [
        { id: "c1", q: "Property to change text color?", options: ["font-color", "color", "text-color"], ans: 1 },
        { id: "c2", q: "How to select class 'box'?", options: [".box", "#box", "box"], ans: 0 },
        { id: "c3", q: "Default position value?", options: ["relative", "absolute", "static"], ans: 2 },
        { id: "c4", q: "Make text bold?", options: ["font-weight: bold", "text-decoration: bold", "style: bold"], ans: 0 },
        { id: "c5", q: "Which property controls space inside an element?", options: ["margin", "spacing", "padding"], ans: 2 }
    ],
    js: [
        { id: "j1", q: "Variable that can't be reassigned?", options: ["var", "let", "const"], ans: 2 },
        { id: "j2", q: "Result of 2 + '2'?", options: ["4", "22", "NaN"], ans: 1 },
        { id: "j3", q: "Correct way to write array?", options: ["(1,2)", "{1,2}", "[1,2]"], ans: 2 },
        { id: "j4", q: "Which is NOT a data type?", options: ["Boolean", "String", "Element"], ans: 2 },
        { id: "j5", q: "Loop that runs at least once?", options: ["for", "while", "do...while"], ans: 2 }
    ]
};

// UI Elements
const statHtmlBar = document.getElementById("stat-html-bar");
const statHtmlTxt = document.getElementById("stat-html-txt");
const statCssBar = document.getElementById("stat-css-bar");
const statCssTxt = document.getElementById("stat-css-txt");
const statJsBar = document.getElementById("stat-js-bar");
const statJsTxt = document.getElementById("stat-js-txt");

const bugContainer = document.getElementById("bug-container");
const bugComplete = document.getElementById("bug-complete");
const bugTitle = document.getElementById("bug-title");
const bugDesc = document.getElementById("bug-desc");
const bugCode = document.getElementById("bug-code");
const bugOptions = document.getElementById("bug-options");

const quizModal = document.getElementById("quiz-modal");
const quizTopic = document.getElementById("quiz-topic");
const quizQ = document.getElementById("quiz-question");
const quizOpt = document.getElementById("quiz-options");
const quizFeed = document.getElementById("quiz-feedback");

// Global State
let quizXPToday = 0; 
let completedQuizIDs = []; // Stores IDs of questions user has finished
let currentAttempts = 2;   // Users get 2 attempts per question

// --- 3. LOAD DATA & INIT SKILLS ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 1. Reset Check (XP Limit)
            const todayStr = new Date().toDateString();
            if (data.lastQuizDate !== todayStr) {
                quizXPToday = 0;
                await updateDoc(userRef, { lastQuizDate: todayStr, quizDailyXP: 0 });
            } else {
                quizXPToday = data.quizDailyXP || 0;
            }

            // 2. Load Completed Question IDs (Prevent Repeats)
            completedQuizIDs = data.completedQuizIDs || [];

            // 3. Load Skills
            const userSkills = data.skills || { html: 0, css: 0, js: 0 };
            updateSkillRadar(userSkills);

            // 4. Load Bug (Based on DAY NUMBER)
            // Use purchaseDate to calculate Day 1-20. 
            // If user was reset, purchaseDate is today, so diffDays is 0 (Day 1).
            const purchaseDate = new Date(data.purchaseDate || new Date());
            const today = new Date();
            const diffTime = Math.abs(today - purchaseDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            // Load the bug for this specific day
            loadDailyBug(diffDays, data.lastBugDate);
        }
    }
});

function updateSkillRadar(skills) {
    let htmlPct = Math.min(100, ((skills.html || 0) / MASTERY_CAP) * 100);
    let cssPct  = Math.min(100, ((skills.css || 0)  / MASTERY_CAP) * 100);
    let jsPct   = Math.min(100, ((skills.js || 0)   / MASTERY_CAP) * 100);

    statHtmlBar.style.width = `${htmlPct}%`;
    statHtmlTxt.innerText = `${Math.round(htmlPct)}%`;
    statCssBar.style.width = `${cssPct}%`;
    statCssTxt.innerText = `${Math.round(cssPct)}%`;
    statJsBar.style.width = `${jsPct}%`;
    statJsTxt.innerText = `${Math.round(jsPct)}%`;
}

// --- 5. BUG HUNT (20 Day Logic) ---
function loadDailyBug(dayNumber, lastBugDate) {
    const today = new Date().toDateString();
    
    // Check if already played today
    if (lastBugDate === today) {
        bugContainer.style.display = "none";
        bugComplete.style.display = "block";
        return;
    }

    // Get Bug Index (Loop back if over 20 days)
    // dayNumber 1 corresponds to index 0
    let index = (dayNumber - 1) % BUG_CHALLENGES.length;
    if (index < 0) index = 0;

    const challenge = BUG_CHALLENGES[index];
    
    bugTitle.innerText = challenge.title;
    bugDesc.innerText = challenge.desc;
    bugCode.innerText = challenge.code;
    bugOptions.innerHTML = "";
    
    challenge.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline";
        btn.style.textAlign = "left";
        btn.innerText = opt;
        btn.onclick = () => checkBugAnswer(idx, challenge.correct, btn);
        bugOptions.appendChild(btn);
    });
}

async function checkBugAnswer(selected, correct, btnElement) {
    if (selected === correct) {
        btnElement.style.background = "#10b981";
        btnElement.style.color = "white";
        
        if(window.confetti) window.confetti({ particleCount: 50, origin: { x: 0.7, y: 0.6 } });
        
        const user = auth.currentUser;
        if(user) {
            await updateDoc(doc(db, "users", user.uid), {
                xp: increment(50),
                lastBugDate: new Date().toDateString()
            });
            setTimeout(() => {
                bugContainer.style.display = "none";
                bugComplete.style.display = "block";
            }, 1500);
        }
    } else {
        btnElement.style.background = "#ef4444";
        btnElement.style.color = "white";
        setTimeout(() => { btnElement.style.background = "transparent"; btnElement.style.color = "#a1a1aa"; }, 500);
    }
}

// --- 6. QUIZ LOGIC (No Repeats + 2 Attempts) ---
window.startQuiz = function(topic) {
    const questions = QUIZ_QUESTIONS[topic];
    
    // Filter out questions user has already answered
    const availableQuestions = questions.filter(q => !completedQuizIDs.includes(q.id));

    if (availableQuestions.length === 0) {
        alert("🎉 You have mastered all questions in this category!");
        return;
    }

    // Pick a random question from what's left
    const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    // Reset Attempts for this new question
    currentAttempts = 2;

    quizModal.classList.remove("hidden");
    quizTopic.innerText = topic.toUpperCase() + " Drill";
    quizQ.innerText = randomQ.q;
    quizFeed.innerText = `Attempts remaining: ${currentAttempts}`;
    quizFeed.style.color = "#a1a1aa";
    
    if(quizXPToday >= QUIZ_DAILY_CAP) {
        quizFeed.innerText += " (Daily XP Limit Reached)";
    }

    quizOpt.innerHTML = "";
    randomQ.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline";
        btn.innerText = opt;
        btn.style.width = "100%";
        
        btn.onclick = async () => {
            // Disable if out of attempts
            if (currentAttempts <= 0) return;

            if (index === randomQ.ans) {
                // --- CORRECT ANSWER ---
                btn.style.background = "#10b981";
                const user = auth.currentUser;

                if(user) {
                    const updates = {};
                    updates[`skills.${topic}`] = increment(1);
                    
                    // Add ID to completed list so it never repeats
                    updates.completedQuizIDs = arrayUnion(randomQ.id);

                    if (quizXPToday < QUIZ_DAILY_CAP) {
                        updates.xp = increment(QUIZ_XP_REWARD);
                        updates.quizDailyXP = increment(QUIZ_XP_REWARD);
                        quizXPToday += QUIZ_XP_REWARD;
                        quizFeed.style.color = "#10b981";
                        quizFeed.innerText = `Correct! +${QUIZ_XP_REWARD} XP`;
                    } else {
                        quizFeed.innerText = `Correct! +1 Skill Point`;
                    }

                    await updateDoc(doc(db, "users", user.uid), updates);
                    completedQuizIDs.push(randomQ.id); // Update local cache
                    
                    setTimeout(() => {
                        quizModal.classList.add("hidden");
                        // Refresh to show skill bar update
                        window.location.reload();
                    }, 1200); 
                }
            } else {
                // --- WRONG ANSWER ---
                currentAttempts--;
                btn.style.background = "#ef4444";
                btn.disabled = true; // Disable the wrong button

                if (currentAttempts > 0) {
                    quizFeed.style.color = "#f59e0b"; // Orange
                    quizFeed.innerText = `Wrong! ${currentAttempts} attempt left.`;
                } else {
                    quizFeed.style.color = "#ef4444";
                    quizFeed.innerText = "❌ Failed. Question Locked.";
                    
                    // Disable all buttons
                    const allBtns = quizOpt.querySelectorAll("button");
                    allBtns.forEach(b => b.disabled = true);
                    
                    setTimeout(() => {
                        quizModal.classList.add("hidden");
                    }, 2000);
                }
            }
        };
        quizOpt.appendChild(btn);
    });
};

// Close Modal Logic (Click outside or X)
document.getElementById("close-quiz-btn")?.addEventListener("click", () => {
    quizModal.classList.add("hidden");
});