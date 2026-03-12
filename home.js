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

// --- 3. ANIMATED COUNTERS (IntersectionObserver for all .counter elements) ---
const counters = document.querySelectorAll('.counter');

function animateCounter(counter) {
    const target = +counter.getAttribute('data-target');
    const inc = target / 80;
    counter.innerText = '0';
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
}

if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
} else {
    // Fallback: old scroll logic
    let animated = false;
    window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('.stats-row');
        if (!statsSection) return;
        const position = statsSection.getBoundingClientRect().top;
        if (position < window.innerHeight / 1.3 && !animated) {
            counters.forEach(c => animateCounter(c));
            animated = true;
        }
    });
}

// --- ENHANCED: SEASONAL THEME MANAGER (12 Monthly Themes) ---
async function applySeasonalTheme() {
    try {
        const docRef = doc(db, "platform_settings", "config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const season = data.season || 'summer';

            // 1. Reset and Apply Classes (all 12 months)
            const allSeasons = ['summer','winter','monsoon','autumn',
                'january','february','march','april','may','june',
                'july','august','september','october','november','december'];
            allSeasons.forEach(s => document.body.classList.remove(`season-${s}`));
            document.body.classList.add(`season-${season}`);

            // 2. Clear and Recreate Overlay
            const oldOverlay = document.getElementById('season-overlay');
            if(oldOverlay) oldOverlay.remove();
            const overlay = document.createElement('div');
            overlay.id = 'season-overlay';
            document.body.appendChild(overlay);

            // 3. Launch Particle Effects
            const winterMonths = ['winter', 'december', 'january'];
            const rainMonths = ['monsoon', 'june', 'july', 'august'];
            const leafMonths = ['autumn', 'september', 'october', 'november'];
            if (winterMonths.includes(season)) createSnow(overlay);
            else if (rainMonths.includes(season)) createRain(overlay);
            else if (leafMonths.includes(season)) createLeaves(overlay);
            else createSun(overlay);

            // 4. SHOW SEASONAL POPUP MESSAGE
            showSeasonalPopup(season);
        }
    } catch (error) {
        console.error("Error applying season:", error);
    }
}

// --- NEW FUNCTION: POPUP MANAGER (12 months) ---
function showSeasonalPopup(season) {
    const config = {
        winter:    { icon: 'fa-snowflake',        title: 'Winter Season!',        msg: 'Cold nights, hot skills. Start your internship today.' },
        monsoon:   { icon: 'fa-cloud-showers-heavy', title: 'Monsoon Coding Rush!', msg: 'Rain down your skills on new projects.' },
        autumn:    { icon: 'fa-leaf',              title: 'Autumn Harvest!',       msg: 'Leaves are falling, opportunities are rising.' },
        summer:    { icon: 'fa-sun',               title: 'Summer Heatwave!',      msg: 'The competition is heating up! Level up your career.' },
        january:   { icon: 'fa-snowflake',        title: '✨ New Year, New Skills!', msg: 'Start fresh. Enroll in an internship track today.' },
        february:  { icon: 'fa-heart',             title: '💝 Love Your Career!',   msg: "Valentine's special — unlock your dream track." },
        march:     { icon: 'fa-seedling',          title: '🌸 Spring Into Action!', msg: 'Holi vibes! Colors of new beginnings await.' },
        april:     { icon: 'fa-cloud-rain',        title: '🌧️ Spring Sprint!',      msg: 'April showers bring career flowers.' },
        may:       { icon: 'fa-sun',               title: '☀️ Early Summer Push!',  msg: 'Beat the heat — earn a certificate before exams.' },
        june:      { icon: 'fa-cloud-sun',         title: '🌤️ Pre-Monsoon Prep!',   msg: 'Monsoon is coming. Get certified before it hits.' },
        july:      { icon: 'fa-umbrella',          title: '⛈️ Monsoon Hustle!',     msg: 'Stay inside, stay productive. Code your way up.' },
        august:    { icon: 'fa-flag',              title: '🇮🇳 Independence Month!', msg: "India's future is tech. Be part of it." },
        september: { icon: 'fa-leaf',              title: '🍂 Autumn Ambition!',    msg: 'Season of change. Start your internship now.' },
        october:   { icon: 'fa-jack-o-lantern',   title: '🎃 Festive Coding!',     msg: 'Diwali is near. Light up your resume.' },
        november:  { icon: 'fa-cloud',             title: '🍁 Pre-Winter Drive!',   msg: 'Last push before winter. Finish strong.' },
        december:  { icon: 'fa-gifts',             title: '🎄 Year-End Sprint!',    msg: 'Close the year with a new certificate.' },
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

function createSun(container) {
    const glare = document.createElement('div');
    glare.className = 'sun-glare';
    container.appendChild(glare);
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