import { db } from "./js/firebase-config.js";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. INITIALIZE ANIMATIONS ---
if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true });
}

// --- 2. NAVBAR & SCROLL LOGIC ---
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    }
});

// --- 3. ANIMATED COUNTERS ---
const counters = document.querySelectorAll('.counter');
let animated = false;

window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.stats-row');
    if (!statsSection) return;
    const position = statsSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.3;

    if (position < screenPos && !animated) {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const inc = target / 100;
            const updateCount = () => {
                const count = +counter.innerText;
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
        animated = true;
    }
});

// --- ENHANCED: SEASONAL THEME MANAGER ---
async function applySeasonalTheme() {
    try {
        const docRef = doc(db, "platform_settings", "config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const season = data.season || 'summer';

            // 1. Reset and Apply Classes
            document.body.classList.remove('season-summer', 'season-winter', 'season-monsoon', 'season-autumn');
            document.body.classList.add(`season-${season}`);

            // 2. Clear and Recreate Overlay
            const oldOverlay = document.getElementById('season-overlay');
            if(oldOverlay) oldOverlay.remove();
            const overlay = document.createElement('div');
            overlay.id = 'season-overlay';
            document.body.appendChild(overlay);

            // 3. Launch Particle Effects
            if (season === 'winter') createSnow(overlay);
            if (season === 'monsoon') createRain(overlay);
            if (season === 'autumn') createLeaves(overlay);
            if (season === 'summer') createSun(overlay);

            // 4. SHOW SEASONAL POPUP MESSAGE
            showSeasonalPopup(season);
        }
    } catch (error) {
        console.error("Error applying season:", error);
    }
}

// --- NEW FUNCTION: POPUP MANAGER ---
function showSeasonalPopup(season) {
    const config = {
        winter: { icon: 'fa-snowflake', title: 'Winter Season Is Here!', msg: 'New opportunities are freezing in! Grab your internship before they melt.' },
        monsoon: { icon: 'fa-cloud-showers-heavy', title: 'Monsoon Coding Rush!', msg: 'Rain down your skills on new projects. Ready to grab opportunities?' },
        autumn: { icon: 'fa-leaf', title: 'Autumn Harvest!', msg: 'Leaves are falling, and so are new career tracks. Start interning today.' },
        summer: { icon: 'fa-sun', title: 'Summer Heatwave!', msg: 'The competition is heating up! Level up your career under the sun.' }
    };

    const current = config[season] || config.summer;

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'season-popup';
    popup.innerHTML = `
        <div class="season-popup-icon"><i class="fa-solid ${current.icon}"></i></div>
        <div class="season-popup-text">
            <h4>${current.title}</h4>
            <p>${current.msg}</p>
        </div>
    `;

    document.body.appendChild(popup);

    // Slide in after 1 second
    setTimeout(() => popup.classList.add('show'), 1000);

    // Slide out after 6 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 1500);
    }, 7000);
}

// --- ENHANCED HELPER FUNCTIONS (Advanced Variety) ---
function createSnow(container) {
    for(let i=0; i<80; i++) { // Increased count for immersion
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        const size = Math.random() * 4 + 2; 
        flake.style.cssText = `
            left: ${Math.random() * 100}vw;
            width: ${size}px;
            height: ${size}px;
            opacity: ${Math.random()};
            animation-duration: ${Math.random() * 3 + 4}s;
            animation-delay: ${Math.random() * 5}s;
            filter: blur(${size > 4 ? '1px' : '0px'});
        `;
        container.appendChild(flake);
    }
}

function createRain(container) {
    for(let i=0; i<120; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.cssText = `
            left: ${Math.random() * 100}vw;
            opacity: ${Math.random() * 0.5};
            animation-duration: ${Math.random() * 0.4 + 0.4}s;
            animation-delay: ${Math.random() * 2}s;
        `;
        container.appendChild(drop);
    }
}

function createLeaves(container) {
    const leafColors = ['#f97316', '#ea580c', '#b45309', '#78350f']; // Varied autumn colors
    for(let i=0; i<40; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.style.cssText = `
            left: ${Math.random() * 100}vw;
            background: ${leafColors[Math.floor(Math.random() * leafColors.length)]};
            animation-duration: ${Math.random() * 4 + 6}s;
            animation-delay: ${Math.random() * 5}s;
            transform: scale(${Math.random() * 0.5 + 0.5}) rotate(${Math.random() * 360}deg);
        `;
        container.appendChild(leaf);
    }
}

// --- 5. FAQ LOADING LOGIC ---
async function loadHomePageFaqs() {
    const container = document.getElementById("faq-list");
    if (!container) return;

    try {
        const q = query(collection(db, "faqs")); 
        const snap = await getDocs(q);
        
        if (snap.empty) {
            container.innerHTML = "<p style='text-align:center;'>No FAQs available currently.</p>";
            return;
        }

        container.innerHTML = ""; 

        snap.forEach(doc => {
            const data = doc.data();
            
            const faqItem = document.createElement("div");
            faqItem.className = "faq-item"; 
            
            faqItem.innerHTML = `
                <div class="question">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <span class="faq-cat-tag">${data.category || 'General'}</span>
                        <span class="q-text">${data.question}</span>
                    </div>
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="answer">
                    ${data.answer}
                </div>
            `;

            const questionDiv = faqItem.querySelector(".question");
            const answerDiv = faqItem.querySelector(".answer");
            const icon = faqItem.querySelector("i");

            questionDiv.addEventListener("click", () => {
                const isOpen = answerDiv.classList.contains("open");
                
                document.querySelectorAll('.answer').forEach(el => el.classList.remove("open"));
                document.querySelectorAll('.question i').forEach(el => el.style.transform = 'rotate(0deg)');
                document.querySelectorAll('.faq-item').forEach(el => el.classList.remove("active-box"));

                if (!isOpen) {
                    answerDiv.classList.add("open");
                    icon.style.transform = "rotate(180deg)";
                    faqItem.classList.add("active-box"); 
                }
            });

            container.appendChild(faqItem);
        });

    } catch (error) {
        console.error("Error loading FAQs:", error);
    }
}

// --- 6. MOBILE MENU LOGIC ---
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
const navButtons = document.querySelector('.nav-buttons');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if(navButtons) navButtons.classList.toggle('active');
        
        const icon = menuBtn.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    });
}

// --- 7. LIVE LEADERBOARD ---
async function updateHomeLeaderboard() {
    if (!db) {
        console.log("Firebase not configured.");
        return; 
    }

    try {
        const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(3));
        const snapshot = await getDocs(q);
        const list = document.getElementById('home-lb-list');
        
        if (list && !snapshot.empty) {
            list.innerHTML = ""; 
            let rank = 1;
            snapshot.forEach(doc => {
                const u = doc.data();
                const isFirst = rank === 1 ? 'first' : '';
                const avatar = u.avatarIcon || u.name.charAt(0);
                const reward = rank === 1 ? '<div class="reward">🎁 Project Unlocked</div>' : '';
                
                list.innerHTML += `
                    <div class="lb-item ${isFirst}">
                        <div class="rank">${rank}</div>
                        <div class="avatar" style="font-size: 18px; display:flex; justify-content:center; align-items:center;">${avatar}</div>
                        <div class="info">
                            <h4>${u.name}</h4>
                            <small>Score: ${u.xp}</small>
                        </div>
                        ${reward}
                    </div>
                `;
                rank++;
            });
        }
    } catch (e) {
        console.log("Error fetching leaderboard", e);
    }
}

// --- 8. INITIALIZE ALL FUNCTIONS ---
document.addEventListener("DOMContentLoaded", () => {
    updateHomeLeaderboard();
    loadHomePageFaqs();
    applySeasonalTheme(); // Start the Seasonal Animation check
});