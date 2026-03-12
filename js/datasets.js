/* UniBolt Curriculum Controller (6 Sections x 20 Days = 120 Tasks) */

// GLOBAL DATA STORE
window.curriculumData = []; 
window.currentTaskSlug = "";

const TOTAL_DAYS = 20;
const SECTIONS_PER_DAY = 6;

document.addEventListener('DOMContentLoaded', init);

function init() {
    const status = calculateProgress();
    
    // Update Page Header
    const pageTitle = document.querySelector('.page-title');
    const h1 = document.querySelector('h1');
    const totalCount = document.getElementById('total-count');

    if(pageTitle) pageTitle.innerText = `Day ${status.day} / ${TOTAL_DAYS}`;
    if(h1) h1.innerHTML = `Day ${status.day} <span style="color:#8b5cf6">Curriculum</span>`;
    if(totalCount) totalCount.innerText = SECTIONS_PER_DAY;

    renderGrid(status.day);
}

// --- 📅 TIME LOGIC ---
function calculateProgress() {
    let startDate = localStorage.getItem('unibolt_start_date');
    if (!startDate) {
        startDate = new Date().toISOString();
        localStorage.setItem('unibolt_start_date', startDate);
    }
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let currentDay = diffDays;
    if (currentDay > TOTAL_DAYS) currentDay = TOTAL_DAYS;
    if (currentDay < 1) currentDay = 1;

    return { day: currentDay };
}

// --- 🧠 120-TASK GENERATOR ---
function getCurriculumForDay(day) {
    const sections = [
        { name: "Python Core", icon: "fa-brands fa-python", color: "tag-cv" },
        { name: "Data Structs", icon: "fa-solid fa-layer-group", color: "tag-tab" },
        { name: "NumPy/Pandas", icon: "fa-solid fa-table", color: "tag-nlp" },
        { name: "Data Viz", icon: "fa-solid fa-chart-simple", color: "tag-cv" },
        { name: "ML Algorithms", icon: "fa-solid fa-brain", color: "tag-nlp" },
        { name: "Project Lab", icon: "fa-solid fa-flask", color: "tag-tab" }
    ];

    let difficulty = "Basic";
    if (day > 5) difficulty = "Intermediate";
    if (day > 15) difficulty = "Expert";

    let tasks = [];

    for (let i = 0; i < SECTIONS_PER_DAY; i++) {
        let sec = sections[i];
        let sectionId = i + 1; 
        
        let topic = getTopicName(day, sectionId);
        
        // --- FIXED: Explicitly define input/output here ---
        let inputContent = `Sample Input for ${topic} (Day ${day})`;
        let outputContent = `Expected Output Result for ${topic}`;

        // Custom logic for specific types (Optional)
        if (sec.name === "Python Core") {
            inputContent = `[10, 20, 30, 40, 50]`;
            outputContent = `150`;
        } else if (sec.name === "NumPy/Pandas") {
            inputContent = `file: dataset_v${day}.csv (Rows: 1000)`;
            outputContent = `DataFrame Shape: (850, 12)`;
        }

        tasks.push({
            id: i, 
            taskId: `day${day}-sec${sectionId}`,
            title: `${sec.name}: ${topic}`,
            category: sec.name,
            desc: `Day ${day} Module: Apply ${difficulty} concepts of ${sec.name} to solve real-world problems.`,
            difficulty: difficulty,
            colorClass: sec.color,
            icon: sec.icon,
            // --- FIXED: Property names match the modal function ---
            problemInput: inputContent, 
            problemOutput: outputContent
        });
    }
    return tasks;
}

function getTopicName(day, section) {
    const topics = {
        1: ["Variables", "Lists", "Arrays", "Line Plots", "Linear Reg", "Setup"], 
        2: ["Loops", "Dicts", "Indexing", "Bar Charts", "Logistic Reg", "Cleaning"],
        3: ["Functions", "Sets", "Slicing", "Scatter Plots", "KNN", "EDA"],
        4: ["Classes", "Tuples", "Broadcasting", "Histograms", "Decision Trees", "Feature Eng"],
        5: ["Modules", "Stacks", "Filtering", "Box Plots", "Random Forest", "Pipeline"]
    };
    if (topics[day]) return topics[day][section - 1];
    return `Level ${day} Concepts`; 
}

// --- RENDER LOGIC ---
function renderGrid(day) {
    const grid = document.getElementById('dataset-grid');
    if(!grid) return;
    
    grid.innerHTML = ''; 
    window.curriculumData = []; 

    const dailyTasks = getCurriculumForDay(day);
    let completedCount = 0;

    dailyTasks.forEach(task => {
        if (localStorage.getItem(`unibolt_done_${task.taskId}`)) {
            task.isDone = true;
            completedCount++;
        } else {
            task.isDone = false;
        }
        window.curriculumData.push(task); 
    });

    if (completedCount >= SECTIONS_PER_DAY) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 20px;">
                <i class="fa-solid fa-medal" style="font-size: 80px; color: #10b981; margin-bottom: 20px;"></i>
                <h1 style="color: white; margin: 0; font-size: 32px;">Day ${day} Completed!</h1>
                <p style="color: #94a3b8; margin: 15px 0 30px; font-size: 16px;">
                    You have finished all 6 sections. Awesome work!<br>
                    Come back tomorrow to unlock Day ${day + 1}.
                </p>
                <div style="background: #111; display: inline-block; padding: 12px 25px; border-radius: 30px; border: 1px solid #333; color: #fff;">
                    Next unlock: <span style="color: #8b5cf6; font-weight:bold;">24 Hours</span>
                </div>
            </div>
        `;
        return; 
    }

    dailyTasks.forEach(item => {
        const card = document.createElement('div');
        card.className = "data-card";
        
        let buttonHtml = '';
        
        if (item.isDone) {
            card.style.opacity = "0.5";
            card.style.borderColor = "#10b981"; 
            buttonHtml = `
                <button class="btn-primary" style="width: 100%; justify-content: center; margin-top: 20px; background: #10b981; pointer-events: none;">
                    <i class="fa-solid fa-check"></i> &nbsp; Completed
                </button>`;
        } else {
            buttonHtml = `
                <button onclick="window.openTaskModal(${item.id})" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 20px;">
                    <i class="fa-solid fa-terminal"></i> &nbsp; View Problem
                </button>`;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; border: 1px solid rgba(255,255,255,0.1);">
                    <i class="${item.icon}"></i>
                </div>
                <span class="tag ${item.colorClass}">${item.category}</span>
            </div>

            <h3 style="color: white; margin: 0 0 8px; font-size: 18px;">${item.title}</h3>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 20px; height: 40px; overflow: hidden;">
                ${item.desc}
            </p>

            <div class="meta-row">
                <span class="meta-item"><i class="fa-solid fa-layer-group"></i> ${item.difficulty}</span>
                <span class="meta-item"><i class="fa-solid fa-clock"></i> 45m</span>
            </div>

            ${buttonHtml}
        `;
        grid.appendChild(card);
    });
}

// --- GLOBAL FUNCTIONS (Exposed for HTML Buttons) ---

window.openTaskModal = function(id) {
    const data = window.curriculumData[id];
    
    // --- FIXED: Ensures we are reading 'problemInput' and 'problemOutput' ---
    document.getElementById('modal-task-title').innerText = data.title;
    document.getElementById('modal-task-desc').innerText = data.desc;
    
    // Check if data exists before setting text, otherwise show default
    document.getElementById('modal-task-input').innerText = data.problemInput || "No input data needed.";
    document.getElementById('modal-task-output').innerText = data.problemOutput || "Check terminal for success message.";
    
    window.currentTaskSlug = data.taskId;

    document.getElementById('task-modal').style.display = "flex";
};

window.closeTaskModal = function() {
    document.getElementById('task-modal').style.display = "none";
};

window.startCoding = function() {
    window.location.href = `task-solver.html?task=${window.currentTaskSlug}`;
};