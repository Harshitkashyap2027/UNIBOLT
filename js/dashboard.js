import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// --- UI ELEMENTS ---
const uiName = document.getElementById("dash-name");
const uiLevel = document.getElementById("dash-level");
const uiCerts = document.getElementById("dash-certs");
const uiRank = document.getElementById("dash-rank");
const uiTopPct = document.getElementById("dash-top-pct");
const uiTasksDone = document.getElementById("dash-tasks-done");
const uiProgTxt = document.getElementById("dash-progress-txt");
const uiProgBar = document.getElementById("dash-progress-bar");
const uiMastTxt = document.getElementById("dash-mastery-txt");
const uiMastBar = document.getElementById("dash-mastery-bar");

// Header Elements
const headerXP = document.getElementById("header-xp");
const headerStreak = document.getElementById("header-streak");
const headerAvatar = document.getElementById("header-avatar");

// Notifications
const notifDot = document.getElementById("notif-dot");
const notifDropdown = document.getElementById("notif-dropdown");
const notifList = document.getElementById("notif-list");
const newsMsg = document.getElementById("news-msg");
const newsDate = document.getElementById("news-date");

// Modals
const lockedModal = document.getElementById("locked-modal");
const verifiedModal = document.getElementById("verified-modal");
const whatsappBtn = document.getElementById("whatsapp-btn");
const lockUtrDisplay = document.getElementById("lock-utr-display");

// PWA Install Button
const installBtn = document.getElementById("install-pwa-btn");

// --- 1. MAIN LOGIC (SINGLE AUTH CHECK) ---
// This is the FIXED part: We only run this ONCE.
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // A. Admin Redirect Check
        if(user.email === "harshit@gmail.com") {
             window.location.href = "admin.html";
             return;
        }

        try {
            // B. Fetch User Data
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // C. Lock/Unlock Check
                if (data.paymentStatus !== "Verified") {
                    activateLockdown(data);
                } 
                else if (data.paymentStatus === "Verified" && !data.welcomeShown) {
                    showCelebration(docRef);
                }

                // D. Load UI
                loadUserData(data);
                loadNotifications(data.notifications || []);
                calculateRank(data.xp);

            } else {
                console.log("User document missing.");
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    } else {
        // No user -> Go to Login
        window.location.href = "login.html";
    }
});

// --- 2. DATA LOADING FUNCTIONS ---

function loadUserData(data) {
    if(uiName) uiName.innerText = data.name || "Student";
    if(headerXP) headerXP.innerText = data.xp || 0;
    if(headerStreak) headerStreak.innerText = data.streak || 0;
    
    // Avatar
    if (headerAvatar) {
        if (data.avatarIcon) {
            headerAvatar.innerText = data.avatarIcon;
            headerAvatar.style.background = "#222";
            headerAvatar.style.fontSize = "20px";
        } else {
            headerAvatar.innerText = (data.name || "U").charAt(0).toUpperCase();
        }
    }

    // Progress
    const totalTasks = data.completedTasks ? data.completedTasks.length : 0;
    if(uiCerts) uiCerts.innerText = Math.floor(totalTasks / 100); 
    if(uiLevel) uiLevel.innerText = `Level ${Math.floor(totalTasks / 5) + 1}`;
    if(uiTasksDone) uiTasksDone.innerText = totalTasks;

    const progPct = (totalTasks / 100) * 100;
    if(uiProgTxt) uiProgTxt.innerText = `${Math.round(progPct)}%`;
    if(uiProgBar) uiProgBar.style.width = `${progPct}%`;

    const mastPct = Math.min(100, ((data.xp || 0) / 2000) * 100);
    if(uiMastTxt) uiMastTxt.innerText = `${Math.round(mastPct)}%`;
    if(uiMastBar) uiMastBar.style.width = `${mastPct}%`;
}

function activateLockdown(userData) {
    // Disable Links
    const links = document.querySelectorAll('.nav-item');
    links.forEach(link => {
        if (!link.href.includes('dashboard.html')) {
            link.style.opacity = "0.5";
            link.style.cursor = "not-allowed";
            link.innerHTML += ' <i class="fa-solid fa-lock" style="font-size:10px;"></i>';
            link.onclick = (e) => { e.preventDefault(); lockedModal.classList.remove("hidden"); };
        }
    });

    // Disable Buttons
    const actionBtns = document.querySelectorAll('.btn-primary');
    actionBtns.forEach(btn => {
        if(!btn.closest('.modal-content')) {
            btn.onclick = (e) => { e.preventDefault(); lockedModal.classList.remove("hidden"); };
        }
    });

    // Setup WhatsApp
    const utr = userData.transactionId || "N/A";
    if(lockUtrDisplay) lockUtrDisplay.innerText = utr;

    const msg = `*Payment Verification Request* 🔐\n\nHello Admin,\nI have paid via QR.\n\n👤 *Name:* ${userData.name}\n💳 *UTR:* ${utr}\n\nPlease unlock my dashboard.`;
    
    if(whatsappBtn) {
        whatsappBtn.onclick = () => {
            window.open(`https://wa.me/919258837596?text=${encodeURIComponent(msg)}`, '_blank');
        };
    }
    
    // Show Modal
    if(lockedModal) lockedModal.classList.remove("hidden");
}

async function showCelebration(docRef) {
    if(verifiedModal) verifiedModal.classList.remove("hidden");
    
    // Confetti
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());

    await updateDoc(docRef, { welcomeShown: true });
}

async function calculateRank(userXP) {
    if (!userXP || !uiRank) return;
    uiRank.innerText = "--";
    try {
        const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
        const snapshot = await getDocs(q);
        let rank = -1;
        snapshot.docs.forEach((doc, index) => {
            if (doc.data().xp === userXP) rank = index + 1;
        });

        if (rank > 0) {
            uiRank.innerText = rank;
            if(uiTopPct) uiTopPct.innerText = "1";
        } else {
            uiRank.innerText = "50+";
            if(uiTopPct) uiTopPct.innerText = "5";
        }
    } catch (e) { console.log("Rank error", e); }
}

function loadNotifications(notifs) {
    if (notifs.length > 0 && notifDot) notifDot.style.display = "block";
    if (notifList) {
        notifList.innerHTML = "";
        if (notifs.length === 0) {
            notifList.innerHTML = `<p style="padding: 20px; text-align: center; color: #666; font-size: 13px;">No new messages</p>`;
        } else {
            [...notifs].reverse().forEach(note => {
                const item = document.createElement("div");
                item.className = "notif-item";
                item.innerHTML = `
                    <div style="width: 30px; height: 30px; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;"><i class="fa-solid fa-bullhorn"></i></div>
                    <div>
                        <p style="margin: 0; font-size: 13px; color: #ddd; line-height: 1.4;">${note.message}</p>
                        <span style="font-size: 10px; color: #666; display: block; margin-top: 4px;">${note.date}</span>
                    </div>`;
                notifList.appendChild(item);
            });
        }
    }
    if (newsMsg && newsDate) {
        if (notifs.length > 0) {
            const latest = notifs[notifs.length - 1];
            newsMsg.innerText = latest.message;
            newsDate.innerText = latest.date;
        } else {
            newsMsg.innerText = "No new announcements.";
            newsDate.innerText = "";
        }
    }
}

// --- 3. UI HELPER FUNCTIONS ---
window.toggleNotifications = () => {
    if(notifDropdown) {
        notifDropdown.classList.toggle("hidden");
        if (!notifDropdown.classList.contains("hidden") && notifDot) notifDot.style.display = "none";
    }
};

window.clearNotifications = async () => {
    const user = auth.currentUser;
    if(!user) return;
    try {
        await updateDoc(doc(db, "users", user.uid), { notifications: [] });
        loadNotifications([]); 
    } catch(e) { console.error(e); }
};

window.closeLockModal = () => document.getElementById("locked-modal").classList.add("hidden");
window.closeVerifiedModal = () => document.getElementById("verified-modal").classList.add("hidden");


// --- 4. ANIMATION (Live Feed) ---
const feedContainer = document.getElementById("live-feed-container");
if (feedContainer) {
    const names = ["Rahul", "Anjali", "Vikas", "Priya", "Amit", "Sneha"];
    const actions = ["passed Level 4", "earned 100 XP", "started React", "won a certificate"];
    const colors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b"];

    function addFeedItem() {
        const name = names[Math.floor(Math.random() * names.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const time = Math.floor(Math.random() * 5) + 1;

        const div = document.createElement("div");
        div.className = "feed-item";
        div.innerHTML = `
            <div style="width: 35px; height: 35px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${color};">
                <i class="fa-solid fa-bolt"></i>
            </div>
            <div>
                <p style="margin: 0; font-weight: 500; font-size: 14px;">${name} ${action}</p>
                <small style="color: #666; font-size: 12px;">${time} mins ago</small>
            </div>
        `;
        feedContainer.prepend(div);
        if (feedContainer.children.length > 4) feedContainer.removeChild(feedContainer.lastChild);
    }
    addFeedItem();
    setInterval(addFeedItem, 5000);
}

// --- 5. PWA INSTALLATION LOGIC (RESTORED) ---
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show the install button
    if(installBtn) installBtn.style.display = "block";
});

if(installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
        }
    });
}

// iOS Detection
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test( userAgent );
}

if (isIos() && !window.navigator.standalone) {
    console.log("iOS User Detected");
}