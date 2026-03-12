/* --- master dashboard logic --- */
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

// ... [Existing UI ELEMENT references kept] ...

// --- 1. MAIN LOGIC (SINGLE AUTH CHECK) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if(user.email === "harshit@gmail.com") {
             window.location.href = "admin.html";
             return;
        }

        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // DYNAMIC SEASON CHECK (The "Big Change")
                applySeasonalEnvironment();

                if (data.paymentStatus !== "Verified") {
                    activateLockdown(data);
                } 
                else if (data.paymentStatus === "Verified" && !data.welcomeShown) {
                    showCelebration(docRef);
                }

                loadUserData(data);
                loadNotifications(data.notifications || []);
                calculateRank(data.xp);

            }
        } catch (error) { console.error("Error:", error); }
    } else {
        window.location.href = "login.html";
    }
});

// --- 2. ADVANCED SEASONAL ENVIRONMENT ---
async function applySeasonalEnvironment() {
    try {
        // Fetch from Global Config instead of individual user
        const seasonRef = doc(db, "platform_settings", "config");
        const seasonSnap = await getDoc(seasonRef);
        
        if (seasonSnap.exists()) {
            const season = seasonSnap.data().season || "summer";
            
            // Apply CSS Class to Body
            document.body.className = `season-${season}`;
            
            // Create Particle Overlay if not exists
            if (!document.getElementById("season-overlay")) {
                const overlay = document.createElement("div");
                overlay.id = "season-overlay";
                document.body.appendChild(overlay);
                
                // Trigger Particles
                if (season === 'winter') spawnParticles('snowflake', 50);
                if (season === 'monsoon') spawnParticles('raindrop', 100);
                if (season === 'autumn') spawnParticles('leaf', 30);
                
                // Show the "Opportunity" Flake Message
                triggerSeasonalPopup(season);
            }
        }
    } catch (e) { console.log("Season Load Error", e); }
}

function triggerSeasonalPopup(season) {
    const msgs = {
        winter: { title: "Winter coding season!", msg: "Ready to grab freezing opportunities?" },
        monsoon: { title: "Monsoon coding rush!", msg: "Rain down your skills on new tasks!" },
        autumn: { title: "Autumn harvest!", msg: "New certificates are falling. Grab yours!" },
        summer: { title: "Summer Heatwave!", msg: "Competition is heating up. level up!" }
    };
    const current = msgs[season] || msgs.summer;

    const popup = document.createElement("div");
    popup.className = "season-popup";
    popup.innerHTML = `
        <div class="season-popup-icon"><i class="fa-solid fa-bolt"></i></div>
        <div class="season-popup-text">
            <h4>${current.title}</h4>
            <p>${current.msg}</p>
        </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 1000);
    setTimeout(() => { popup.classList.remove("show"); setTimeout(()=>popup.remove(), 1000); }, 6000);
}

function spawnParticles(className, count) {
    const container = document.getElementById("season-overlay");
    for(let i=0; i<count; i++) {
        const p = document.createElement("div");
        p.className = className;
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = (Math.random() * 3 + 2) + "s";
        p.style.animationDelay = Math.random() * 5 + "s";
        container.appendChild(p);
    }
}

// ... [loadUserData, activateLockdown, and other original functions kept exactly as you wrote them] ...

// --- 5. FIXED PWA INSTALLATION LOGIC ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // The button will only show if it exists in your HTML
    if(installBtn) installBtn.style.display = "flex"; 
});

if(installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (outcome === 'accepted') installBtn.style.display = "none";
        }
    });
}