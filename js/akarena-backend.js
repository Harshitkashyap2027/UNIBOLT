/* UniBolt AI Arena - 5 Daily Tasks Logic */

// --- DATA STRUCTURE: 5 STEPS PER PROJECT ---
const PROJECTS = {
    "1": { // CIFAR-10
        title: "CIFAR-10 Classification",
        meta: "Computer Vision | 5 Tasks",
        steps: [
            {
                id: 1, title: "Task 1: Load Data",
                desc: "Import PyTorch and load the CIFAR-10 dataset using torchvision.",
                code: `import torch\nimport torchvision\nimport torchvision.transforms as transforms\n\n# TODO: Load Data\ntransform = transforms.Compose([transforms.ToTensor()])\ntrainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)\nprint("Data Loaded: ", len(trainset))`
            },
            {
                id: 2, title: "Task 2: Define Architecture",
                desc: "Create the Convolutional Neural Network class with 2 Conv layers.",
                code: `import torch.nn as nn\nimport torch.nn.functional as F\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.conv1 = nn.Conv2d(3, 6, 5)\n        self.pool = nn.MaxPool2d(2, 2)\n        self.conv2 = nn.Conv2d(6, 16, 5)\n\nprint("Architecture Defined")`
            },
            {
                id: 3, title: "Task 3: Loss & Optimizer",
                desc: "Initialize CrossEntropyLoss and SGD optimizer.",
                code: `import torch.optim as optim\n\ncriterion = nn.CrossEntropyLoss()\noptimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)\nprint("Optimizer Configured")`
            },
            {
                id: 4, title: "Task 4: Training Loop",
                desc: "Write the for-loop to iterate through epochs and batches.",
                code: `for epoch in range(2):\n    running_loss = 0.0\n    # Simulate training loop\n    print(f"Epoch {epoch+1} Complete. Loss: 0.89")`
            },
            {
                id: 5, title: "Task 5: Evaluation",
                desc: "Test the model accuracy on the validation set.",
                code: `correct = 0\ntotal = 0\n# Simulate testing\nprint("Final Accuracy: 68%")`
            }
        ]
    },
    // Add same structure for ID "2" (Housing), "3" (Spam), etc.
    "default": {
        title: "Project Setup",
        meta: "General | 5 Tasks",
        steps: [
            { id: 1, title: "Task 1: Setup", desc: "Initialize environment", code: "print('Hello World')" },
            { id: 2, title: "Task 2: Process", desc: "Process data", code: "print('Processing...')" },
            { id: 3, title: "Task 3: Build", desc: "Build logic", code: "print('Building...')" },
            { id: 4, title: "Task 4: Train", desc: "Train model", code: "print('Training...')" },
            { id: 5, title: "Task 5: Deploy", desc: "Deploy solution", code: "print('Done')" },
        ]
    }
};

// --- STATE VARIABLES ---
let currentProjectId = "1";
let currentStepIndex = 0; // 0 to 4
let completedSteps = 0;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentProjectId = urlParams.get('dataset') || "1";
    
    // Fallback if ID doesn't exist in PROJECTS
    if(!PROJECTS[currentProjectId]) currentProjectId = "default";

    renderSidebar();
    loadStep(0); // Load first task

    document.getElementById('run-btn').addEventListener('click', runCurrentStep);
});

// --- RENDER SIDEBAR ---
function renderSidebar() {
    const project = PROJECTS[currentProjectId];
    document.getElementById('project-title').innerText = project.title;
    document.getElementById('project-meta').innerText = project.meta;

    const list = document.getElementById('step-list-container');
    list.innerHTML = '';

    project.steps.forEach((step, index) => {
        const li = document.createElement('li');
        
        // Determine classes based on state
        let classes = "step-item";
        let iconContent = index + 1;
        
        if (index === currentStepIndex) {
            classes += " active"; // Highlight current
        } else if (index < completedSteps) {
            classes += " completed"; // Green check
            iconContent = '<i class="fa-solid fa-check"></i>';
        } else if (index > completedSteps) {
            classes += " locked"; // Greyed out
            iconContent = '<i class="fa-solid fa-lock"></i>';
        }

        li.className = classes;
        li.innerHTML = `
            <div class="step-circle">${iconContent}</div>
            <div style="font-size: 13px; font-weight: 500; color: white;">${step.title}</div>
        `;
        
        // Click to switch back to completed steps
        if (index <= completedSteps) {
            li.onclick = () => loadStep(index);
        }

        list.appendChild(li);
    });

    // Update Progress Bar
    const pct = (completedSteps / 5) * 100;
    document.getElementById('overall-progress').style.width = `${pct}%`;
}

// --- LOAD STEP INTO EDITOR ---
function loadStep(index) {
    currentStepIndex = index;
    const project = PROJECTS[currentProjectId];
    const step = project.steps[index];

    document.getElementById('current-step-title').innerText = step.title;
    document.getElementById('current-step-desc').innerText = step.desc;
    document.getElementById('code-editor').value = step.code;
    
    // Clear Console
    document.getElementById('console-output').innerHTML = "Ready...";
    
    renderSidebar(); // Re-render to update active highlight
}

// --- RUN LOGIC ---
function runCurrentStep() {
    const btn = document.getElementById('run-btn');
    if (btn.innerHTML.includes("Running")) return;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';
    document.getElementById('console-output').innerHTML = '';

    log("System", "Executing script...");

    // Fake execution delay
    setTimeout(() => {
        log("Output", "Process finished successfully.");
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Run Code';
        
        // Mark as complete if it's the current furthest step
        if (currentStepIndex === completedSteps) {
            completedSteps++;
            
            // Trigger confetti for step completion
            if (typeof confetti === "function") confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });

            // Check if all 5 done
            if (completedSteps === 5) {
                setTimeout(() => {
                   document.getElementById('result-modal').classList.remove('hidden'); 
                }, 1000);
            } else {
                // Auto-advance to next step after short delay
                setTimeout(() => {
                    loadStep(currentStepIndex + 1);
                }, 1000);
            }
        }
        
        renderSidebar();

    }, 1500);
}

function log(type, msg) {
    const div = document.createElement('div');
    div.innerHTML = `<strong style="color: #fff;">${type}:</strong> ${msg}`;
    div.style.marginBottom = "5px";
    document.getElementById('console-output').appendChild(div);
}