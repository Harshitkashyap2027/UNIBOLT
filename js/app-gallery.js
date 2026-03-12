import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCLaf8yGis2vT0DA4HlGlXXBKgFoCNGfDY",
    authDomain: "unibolt-f7005.firebaseapp.com",
    projectId: "unibolt-f7005",
    storageBucket: "unibolt-f7005.appspot.com",
    messagingSenderId: "121987854250",
    appId: "1:121987854250:web:21a9f50aad54b2143a85d3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- STATE MANAGEMENT ---
// Checks if user has uploaded an app before
let isContributor = localStorage.getItem("unibolt_contributor") === "true";

// --- DOM REFERENCES ---
const dom = {
    recGrid: document.getElementById('rec-grid'),
    gameGrid: document.getElementById('game-grid'),
    devGrid: document.getElementById('dev-grid'),
    search: document.getElementById('search-input'),
    // Modals
    detailModal: document.getElementById('detail-modal'),
    lockModal: document.getElementById('lock-modal'),
    uploadModal: document.getElementById('upload-modal'),
    // Detail Elements
    dtIcon: document.getElementById('dt-icon'),
    dtTitle: document.getElementById('dt-title'),
    dtDev: document.getElementById('dt-dev'),
    dtDesc: document.getElementById('dt-desc'),
    dtRating: document.getElementById('dt-rating'),
    dtDownloads: document.getElementById('dt-downloads'),
    // Upload Elements
    upProgress: document.getElementById('up-progress'),
    upFill: document.getElementById('up-fill'),
    upPct: document.getElementById('up-pct'),
    upStatus: document.getElementById('up-status'),
    // Sidebar
    contribPill: document.getElementById('contrib-pill')
};

// --- ROBUST DATA GENERATOR (250+ Unique Apps) ---
function generateApps() {
    const apps = [];
    
    // Hand-Crafted Premium Apps
    const featured = [
        { id: 1, name: "UniBolt IDE", dev: "UniBolt Team", cat: "Dev Tools", rating: 4.9, dl: "1M+", color: "#0ea5e9", icon: "fa-code", desc: "The official mobile IDE for UniBolt students. Code, compile, and deploy directly from your phone." },
        { id: 2, name: "FitLife Pro", dev: "HealthInc", cat: "Health", rating: 4.7, dl: "500k+", color: "#22c55e", icon: "fa-heart-pulse", desc: "Track calories and workouts with AI." },
        { id: 3, name: "CyberRacer", dev: "GameStudio", cat: "Game", rating: 4.8, dl: "2M+", color: "#ef4444", icon: "fa-gamepad", desc: "High-octane cyberpunk racing game." },
        { id: 4, name: "BeatMaker", dev: "AudioLabs", cat: "Music", rating: 4.6, dl: "100k+", color: "#a855f7", icon: "fa-music", desc: "Create beats and loops in seconds." },
        { id: 5, name: "CryptoWallet", dev: "FinTech Sol", cat: "Finance", rating: 4.5, dl: "800k+", color: "#f59e0b", icon: "fa-bitcoin", desc: "Secure crypto storage." }
    ];
    apps.push(...featured);

    // Procedural Generator Arrays
    const categories = ["Productivity", "Social", "Health", "Finance", "Game", "Utility", "Education", "Music", "Dev Tools"];
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#64748b"];
    const icons = ["fa-bolt", "fa-heart", "fa-music", "fa-wallet", "fa-comment", "fa-gamepad", "fa-camera", "fa-plane", "fa-basket-shopping", "fa-robot", "fa-ghost", "fa-dragon", "fa-chess"];
    const devs = ["Pixel Labs", "CodeFactory", "AppWiz", "DevStudio", "SoftCorp", "IndieDev", "RocketSoft", "NinjaCoders"];
    const adjs = ["Super", "Ultra", "Quick", "Smart", "Mega", "Hyper", "Secure", "Cloud", "Nano", "Flex", "Zen", "Pro", "Neon", "Cyber", "Retro"];
    const nouns = ["Notes", "Chat", "Scanner", "Vibe", "Docs", "Drive", "Share", "Cast", "Cleaner", "Booster", "VPN", "Cam", "Player", "Editor", "Link"];

    // Generate 250 Apps
    for (let i = 0; i < 250; i++) {
        const adj = adjs[Math.floor(Math.random() * adjs.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
        
        apps.push({
            id: i + 100,
            name: `${adj} ${noun}`,
            dev: devs[Math.floor(Math.random() * devs.length)],
            cat: cat,
            rating: rating,
            dl: Math.floor(Math.random() * 900) + "k+",
            color: colors[Math.floor(Math.random() * colors.length)],
            icon: icons[Math.floor(Math.random() * icons.length)],
            desc: `Experience the power of ${adj} ${noun}. This ${cat} app offers seamless performance, intuitive design, and cloud synchronization. Perfect for professionals and enthusiasts alike.`
        });
    }
    return apps;
}

const ALL_APPS = generateApps();

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateContributorUI();
    renderGrids(ALL_APPS);
    
    // Search Listener
    dom.search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = ALL_APPS.filter(a => a.name.toLowerCase().includes(term));
        renderGrids(filtered);
    });
});

function updateContributorUI() {
    if (isContributor) {
        dom.contribPill.innerText = "CONTRIBUTOR VERIFIED ✅";
        dom.contribPill.classList.add('unlocked');
    }
}

// --- RENDER LOGIC ---
function renderGrids(apps) {
    // Clear Grids
    dom.recGrid.innerHTML = '';
    dom.gameGrid.innerHTML = '';
    dom.devGrid.innerHTML = '';

    // Filter Logic
    const recApps = apps.slice(0, 10); // First 10 mixed
    const gameApps = apps.filter(a => a.cat === 'Game').slice(0, 10);
    const devApps = apps.filter(a => a.cat === 'Dev Tools' || a.cat === 'Utility').slice(0, 10);

    // Render using Fragment for Speed
    appendCards(dom.recGrid, recApps);
    appendCards(dom.gameGrid, gameApps);
    appendCards(dom.devGrid, devApps);
}

function appendCards(container, list) {
    const fragment = document.createDocumentFragment();
    list.forEach(app => {
        const div = document.createElement('div');
        div.className = 'app-card';
        div.onclick = () => openDetail(app.id);
        div.innerHTML = `
            <div class="card-icon" style="background: ${app.color}; color: white;">
                <i class="fa-solid ${app.icon}"></i>
            </div>
            <div class="card-title">${app.name}</div>
            <div class="card-dev">${app.dev}</div>
            <div class="card-meta">
                <div class="card-rating">${app.rating} <i class="fa-solid fa-star" style="font-size:9px;"></i></div>
                <div>${app.cat}</div>
            </div>
        `;
        fragment.appendChild(div);
    });
    container.appendChild(fragment);
}

// --- APP DETAILS MODAL ---
window.openDetail = (id) => {
    const app = ALL_APPS.find(a => a.id === id);
    if(app) {
        // Populate Data
        dom.dtTitle.innerText = app.name;
        dom.dtDev.innerText = app.dev;
        dom.dtDesc.innerText = app.desc;
        dom.dtRating.innerText = `${app.rating} ★`;
        dom.dtDownloads.innerText = app.dl;
        
        dom.dtIcon.style.background = app.color;
        dom.dtIcon.innerHTML = `<i class="fa-solid ${app.icon}"></i>`;
        
        // Open Modal
        dom.detailModal.classList.add('modal-active');
    }
};

// --- ACTION LOGIC (THE "GIVE TO GET" SYSTEM) ---
window.attemptAction = (type) => {
    if (!isContributor) {
        // BLOCKED: Close Detail, Open Lock
        dom.detailModal.classList.remove('modal-active');
        dom.lockModal.classList.add('modal-active');
    } else {
        // ALLOWED
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        
        setTimeout(() => {
            btn.innerHTML = type === 'install' ? 'Installed' : 'Downloaded';
            alert(type === 'install' ? "App installed successfully on Virtual Device!" : "Source Code ZIP Downloaded.");
            setTimeout(() => btn.innerHTML = originalText, 2000);
        }, 1500);
    }
};

// --- UPLOAD FLOW ---
window.openUpload = () => {
    dom.lockModal.classList.remove('modal-active');
    dom.uploadModal.classList.add('modal-active');
    
    // Reset UI
    dom.upProgress.style.display = 'none';
    dom.upFill.style.width = '0%';
    document.getElementById('up-name').value = '';
};

window.startUploadProcess = () => {
    const name = document.getElementById('up-name').value;
    if(!name) { alert("Please enter the App Name first."); return; }

    dom.upProgress.style.display = 'block';
    
    // Simulate Upload
    let w = 0;
    const int = setInterval(() => {
        w += 2; // Slower, more realistic
        dom.upFill.style.width = `${w}%`;
        dom.upPct.innerText = `${w}%`;
        
        if(w >= 100) {
            clearInterval(int);
            dom.upStatus.innerText = "Processing Scan...";
            
            setTimeout(() => {
                finalizeUpload(name);
            }, 1000);
        }
    }, 50);
};

function finalizeUpload(appName) {
    // 1. Update State
    isContributor = true;
    localStorage.setItem("unibolt_contributor", "true");
    updateContributorUI();
    
    // 2. Add User App to Store
    const newApp = { 
        id: Date.now(), 
        name: appName, 
        dev: "You", 
        cat: "Community", 
        rating: 5.0, 
        dl: "0", 
        color: "#fff", 
        icon: "fa-box-open", 
        desc: "An app contributed by you to the community." 
    };
    ALL_APPS.unshift(newApp);
    renderGrids(ALL_APPS); // Refresh UI

    // 3. Close & Notify
    dom.uploadModal.classList.remove('modal-active');
    alert(`Success! "${appName}" is now live. You have full access to download all apps.`);
}

// --- UTILS ---
window.closeModal = (id) => {
    document.getElementById(id).classList.remove('modal-active');
};