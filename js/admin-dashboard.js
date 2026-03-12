import { db, requireAdmin, logout } from "./admin-core.js";
import { collection, query, getDocs, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Initialize
requireAdmin();
document.getElementById('logout-btn').addEventListener('click', logout);

// 2. Load Stats
function loadStats() {
    const q = query(collection(db, "users"));
    
    onSnapshot(q, (snapshot) => {
        let revenue = 0;
        let pending = 0;
        let stats = { web: 0, ai: 0, app: 0 };

        snapshot.forEach(doc => {
            const d = doc.data();
            // Skip Admin account in stats
            if(d.email === "harshit@gmail.com") return;

            // Revenue
            if (d.paymentStatus === "Verified") revenue += 200;
            
            // Pending Actions
            if (d.paymentStatus !== "Verified") pending++;

            // Course Data
            const c = (d.enrolledProgram || "web").toLowerCase();
            if (c.includes('web')) stats.web++;
            else if (c.includes('ai')) stats.ai++;
            else stats.app++;
        });

        // Update UI
        document.getElementById("stat-users").innerText = snapshot.size - 1; // Minus admin
        document.getElementById("stat-rev").innerText = "₹" + revenue.toLocaleString();
        document.getElementById("stat-pending").innerText = pending;

        renderChart(stats);
    });
    
    // Load Logs (Bugs)
    loadLogs();
}

function renderChart(data) {
    const ctx = document.getElementById('mainChart');
    if(!ctx) return;

    // Destroy existing if any (simple hack for this setup)
    if(window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Web Dev', 'AI & DS', 'App Dev'],
            datasets: [{
                data: [data.web, data.ai, data.app],
                backgroundColor: ['#22d3ee', '#a78bfa', '#f472b6'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function loadLogs() {
    const q = query(collection(db, "bugs"), orderBy("timestamp", "desc"), limit(10));
    const logContainer = document.getElementById("activity-log");

    onSnapshot(q, (snap) => {
        if(snap.empty) {
            logContainer.innerHTML = "<p>No recent activity.</p>";
            return;
        }
        
        logContainer.innerHTML = "";
        snap.forEach(doc => {
            const d = doc.data();
            const date = d.timestamp?.toDate ? d.timestamp.toDate().toLocaleTimeString() : "";
            
            const item = document.createElement("div");
            item.style.borderBottom = "1px solid #222";
            item.style.padding = "10px 0";
            item.innerHTML = `
                <div style="display:flex; gap:10px; align-items:center;">
                    <i class="fa-solid fa-bug" style="color:#ef4444;"></i>
                    <div>
                        <div style="color:#fff;">${d.userEmail} reported issue</div>
                        <div style="color:#666; font-size:11px;">"${d.description}" • ${date}</div>
                    </div>
                </div>
            `;
            logContainer.appendChild(item);
        });
    });
}

loadStats();