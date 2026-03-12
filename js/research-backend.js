/* =========================================
   UNIBOLT RESOURCE DATABASE & CONTROLLER
   ========================================= */

// --- 1. THE DATABASE ---
// We updated the links to point to your new HTML pages
const resourcesDB = [
    // --- 🤖 AI & DATA SCIENCE ---
    {
        id: "ai-101",
        title: "UniBolt AI Masterclass Notes",
        category: "ai",
        type: "PDF",
        desc: "Complete lecture notes covering Neural Networks, Backpropagation, and Optimizers.",
        link: "ai-notes.html", 
        icon: "fa-file-pdf",
        badge: "AI & DS"
    },
    {
        id: "ai-102",
        title: "Project: Traffic Sign Classifier",
        category: "ai",
        type: "Project",
        desc: "Capstone project environment with starter code and dataset utilities.",
        link: "traffic-sign-project.html", // LINKS TO YOUR NEW PAGE
        icon: "fa-box-archive",
        badge: "AI & DS"
    },
    {
        id: "ai-103",
        title: "Python for Data Science Cheat Sheet",
        category: "ai",
        type: "PDF",
        desc: "Exclusive quick-reference guide for NumPy, Pandas, and Matplotlib.",
        link: "python-cheatsheet.html",
        icon: "fa-file-code",
        badge: "AI & DS"
    },
    {
        id: "ai-104",
        title: "Internship Roadmap: AI Track",
        category: "ai",
        type: "Guide",
        desc: "Step-by-step timeline of what you need to complete for certification.",
        link: "ai-roadmap.html",
        icon: "fa-map",
        badge: "Career"
    },

    // --- 💻 FULL STACK WEB ---
    {
        id: "web-201",
        title: "The Ultimate React Pattern Guide",
        category: "web",
        type: "PDF",
        desc: "Internal guide on industry-standard React folder structures and hooks.",
        link: "react-patterns.html",
        icon: "fa-file-pdf",
        badge: "Web Dev"
    },
    {
        id: "web-202",
        title: "Backend Boilerplate Code",
        category: "web",
        type: "Code",
        desc: "Production-ready Node.js & Express template with JWT auth pre-built.",
        link: "backend-boilerplate.html",
        icon: "fa-server",
        badge: "Web Dev"
    },
    {
        id: "web-203",
        title: "CSS Grid & Flexbox Workbook",
        category: "web",
        type: "PDF",
        desc: "Practice exercises designed by UniBolt mentors to master layouts.",
        link: "css-workbook.html",
        icon: "fa-book-open",
        badge: "Design"
    },
    {
        id: "web-204",
        title: "Web Security Checklist",
        category: "web",
        type: "PDF",
        desc: "Ensure your capstone projects are secure against XSS and SQL Injection.",
        link: "security-checklist.html",
        icon: "fa-shield-halved",
        badge: "Security"
    },

    // --- 📱 APP DEVELOPMENT ---
    {
        id: "app-301",
        title: "Flutter UI Kit (UniBolt Edition)",
        category: "app",
        type: "Design",
        desc: "A collection of pre-made widgets and screens to speed up dev.",
        link: "flutter-ui-kit.html", // LINKS TO YOUR NEW PAGE
        icon: "fa-palette",
        badge: "App Dev"
    },
    {
        id: "app-302",
        title: "Android Publishing Guide",
        category: "app",
        type: "PDF",
        desc: "How to sign, build, and publish your APK to the Google Play Store.",
        link: "android-publish.html",
        icon: "fa-android",
        badge: "App Dev"
    },
    {
        id: "app-303",
        title: "React Native Performance Opt.",
        category: "app",
        type: "Video",
        desc: "Exclusive recording of our internal workshop on reducing app bundle size.",
        link: "rn-performance.html", // LINKS TO YOUR NEW PAGE
        icon: "fa-video",
        badge: "Workshop"
    }
];


// --- 2. STATE MANAGEMENT ---
let currentFilter = "all";
let savedIDs = JSON.parse(localStorage.getItem("unibolt_saved_res")) || [];


// --- 3. DOM ELEMENTS ---
// Ensure these IDs match your 'research.html' file
const grid = document.getElementById("resource-grid"); // The container for cards
const searchInput = document.getElementById("search-input");
const countLabel = document.getElementById("res-count");
const filterBtns = document.querySelectorAll(".tag-btn"); // Your filter buttons


// --- 4. INITIALIZATION ---
// We use DOMContentLoaded to ensure HTML is ready before running JS
document.addEventListener('DOMContentLoaded', () => {
    console.log("UniBolt Resources Loaded"); // Debugging check
    renderResources();
    setupEventListeners();
});


// --- 5. RENDER FUNCTION ---
function renderResources() {
    // Safety check if grid doesn't exist on page
    if(!grid) {
        console.error("Error: Element #resource-grid not found in HTML");
        return;
    }

    grid.innerHTML = "";
    
    // Get search term safely
    const term = searchInput ? searchInput.value.toLowerCase() : "";
    
    // Filter Logic
    const filtered = resourcesDB.filter(item => {
        // 1. Category Filter
        let matchesCategory = false;
        if (currentFilter === "all") matchesCategory = true;
        else if (currentFilter === "saved") matchesCategory = savedIDs.includes(item.id);
        else matchesCategory = item.category === currentFilter;

        // 2. Search Filter
        const matchesSearch = item.title.toLowerCase().includes(term) || 
                              item.desc.toLowerCase().includes(term);

        return matchesCategory && matchesSearch;
    });

    // Update Count Display
    if(countLabel) countLabel.innerText = filtered.length;

    // Empty State Handling
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #555; padding: 60px;">
                <i class="fa-solid fa-folder-open" style="font-size: 40px; margin-bottom: 15px; opacity:0.5;"></i><br>
                No resources found matching your criteria.
            </div>`;
        return;
    }

    // Generate Cards
    filtered.forEach(item => {
        const isSaved = savedIDs.includes(item.id);
        const card = document.createElement("div");
        card.className = "resource-card"; // Make sure you have CSS for this class
        
        // Dynamic Badge Styling
        let badgeColorClass = "bg-ai"; // Default purple
        if(item.category === "web") badgeColorClass = "bg-web"; // Blue
        if(item.category === "app") badgeColorClass = "bg-app"; // Pink

        // Card HTML Structure
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div class="res-badge ${badgeColorClass}">
                    <i class="fa-solid ${item.icon}"></i> ${item.type}
                </div>
                ${isSaved ? '<i class="fa-solid fa-star" style="color:#f59e0b; font-size:12px;"></i>' : ''}
            </div>
            
            <div class="res-title">${item.title}</div>
            <div class="res-desc">${item.desc}</div>
            
            <div class="res-footer">
                <button class="btn-save ${isSaved ? 'saved' : ''}" 
                        onclick="toggleSave('${item.id}')" 
                        title="${isSaved ? 'Remove from Saved' : 'Save to Library'}">
                    <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
                
                <a href="${item.link}" class="btn-link">
                    Open Resource <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px; margin-left:4px;"></i>
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}


// --- 6. EVENT LISTENERS ---
function setupEventListeners() {
    // Search Input
    if(searchInput) {
        searchInput.addEventListener("input", renderResources);
    }

    // Filter Buttons
    if(filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // Remove 'active' class from old button
                const currentActive = document.querySelector(".tag-btn.active");
                if(currentActive) currentActive.classList.remove("active");
                
                // Add 'active' class to clicked button
                btn.classList.add("active");
                
                // Update filter state
                currentFilter = btn.dataset.filter; // Ensure your HTML has data-filter="ai", etc.
                renderResources();
            });
        });
    }
}


// --- 7. GLOBAL ACTIONS (Save/Bookmark) ---
// Attached to window so onclick="" in HTML can find it
window.toggleSave = function(id) {
    if (savedIDs.includes(id)) {
        // Remove ID
        savedIDs = savedIDs.filter(savedId => savedId !== id);
    } else {
        // Add ID
        savedIDs.push(id);
    }
    
    // Save to LocalStorage for persistence
    localStorage.setItem("unibolt_saved_res", JSON.stringify(savedIDs));
    
    // Re-render grid to update icons
    renderResources();
};