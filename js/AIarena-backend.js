/* UniBolt AI Arena - The Ultimate 20-Day Engine (6 Tracks x 20 Days) */

document.addEventListener('DOMContentLoaded', init);

// ======================================================
// 1. DAY 1: MANUAL SETUP (Foundation for all 6 Tracks)
// ======================================================
const CURRICULUM = {
    "cifar-10": { // CHANGED FROM "1" TO "cifar-10"
        title: "Image Classification (CIFAR-10)",
        track: "CV", 
        tech: "PyTorch CNN",
        days: {
            1: [
                { title: "Task 1: Load Data", desc: "Import TorchVision and load CIFAR-10.", code: "trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True)" },
                { title: "Task 2: Transforms", desc: "Apply ToTensor and Normalize transforms.", code: "transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])" },
                { title: "Task 3: DataLoader", desc: "Create a DataLoader with batch_size=4.", code: "trainloader = torch.utils.data.DataLoader(trainset, batch_size=4, shuffle=True)" },
                { title: "Task 4: Architecture", desc: "Define the ConvNet class structure.", code: "class Net(nn.Module):\n    def __init__(self):\n        super().__init__()" },
                { title: "Task 5: Forward Pass", desc: "Implement the forward() function.", code: "def forward(self, x):\n    x = self.pool(F.relu(self.conv1(x)))\n    return x" }
            ]
        }
    },
    "housing-prices": { // CHANGED FROM "2" TO "housing-prices"
        title: "Housing Price Prediction",
        track: "TABULAR",
        tech: "Scikit-Learn",
        days: {
            1: [
                { title: "Task 1: Load CSV", desc: "Load housing.csv using Pandas.", code: "df = pd.read_csv('housing.csv')" },
                { title: "Task 2: Inspection", desc: "Print the first 5 rows and data info.", code: "print(df.head())\nprint(df.info())" },
                { title: "Task 3: Feature Select", desc: "Choose 'GrLivArea' and 'YearBuilt'.", code: "X = df[['GrLivArea', 'YearBuilt']]" },
                { title: "Task 4: Cleaning", desc: "Drop rows with missing target values.", code: "df.dropna(subset=['SalePrice'], inplace=True)" },
                { title: "Task 5: Train/Test", desc: "Split data 80/20.", code: "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)" }
            ]
        }
    },
    "spam-detection": { // CHANGED FROM "3" TO "spam-detection"
        title: "Spam Detection (NLP)",
        track: "NLP",
        tech: "Naive Bayes",
        days: {
            1: [
                { title: "Task 1: Load Corpus", desc: "Read emails.json into a DataFrame.", code: "df = pd.read_json('emails.json')" },
                { title: "Task 2: Preprocessing", desc: "Convert text to lowercase.", code: "df['text'] = df['text'].str.lower()" },
                { title: "Task 3: Tokenization", desc: "Split sentences into words.", code: "df['tokens'] = df['text'].apply(lambda x: x.split())" },
                { title: "Task 4: Vectorize", desc: "Initialize CountVectorizer.", code: "cv = CountVectorizer(stop_words='english')" },
                { title: "Task 5: Transform", desc: "Fit and transform the text data.", code: "X = cv.fit_transform(df['text'])" }
            ]
        }
    },
    "facial-emotion": { // CHANGED FROM "4" TO "facial-emotion"
        title: "Facial Emotion Recognition",
        track: "CV",
        tech: "Keras CNN",
        days: {
            1: [
                { title: "Task 1: Data Gen", desc: "Setup ImageDataGenerator.", code: "datagen = ImageDataGenerator(rescale=1./255)" },
                { title: "Task 2: Flow Data", desc: "Load images from directory.", code: "train_it = datagen.flow_from_directory('data/train')" },
                { title: "Task 3: Model Init", desc: "Create Sequential model.", code: "model = Sequential()" },
                { title: "Task 4: Conv Layers", desc: "Add Conv2D and MaxPool layers.", code: "model.add(Conv2D(32, (3,3), activation='relu'))" },
                { title: "Task 5: Compile", desc: "Compile with Categorical Crossentropy.", code: "model.compile(loss='categorical_crossentropy')" }
            ]
        }
    },
    "crypto-forecast": { // CHANGED FROM "5" TO "crypto-forecast"
        title: "Crypto Forecasting",
        track: "TABULAR",
        tech: "LSTM",
        days: {
            1: [
                { title: "Task 1: Load History", desc: "Load ETH price history CSV.", code: "df = pd.read_csv('eth.csv')" },
                { title: "Task 2: Scaling", desc: "Apply MinMaxScaling (0,1).", code: "scaler = MinMaxScaler()\nscaled_data = scaler.fit_transform(df[['Close']])" },
                { title: "Task 3: Windowing", desc: "Create 60-day sequences.", code: "X, y = create_sequences(scaled_data, 60)" },
                { title: "Task 4: Reshape", desc: "Reshape X for LSTM input.", code: "X = X.reshape(X.shape[0], X.shape[1], 1)" },
                { title: "Task 5: Build LSTM", desc: "Define LSTM model structure.", code: "model.add(LSTM(50, return_sequences=True))" }
            ]
        }
    },
    "wikitext-llm": { // CHANGED FROM "6" TO "wikitext-llm"
        title: "WikiText LLM",
        track: "NLP",
        tech: "Transformers",
        days: {
            1: [
                { title: "Task 1: Tokenizer", desc: "Load GPT-2 Tokenizer.", code: "tokenizer = GPT2Tokenizer.from_pretrained('gpt2')" },
                { title: "Task 2: Encode", desc: "Test encoding a sentence.", code: "input_ids = tokenizer.encode('Hello world')" },
                { title: "Task 3: Dataset", desc: "Load WikiText file.", code: "dataset = TextDataset(tokenizer=tokenizer, file_path='wiki.txt')" },
                { title: "Task 4: Model", desc: "Load GPT2LMHeadModel.", code: "model = GPT2LMHeadModel.from_pretrained('gpt2')" },
                { title: "Task 5: Trainer", desc: "Initialize Trainer args.", code: "args = TrainingArguments(output_dir='./results')" }
            ]
        }
    }
};

// ======================================================
// 2. THE 600-QUESTION GENERATOR (Days 2-20)
// ======================================================
function generateFullCurriculum() {
    
    // --- TRACK 1: COMPUTER VISION (Days 2-20) ---
    const SYLLABUS_CV = [
        "Data Augmentation", "Dropout Regularization", "Batch Normalization", "Model Checkpointing", 
        "Confusion Matrix", "Saliency Maps", "Transfer Learning", "Fine-Tuning Layers", 
        "Learning Rate Scheduler", "Early Stopping", "Saving Models", "Loading Weights",
        "OpenCV Preprocessing", "Inference Loops", "Model Quantization", "ONNX Export", 
        "Edge Deployment", "Speed Optimization", "Capstone Part 1", "Capstone Part 2"
    ];

    // --- TRACK 2: NLP (Days 2-20) ---
    const SYLLABUS_NLP = [
        "Stopword Removal", "Lemmatization", "TF-IDF", "N-Grams",
        "Word Embeddings", "RNN Basics", "LSTM Memory", "Attention",
        "Transformer Blocks", "Sentiment Heads", "Named Entity Rec", "Text Gen Loop",
        "BLEU Scores", "HF Pipelines", "Fine-Tuning BERT", "Serialization",
        "API Wrappers", "Dockerization", "Capstone Part 1", "Capstone Part 2"
    ];

    // --- TRACK 3: TABULAR / TIME SERIES (Days 2-20) ---
    const SYLLABUS_TABULAR = [
        "Imputation", "One-Hot Encoding", "Outlier Detection", "Standard Scaling", 
        "Correlation Matrix", "Polynomial Features", "Ridge Regression", "Decision Trees", 
        "Random Forest", "XGBoost", "GridSearch", "Cross-Validation",
        "Feature Importance", "SHAP Values", "Pickling Models", "Pipelines", 
        "Serving Predictions", "A/B Testing", "Capstone Part 1", "Capstone Part 2"
    ];

    // Assign unique syllabus based on the track
    for (let id in CURRICULUM) {
        const section = CURRICULUM[id];
        let syllabus = [];

        if (section.track === "CV") syllabus = SYLLABUS_CV;
        else if (section.track === "NLP") syllabus = SYLLABUS_NLP;
        else syllabus = SYLLABUS_TABULAR; // Handles Tabular & Crypto

        // Loop through the syllabus and create 5 tasks per day
        for (let i = 0; i < syllabus.length; i++) {
            const dayNum = i + 2; 
            const topic = syllabus[i];
            
            section.days[dayNum] = [
                { title: `Task 1: Setup`, desc: `Initialize environment for ${topic}.`, code: `# Setup ${topic}\nprint("Ready")` },
                { title: `Task 2: Config`, desc: `Configure parameters for ${topic}.`, code: `# Config ${topic}\nparams = {}` },
                { title: `Task 3: Logic`, desc: `Implement core logic for ${topic}.`, code: `# Logic for ${topic}\ndef run(): pass` },
                { title: `Task 4: Test`, desc: `Run a test batch for ${topic}.`, code: `# Testing ${topic}\nprint("Testing...")` },
                { title: `Task 5: Verify`, desc: `Validate final output for ${topic}.`, code: `# Validation\nprint("Success")` }
            ];
            
            section.days[dayNum].meta = {
                title: `Day ${dayNum}: ${topic}`,
                tech: `${section.tech} | Advanced`
            };
        }
    }
}

// ======================================================
// 3. STATE MANAGEMENT & LOGIC
// ======================================================
let currentDatasetId = "1";
let userProgress = {}; // Stores { "1": {day:1, step:0, xp:0}, "2": ... }

function init() {
    generateFullCurriculum(); 

    // 1. Get Section ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentDatasetId = urlParams.get('dataset') || "1";

    // 2. Load Global Progress
    const savedData = localStorage.getItem("unibolt_global_progress");
    if (savedData) {
        userProgress = JSON.parse(savedData);
    }

    // 3. Initialize specific section if missing
    if (!userProgress[currentDatasetId]) {
        userProgress[currentDatasetId] = {
            day: 1,
            step: 0,
            xp: 0,
            lastDate: null
        };
    }

    // 4. Check Day/Lock Status
    checkDayStatus();

    // 5. Setup Listeners
    document.getElementById('run-btn').addEventListener('click', runCurrentStep);
    startTimer(45 * 60);
}

function checkDayStatus() {
    const todayStr = new Date().toDateString();
    const sectionState = userProgress[currentDatasetId];

    // IF finished 5 tasks
    if (sectionState.step >= 5) {
        // IF completed TODAY -> Lock Screen
        if (sectionState.lastDate === todayStr) {
            showLockScreen();
        } else {
            // NEW DAY -> Unlock Next Level
            sectionState.day++;
            sectionState.step = 0;
            sectionState.lastDate = null;
            
            if (sectionState.day > 20) {
                alert("Course Complete! You are a master.");
                window.location.href = '/datasets';
                return;
            }
            saveProgress();
            renderInterface();
        }
    } else {
        renderInterface();
    }
}

function saveProgress() {
    localStorage.setItem("unibolt_global_progress", JSON.stringify(userProgress));
}

// ======================================================
// 4. UI RENDERING
// ======================================================
function renderInterface() {
    const sectionState = userProgress[currentDatasetId];
    const project = CURRICULUM[currentDatasetId];
    
    // Safety Fallback
    if (!project.days[sectionState.day]) sectionState.day = 1;

    const dayTasks = project.days[sectionState.day];
    const dayMeta = dayTasks.meta || { title: `Day ${sectionState.day}: Fundamentals` };

    // Update Header
    document.getElementById('project-title').innerText = dayMeta.title;
    document.getElementById('project-meta').innerText = `${project.tech} | XP: ${sectionState.xp}`;

    // Render Steps List
    const list = document.getElementById('step-list-container');
    list.innerHTML = '';

    dayTasks.forEach((step, index) => {
        const li = document.createElement('li');
        let classes = "step-item";
        let iconContent = index + 1;

        if (index === sectionState.step) classes += " active";
        if (index < sectionState.step) {
            classes += " completed";
            iconContent = '<i class="fa-solid fa-check"></i>';
        }
        if (index > sectionState.step) {
            classes += " locked";
            iconContent = '<i class="fa-solid fa-lock"></i>';
        }

        li.className = classes;
        li.innerHTML = `<div class="step-circle">${iconContent}</div><div style="font-size:13px; font-weight:500; color:white;">${step.title}</div>`;
        list.appendChild(li);
    });

    // Progress Bar
    const pct = (sectionState.step / 5) * 100;
    document.getElementById('overall-progress').style.width = `${pct}%`;

    loadStepInEditor(dayTasks, sectionState.step);
}

function loadStepInEditor(steps, index) {
    if(!steps[index]) return;
    const step = steps[index];
    document.getElementById('current-step-title').innerText = step.title;
    document.getElementById('current-step-desc').innerText = step.desc;
    document.getElementById('code-editor').value = step.code;
    document.getElementById('console-output').innerHTML = '<div style="color:#666;">Ready...</div>';
}

function showLockScreen() {
    const sectionState = userProgress[currentDatasetId];
    document.querySelector('.editor-frame').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; text-align:center; color:white;">
            <div style="background:rgba(139, 92, 246, 0.1); padding:30px; border-radius:50%; margin-bottom:20px;">
                <i class="fa-solid fa-moon" style="font-size:50px; color:#8b5cf6;"></i>
            </div>
            <h1 style="margin:0 0 10px;">Day ${sectionState.day} Complete!</h1>
            <p style="color:#a1a1aa; max-width:400px; line-height:1.6; margin-bottom:30px;">
                You earned <strong>+20 XP</strong> today.<br>
                Day ${sectionState.day + 1} will unlock tomorrow.
            </p>
            <button onclick="window.location.href='/datasets'" class="btn-primary" style="background:#27272a; border:1px solid #444;">
                Return to Dashboard
            </button>
        </div>
    `;
}

// ======================================================
// 5. RUNNER & XP LOGIC
// ======================================================
function runCurrentStep() {
    const btn = document.getElementById('run-btn');
    if (btn.innerHTML.includes("Running")) return;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';
    document.getElementById('console-output').innerHTML = '';

    setTimeout(() => {
        log("Output", "Execution Successful [Exit 0]");
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Run Code';

        const sectionState = userProgress[currentDatasetId];
        sectionState.step++;
        
        // IF DAY COMPLETE (5 Tasks)
        if (sectionState.step >= 5) {
            sectionState.lastDate = new Date().toDateString(); // Mark done for today
            sectionState.xp += 20; // AWARD 20 XP
            saveProgress();
            
            // Show Success Modal
            const modal = document.getElementById('result-modal');
            modal.querySelector('h2').innerText = "+20 XP Earned!";
            modal.classList.remove('hidden');
            
            if (typeof confetti === "function") confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
        } else {
            saveProgress();
            renderInterface();
        }
    }, 1000);
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('timer');
    if(!display) return;
    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        if (--timer < 0) clearInterval(interval);
    }, 1000);
}

function log(type, msg) {
    const div = document.createElement('div');
    div.innerHTML = `<strong style="color:#10b981;">${type}:</strong> ${msg}`;
    document.getElementById('console-output').appendChild(div);
}