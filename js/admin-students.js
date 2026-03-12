import { db, requireAdmin, showToast } from "./admin-core.js";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
requireAdmin();
const tbody = document.getElementById("student-table-body");
const searchInput = document.getElementById('student-search');
const statusFilter = document.getElementById('filter-status');
let studentsData = [];
onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
    studentsData = [];
    snap.forEach(doc => { studentsData.push({ id: doc.id, ...doc.data() }); });
    applyFilters();
});

function renderTable(data) {
    tbody.innerHTML = "";
    if (data.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: rgba(255,255,255,0.5);">No students found.</td></tr>`; return; }
    data.forEach(s => {
        const tr = document.createElement("tr");
        const isVerified = s.paymentStatus === "Verified";
        const statusClass = isVerified ? 'status-success' : 'status-pending';
        const statusText = isVerified ? 'Verified' : 'Pending';
        const initial = s.name ? s.name.charAt(0).toUpperCase() : "?";
        tr.innerHTML = `
            <td><div style="display:flex; align-items:center; gap:12px;"><div class="table-avatar">${initial}</div><div><div style="font-weight:600; color:var(--text-main);">${s.name || "Unknown"}</div><div style="color:var(--text-muted); font-size:0.85rem;">${s.email}</div></div></div></td>
            <td style="color:var(--text-secondary);">${s.enrolledProgram || "General"}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td style="font-family:monospace; color:var(--accent-color); letter-spacing:1px;">${s.transactionId || "--"}</td>
            <td><div style="display:flex; gap: 8px;">
                <button class="action-btn edit" onclick="window.editStudent('${s.id}')" title="Edit Student"><i class="fa-solid fa-pen"></i></button>
                ${!isVerified ? `<button class="action-btn verify" onclick="window.verifyUser('${s.id}')" title="Verify Payment"><i class="fa-solid fa-check"></i></button>` : ''}
                <button class="action-btn delete" onclick="window.deleteUser('${s.id}')" title="Delete User"><i class="fa-solid fa-trash"></i></button>
            </div></td>`;
        tbody.appendChild(tr);
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const filtered = studentsData.filter(s => {
        const matchesSearch = (s.name && s.name.toLowerCase().includes(searchTerm)) || (s.email && s.email.toLowerCase().includes(searchTerm)) || (s.transactionId && s.transactionId.toLowerCase().includes(searchTerm));
        const userStatus = s.paymentStatus || 'Pending';
        const matchesStatus = statusValue === 'all' || userStatus === statusValue;
        return matchesSearch && matchesStatus;
    });
    renderTable(filtered);
}
searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);

window.editStudent = (id) => {
    const s = studentsData.find(x => x.id === id);
    if (!s) return;
    document.getElementById('edit-id').value = s.id;
    document.getElementById('edit-name').value = s.name || '';
    document.getElementById('edit-email').value = s.email || '';
    document.getElementById('edit-phone').value = s.phone || '';
    document.getElementById('edit-program').value = s.enrolledProgram || '';
    document.getElementById('edit-txid').value = s.transactionId || '';
    document.getElementById('edit-status').value = s.paymentStatus || 'Pending';
    document.getElementById('edit-notes').value = s.notes || '';
    const certField = document.getElementById('edit-cert');
    if (certField) certField.value = s.certificateId || '';
    document.getElementById('edit-modal').classList.add('active');
};

window.saveEditStudent = async () => {
    const id = document.getElementById('edit-id').value;
    if (!id) return;
    const updates = {
        name: document.getElementById('edit-name').value,
        phone: document.getElementById('edit-phone').value,
        enrolledProgram: document.getElementById('edit-program').value,
        transactionId: document.getElementById('edit-txid').value,
        paymentStatus: document.getElementById('edit-status').value,
        notes: document.getElementById('edit-notes').value,
        updatedAt: new Date().toISOString()
    };
    const certField = document.getElementById('edit-cert');
    if (certField) updates.certificateId = certField.value;
    try {
        await updateDoc(doc(db, "users", id), updates);
        showToast("Student updated successfully", "success");
        document.getElementById('edit-modal').classList.remove('active');
    } catch (error) {
        showToast("Error updating student", "error");
    }
};

window.closeEditModal = () => {
    document.getElementById('edit-modal').classList.remove('active');
};

window.verifyUser = async (id) => {
    if(confirm("Are you sure you want to verify this student's payment?")) {
        try { await updateDoc(doc(db, "users", id), { paymentStatus: "Verified", verifiedAt: new Date().toISOString() }); showToast("User Verified Successfully", "success"); }
        catch (error) { showToast("Error verifying user", "error"); }
    }
};
window.deleteUser = async (id) => {
    if(confirm("WARNING: This action cannot be undone. Delete this user?")) {
        try { await deleteDoc(doc(db, "users", id)); showToast("User deleted from database", "success"); }
        catch (error) { showToast("Error deleting user", "error"); }
    }
};
window.exportCSV = () => {
    if (studentsData.length === 0) { showToast("No data to export", "error"); return; }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Course,Status,Transaction ID,Phone,Date Joined\n";
    studentsData.forEach(s => {
        const joined = s.createdAt ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : "";
        const row = [
            s.name || "Unknown",
            s.email || "",
            s.enrolledProgram || "General",
            s.paymentStatus || "Pending",
            s.transactionId || "N/A",
            s.phone || "",
            joined
        ];
        csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "unibolt_students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
