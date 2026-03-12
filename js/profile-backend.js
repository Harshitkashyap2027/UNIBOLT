import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentUserUID = null;

// UI Elements
const nameInput = document.getElementById("input-name");
const collegeInput = document.getElementById("input-college");
const emailInput = document.getElementById("input-email");
const avatarInput = document.getElementById("selected-avatar-val"); 
const saveBtn = document.getElementById("save-btn");

// Card Elements
const cardName = document.getElementById("card-name");
const cardCollege = document.getElementById("card-college");
const cardUid = document.getElementById("card-uid");
const cardIcon = document.getElementById("card-icon"); 

// 1. LOAD DATA
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUID = user.uid;
        if(emailInput) emailInput.value = user.email;
        if(cardUid) cardUid.innerText = "UB-" + user.uid.substring(0, 6).toUpperCase();

        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if(nameInput) nameInput.value = data.name || "";
                if(collegeInput) collegeInput.value = data.college || "";
                if(avatarInput) avatarInput.value = data.avatarIcon || "🐶";

                // Update Visuals
                updateCardVisuals(data.name, data.college, data.avatarIcon);
                
                // Highlight Icon
                const options = document.querySelectorAll('.avatar-option');
                options.forEach(el => {
                    el.classList.remove('selected');
                    if(el.innerText.trim() === (data.avatarIcon || "🐶")) el.classList.add('selected');
                });
            }
        } catch (error) { console.error("Error loading profile:", error); }
    } else {
        if(!window.location.href.includes("login.html")) window.location.href = "login.html";
    }
});

function updateCardVisuals(name, college, emoji) {
    if(cardName) cardName.innerText = name || "Student Name";
    if(cardCollege) cardCollege.innerText = college || "College Name";
    if(cardIcon && emoji) cardIcon.innerText = emoji;
}

// 2. SAVE DATA (FIXED POPUP LOGIC)
const form = document.getElementById("profile-form");
if(form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUserUID) return;

        saveBtn.innerText = "Saving...";
        saveBtn.disabled = true;

        try {
            await setDoc(doc(db, "users", currentUserUID), {
                name: nameInput.value,
                college: collegeInput.value,
                avatarIcon: avatarInput.value
            }, { merge: true });

            // Show success modal — supports both inline-display and CSS-class approaches
            const modal = document.getElementById('success-modal');
            if(modal) {
                modal.classList.remove('hidden');
                if (modal.style.display === 'none') modal.style.display = '';
            }

            saveBtn.innerText = "Save Changes";
            saveBtn.disabled = false;
            
            updateCardVisuals(nameInput.value, collegeInput.value, avatarInput.value);

        } catch (error) {
            console.error("Save Error:", error);
            alert("Error saving profile.");
            saveBtn.innerText = "Save Changes";
            saveBtn.disabled = false;
        }
    });
}

// 3. DOWNLOAD FUNCTION
window.downloadIDCard = function() {
    const cardElement = document.getElementById("id-card-visual");
    const btn = document.querySelector(".btn-download-card");
    const originalText = btn.innerHTML;
    
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;
    
    html2canvas(cardElement, {
        scale: 3, 
        backgroundColor: null, 
        useCORS: true 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `UniBolt_ID_${currentUserUID ? currentUserUID.substring(0,6) : 'Card'}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        btn.innerHTML = originalText;
    }).catch(err => {
        console.error("Download Error:", err);
        alert("Failed to generate ID card.");
        btn.innerHTML = originalText;
    });
};