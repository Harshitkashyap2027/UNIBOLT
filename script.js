import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURATION ---
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
const db = getFirestore(app);

// --- NEW: AUDIT LOGGING FUNCTION ---
async function logAudit(email, role, type, message) {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const geo = await response.json();
        await addDoc(collection(db, "audit_logs"), {
            userName: email,
            role: role,
            type: type,
            message: message,
            ip: geo.ip,
            location: `${geo.city}, ${geo.region}`,
            userAgent: navigator.userAgent,
            timestamp: serverTimestamp()
        });
    } catch (err) { console.log("Audit failed", err); }
}

// --- UI ELEMENTS ---
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const courseSelect = document.getElementById('courseSelect');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const togglePassword = document.getElementById('togglePassword');

// --- COURSE MAPPING (DB String -> Redirect Code) ---
const COURSE_MAP = {
    "Full Stack Web Development": "web",
    "AI & Data Science": "ai",
    "App Development": "app"
};

// --- LOGIN LOGIC ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const selectedDropdownValue = courseSelect.value; // Expecting 'web', 'ai', or 'app' from HTML value=""

    // 1. Validation
    if (!selectedDropdownValue) {
        showToast("Action Required", "Please select your course domain.", "error");
        return;
    }

    // 2. UI Loading
    btnText.innerText = "Authenticating...";
    loginBtn.style.opacity = "0.7";
    loginBtn.disabled = true;

    try {
        // 3. Admin Override Check (Before Firebase Auth to save reads/time)
        if(email.toLowerCase() === "harshit@gmail.com") {
            // Check password via Firebase first to ensure security
            await signInWithEmailAndPassword(auth, email, password);
            
            // LOG ADMIN ACCESS
            await logAudit(email, "Admin", "LOGIN", "Master Admin accessed the console");
            
            window.location.href = "admin.html";
            return;
        }

        // 4. Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 5. Fetch User Data
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // A. Get Real Course from DB (e.g., "AI & Data Science")
            const enrolledString = userData.enrolledProgram; 
            
            // B. Convert DB String to Short Code (e.g., "ai")
            const userCourseCode = COURSE_MAP[enrolledString];

            // C. Get Payment Status
            const status = userData.paymentStatus;

            // --- SECURITY CHECKS --- //

            // Check 1: Course Mismatch
            // If the user selected 'web' but DB says they are 'ai'
            if (userCourseCode !== selectedDropdownValue) {
                // LOG SECURITY ALERT
                await logAudit(email, "Student", "SECURITY_ALERT", `Course Mismatch: Tried to enter ${selectedDropdownValue} but is enrolled in ${enrolledString}`);
                
                // Formatting for cleaner error message
                throw new Error(`Access Denied! You are enrolled in ${enrolledString}, not the selected course.`);
            }

            // Check 2: Payment Verification
            // We allow them to login even if Pending, so they see the "Locked" modal inside the dashboard.
            // If you want to BLOCK login entirely for non-verified, uncomment the lines below:
            /*
            if (status !== "Verified") {
               throw new Error("Account pending approval. Please wait for admin verification.");
            }
            */

            // --- SUCCESS REDIRECT --- //
            // LOG STUDENT SUCCESSFUL LOGIN
            await logAudit(email, "Student", "LOGIN", `Successful login to ${enrolledString} Dashboard`);
            
            showToast("Access Granted", "Redirecting to your dashboard...", "success");
            
            setTimeout(() => {
                if(userCourseCode === 'web') window.location.href = "dashboard.html"; // Web Dev Dashboard
                else if(userCourseCode === 'ai') window.location.href = "AI.html";    // AI Dashboard
                else if(userCourseCode === 'app') window.location.href = "APP.html";  // App Dashboard
                else window.location.href = "dashboard.html"; // Fallback
            }, 1500);

        } else {
            throw new Error("Student record not found. Please register first.");
        }

    } catch (error) {
        // Handle Errors
        let msg = "Invalid Email or Password.";
        
        // Clean up Firebase error messages
        if (error.message.includes("Access Denied")) msg = error.message;
        else if (error.message.includes("Student record")) msg = error.message;
        else if (error.code === "auth/invalid-credential") msg = "Incorrect email or password.";
        else if (error.code === "auth/too-many-requests") msg = "Too many failed attempts. Try later.";
        else if (error.code === "auth/user-not-found") msg = "No account found with this email.";
        
        // LOG FAILED ATTEMPT
        await logAudit(email || "Unknown", "Student", "LOGIN_FAILED", msg);
        
        showToast("Login Failed", msg, "error");
        
        // Reset Button
        btnText.innerText = "Access Dashboard";
        loginBtn.style.opacity = "1";
        loginBtn.disabled = false;
        
        // If it was a critical error, sign them out just in case
        signOut(auth);
    }
});

// --- HELPER FUNCTIONS ---

// Toast Notification
function showToast(title, message, type) {
    const toast = document.getElementById('toast');
    if(!toast) return alert(message); // Fallback

    const titleEl = document.getElementById('toast-title');
    const msgEl = document.getElementById('toast-msg');
    const iconEl = toast.querySelector('.toast-icon i');

    titleEl.innerText = title;
    msgEl.innerText = message;

    if (type === "success") {
        toast.classList.add("success");
        if(iconEl) iconEl.className = "fa-solid fa-circle-check";
    } else {
        toast.classList.remove("success");
        if(iconEl) iconEl.className = "fa-solid fa-triangle-exclamation";
    }

    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}

// Toggle Password
if(togglePassword) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}