import { templates, generateEmailHtml } from './email-theme.js';

// --- CONFIG ---
const API_URL = '/api/send-email';

// --- DOM ELEMENTS ---
const templateSelect = document.getElementById('inp-template');
const dynamicContainer = document.getElementById('dynamic-fields');
const inputsContainer = document.getElementById('dynamic-inputs-container');
const previewFrame = document.getElementById('preview-frame');
const logBox = document.getElementById('logs');

// --- MOCK STUDENT DATA (Auto-Fill) ---
const MOCK_DATA = {
    name: "Aarav Patel",
    email: "aarav.p@example.com",
    phone: "+91 98765 43210",
    streak: "42",
    rank: "15",
    xp: "12,450",
    utr: "UB-8839201928",
    amount: "499.00",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    link: "https://unibolt.in/dashboard",
    otp: "8291",
    ticket_id: "9921",
    course_name: "Full Stack Development",
    badge_name: "Python Guru",
    device: "Chrome on Windows",
    location: "Mumbai, India",
    reason: "Profile did not meet criteria"
};

// --- INITIALIZE ---
function init() {
    // 1. Populate Template Dropdown
    Object.keys(templates).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        // Format: "welcome" -> "WELCOME"
        opt.innerText = key.replace(/_/g, ' ').toUpperCase();
        templateSelect.appendChild(opt);
    });

    // 2. Listeners
    templateSelect.addEventListener('change', renderInputs);
    
    // Live Preview on Input Change
    document.addEventListener('input', (e) => {
        if(e.target.matches('#dynamic-inputs-container input')) {
            updatePreview();
        }
    });
}

// --- RENDER INPUTS BASED ON TEMPLATE ---
function renderInputs() {
    const key = templateSelect.value;
    const t = templates[key];
    
    inputsContainer.innerHTML = ''; // Clear previous inputs
    
    if (t && t.fields) {
        dynamicContainer.style.display = 'block'; // Show container
        
        t.fields.forEach(field => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = "10px";
            
            const label = document.createElement('label');
            label.innerText = field.replace(/_/g, ' ').toUpperCase();
            
            const input = document.createElement('input');
            input.id = `data-${field}`;
            input.dataset.key = field;
            
            // AUTO-FILL WITH MOCK DATA IF AVAILABLE
            if(MOCK_DATA[field]) {
                input.value = MOCK_DATA[field];
            } else {
                input.placeholder = `Enter ${field}...`;
            }
            
            wrapper.appendChild(label);
            wrapper.appendChild(input);
            inputsContainer.appendChild(wrapper);
        });
        
        // Also auto-fill main email if sending to mock
        document.getElementById('inp-to').value = MOCK_DATA.email;
        
        updatePreview(); // Trigger initial preview
    }
}

// --- GENERATE & SHOW PREVIEW ---
function updatePreview() {
    const key = templateSelect.value;
    if (!key) return;

    const data = collectData();
    // Add standard email for footer if not in fields
    if(!data.email) data.email = document.getElementById('inp-to').value || "student@example.com";

    const result = generateEmailHtml(key, data);

    if (result) {
        previewFrame.srcdoc = result.html;
    }
}

// --- COLLECT DATA FROM INPUTS ---
function collectData() {
    const data = {};
    const inputs = inputsContainer.querySelectorAll('input');
    inputs.forEach(input => {
        data[input.dataset.key] = input.value;
    });
    return data;
}

// --- SEND EMAIL FUNCTION ---
window.sendEmail = async function() {
    const btn = document.getElementById('btn-send');
    const originalText = btn.innerHTML;
    
    const from = document.getElementById('inp-from').value;
    const to = document.getElementById('inp-to').value;
    const key = templateSelect.value;

    if (!to || !key) return alert("Select a template and recipient.");

    btn.innerHTML = 'Sending...';
    btn.disabled = true;
    log(`Generating email: ${key}...`);

    const data = collectData();
    // Use the name from the data if available, else default
    const studentName = data.name || "Student"; 
    
    const result = generateEmailHtml(key, data);

    try {
        log(`Connecting to API...`);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromEmail: from,
                toEmail: to,
                name: studentName,
                subject: result.subject,
                html: result.html
            })
        });

        const resData = await response.json();

        if (resData.success) {
            log(`✅ Sent Successfully!`);
            alert("Email Sent!");
        } else {
            throw new Error(resData.message);
        }

    } catch (error) {
        log(`❌ Error: ${error.message}`);
        alert("Failed: " + error.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function log(msg) {
    const div = document.createElement('div');
    div.innerText = `> ${msg}`;
    logBox.prepend(div);
}

// Start
init();