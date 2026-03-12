/**
 * App Development Course Access Guard
 * Checks that the authenticated user is enrolled in App Development.
 * Unauthorized access is blocked, logged to Firestore, and admin is notified.
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCLaf8yGis2vT0DA4HlGlXXBKgFoCNGfDY",
    authDomain: "unibolt-f7005.firebaseapp.com",
    projectId: "unibolt-f7005",
    storageBucket: "unibolt-f7005.appspot.com",
    messagingSenderId: "121987854250",
    appId: "1:121987854250:web:21a9f50aad54b2143a85d3"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function isAppDevStudent(enrolledProgram) {
    const p = (enrolledProgram || "").toLowerCase();
    return p.includes("app") || p.includes("flutter") || p.includes("android") || p.includes("mobile");
}

function showAccessDenied(enrolledCourse) {
    // Inject a blocking overlay
    const overlay = document.createElement("div");
    overlay.id = "access-denied-overlay";
    overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:99999;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        font-family:'Outfit',sans-serif; text-align:center; padding:20px;
    `;
    overlay.innerHTML = `
        <div style="background:#111827; border:1px solid rgba(239,68,68,0.3); border-radius:24px; padding:40px; max-width:480px; width:100%;">
            <div style="font-size:60px; margin-bottom:20px;">🚫</div>
            <h2 style="color:#ef4444; margin:0 0 12px; font-size:24px;">Access Denied</h2>
            <p style="color:#94a3b8; margin:0 0 8px; font-size:15px;">
                This page is for <strong style="color:white;">App Development</strong> students only.
            </p>
            <p style="color:#64748b; font-size:13px; margin:0 0 24px;">
                You are enrolled in: <strong style="color:#fbbf24;">${enrolledCourse || "another course"}</strong>.<br>
                This unauthorized access has been reported to the Admin.
            </p>
            <button onclick="history.back()" style="background:#1d4ed8; color:white; border:none; padding:12px 24px; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; margin-right:10px;">
                ← Go Back
            </button>
            <button onclick="window.location.href='login.html'" style="background:rgba(255,255,255,0.05); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); padding:12px 24px; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600;">
                Logout
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
}

async function logViolation(user, enrolledCourse, pageName) {
    try {
        await addDoc(collection(db, "access_violations"), {
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || "",
            enrolledCourse: enrolledCourse,
            attemptedPage: pageName,
            coursePage: "App Development",
            timestamp: serverTimestamp()
        });
    } catch (e) {
        // Silently fail — logging is best-effort
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
            window.location.href = "login.html";
            return;
        }

        const data = snap.data();
        const enrolledProgram = data.enrolledProgram || data.course || "";

        if (!isAppDevStudent(enrolledProgram)) {
            showAccessDenied(enrolledProgram);
            await logViolation(user, enrolledProgram, window.location.pathname);
        }
    } catch (e) {
        console.error("Access guard error:", e);
    }
});
