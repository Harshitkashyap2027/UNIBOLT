import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);

// --- SET YOUR ADMIN EMAIL HERE ---
const SUPER_ADMIN_EMAIL = "harshit@gmail.com"; 

// --- LOGIN LOGIC ---
const form = document.getElementById("admin-login-form");
const emailInp = document.getElementById("adm-email");
const passInp = document.getElementById("adm-pass");
const btn = document.getElementById("login-btn");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    btn.innerText = "Verifying...";
    btn.disabled = true;

    const email = emailInp.value;
    const pass = passInp.value;

    // 1. Pre-Check: Is this the correct email?
    // This saves a Firebase call if a random student tries to log in here.
    if (email !== SUPER_ADMIN_EMAIL) {
        showError("Unauthorized ID");
        return;
    }

    try {
        // 2. Firebase Auth
        await signInWithEmailAndPassword(auth, email, pass);
        
        // 3. Success -> Redirect
        btn.style.background = "#10b981";
        btn.innerText = "Access Granted";
        setTimeout(() => {
            window.location.href = "/admin";
        }, 800);

    } catch (error) {
        console.error(error);
        showError("Invalid Credentials");
    }
});

function showError(msg) {
    errorMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
    errorMsg.style.display = "block";
    btn.innerText = "Authenticate";
    btn.disabled = false;
    
    // Shake effect
    const card = document.querySelector(".admin-card");
    card.style.animation = "shake 0.3s";
    setTimeout(() => card.style.animation = "", 300);
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}`;
document.head.appendChild(style);
// Example: Inside your Admin Login Logic
async function handleLogin() {
    const username = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (username === "admin" && pass === "your-secret-password") {
        
        // --- START TRACKING ---
        // This sends the data to your Monitor Page
        await logSecurityEvent("LOGIN", "Admin", username, "Successfully logged into Master Control");
        // --- END TRACKING ---

        window.location.href = "/admin";
    } else {
        // Track failed attempts too for security!
        await logSecurityEvent("SECURITY_ALERT", "Unknown", username, "FAILED login attempt detected");
        alert("Invalid Credentials");
    }
}