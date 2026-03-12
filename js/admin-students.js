import { db, requireAdmin, showToast } from "./admin-core.js";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Check Auth
requireAdmin();

const tbody = document.getElementById("student-table-body");
const searchInput = document.getElementById('student-search');
const statusFilter = document.getElementById('filter-status');

let studentsData = [];

// --- 1. Load Data Real-time ---
onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
    studentsData = [];
    snap.forEach(doc => {
        // Safe access to data
        studentsData.push({ id: doc.id, ...doc.data() });
    });
    applyFilters(); // Initial render with filters applied
});

// --- 2. Render Table ---
function renderTable(data) {
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 30px; color: rgba(255,255,255,0.5);">
                    No students found matching your criteria.
                </td>
            </tr>`;
        return;
    }

    data.forEach(s => {
        const tr = document.createElement("tr");
        
        // Status Logic
        const isVerified = s.paymentStatus === "Verified";
        const statusClass = isVerified ? 'status-success' : 'status-pending';
        const statusText = isVerified ? 'Verified' : 'Pending';

        // Avatar Logic (Initials)
        const initial = s.name ? s.name.charAt(0).toUpperCase() : "?";
        
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="table-avatar">${initial}</div>
                    <div>
                        <div style="font-weight:600; color:var(--text-main);">${s.name || "Unknown"}</div>
                        <div style="color:var(--text-muted); font-size:0.85rem;">${s.email}</div>
                    </div>
                </div>
            </td>
            <td style="color:var(--text-secondary);">${s.enrolledProgram || "General"}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td style="font-family:monospace; color:var(--accent-color); letter-spacing:1px;">
                ${s.transactionId || "--"}
            </td>
            <td>
                <div style="display:flex; gap: 8px;">
                    ${!isVerified ? `
                    <button class="action-btn verify" onclick="window.verifyUser('${s.id}')" title="Verify Payment">
                        <i class="fa-solid fa-check"></i>
                    </button>` : ''}
                    
                    <button class="action-btn delete" onclick="window.deleteUser('${s.id}')" title="Delete User">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 3. Filter Logic (Search + Dropdown) ---
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filtered = studentsData.filter(s => {
        // 1. Text Search Match
        const matchesSearch = 
            (s.name && s.name.toLowerCase().includes(searchTerm)) || 
            (s.email && s.email.toLowerCase().includes(searchTerm)) ||
            (s.transactionId && s.transactionId.toLowerCase().includes(searchTerm));

        // 2. Dropdown Status Match
        // Note: We treat undefined status as 'Pending' for filtering
        const userStatus = s.paymentStatus || 'Pending'; 
        const matchesStatus = statusValue === 'all' || userStatus === statusValue;

        return matchesSearch && matchesStatus;
    });

    renderTable(filtered);
}

// Event Listeners for Filters
searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// --- 4. Window Functions (Global Actions) ---

// Verify User
window.verifyUser = async (id) => {
    if(confirm("Are you sure you want to verify this student's payment?")) {
        try {
            await updateDoc(doc(db, "users", id), { 
                paymentStatus: "Verified",
                verifiedAt: new Date().toISOString()
            });
            showToast("User Verified Successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Error verifying user", "error");
        }
    }
};

// Delete User
window.deleteUser = async (id) => {
    if(confirm("WARNING: This action cannot be undone. Delete this user?")) {
        try {
            await deleteDoc(doc(db, "users", id));
            showToast("User deleted from database", "success");
        } catch (error) {
            console.error(error);
            showToast("Error deleting user", "error");
        }
    }
};

// Export to CSV
window.exportCSV = () => {
    if (studentsData.length === 0) {
        showToast("No data to export", "error");
        return;
    }

    // Define Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Course,Status,Transaction ID,Date Joined\n";

    // Loop through current data
    studentsData.forEach(s => {
        const row = [
            s.name || "Unknown",
            s.email || "",
            s.enrolledProgram || "General",
            s.paymentStatus || "Pending",
            s.transactionId || "N/A",
            s.createdAt ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : ""
        ];
        csvContent += row.join(",") + "\n";
    });

    // Create Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "unibolt_students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};