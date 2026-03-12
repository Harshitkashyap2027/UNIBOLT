// Initialize Syntax Highlighting
document.addEventListener('DOMContentLoaded', () => {
    hljs.highlightAll();
    setupEventListeners();
});

function setupEventListeners() {
    // 1. File Explorer Clicks
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.addEventListener('click', () => {
            const fileId = item.getAttribute('data-file');
            openFile(fileId);
        });
    });

    // 2. Button Clicks
    document.getElementById('btnDownload').addEventListener('click', downloadZip);
    document.getElementById('btnVerify').addEventListener('click', toggleQR);
    document.getElementById('btnCloseQR').addEventListener('click', toggleQR);
    
    // 3. Modal Background Click (Close)
    document.getElementById('qr-modal').addEventListener('click', (e) => {
        if (e.target.id === 'qr-modal') toggleQR();
    });
}

function openFile(fileId) {
    // Update Sidebar Active State
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.file-item[data-file="${fileId}"]`);
    if(activeItem) activeItem.classList.add('active');

    // Show Selected Code Content
    document.querySelectorAll('.code-view').forEach(el => el.classList.add('hidden'));
    const view = document.getElementById('view-' + fileId);
    if(view) view.classList.remove('hidden');

    // Update Tab Name
    const names = { 
        server: 'server.js', 
        auth: 'auth.js', 
        env: '.env', 
        pkg: 'package.json' 
    };
    const tabNameEl = document.getElementById('tab-name');
    if(tabNameEl && names[fileId]) tabNameEl.innerText = names[fileId];
}

function downloadZip() {
    const link = document.createElement('a');
    // POINT TO YOUR REAL FILE HERE:
    link.href = 'resources/code/backend-boilerplate.zip'; 
    link.download = 'backend-boilerplate.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toggleQR() {
    const modal = document.getElementById('qr-modal');
    modal.classList.toggle('hidden');
}