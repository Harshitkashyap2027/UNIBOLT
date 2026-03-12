import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);

// --- STATE MANAGEMENT ---
let isContributor = false;
let currentUser = null;
let currentUserData = null;

// Auth guard + contributor check
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "login.html"; return; }
    currentUser = user;

    try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
            currentUserData = userSnap.data();
            const av = document.querySelector('.avatar');
            if (av) av.innerText = currentUserData.avatarIcon || (currentUserData.name ? currentUserData.name.charAt(0) : 'U');
        }
    } catch (e) { console.warn("Profile load failed", e); }

    // Check if user has an approved app submission
    try {
        const q = query(collection(db, "app_submissions"), where("uid", "==", user.uid), where("status", "==", "approved"));
        const snap = await getDocs(q);
        isContributor = !snap.empty;
    } catch (e) { /* fallback to localStorage */ isContributor = localStorage.getItem("unibolt_contributor") === "true"; }

    updateContributorUI();
    renderGrids(ALL_APPS);

    // Search Listener
    const searchEl = document.getElementById('search-input');
    if (searchEl) {
        searchEl.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = ALL_APPS.filter(a => a.name.toLowerCase().includes(term));
            renderGrids(filtered);
        });
    }
});

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
        { id: 2, name: "FitLife Pro", dev: "HealthInc", cat: "Health", rating: 4.7, dl: "500k+", color: "#22c55e", icon: "fa-heart-pulse", desc: "Track calories and workouts with AI-powered coaching. Set goals and monitor real-time vitals." },
        { id: 3, name: "CyberRacer", dev: "GameStudio", cat: "Game", rating: 4.8, dl: "2M+", color: "#ef4444", icon: "fa-gamepad", desc: "High-octane cyberpunk racing game with stunning neon visuals. Compete globally." },
        { id: 4, name: "BeatMaker Pro", dev: "AudioLabs", cat: "Music", rating: 4.6, dl: "100k+", color: "#a855f7", icon: "fa-music", desc: "Create professional beats and loops in seconds with our AI-assisted composer." },
        { id: 5, name: "CryptoWallet", dev: "FinTech Sol", cat: "Finance", rating: 4.5, dl: "800k+", color: "#f59e0b", icon: "fa-bitcoin", desc: "Secure, fast crypto storage and portfolio tracker. Supports 200+ tokens." },
        { id: 6, name: "CodeSnippets", dev: "DevMind", cat: "Dev Tools", rating: 4.8, dl: "300k+", color: "#6366f1", icon: "fa-terminal", desc: "Save, organize, and share code snippets across all your devices." },
        { id: 7, name: "MindMap AI", dev: "BrainSoft", cat: "Productivity", rating: 4.7, dl: "450k+", color: "#ec4899", icon: "fa-diagram-project", desc: "AI-powered mind mapping for students and professionals. Export to PDF." },
        { id: 8, name: "FlashLearn", dev: "EduTech", cat: "Education", rating: 4.9, dl: "600k+", color: "#10b981", icon: "fa-graduation-cap", desc: "Spaced repetition flashcard app with AI-generated content from your notes." },
        { id: 9, name: "TaskForge", dev: "ProdLabs", cat: "Productivity", rating: 4.6, dl: "220k+", color: "#f97316", icon: "fa-list-check", desc: "Powerful task management with Kanban boards, time tracking, and team sync." },
        { id: 10, name: "PixelArt Studio", dev: "CreativeCo", cat: "Utility", rating: 4.8, dl: "180k+", color: "#8b5cf6", icon: "fa-palette", desc: "Professional pixel art editor with animation timeline and export features." },
        { id: 11, name: "WeatherSense", dev: "MeteoTech", cat: "Utility", rating: 4.5, dl: "1.2M+", color: "#0ea5e9", icon: "fa-cloud-sun", desc: "Hyper-local 15-day forecasts with air quality, UV index, and storm alerts." },
        { id: 12, name: "StudyRoom", dev: "EduConnect", cat: "Education", rating: 4.7, dl: "95k+", color: "#22c55e", icon: "fa-book-open", desc: "Real-time collaborative study rooms. Share notes, quiz each other, and stay focused." }
    ];
    apps.push(...featured);

    // Procedural Generator Arrays
    const categories = ["Productivity", "Social", "Health", "Finance", "Game", "Utility", "Education", "Music", "Dev Tools"];
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#64748b", "#10b981", "#6366f1"];
    const icons = ["fa-bolt", "fa-heart", "fa-music", "fa-wallet", "fa-comment", "fa-gamepad", "fa-camera", "fa-plane", "fa-basket-shopping", "fa-robot", "fa-ghost", "fa-dragon", "fa-chess", "fa-map", "fa-fire", "fa-shield"];
    const devs = ["Pixel Labs", "CodeFactory", "AppWiz", "DevStudio", "SoftCorp", "IndieDev", "RocketSoft", "NinjaCoders", "ByteBuilders", "FlutterFam", "DroidMakers", "iCraftStudio"];
    const adjs = ["Super", "Ultra", "Quick", "Smart", "Mega", "Hyper", "Secure", "Cloud", "Nano", "Flex", "Zen", "Pro", "Neon", "Cyber", "Retro", "Swift", "Nova", "Bold"];
    const nouns = ["Notes", "Chat", "Scanner", "Vibe", "Docs", "Drive", "Share", "Cast", "Cleaner", "Booster", "VPN", "Cam", "Player", "Editor", "Link", "Hub", "Board", "Sync"];

    for (let i = 0; i < 250; i++) {
        const adj = adjs[i % adjs.length];
        const noun = nouns[i % nouns.length];
        const cat = categories[i % categories.length];
        const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
        
        apps.push({
            id: i + 100,
            name: `${adj} ${noun}`,
            dev: devs[i % devs.length],
            cat: cat,
            rating: rating,
            dl: (Math.floor(Math.random() * 900) + 10) + "k+",
            color: colors[i % colors.length],
            icon: icons[i % icons.length],
            desc: `Experience the power of ${adj} ${noun}. This ${cat} app offers seamless performance, intuitive design, and cloud synchronization. Built by the UniBolt community.`
        });
    }
    return apps;
}

const ALL_APPS = generateApps();

function updateContributorUI() {
    const pill = dom.contribPill;
    if (!pill) return;
    if (isContributor) {
        pill.innerText = "CONTRIBUTOR VERIFIED ✅";
        pill.classList.add('unlocked');
    } else {
        pill.innerText = "NOT CONTRIBUTOR";
    }
}

// --- RENDER LOGIC ---
function renderGrids(apps) {
    if (dom.recGrid) dom.recGrid.innerHTML = '';
    if (dom.gameGrid) dom.gameGrid.innerHTML = '';
    if (dom.devGrid) dom.devGrid.innerHTML = '';

    const recApps = apps.slice(0, 12);
    const gameApps = apps.filter(a => a.cat === 'Game').slice(0, 10);
    const devApps = apps.filter(a => a.cat === 'Dev Tools' || a.cat === 'Utility').slice(0, 10);

    if (dom.recGrid) appendCards(dom.recGrid, recApps);
    if (dom.gameGrid) appendCards(dom.gameGrid, gameApps);
    if (dom.devGrid) appendCards(dom.devGrid, devApps);
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
            <div class="card-title">${escHtml(app.name)}</div>
            <div class="card-dev">${escHtml(app.dev)}</div>
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
    if (app && dom.detailModal) {
        dom.dtTitle.innerText = app.name;
        dom.dtDev.innerText = app.dev;
        dom.dtDesc.innerText = app.desc;
        dom.dtRating.innerText = `${app.rating} ★`;
        dom.dtDownloads.innerText = app.dl;
        dom.dtIcon.style.background = app.color;
        dom.dtIcon.innerHTML = `<i class="fa-solid ${app.icon}"></i>`;
        dom.detailModal.classList.add('modal-active');
    }
};

// --- ACTION LOGIC (THE "GIVE TO GET" SYSTEM) ---
window.attemptAction = (type) => {
    if (!isContributor) {
        dom.detailModal.classList.remove('modal-active');
        dom.lockModal.classList.add('modal-active');
    } else {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        setTimeout(() => {
            btn.innerHTML = type === 'install' ? 'Installed ✅' : 'Downloaded ✅';
            setTimeout(() => btn.innerHTML = originalText, 2500);
        }, 1500);
    }
};

// --- UPLOAD / SUBMISSION FLOW ---
window.openUpload = () => {
    if (dom.lockModal) dom.lockModal.classList.remove('modal-active');
    if (dom.uploadModal) dom.uploadModal.classList.add('modal-active');
    // Reset form
    document.getElementById('submit-form-section').style.display = 'block';
    document.getElementById('submit-success-section').style.display = 'none';
    if (dom.upProgress) dom.upProgress.style.display = 'none';
    if (dom.upFill) dom.upFill.style.width = '0%';
    const nameEl = document.getElementById('up-name');
    const descEl = document.getElementById('up-desc');
    const designEl = document.getElementById('up-design');
    if (nameEl) nameEl.value = '';
    if (descEl) descEl.value = '';
    if (designEl) designEl.value = '';
};

window.submitAppForReview = async () => {
    const name = (document.getElementById('up-name')?.value || '').trim();
    const desc = (document.getElementById('up-desc')?.value || '').trim();
    const design = (document.getElementById('up-design')?.value || '').trim();
    const cat = document.getElementById('up-cat')?.value || 'Productivity';

    if (!name || !desc || !design) {
        alert('Please fill in all required fields, including the design mockup URL.');
        return;
    }

    // Show progress
    const formSection = document.getElementById('submit-form-section');
    if (dom.upProgress) dom.upProgress.style.display = 'block';
    if (formSection) formSection.querySelector('button').disabled = true;

    let w = 0;
    const simulateProgress = setInterval(() => {
        w = Math.min(w + 5, 90);
        if (dom.upFill) dom.upFill.style.width = `${w}%`;
        if (dom.upPct) dom.upPct.innerText = `${w}%`;
    }, 80);

    try {
        const submissionData = {
            uid: currentUser ? currentUser.uid : 'anonymous',
            studentName: currentUserData?.name || 'Unknown',
            studentEmail: currentUserData?.email || currentUser?.email || '',
            appName: name,
            appDesc: desc,
            appCategory: cat,
            designUrl: design,
            status: 'pending',
            submittedAt: serverTimestamp(),
            type: 'app_store_submission'
        };

        await addDoc(collection(db, "app_submissions"), submissionData);

        clearInterval(simulateProgress);
        if (dom.upFill) dom.upFill.style.width = '100%';
        if (dom.upPct) dom.upPct.innerText = '100%';
        if (dom.upStatus) dom.upStatus.innerText = 'Submitted!';

        await new Promise(r => setTimeout(r, 600));

        // Show success state
        if (dom.upProgress) dom.upProgress.style.display = 'none';
        if (formSection) formSection.style.display = 'none';
        const successSection = document.getElementById('submit-success-section');
        if (successSection) successSection.style.display = 'block';

    } catch (e) {
        clearInterval(simulateProgress);
        console.error("Submission failed:", e);
        if (dom.upProgress) dom.upProgress.style.display = 'none';
        if (formSection) formSection.querySelector('button').disabled = false;
        alert('Submission failed. Please check your connection and try again.');
    }
};

// Kept for backward compatibility
window.startUploadProcess = () => { window.submitAppForReview(); };

// --- UTILS ---
window.closeModal = (id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('modal-active');
};

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}