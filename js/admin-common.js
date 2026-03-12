import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCLaf8yGis2vT0DA4HlGlXXBKgFoCNGfDY",
    authDomain: "unibolt-f7005.firebaseapp.com",
    projectId: "unibolt-f7005",
    storageBucket: "unibolt-f7005.appspot.com",
    messagingSenderId: "121987854250",
    appId: "1:121987854250:web:21a9f50aad54b2143a85d3"
};

// Initialize App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- EXPORT FOR PAGES ---
export { app, auth, db, firebaseConfig };

// --- 1. AUTH PROTECTION ---
// Kicks user out if not logged in
onAuthStateChanged(auth, (user) => {
    if (!user && !window.location.href.includes("index.html")) {
        window.location.href = "index.html"; // Redirect to login
    }
});

// --- 2. LOGOUT FUNCTION ---
window.logout = async () => {
    if(confirm("Securely Logout?")) {
        await signOut(auth);
        window.location.href = "index.html";
    }
};

// --- 3. SIDEBAR HIGHLIGHT ---
// Automatically highlights the active link
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".nav-item");
    links.forEach(link => {
        if(link.getAttribute("href") === path) {
            link.classList.add("active");
        }
    });
});