import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

// --- GLOBAL HELPERS ---
window.checkEmpty = function(ids) {
    let isValid = true;
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) { 
            if(el) el.classList.add('error'); 
            isValid = false; 
        } else { 
            el.classList.remove('error'); 
        }
    });
    return isValid;
};

window.showWarning = function(msg) {
    const errEl = document.getElementById('error-msg');
    if(errEl) errEl.innerText = msg;
    const modal = document.getElementById('error-modal');
    if(modal) modal.classList.remove('hidden');
    else alert(msg);
};

window.closeModal = function(id) { 
    document.getElementById(id).classList.add('hidden'); 
};

// --- NAVIGATION ---
window.changeStep = function(stepNum) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active', 'done'));
    
    document.getElementById(`step-${stepNum}`).classList.add('active');
    
    for(let i=1; i<=3; i++) {
        const ind = document.getElementById(`step-${i}-ind`);
        if(i < stepNum) { 
            ind.classList.add('done'); 
            ind.querySelector('.step-num').style.background='#10b981'; 
        } else if(i === stepNum) { 
            ind.classList.add('active'); 
        }
    }
};

// --- VALIDATION STEPS ---
window.validateStep1 = function() {
    if (window.checkEmpty(['inp-name', 'inp-phone', 'inp-city', 'inp-state', 'inp-college', 'inp-course'])) {
        window.changeStep(2);
    } else {
        window.showWarning("Please fill in all details (City & State included) to proceed.");
    }
};

window.validateStep2 = function() {
    const utr = document.getElementById('inp-txn');
    if (!utr.value.trim() || utr.value.length < 12) {
        utr.classList.add('error'); 
        window.showWarning("Enter valid 12-digit UTR/Transaction ID."); 
        return;
    }
    utr.classList.remove('error'); 
    window.changeStep(3);
};

window.validateStep3 = function() {
    if (!window.checkEmpty(['inp-email', 'inp-pass', 'inp-confirm-pass'])) { 
        window.showWarning("All fields are required."); 
        return; 
    }
    const p1 = document.getElementById('inp-pass').value;
    const p2 = document.getElementById('inp-confirm-pass').value;
    
    if (p1 !== p2) {
        document.getElementById('inp-confirm-pass').classList.add('error'); 
        window.showWarning("Passwords do not match!"); 
        return;
    }
    window.registerUser();
};

window.verifyPayment = function() { window.validateStep2(); };

// --- PAYMENT LOGIC ---
let pendingUpiLink = "";
window.handleAppPayment = function() {
    const upi = document.getElementById('inp-payer-upi').value;
    if(!upi) { window.showWarning("Enter UPI ID first."); return; }
    
    const merchantVPA = "6397774991-2.wallet@phonepe"; 
    const merchantName = "UniBolt"; 
    const amount = "200";
    pendingUpiLink = `upi://pay?pa=${merchantVPA}&pn=${merchantName}&am=${amount}&cu=INR`;
    
    window.location.href = pendingUpiLink;
    document.getElementById('payment-modal').classList.remove('hidden');
};

const confirmBtn = document.getElementById('confirm-pay-btn');
if(confirmBtn) {
    confirmBtn.onclick = function() {
        window.location.href = pendingUpiLink;
        setTimeout(() => { window.closeModal('payment-modal'); }, 3000);
    };
}

// --- FIREBASE REGISTRATION (WEB DEV SPECIFIC) ---
window.registerUser = async function() {
    const btn = document.getElementById("btn-submit");
    btn.innerText = "Creating...";
    btn.disabled = true;

    try {
        const email = document.getElementById('inp-email').value;
        const pass = document.getElementById('inp-pass').value;
        const name = document.getElementById("inp-name").value;

        // 1. Create Auth User
        const userCred = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCred.user;

        // 2. Save Data
        await setDoc(doc(db, "users", user.uid), {
            // Personal
            name: name,
            phone: document.getElementById("inp-phone").value,
            email: email,
            
            // Location
            city: document.getElementById("inp-city").value,
            state: document.getElementById("inp-state").value,
            
            // Academic
            college: document.getElementById("inp-college").value,
            year: document.getElementById("inp-year").value,
            degree: document.getElementById("inp-course").value,
            
            // *** COURSE SPECIFIC ***
            enrolledProgram: "Full Stack Web Development", 

            // Status
            paymentStatus: "Pending",
            transactionId: document.getElementById("inp-txn").value,
            paymentDate: new Date().toISOString(),
            
            // Gamification
            xp: 0, streak: 0, role: "student",
            createdAt: new Date(),
            welcomeShown: false,
            notifications: [],
            completedTasks: []
        });

        // 3. LOG TO AUDIT SYSTEM
        const geoResponse = await fetch('https://ipapi.co/json/');
        const geoData = await geoResponse.json();
        
        await addDoc(collection(db, "audit_logs"), {
            userName: email,
            role: "Student",
            type: "CREATE",
            message: `New Registration: ${name} enrolled in Web Development`,
            ip: geoData.ip || "Unknown",
            location: `${geoData.city || 'Unknown'}, ${geoData.region || 'Unknown'}`,
            userAgent: navigator.userAgent,
            timestamp: serverTimestamp()
        });

        // 4. Success
        document.getElementById('success-modal').classList.remove('hidden');

    } catch (error) {
        console.error(error);
        window.showWarning("Error: " + error.message);
        btn.innerText = "Complete Registration";
        btn.disabled = false;
    }
};

// Check registration settings
const settings = { allowRegistrations: true }; // This would typically come from DB
if (settings.allowRegistrations === false) {
    window.location.href = "registration-closed.html";
}