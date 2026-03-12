import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentTrack = "AI"; 

onAuthStateChanged(auth, async (user) => {
    if (user) await loadHallOfFame(user.uid);
    else window.location.href = "login.html";
});

async function loadHallOfFame(uid) {
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) updateGalleryUI(docSnap.data(), uid);
    } catch (e) { console.error(e); }
}

function updateGalleryUI(data, uid) {
    // 1. Fill Names
    document.querySelectorAll("#cert-name, #offer-name").forEach(el => el.innerText = data.name || "Student");

    // --- DATE LOGIC ---
    // Start Date: Use 'createdAt' from Firebase (Registration Date)
    const startDate = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
    
    // End Date: Start Date + 1 Month
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Format Dates (e.g., "Dec 27, 2025")
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const strStart = startDate.toLocaleDateString('en-US', options);
    const strEnd = endDate.toLocaleDateString('en-US', options);

    // Update Certificate Dates
    const certStartEl = document.getElementById("cert-start-date");
    const certEndEl = document.getElementById("cert-end-date");
    const certIssuedEl = document.getElementById("cert-issued-date");
    
    if(certStartEl) certStartEl.innerText = strStart;
    if(certEndEl) certEndEl.innerText = strEnd;
    if(certIssuedEl) certIssuedEl.innerText = strEnd;

    // Update Offer Letter Header Date
    const offerDateEl = document.getElementById("offer-date");
    if(offerDateEl) offerDateEl.innerText = strStart;

    // 2. Track Detection
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const dbCourse = (data.course || data.track || "").toLowerCase();

    if (page.includes("aigallery") || path.includes("/AI")) currentTrack = "AI";
    else if (page.includes("gallery") || path.includes("/web")) currentTrack = "WEB";
    else if (path.includes("/app")) currentTrack = "APP";
    else {
        if (dbCourse.includes("web")) currentTrack = "WEB";
        else if (dbCourse.includes("app")) currentTrack = "APP";
    }

    // 3. Customize Text
    let labName, roleText, certBodyText, skillsText;
    if (currentTrack === "WEB") {
        labName = "Full Stack Web Lab";
        roleText = "Full Stack Intern";
        certBodyText = "For successfully completing the <strong>Full Stack Web Development Internship</strong>. Excellence in MERN Stack & React.";
        skillsText = "React, Node.js, and Modern Web Tech.";
    } else if (currentTrack === "APP") {
        labName = "Mobile App Lab";
        roleText = "App Developer Intern";
        certBodyText = "For successfully completing the <strong>Mobile App Development Internship</strong>. Excellence in Flutter & React Native.";
        skillsText = "Flutter, Dart, and Mobile Architecture.";
    } else {
        labName = "AI & Data Science Lab";
        roleText = "AI Research Intern";
        certBodyText = "For successfully completing the <strong>AI & Data Science Internship</strong>. Excellence in Neural Networks & ML.";
        skillsText = "Neural Networks and Deep Learning.";
    }

    document.querySelectorAll(".logo-sub").forEach(el => el.innerText = labName);
    const certBody = document.querySelector(".cert-body-text");
    if(certBody) certBody.innerHTML = certBodyText;
    
    // Fill Offer Letter (With Dynamic Duration)
    const offerContent = document.querySelector("#offer-element .offer-body");
    if(offerContent) {
        offerContent.innerHTML = `
            <p><strong>To, <span id="offer-name">${data.name || 'Student'}</span></strong></p>
            <p><strong>Subject: Internship Offer Letter</strong></p>
            <p>Dear Candidate,</p>
            <p>We are pleased to offer you an educational internship at the <strong>${labName}</strong>.</p>
            <div style="background: #f4f4f5; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; color: #333;">
                <strong>Position:</strong> ${roleText}<br>
                <strong>Duration:</strong> ${strStart} - ${strEnd} (1 Month)<br>
                <strong>Mode:</strong> Remote
            </div>
            <p>You will work on projects involving ${skillsText} We look forward to a productive journey.</p>
        `;
    }

    // 4. Update QR Code & ID
    // We update the image source directly (simpler method)
    const qrImg = document.querySelector(".footer-left img");
    if(qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://unibolt.in/verify/${uid}`;
    }
    const certIdEl = document.getElementById("cert-id");
    if(certIdEl) certIdEl.innerText = "ID: " + uid.substring(0,8).toUpperCase();


    // 5. Unlock Logic
    const xp = data.xp || 0;
    const streak = data.streak || 0;
    
    // Set condition (XP > 1000)
    if (xp >= 1000 && streak >= 20) {
        const lock = document.getElementById("cert-lock");
        if(lock) lock.style.display = "none";
        
        const btn = document.getElementById("dl-cert-btn");
        if(btn) {
            btn.disabled = false;
            btn.className = "btn btn-primary";
            btn.style.background = "#d4af37";
            btn.style.color = "#000";
            btn.innerHTML = `<i class="fa-solid fa-download"></i> Download Certificate`;
            btn.onclick = downloadCertificate;
        }
    } else {
        const msg = document.getElementById("lock-msg");
        if(msg) msg.innerHTML = `${xp}/1000 XP | ${streak}/20 Days`;
    }
}

// --- UNIVERSAL DOWNLOADER ---
window.downloadOffer = function() {
    downloadPDF('offer-element', `UniBolt_${currentTrack}_Offer.pdf`, 'portrait');
};

window.downloadCertificate = function() {
    downloadPDF('cert-element', `UniBolt_${currentTrack}_Certificate.pdf`, 'landscape');
};

function downloadPDF(elementId, filename, orientation) {
    const original = document.getElementById(elementId);
    
    // Clone and force visibility
    const clone = original.cloneNode(true);
    clone.style.transform = "none"; 
    clone.style.position = "relative";
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.style.zIndex = "99999"; 
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '-1000';
    container.style.background = '#fff';
    container.style.overflow = 'hidden'; 
    
    if(orientation === 'landscape') {
        container.style.width = '1122px';
        container.style.height = '793px';
    } else {
        container.style.width = '793px';
        container.style.height = '1122px';
    }

    container.appendChild(clone);
    document.body.appendChild(container);

    const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            logging: true,
            windowWidth: orientation === 'landscape' ? 1123 : 794 
        },
        jsPDF: { 
            unit: 'px', 
            format: [orientation === 'landscape' ? 1123 : 794, orientation === 'landscape' ? 794 : 1123], 
            orientation: orientation 
        }
    };

    setTimeout(() => {
        html2pdf().set(opt).from(clone).save().then(() => {
            document.body.removeChild(container);
        }).catch(err => {
            console.error("PDF Error:", err);
            alert("Download failed. Please try on Desktop.");
            document.body.removeChild(container);
        });
    }, 500);
}