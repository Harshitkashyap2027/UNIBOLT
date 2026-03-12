import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

async function initCharts() {
    const snap = await getDocs(collection(db, "users"));
    let web = 0, ai = 0, appDev = 0;
    let totalHtml = 0, totalCss = 0, totalJs = 0;
    let count = 0;

    snap.forEach(doc => {
        const d = doc.data();
        if(d.role !== 'admin') {
            count++;
            // Distribution Stats
            if(d.course === 'web') web++;
            else if(d.course === 'ai') ai++;
            else if(d.course === 'app') appDev++;

            // Skill Stats (Mocking logic if data missing)
            if(d.skills) {
                totalHtml += d.skills.html || 0;
                totalCss += d.skills.css || 0;
                totalJs += d.skills.js || 0;
            }
        }
    });

    // 1. Distribution Chart
    new Chart(document.getElementById('distChart'), {
        type: 'doughnut',
        data: {
            labels: ['Web', 'AI', 'App'],
            datasets: [{
                data: [web, ai, appDev],
                backgroundColor: ['#22d3ee', '#a78bfa', '#f472b6'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { position: 'right', labels: { color: 'white' } } } }
    });

    // 2. Skill Radar
    new Chart(document.getElementById('skillChart'), {
        type: 'radar',
        data: {
            labels: ['HTML', 'CSS', 'JavaScript', 'Python', 'React'],
            datasets: [{
                label: 'Average Mastery',
                data: [
                    count ? totalHtml/count : 0, 
                    count ? totalCss/count : 0, 
                    count ? totalJs/count : 0, 
                    count ? (totalHtml/count)*0.8 : 0, // Simulated
                    count ? (totalJs/count)*0.6 : 0 // Simulated
                ],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                pointBackgroundColor: '#fff'
            }]
        },
        options: { 
            scales: { r: { grid: { color: '#333' }, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });

    // 3. Revenue (Simulated Trend for visuals)
    new Chart(document.getElementById('revenueChart'), {
        type: 'line',
        data: {
            labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue (₹)',
                data: [15000, 25000, 18000, 32000, 45000, 60000],
                borderColor: '#10b981',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
        },
        options: { 
            scales: { y: { grid: { color: '#222' } }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

initCharts();