import { auth, db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// UI Elements
const form = document.getElementById("ticket-form");
const typeInput = document.getElementById("ticket-type");
const msgInput = document.getElementById("ticket-msg");
const ticketList = document.getElementById("ticket-list");

// --- 1. LOAD TICKETS ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                renderTickets(data.tickets || []);
            }
        } catch (error) {
            console.error("Error loading tickets:", error);
        }
    } else {
        window.location.href = "login.html";
    }
});

// --- 2. RENDER TICKETS ---
function renderTickets(tickets) {
    if (tickets.length === 0) {
        ticketList.innerHTML = `<p style="color: #666; font-size: 13px; text-align: center;">No tickets raised yet.</p>`;
        return;
    }

    ticketList.innerHTML = ""; // Clear loader
    // Reverse to show newest first
    tickets.reverse().forEach(t => {
        const div = document.createElement("div");
        div.style.padding = "10px 0";
        div.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.fontSize = "13px";

        // Status Color
        const statusColor = t.status === "Resolved" ? "#10b981" : "#f59e0b";

        div.innerHTML = `
            <div>
                <div style="font-weight: 500; color: white;">${t.category}</div>
                <div style="color: #666; font-size: 11px;">${t.date}</div>
            </div>
            <div style="color: ${statusColor}; font-weight: bold;">${t.status}</div>
        `;
        ticketList.appendChild(div);
    });
}

// --- 3. SUBMIT TICKET ---
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newTicket = {
        id: Date.now(),
        category: typeInput.value,
        message: msgInput.value,
        status: "Pending", // Default status
        date: new Date().toLocaleDateString()
    };

    const btn = form.querySelector("button");
    btn.innerText = "Submitting...";
    btn.disabled = true;

    try {
        const userRef = doc(db, "users", user.uid);
        
        // Add to array in Firebase
        await updateDoc(userRef, {
            tickets: arrayUnion(newTicket)
        });

        alert("Ticket Raised Successfully!");
        window.location.reload(); // Reload to show new ticket in list

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to submit ticket.");
        btn.innerText = "Submit Ticket";
        btn.disabled = false;
    }
});