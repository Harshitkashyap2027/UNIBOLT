import { db, requireAdmin, showToast } from "./admin-core.js";
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

requireAdmin();

const tbody = document.getElementById("ticket-table-body");

onSnapshot(query(collection(db, "bugs"), orderBy("timestamp", "desc")), (snap) => {
    tbody.innerHTML = "";
    if(snap.empty) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:#666;'>No open tickets</td></tr>";
        return;
    }

    snap.forEach(docSnap => {
        const t = docSnap.data();
        const tr = document.createElement("tr");
        const time = t.timestamp?.toDate().toLocaleString() || "";
        
        tr.innerHTML = `
            <td style="font-weight:600;">${t.userEmail}</td>
            <td>${t.description}</td>
            <td style="color:#888;">${time}</td>
            <td><span class="badge badge-warning">Open</span></td>
            <td style="text-align:right;">
                <button class="btn-icon" style="color:#10b981;" onclick="window.resolveTicket('${docSnap.id}')" title="Mark Resolved">
                    <i class="fa-solid fa-check-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

window.resolveTicket = async (id) => {
    if(confirm("Mark ticket as resolved?")) {
        await deleteDoc(doc(db, "bugs", id));
        showToast("Ticket Resolved");
    }
};