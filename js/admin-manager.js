import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FIREBASE CONFIG
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
let allStudents = [];

window.onload = () => { fetchData(); };

async function fetchData() {
    // Order by latest created
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    allStudents = [];
    let pending = 0, revenue = 0;

    snapshot.forEach(doc => {
        let data = doc.data();
        data.id = doc.id;
        allStudents.push(data);
        
        if(data.paymentStatus === "Pending") pending++;
        // Assuming 200 is the course fee, adjust logic if dynamic
        if(data.paymentStatus === "Verified") revenue += 200;
    });

    document.getElementById("stat-total").innerText = allStudents.length;
    document.getElementById("stat-pending").innerText = pending;
    document.getElementById("stat-rev").innerText = "₹" + revenue.toLocaleString();

    renderTable(allStudents);
}

function renderTable(data) {
    const tbody = document.getElementById("student-list");
    tbody.innerHTML = "";

    data.forEach(s => {
        let badge = s.paymentStatus === 'Verified' ? 'verified' : (s.paymentStatus === 'Pending' ? 'pending' : 'rejected');
        let badgeColor = badge === 'pending' ? 'color:#f59e0b; background:rgba(245,158,11,0.1)' : badge === 'verified' ? 'color:#10b981; background:rgba(16,185,129,0.1)' : 'color:#ef4444; background:rgba(239,68,68,0.1)';
        
        // Handle Program Name
        let program = s.enrolledProgram || s.course || "N/A";
        
        // Handle Avatar Display in Table
        let avatarDisplay;
        if (s.avatarIcon) {
            avatarDisplay = `<img src="${s.avatarIcon}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">`;
        } else {
            avatarDisplay = `<div class="log-icon" style="background:#333; color:white; font-weight:bold;">${s.name.charAt(0).toUpperCase()}</div>`;
        }

        let row = `
            <tr>
                <td>
                    <div class="log-item" style="border:none; padding:0; display:flex; align-items:center; gap:10px;">
                        ${avatarDisplay}
                        <div>
                            <div style="font-weight:bold; color:white;">${s.name}</div>
                            <div style="font-size:11px; color:#666;">${s.email}</div>
                        </div>
                    </div>
                </td>
                <td>${program}</td>
                <td><span class="badge" style="${badgeColor}">${s.paymentStatus || 'Pending'}</span></td>
                <td style="font-family:monospace; color:#888;">${s.utr || s.transactionId || '--'}</td>
                <td style="text-align:right;">
                    <button class="btn-icon" title="Message" onclick="window.openBroadcastModal('${s.id}', '${s.name}')"><i class="fa-solid fa-comment-dots"></i></button>
                    <button class="btn-icon" title="Edit" onclick="window.openStudentModal('${s.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-icon" title="Delete" onclick="window.deleteStudent('${s.id}')" style="color:#ef4444;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

// --- MODAL LOGIC (POPULATE ALL FIELDS) ---
window.openStudentModal = function(uid) {
    document.getElementById("student-modal").classList.remove("hidden");
    const form = document.getElementById("admin-form");
    form.reset(); // Clear previous data

    if(uid) {
        // === EDIT MODE ===
        const s = allStudents.find(student => student.id === uid);
        document.getElementById("edit-uid").value = uid;
        document.getElementById("modal-title").innerText = "Edit Student";
        
        // 1. Identity & Contact
        document.getElementById("inp-name").value = s.name || "";
        document.getElementById("inp-phone").value = s.phone || "";
        document.getElementById("inp-email").value = s.email || "";
        document.getElementById("inp-college").value = s.college || "";
        
        // 2. Avatar & Dates
        document.getElementById("inp-avatarIcon").value = s.avatarIcon || "";
        document.getElementById("inp-avatar-preview").src = s.avatarIcon || "https://via.placeholder.com/80";
        document.getElementById("inp-lastActiveDate").value = s.lastActiveDate || "";

        // 3. Course & Bio
        document.getElementById("inp-program").value = s.course || s.enrolledProgram || "";
        document.getElementById("inp-message").value = s.message || "";

        // 4. Gamification Stats
        document.getElementById("inp-xp").value = s.xp || 0;
        document.getElementById("inp-streak").value = s.streak || 0;
        document.getElementById("inp-dailyCount").value = s.dailyCount || 0;

        // 5. Payment Details
        document.getElementById("inp-status").value = s.paymentStatus || "Pending";
        document.getElementById("inp-utr").value = s.utr || "";
        document.getElementById("inp-transactionId").value = s.transactionId || "";

        // 6. Render Tickets
        const ticketContainer = document.getElementById("ticket-list-container");
        ticketContainer.innerHTML = ""; // Clear existing

        if (s.tickets && Array.isArray(s.tickets) && s.tickets.length > 0) {
            s.tickets.forEach(t => {
                let statusColor = t.status === 'Open' ? '#ef4444' : '#10b981';
                let ticketHtml = `
                    <div class="ticket-item">
                        <div class="ticket-header">
                            <span style="color:#f59e0b; font-weight:bold;">${t.category || 'General'}</span>
                            <span style="color:${statusColor}">${t.status || 'Open'}</span>
                        </div>
                        <div class="ticket-msg">${t.message}</div>
                    </div>
                `;
                ticketContainer.innerHTML += ticketHtml;
            });
        } else {
            ticketContainer.innerHTML = `<p style="text-align: center; color: #666; font-size: 12px; padding: 10px;">No tickets found.</p>`;
        }

    } else {
        // === ADD NEW MODE ===
        document.getElementById("edit-uid").value = "";
        document.getElementById("modal-title").innerText = "New Student";
        document.getElementById("inp-avatar-preview").src = "https://via.placeholder.com/80";
        document.getElementById("ticket-list-container").innerHTML = `<p style="text-align: center; color: #666; font-size: 12px;">N/A for new users</p>`;
    }
}

// --- SAVE DATA (UPDATE FIREBASE) ---
document.getElementById("admin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const uid = document.getElementById("edit-uid").value;
    
    // Construct Object matching your requirements
    const data = {
        name: document.getElementById("inp-name").value,
        phone: document.getElementById("inp-phone").value,
        college: document.getElementById("inp-college").value,
        
        // Course info (saving as 'course' to match your list, keeping 'enrolledProgram' for legacy)
        course: document.getElementById("inp-program").value,
        enrolledProgram: document.getElementById("inp-program").value, 
        
        avatarIcon: document.getElementById("inp-avatarIcon").value,
        lastActiveDate: document.getElementById("inp-lastActiveDate").value,
        message: document.getElementById("inp-message").value,
        
        // Gamification (Ensure numbers)
        xp: Number(document.getElementById("inp-xp").value),
        streak: Number(document.getElementById("inp-streak").value),
        dailyCount: Number(document.getElementById("inp-dailyCount").value),
        
        // Payment
        paymentStatus: document.getElementById("inp-status").value,
        utr: document.getElementById("inp-utr").value,
        transactionId: document.getElementById("inp-transactionId").value
    };

    // Note: We are NOT saving 'tickets' here because there is no UI to *edit* them, 
    // only to view them. This prevents overwriting the ticket array with empty data.

    try {
        if(uid) {
            await updateDoc(doc(db, "users", uid), data);
            showToast("Student Updated Successfully");
        } else {
            // New Student creation
            data.email = document.getElementById("inp-email").value; // Only save email on create
            data.createdAt = new Date().toISOString();
            await addDoc(collection(db, "users"), data);
            showToast("New Student Added");
        }
        
        document.getElementById("student-modal").classList.add("hidden");
        fetchData(); // Refresh table
    } catch(err) {
        console.error(err);
        showToast("Error Saving Data", true);
    }
});

// --- BROADCAST LOGIC ---
window.openBroadcastModal = function(uid, name) {
    document.getElementById("broadcast-modal").classList.remove("hidden");
    document.getElementById("bc-uid").value = uid;
    document.getElementById("bc-target-name").innerText = uid === 'all' ? "All Students" : name;
}

window.sendBroadcast = async function() {
    const title = document.getElementById("bc-title").value;
    const msg = document.getElementById("bc-msg").value;
    if(!title || !msg) return alert("Fill all fields");
    
    // Here you would add code to save to a 'notifications' collection in Firebase
    console.log("Broadcast:", title, msg);
    
    showToast("Message Sent (Simulated)");
    document.getElementById("broadcast-modal").classList.add("hidden");
}

window.deleteStudent = async function(uid) {
    if(!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
        await deleteDoc(doc(db, "users", uid));
        showToast("User Deleted");
        fetchData();
    } catch(e) { 
        console.error(e);
        showToast("Error Deleting", true); 
    }
}

function showToast(msg, isError) {
    const t = document.getElementById("success-toast");
    document.getElementById("toast-msg").innerText = msg;
    t.style.borderLeftColor = isError ? "#ef4444" : "#10b981";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

window.filterTable = function(val) {
    const lower = val.toLowerCase();
    const filtered = allStudents.filter(s => 
        (s.name && s.name.toLowerCase().includes(lower)) || 
        (s.email && s.email.toLowerCase().includes(lower)) ||
        (s.utr && s.utr.toLowerCase().includes(lower))
    );
    renderTable(filtered);
}

window.filterPending = function() {
    const dropdown = document.getElementById("filter-status");
    dropdown.value = "Pending";
    // Trigger change event or manually filter
    const filtered = allStudents.filter(s => s.paymentStatus === "Pending");
    renderTable(filtered);
}

// Filter Dropdown Listener
document.getElementById("filter-status").addEventListener("change", function() {
    const val = this.value;
    if(val === "all") {
        renderTable(allStudents);
    } else {
        const filtered = allStudents.filter(s => s.paymentStatus === val);
        renderTable(filtered);
    }
});

window.logoutAdmin = function() {
    if(confirm("Logout?")) window.location.href = "index.html";
}