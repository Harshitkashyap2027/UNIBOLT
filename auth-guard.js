// js/auth-guard.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in. We are good.
        console.log("Secure Access Granted: " + user.email);
        
        // Save UID to local storage for easy access in other scripts
        localStorage.setItem("userUID", user.uid);
    } else {
        // No user found. Redirect to login.
        console.log("No user found. Redirecting...");
        window.location.href = "login.html";
    }
});