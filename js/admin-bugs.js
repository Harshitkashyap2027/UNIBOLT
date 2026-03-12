import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

async function loadBugs() {
    const list = document.getElementById("bug-list");
    const snap = await getDocs(collection(db, "bug_reports"));
    
    if(snap.empty) {
        list.innerHTML = `<div style="color:#666;">No bugs reported yet. Click "Simulate Report" to test.</div>`;
        return;
    }

    list.innerHTML = "";
    snap.forEach(d => {
        const bug = d.data();
        const severity = bug.severity || 'medium';
        const card = document.createElement("div");
        card.className = `bug-card ${severity}`;
        card.innerHTML = `
            <div class="bug-header">
                <span style="font-weight:bold; font-size:14px;">${bug.title}</span>
                <span class="status ${bug.status}">${bug.status}</span>
            </div>
            <p style="color:#aaa; font-size:12px; margin-bottom:15px;">${bug.desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#666;">
                <span>Reported by: ${bug.user || 'Anon'}</span>
                ${bug.status === 'open' ? `<button onclick="resolveBug('${d.id}')" style="background:#10b981; border:none; color:white; padding:4px 8px; border-radius:4px; cursor:pointer;">Resolve</button>` : ''}
            </div>
        `;
        list.appendChild(card);
    });
}

window.resolveBug = async (id) => {
    await updateDoc(doc(db, "bug_reports", id), { status: 'closed' });
    loadBugs();
}

window.createTestBug = async () => {
    await addDoc(collection(db, "bug_reports"), {
        title: "Login Page Glitch",
        desc: "The login button flickers on mobile devices when dark mode is enabled.",
        severity: "medium",
        status: "open",
        user: "student@test.com",
        date: new Date()
    });
    loadBugs();
}

loadBugs();