document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. USER IDENTITY LOGIC ---
    // Try to get real user info from LocalStorage (if set by Login), otherwise simulate it.
    const storedUser = localStorage.getItem("unibolt_user_email");
    const sessionID = "UB-" + Math.floor(Math.random() * 1000000); // Random Session ID for security

    const studentData = {
        email: storedUser || "student@unibolt.com", 
        id: sessionID,
        ip: "192.168.1.10" // Simulated internal IP
    };

    // --- 2. INJECT WATERMARK ---
    // Adds the large diagonal text behind the content
    const watermark = document.createElement('div');
    watermark.className = 'watermark';
    watermark.innerText = `CONFIDENTIAL • ${studentData.id}`;
    document.body.appendChild(watermark);

    // --- 3. INJECT SECURITY FOOTER ---
    // Adds the legal/tracking bar at the bottom of the page
    const footer = document.createElement('div');
    footer.className = 'security-footer';
    footer.innerHTML = `
        <div>Licensed to: <strong>${studentData.email}</strong></div>
        <div>ID: ${studentData.id} • IP: ${studentData.ip} • Session: Secure</div>
        <div>© ${new Date().getFullYear()} UniBolt EdTech. Do not distribute.</div>
    `;
    document.body.appendChild(footer);

    // --- 4. UPDATE DYNAMIC DATES ---
    // Finds any element with id="dynamic-date" and sets it to today
    const dateEl = document.getElementById('dynamic-date');
    if(dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // --- 5. GENERATE QR CODE ---
    // Creates a unique verification link for this specific document session
    const qrContainer = document.getElementById('qr-code-img');
    if(qrContainer) {
        // We add a timestamp to make the QR unique every time
        const qrData = `UniBolt-Verify:${studentData.id}-${Date.now()}`;
        qrContainer.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
    }
});