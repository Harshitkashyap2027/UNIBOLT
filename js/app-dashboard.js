import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, collection, query, where, getCountFromServer, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCLaf8yGis2vT0DA4HlGlXXBKgFoCNGfDY",
    authDomain: "unibolt-f7005.firebaseapp.com",
    projectId: "unibolt-f7005",
    storageBucket: "unibolt-f7005.appspot.com",
    messagingSenderId: "121987854250",
    appId: "1:121987854250:web:21a9f50aad54b2143a85d3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TOTAL_APP_MODULES = 100;

// --- 2. DOM ELEMENTS (Complete Mapping) ---
const dom = {
    // Stats & Identity
    name: document.getElementById('dash-name'),
    avatar: document.getElementById('header-avatar'),
    xp: document.getElementById('header-xp'),
    streak: document.getElementById('header-streak'),
    level: document.getElementById('dash-level'),
    rank: document.getElementById('dash-rank'), 
    topPct: document.getElementById('dash-top-pct'),
    certs: document.getElementById('dash-certs'),
    
    // Progress
    tasksDone: document.getElementById('dash-tasks-done'),
    progressTxt: document.getElementById('dash-progress-txt'),
    progressBar: document.getElementById('dash-progress-bar'),
    masteryTxt: document.getElementById('dash-mastery-txt'),
    masteryBar: document.getElementById('dash-mastery-bar'),
    
    // Notifications & Feeds
    feed: document.getElementById('live-feed-container'),
    notifDot: document.getElementById('notif-dot'),
    notifList: document.getElementById('notif-list'),
    notifDropdown: document.getElementById('notif-dropdown'),
    newsMsg: document.getElementById("news-msg"),
    newsDate: document.getElementById("news-date"),

    // Locking & Modals
    lockedModal: document.getElementById("locked-modal"),
    verifiedModal: document.getElementById("verified-modal"),
    lockUtrDisplay: document.getElementById("lock-utr-display"),
    whatsappBtn: document.getElementById("whatsapp-lock-btn"), // Updated ID based on previous HTML

    // Sidebar & System
    installBtn: document.getElementById("install-pwa-btn"),
    sidebar: document.getElementById("mobile-sidebar"),
    menuBtn: document.querySelector(".menu-btn")
};

// --- 3. AUTHENTICATION & MAINTENANCE CHECK ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // A. ADMIN PROTECTION
        if(user.email === "harshit@gmail.com") {
            window.location.href = "admin.html";
            return;
        }

        // B. MAINTENANCE MODE CHECK
        try {
            const settingsSnap = await getDoc(doc(db, "platform_settings", "config")); // Updated collection name based on prev files
            if (settingsSnap.exists() && settingsSnap.data().maintenanceMode === true) {
                window.location.href = "maintenance.html";
                return;
            }
        } catch (e) { console.error("Maintenance check failed", e); }
        
        // C. START APP LISTENERS
        listenToUserProfile(user.uid);
        listenToGlobalAnnouncements();
        calculateRank(user.uid);

        // --- D. LOAD APP MISSIONS ---
        loadLatestTask();
        loadMissionLog();
        updateDailyTaskDisplay();

    } else {
        window.location.href = "login.html";
    }
});

// --- 4. REAL-TIME USER LISTENER ---
function listenToUserProfile(uid) {
    const userRef = doc(db, "users", uid);

    onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();

            // 1. SECURITY LOCKDOWN CHECK
            // Checks if payment is Pending or Rejected
            if (data.paymentStatus === "Pending" || data.paymentStatus === "Rejected") {
                activateLockdown(data);
            } 
            // 2. CELEBRATION CHECK (Just Verified)
            else {
                // Remove lock if it was present
                if(dom.lockedModal) dom.lockedModal.classList.add("hidden");
                
                // Show celebration only once
                if (!data.welcomeShown && data.paymentStatus === "Verified") {
                    showCelebration(userRef);
                }
            }

            // 3. UPDATE DASHBOARD UI
            updateDashboardUI(data);
            
            // 4. UPDATE NOTIFICATIONS (Instant)
            renderNotifications(data.notifications || []);
        }
    });
    
    renderFeed(); // Load the community feed
}

// --- 5. LOCKDOWN MODE ---
function activateLockdown(userData) {
    // 1. Show Modal
    if(dom.lockedModal) dom.lockedModal.classList.remove("hidden");

    // 2. Disable Sidebar Links (Except permitted ones)
    const links = document.querySelectorAll('.nav-item');
    links.forEach(link => {
        const href = link.getAttribute('href');
        // Allow: Dashboard itself, Contact, Logout
        if (href !== 'app-dashboard.html' && href !== 'contact.html' && !link.classList.contains('logout-btn')) {
            link.style.opacity = "0.5";
            link.style.cursor = "not-allowed";
            // Add lock icon if not already there
            if(!link.innerHTML.includes('fa-lock')) {
                link.innerHTML = `<i class="fa-solid fa-lock" style="font-size:10px; margin-right:5px;"></i> ${link.innerText}`;
            }
            // Prevent click
            link.onclick = (e) => { 
                e.preventDefault(); 
                if(dom.lockedModal) dom.lockedModal.classList.remove("hidden"); 
            };
            link.removeAttribute("href");
        }
    });

    // 3. Disable Action Buttons
    const actionBtns = document.querySelectorAll('.btn-primary');
    actionBtns.forEach(btn => {
        // Don't disable buttons inside the modal itself
        if(!btn.closest('.modal-content')) {
            btn.classList.add('locked-btn-style'); // Use CSS class
            btn.innerHTML = '<i class="fa-solid fa-lock"></i> Locked';
            btn.onclick = (e) => { 
                e.preventDefault(); 
                if(dom.lockedModal) dom.lockedModal.classList.remove("hidden"); 
            };
        }
    });

    // 4. WhatsApp Button Logic
    const utr = userData.transactionId || "N/A";
    if(dom.lockUtrDisplay) dom.lockUtrDisplay.innerText = utr;

    const msg = `*Course Access Request* 🔐\n\nHello Admin,\nI have paid via QR.\n\n👤 *Name:* ${userData.name}\n📱 *Course:* App Development\n💳 *UTR:* ${utr}\n\nPlease unlock my dashboard.`;
    
    if(dom.whatsappBtn) {
        dom.whatsappBtn.onclick = () => {
            window.open(`https://wa.me/919258837596?text=${encodeURIComponent(msg)}`, '_blank');
        };
    }
}

// --- 6. CELEBRATION (CONFETTI) ---
async function showCelebration(userRef) {
    if(dom.verifiedModal) dom.verifiedModal.classList.remove("hidden");
    
    // Confetti Effect (Blue/Cyan Theme)
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0ea5e9', '#3b82f6', '#ffffff'] });
    }

    // Update DB so it doesn't show again
    await updateDoc(userRef, { welcomeShown: true });
}

// --- 7. UI UPDATER ---
function updateDashboardUI(data) {
    const userName = data.name || "Developer";
    
    // Name
    if(dom.name) dom.name.innerText = userName.split(" ")[0]; 
    
    // Avatar Logic
    if (dom.avatar) {
        if (data.avatarIcon) {
            dom.avatar.innerText = data.avatarIcon; 
            dom.avatar.style.fontSize = "20px";
            dom.avatar.style.background = "rgba(255,255,255,0.1)"; 
        } else {
            dom.avatar.innerText = userName.charAt(0).toUpperCase();
            dom.avatar.style.fontSize = "16px";
        }
    }

    // XP & Streak
    if (dom.xp) dom.xp.innerText = (data.xp || 0).toLocaleString();
    if (dom.streak) dom.streak.innerText = data.streak || 0;

    // Levels & Certs
    const currentLevel = Math.floor((data.xp || 0) / 500) + 1;
    if (dom.level) dom.level.innerText = `Level ${currentLevel}`;
    if (dom.certs) dom.certs.innerText = Math.floor(currentLevel / 10);

    // Progress Calculation
    const completedCount = data.completedTasks ? data.completedTasks.length : 0;
    if (dom.tasksDone) dom.tasksDone.innerText = completedCount;
    
    const progressPct = Math.min(100, Math.round((completedCount / TOTAL_APP_MODULES) * 100));
    if (dom.progressTxt) dom.progressTxt.innerText = `${progressPct}%`;
    if (dom.progressBar) dom.progressBar.style.width = `${progressPct}%`;

    // Mastery Calculation
    const masteryPct = Math.min(100, Math.round(((data.xp || 0) / 5000) * 100));
    if (dom.masteryTxt) dom.masteryTxt.innerText = `${masteryPct}%`;
    if (dom.masteryBar) dom.masteryBar.style.width = `${masteryPct}%`;
}

// --- 8. RANK CALCULATION ---
async function calculateRank(uid) {
    try {
        const userSnap = await getDoc(doc(db, "users", uid));
        const myXP = userSnap.data().xp || 0;

        // Count how many users have MORE xp than me
        const q = query(collection(db, "users"), where("xp", ">", myXP));
        const snapshot = await getCountFromServer(q);
        const rank = snapshot.data().count + 1;

        // Get total users for percentage
        const totalSnap = await getCountFromServer(collection(db, "users"));
        const totalUsers = totalSnap.data().count;

        if (dom.rank) dom.rank.innerText = rank;
        
        const pct = Math.ceil((rank / totalUsers) * 100);
        if (dom.topPct) dom.topPct.innerText = `Top ${pct}%`;

    } catch (e) {
        if (dom.rank) dom.rank.innerText = "--";
    }
}

// --- 9. NOTIFICATIONS & ANNOUNCEMENTS ---
function renderNotifications(notifs) {
    // 1. Unread Dot Logic
    const unread = notifs.filter(n => !n.read);
    if (dom.notifDot) dom.notifDot.style.display = unread.length > 0 ? "block" : "none";

    // 2. Update System News (Last Notification)
    if (dom.newsMsg && notifs.length > 0) {
        const latest = notifs[notifs.length - 1];
        dom.newsMsg.innerText = latest.message;
        dom.newsDate.innerText = latest.date;
    }

    // 3. Render Dropdown List
    if (dom.notifList) {
        dom.notifList.innerHTML = '';
        if(notifs.length === 0) {
            dom.notifList.innerHTML = '<div style="padding:15px; text-align:center; color:#666;">No notifications</div>';
            return;
        }

        [...notifs].reverse().forEach(n => {
            const item = document.createElement('div');
            item.className = "notif-item";
            item.style.opacity = n.read ? 0.5 : 1;
            item.innerHTML = `
                <div style="color: #0ea5e9; margin-top: 2px;">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div>
                    <div style="color: white; font-size: 13px; line-height: 1.4;">${n.message}</div>
                    <div style="color: #666; font-size: 10px; margin-top: 4px;">${n.date}</div>
                </div>
            `;
            dom.notifList.appendChild(item);
        });
    }
}

// Global Announcements
function listenToGlobalAnnouncements() {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"), limit(1));
    onSnapshot(q, (snap) => {
        if (!snap.empty) {
            const data = snap.docs[0].data();
            if(dom.newsMsg) dom.newsMsg.innerText = `${data.title}: ${data.message}`;
            if(dom.newsDate) dom.newsDate.innerText = data.date.toDate().toLocaleDateString();
        }
    });
}

// --- 10. GLOBAL WINDOW FUNCTIONS ---
window.toggleNotifications = async function() {
    dom.notifDropdown.classList.toggle('hidden');
    
    if(!dom.notifDropdown.classList.contains('hidden')) {
        if(dom.notifDot) dom.notifDot.style.display = "none";
        
        const user = auth.currentUser;
        if(user) {
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);
            if(snap.exists()) {
                const oldNotifs = snap.data().notifications || [];
                if(oldNotifs.some(n => !n.read)) {
                    const newNotifs = oldNotifs.map(n => ({ ...n, read: true }));
                    await updateDoc(userRef, { notifications: newNotifs });
                }
            }
        }
    }
};

window.clearNotifications = async () => {
    const user = auth.currentUser;
    if(!user) return;
    await updateDoc(doc(db, "users", user.uid), { notifications: [] });
};

window.closeVerifiedModal = () => { if(dom.verifiedModal) dom.verifiedModal.classList.add("hidden"); }
window.closeLockModal = () => { if(dom.lockedModal) dom.lockedModal.classList.add("hidden"); }

window.logout = function() {
    signOut(auth).then(() => window.location.href = "login.html");
};
const logoutBtn = document.querySelector(".logout-btn");
if(logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); window.logout(); });


// --- 11. COMMUNITY FEED (App Development Theme) ---
// Customized for App Dev Actions
const appEvents = [
    { user: "Dev R.", action: "deployed", target: "APK v1.0", time: "2m ago", icon: "fa-android", color: "#3ddc84" },
    { user: "Sarah L.", action: "fixed", target: "Null Error", time: "8m ago", icon: "fa-bug", color: "#ef4444" },
    { user: "Aman K.", action: "published", target: "Play Store", time: "15m ago", icon: "fa-google-play", color: "#3b82f6" },
    { user: "Rohan S.", action: "integrated", target: "Firebase", time: "30m ago", icon: "fa-fire", color: "#f59e0b" }
];

function renderFeed() {
    if (!dom.feed) return;
    dom.feed.innerHTML = '';
    
    appEvents.forEach(event => {
        const item = document.createElement('div');
        item.style.cssText = `display: flex; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px;`;
        item.innerHTML = `
            <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: ${event.color};">
                <i class="fa-brands ${event.icon}"></i>
            </div>
            <div style="flex: 1;">
                <span style="font-weight: 600; color: #e0e0e0;">${event.user}</span> 
                <span style="color: #a1a1aa;">${event.action}</span> 
                <span style="color: ${event.color};">${event.target}</span>
            </div>
            <div style="color: #666; font-size: 11px;">${event.time}</div>
        `;
        dom.feed.appendChild(item);
    });
}

// --- 12. PWA INSTALLATION ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if(dom.installBtn) dom.installBtn.style.display = "block";
});

if(dom.installBtn) {
    dom.installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
        }
    });
}

// --- 13. APP MISSION CONTROL ---

// A. Load "Latest Task" Widget 
async function loadLatestTask() {
    const widget = document.getElementById("latest-task-widget");
    if(!widget) return;

    try {
        // Query specific to App Development
        const q = query(
            collection(db, "tasks"), 
            where("module", "==", "App Development"), // Changed from AI
            orderBy("day", "desc"), 
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const task = snapshot.docs[0].data();
            
            // Populate Details
            const titleEl = document.getElementById("task-title");
            const descEl = document.getElementById("task-desc");
            const dateEl = document.getElementById("task-date");
            const linkBtn = document.getElementById("task-link");

            if(titleEl) titleEl.innerText = task.title;
            if(descEl) descEl.innerText = task.desc;
            if(dateEl) dateEl.innerText = `DAY ${task.day}`; 
            
            if (task.video && linkBtn) {
                linkBtn.href = task.video;
                linkBtn.style.display = "inline-flex";
            } else if (linkBtn) {
                linkBtn.style.display = "none";
            }

            // Reveal Widget
            widget.style.display = "block";
            widget.classList.add("animate-entry");
        } 
    } catch (error) {
        console.error("Widget Error:", error);
    }
}

// B. Load "Mission Log" (List of App tasks)
async function loadMissionLog() {
    const container = document.getElementById("mission-log-container");
    if(!container) return;

    try {
        // Fetch ALL App Development tasks
        const q = query(
            collection(db, "tasks"), 
            where("module", "==", "App Development"), // Changed from AI
            orderBy("day", "asc")
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            container.innerHTML = `<p style="text-align:center; color:#666; padding:20px;">No missions available.</p>`;
            return;
        }

        container.innerHTML = ""; 

        snapshot.forEach(docSnap => {
            const t = docSnap.data();
            const div = document.createElement("div");
            div.style.cssText = "display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); transition:0.2s;";
            
            div.onmouseover = () => div.style.background = "rgba(255,255,255,0.06)";
            div.onmouseout = () => div.style.background = "rgba(255,255,255,0.03)";

            div.innerHTML = `
                <div style="width: 40px; height: 40px; background: rgba(14, 165, 233, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0ea5e9; font-weight: bold; font-size: 14px;">
                    ${t.day}
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 3px 0; font-size: 14px; color: white;">${t.title}</h4>
                    <p style="margin: 0; font-size: 11px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${t.desc}</p>
                </div>
                ${t.video ? `
                    <a href="${t.video}" target="_blank" style="width: 30px; height: 30px; border: 1px solid #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #aaa; text-decoration: none;">
                        <i class="fa-solid fa-play" style="font-size: 10px;"></i>
                    </a>
                ` : '<i class="fa-solid fa-lock" style="color:#333; font-size:12px;"></i>'}
            `;
            container.appendChild(div);
        });
    } catch (e) { 
        console.error(e); 
        container.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:12px;">Index Required (Check Console)</p>`;
    }
}

// C. Widget Dismiss Function
window.markRead = () => {
    const w = document.getElementById("latest-task-widget");
    if(w) {
        w.style.opacity = "0";
        setTimeout(() => w.style.display = "none", 300);
    }
}

function updateDailyTaskDisplay() {
    const displayElement = document.getElementById("daily-task-number");
    if(!displayElement) return;

    // --- CONFIGURATION: Set the Course Start Date Here ---
    const startDate = new Date("2025-12-01"); 
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Logic: Clamp between Day 1 and Day 20
    let currentDay = diffDays;
    if (currentDay < 1) currentDay = 1;
    if (currentDay > 20) currentDay = 20; // Cap at 20

    displayElement.innerText = `Day ${currentDay}`;
}