document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. SECURITY & IDENTITY ---
    const studentData = {
        email: "student@unibolt.com", 
        id: "UB-VID-" + Math.floor(Math.random() * 1000000),
        ip: "192.168.1.XX"
    };

    // Inject Watermark
    const watermark = document.createElement('div');
    watermark.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 60px; font-weight: 900; color: rgba(255, 255, 255, 0.02);
        white-space: nowrap; pointer-events: none; z-index: 999; user-select: none;
        font-family: 'Inter', sans-serif;
    `;
    watermark.innerText = `CONFIDENTIAL • ${studentData.id}`;
    document.body.appendChild(watermark);

    // Inject Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%;
        background: #0f0f0f; border-top: 1px solid #333;
        padding: 8px 20px; font-size: 10px; color: #555;
        display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace;
        z-index: 1000; box-sizing: border-box;
    `;
    footer.innerHTML = `
        <div>Viewer: <strong>${studentData.email}</strong></div>
        <div>Session ID: ${studentData.id} • Secure Stream</div>
        <div>© ${new Date().getFullYear()} UniBolt Internal. Do not distribute.</div>
    `;
    document.body.appendChild(footer);


    // --- 2. DOWNLOAD LOGIC (FIXED) ---
    window.downloadAssets = function() {
        const btn = document.querySelector('.download-box button');
        const originalText = btn.innerHTML;
        
        // 1. Show Loading State
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Downloading...`;
        
        setTimeout(() => {
            // 2. Create and Click the Link
            const link = document.createElement('a');
            
            // IMPORTANT: This path must match where you put the zip file!
            link.href = 'resources/code/rn-workshop-assets.zip'; 
            link.download = 'rn-workshop-assets.zip';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 3. Show Success State
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Complete`;
            setTimeout(() => btn.innerHTML = originalText, 2000);
        }, 1000);
    };

    // Attach listener to button
    const dlBtn = document.querySelector('.download-box button');
    if(dlBtn) dlBtn.onclick = window.downloadAssets;

});