import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, doc, updateDoc, setDoc, deleteDoc, getDoc, query, orderBy, 
    onSnapshot, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIG ---
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
let allStudents = [];

// --- UTILS ---
window.showToast = function(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = message;
    toast.querySelector('i').className = type === 'success' ? 'fa-solid fa-circle-check' : (type === 'error' ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-info');
    toast.querySelector('i').style.color = type === 'success' ? '#30d158' : (type === 'error' ? '#ff453a' : '#0a84ff');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
window.closeModal = (id) => document.getElementById(id).classList.remove("active");

window.logout = function() {
    window.customConfirm("Are you sure you want to log out?", "reset", () => {
        signOut(auth).then(() => window.location.href = "index.html");
    });
}

// --- LOGGING ---
async function logSecurityEvent(type, role, user, msg) {
    try {
        let ip = 'Unknown', location = 'Unknown';
        try {
            const geo = await fetch('https://ipapi.co/json/').then(r => r.json());
            ip = geo.ip || 'Unknown';
            location = [geo.city, geo.region, geo.country_name].filter(Boolean).join(', ') || 'Unknown';
        } catch(e) {
            try { ip = (await fetch('https://api.ipify.org?format=json').then(r => r.json())).ip; } catch(e2) {}
        }
        // Detect device type from userAgent
        const ua = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad/.test(ua);
        const isTablet = /iPad|Tablet/.test(ua);
        const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
        const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : ua.includes('Android') ? 'Android' : ua.includes('Linux') ? 'Linux' : 'Unknown';
        const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Unknown';

        await addDoc(collection(db, "audit_logs"), {
            type, role, userName: user, message: msg,
            ip, location,
            userAgent: ua,
            device: `${deviceType} — ${os} — ${browser}`,
            page: window.location.pathname,
            timestamp: serverTimestamp()
        });
    } catch (e) { console.error(e); }
}

// --- REALTIME DATA ---
window.onload = () => { setupRealtimeListener(); };

function setupRealtimeListener() {
    const q = query(collection(db, "users"), orderBy("paymentDate", "desc"));
    onSnapshot(q, (snapshot) => {
        allStudents = [];
        let pending = 0, revenue = 0;
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            data.uid = docSnap.id;
            allStudents.push(data);
            if(data.paymentStatus === "Pending") pending++;
            if(data.paymentStatus === "Verified") revenue += 200;
        });
        document.getElementById("stat-total").innerText = allStudents.length;
        document.getElementById("stat-pending").innerText = pending;
        document.getElementById("stat-rev").innerText = "₹" + revenue.toLocaleString();
        window.filterTable();
    });
}

function renderTable(data) {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";
    if(data.length === 0) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#666;">No students found.</td></tr>`; return; }

    data.forEach(s => {
        const avatar = s.avatarIcon || "👤";
        const approveBtn = s.paymentStatus !== 'Verified' 
            ? `<button class="btn-icon btn-approve" onclick="window.quickApprove('${s.uid}', '${s.name}')"><i class="fa-solid fa-check"></i></button>` : '';

        const row = `
            <tr>
                <td data-label="Student">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="background:#2c2c2e; width:40px; height:40px; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:20px;">${avatar}</div>
                        <div>
                            <div style="font-weight:600; color:white; font-size:15px;">${s.name || "Unknown"}</div>
                            <div style="font-size:13px; color:#8e8e93;">${s.email}</div>
                        </div>
                    </div>
                </td>
                <td data-label="Program">
                    <div style="color:white; font-size:14px;">${s.enrolledProgram || "N/A"}</div>
                    <div style="font-size:12px; color:#8e8e93;">${s.course || "N/A"} • ${s.year || ""}</div>
                </td>
                <td data-label="Payment">
                    <div style="font-family:'SF Mono', monospace; color:#fff; font-size:13px;">${s.transactionId || "NO UTR"}</div>
                    <div style="font-size:12px; font-weight:700; color:${s.paymentStatus==='Verified'?'#30d158':(s.paymentStatus==='Pending'?'#ff9f0a':'#ff453a')}">${s.paymentStatus}</div>
                </td>
                <td>
                    <div class="btn-group">
                        ${approveBtn}
                        <button class="btn-icon btn-reset" onclick="window.quickReset('${s.uid}', '${s.name}')"><i class="fa-solid fa-rotate-left"></i></button>
                        <button class="btn-icon btn-msg" onclick="window.openBroadcastModal('${s.uid}', '${s.name}')"><i class="fa-solid fa-comment-dots"></i></button>
                        <button class="btn-icon" onclick="window.openEdit('${s.uid}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon btn-delete" onclick="window.deleteUser('${s.uid}', '${s.name}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

window.filterTable = function(val = "") {
    const filter = document.getElementById("course-filter").value;
    if(!val) val = document.querySelector(".search-bar").value;
    const lower = val.toLowerCase();
    const res = allStudents.filter(s => {
        const matchCourse = filter === "all" || s.enrolledProgram === filter;
        const matchSearch = (s.name && s.name.toLowerCase().includes(lower)) || (s.email && s.email.toLowerCase().includes(lower));
        return matchCourse && matchSearch;
    });
    renderTable(res);
}

// --- POP-UP ACTION LOGIC ---
window.quickApprove = function(uid, name) {
    window.customConfirm(`Approve payment for ${name}?`, "approve", async () => {
        try {
            await updateDoc(doc(db, "users", uid), { paymentStatus: "Verified" });
            window.showToast("Approved Successfully", "success");
            logSecurityEvent("UPDATE", "Admin", "MasterAdmin", `Approved: ${name}`);
        } catch(e) { window.showToast("Error", "error"); }
    });
}

window.quickReset = function(uid, name) {
    window.customConfirm(`Reset progress for ${name}?`, "reset", async () => {
        try {
            await updateDoc(doc(db, "users", uid), { xp: 0, streak: 0, completedTasks: [] });
            window.showToast("Progress Reset", "success");
        } catch(e) { window.showToast("Error", "error"); }
    });
}

window.deleteUser = function(uid, name) {
    window.customConfirm(`Permanently delete ${name}?`, "delete", async () => {
        try {
            await deleteDoc(doc(db, "users", uid));
            window.showToast("User Deleted", "success");
            logSecurityEvent("DELETE", "Admin", "MasterAdmin", `Deleted: ${name}`);
        } catch(e) { window.showToast("Error", "error"); }
    });
}

// --- MODAL OPENERS ---
window.openAddModal = function() {
    document.getElementById("student-modal").classList.add("active");
    document.getElementById("student-form").reset();
    document.getElementById("inp-uid").value = "";
    document.getElementById("inp-paymentDate").value = new Date().toLocaleDateString();
}

window.openEdit = function(uid) {
    const s = allStudents.find(stu => stu.uid === uid);
    if(!s) return;
    document.getElementById("student-modal").classList.add("active");
    document.getElementById("inp-uid").value = uid;
    document.getElementById("inp-name").value = s.name || "";
    document.getElementById("inp-phone").value = s.phone || "";
    document.getElementById("inp-email").value = s.email || "";
    document.getElementById("inp-avatarIcon").value = s.avatarIcon || "";
    document.getElementById("inp-state").value = s.state || "";
    document.getElementById("inp-city").value = s.city || "";
    document.getElementById("inp-college").value = s.college || "";
    document.getElementById("inp-year").value = s.year || "";
    document.getElementById("inp-course").value = s.course || "";
    document.getElementById("inp-enrolledProgram").value = s.enrolledProgram || "";
    document.getElementById("inp-paymentStatus").value = s.paymentStatus || "Pending";
    document.getElementById("inp-transactionId").value = s.transactionId || "";
    document.getElementById("inp-paymentDate").value = s.paymentDate || "";
    document.getElementById("inp-xp").value = s.xp || 0;
    document.getElementById("inp-streak").value = s.streak || 0;
}

window.openBroadcastModal = function(uid, name) {
    document.getElementById("broadcast-modal").classList.add("active");
    document.getElementById("bc-target-uid").value = uid;
    document.getElementById("bc-target-name").innerText = uid === 'all' ? "Everyone" : name;
}

window.sendBroadcast = async function() {
    const uid = document.getElementById("bc-target-uid").value;
    const msg = document.getElementById("bc-message").value;
    if(!msg) return window.showToast("Enter a message", "error");
    
    try {
        const notif = { message: msg, date: new Date().toLocaleDateString(), read: false };
        if(uid === 'all') {
            const batch = allStudents.map(async s => {
                const ref = doc(db, "users", s.uid);
                const snap = await getDoc(ref);
                await updateDoc(ref, { notifications: [...(snap.data().notifications||[]), notif] });
            });
            await Promise.all(batch);
        } else {
            const ref = doc(db, "users", uid);
            const snap = await getDoc(ref);
            await updateDoc(ref, { notifications: [...(snap.data().notifications||[]), notif] });
        }
        window.showToast("Message Sent", "success");
        window.closeModal("broadcast-modal");
    } catch(e) { window.showToast("Error sending", "error"); }
}

document.getElementById("student-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const uid = document.getElementById("inp-uid").value;
    const data = {
        name: document.getElementById("inp-name").value,
        phone: document.getElementById("inp-phone").value,
        email: document.getElementById("inp-email").value,
        avatarIcon: document.getElementById("inp-avatarIcon").value,
        state: document.getElementById("inp-state").value,
        city: document.getElementById("inp-city").value,
        college: document.getElementById("inp-college").value,
        year: document.getElementById("inp-year").value,
        course: document.getElementById("inp-course").value,
        enrolledProgram: document.getElementById("inp-enrolledProgram").value,
        paymentStatus: document.getElementById("inp-paymentStatus").value,
        transactionId: document.getElementById("inp-transactionId").value,
        paymentDate: document.getElementById("inp-paymentDate").value,
        xp: Number(document.getElementById("inp-xp").value),
        streak: Number(document.getElementById("inp-streak").value)
    };
    
    try {
        if(uid) {
            await updateDoc(doc(db, "users", uid), data);
            window.showToast("Updated", "success");
            logSecurityEvent("UPDATE", "Admin", "MasterAdmin", `Updated student: ${data.name} (${data.email}) — Status: ${data.paymentStatus}, XP: ${data.xp}`);
        } else {
            const secondaryApp = initializeApp(firebaseConfig, "Secondary");
            const pass = document.getElementById("inp-tempPass").value || "password123";
            const user = await createUserWithEmailAndPassword(getAuth(secondaryApp), data.email, pass);
            await setDoc(doc(db, "users", user.user.uid), { ...data, createdAt: serverTimestamp(), notifications: [] });
            await signOut(getAuth(secondaryApp));
            window.showToast("Created", "success");
            logSecurityEvent("CREATE", "Admin", "MasterAdmin", `Created new student: ${data.name} (${data.email}) — Program: ${data.enrolledProgram}`);
        }
        window.closeModal("student-modal");
    } catch(e) { window.showToast(e.message, "error"); }
});