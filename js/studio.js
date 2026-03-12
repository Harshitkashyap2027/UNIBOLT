/* UniBolt App Arena - The Ultimate 20-Day Engine (App Dev Edition) */

document.addEventListener('DOMContentLoaded', init);

// ======================================================
// 1. DAY 1: MANUAL SETUP (Foundation for App Tracks)
// ======================================================
const CURRICULUM = {
    "flutter-basics": { 
        title: "Flutter Essentials",
        track: "CROSS-PLATFORM", 
        tech: "Dart & Flutter",
        days: {
            1: [
                { title: "Task 1: Main Entry", desc: "Define the main() entry point.", code: "void main() {\n  runApp(const MyApp());\n}" },
                { title: "Task 2: Root Widget", desc: "Create the root StatelessWidget.", code: "class MyApp extends StatelessWidget {\n  const MyApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return const MaterialApp(home: HomeScreen());\n  }\n}" },
                { title: "Task 3: Scaffold", desc: "Build the basic screen structure.", code: "return Scaffold(\n  appBar: AppBar(title: const Text('Home')),\n  body: const Center(child: Text('Hello Flutter')),\n);" },
                { title: "Task 4: Styling", desc: "Apply text styling.", code: "Text(\n  'Hello Flutter',\n  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),\n)" },
                { title: "Task 5: Stateful Interaction", desc: "Convert to StatefulWidget for interactivity.", code: "class HomeScreen extends StatefulWidget {\n  @override\n  State<HomeScreen> createState() => _HomeScreenState();\n}" }
            ]
        }
    },
    "android-native": { 
        title: "Native Android",
        track: "NATIVE",
        tech: "Kotlin & Jetpack Compose",
        days: {
            1: [
                { title: "Task 1: Activity Setup", desc: "Define the MainActivity class.", code: "class MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n    }\n}" },
                { title: "Task 2: Set Content", desc: "Initialize Compose content.", code: "setContent {\n    UniBoltTheme {\n        Surface(modifier = Modifier.fillMaxSize()) { Greeting(\"Android\") }\n    }\n}" },
                { title: "Task 3: Composable", desc: "Create a basic Composable function.", code: "@Composable\nfun Greeting(name: String) {\n    Text(text = \"Hello $name!\")\n}" },
                { title: "Task 4: Modifiers", desc: "Add padding and alignment.", code: "Text(\n    text = \"Hello $name!\",\n    modifier = Modifier.padding(24.dp)\n)" },
                { title: "Task 5: Preview", desc: "Setup the preview annotation.", code: "@Preview(showBackground = true)\n@Composable\nfun GreetingPreview() {\n    UniBoltTheme { Greeting(\"Android\") }\n}" }
            ]
        }
    },
    "ios-native": { 
        title: "Native iOS",
        track: "NATIVE",
        tech: "Swift & SwiftUI",
        days: {
            1: [
                { title: "Task 1: App Entry", desc: "Define the App struct.", code: "@main\nstruct UniBoltApp: App {\n    var body: some Scene {\n        WindowGroup { ContentView() }\n    }\n}" },
                { title: "Task 2: View Structure", desc: "Create the ContentView.", code: "struct ContentView: View {\n    var body: some View {\n        VStack { Text(\"Hello, world!\") }\n    }\n}" },
                { title: "Task 3: Images", desc: "Add an SF Symbol image.", code: "Image(systemName: \"globe\")\n    .imageScale(.large)\n    .foregroundColor(.accentColor)" },
                { title: "Task 4: State", desc: "Add a @State variable.", code: "@State private var count = 0" },
                { title: "Task 5: Button", desc: "Create an interactive button.", code: "Button(\"Tap me\") {\n    count += 1\n}" }
            ]
        }
    },
    "react-native": { 
        title: "React Native",
        track: "CROSS-PLATFORM",
        tech: "JavaScript / TS",
        days: {
            1: [
                { title: "Task 1: Imports", desc: "Import React and core components.", code: "import React from 'react';\nimport { Text, View, StyleSheet } from 'react-native';" },
                { title: "Task 2: Component", desc: "Define the main App component.", code: "export default function App() {\n  return (\n    <View style={styles.container}>\n      <Text>Open up App.js to start working on your app!</Text>\n    </View>\n  );\n}" },
                { title: "Task 3: Styles", desc: "Create a StyleSheet.", code: "const styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#fff',\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n});" },
                { title: "Task 4: Props", desc: "Pass props to a custom component.", code: "<Greeting name=\"UniBolt\" />" },
                { title: "Task 5: Hooks", desc: "Use useState for logic.", code: "const [count, setCount] = useState(0);" }
            ]
        }
    }
};

// ======================================================
// 2. THE 600-QUESTION GENERATOR (Days 2-20)
// ======================================================
function generateFullCurriculum() {
    
    // --- FLUTTER SYLLABUS ---
    const SYLLABUS_FLUTTER = [
        "Layouts (Row/Column)", "Container & Decorators", "ListView & GridView", "Navigation (Push/Pop)", 
        "State Management (Provider)", "API Calls (Dio/Http)", "JSON Serialization", "Forms & Validation",
        "Firebase Auth", "Firestore Database", "Cloud Storage", "Animations",
        "Custom Painters", "Themes & Dark Mode", "Local Storage (Hive)", "State Management (Riverpod)", 
        "Unit Testing", "CI/CD Setup", "App Store Deploy", "Final Capstone"
    ];

    // --- NATIVE SYLLABUS (Android/iOS) ---
    const SYLLABUS_NATIVE = [
        "UI Components", "Lists & Adapters", "Navigation Patterns", "Networking",
        "Database (Room/CoreData)", "Dependency Injection", "Background Tasks", "Notifications",
        "Permissions", "Camera & Media", "Location Services", "Sensors",
        "Bluetooth / BLE", "Biometrics", "Widgets (Home Screen)", "Performance Profiling",
        "Accessibility", "Security Best Practices", "Beta Testing", "Final Capstone"
    ];

    // --- REACT NATIVE SYLLABUS ---
    const SYLLABUS_RN = [
        "Flexbox Layout", "FlatList & ScrollView", "React Navigation", "Redux Toolkit",
        "Axios & Networking", "AsyncStorage", "Native Modules", "Expo APIs",
        "Maps Integration", "Push Notifications", "Gestures & Reanimated", "Formik & Yup",
        "Authentication Flows", "OTA Updates", "Deep Linking", "Performance Opt",
        "TypeScript Migration", "Testing (Jest/Detox)", "EAS Build", "Final Capstone"
    ];

    for (let id in CURRICULUM) {
        const section = CURRICULUM[id];
        let syllabus = [];

        if (section.title.includes("Flutter")) syllabus = SYLLABUS_FLUTTER;
        else if (section.track === "NATIVE") syllabus = SYLLABUS_NATIVE;
        else syllabus = SYLLABUS_RN;

        // Loop through syllabus to generate 5 tasks per day
        for (let i = 0; i < syllabus.length; i++) {
            const dayNum = i + 2; 
            const topic = syllabus[i];
            
            section.days[dayNum] = [
                { title: `Task 1: Setup`, desc: `Prepare environment for ${topic}.`, code: `// initializing ${topic}...\nvoid setup() {}` },
                { title: `Task 2: UI Build`, desc: `Create UI elements for ${topic}.`, code: `// Building UI for ${topic}\nWidget build() { return Container(); }` },
                { title: `Task 3: Logic`, desc: `Implement business logic for ${topic}.`, code: `// Logic Controller\nclass ${topic.replace(/\s/g,'')}Controller {}` },
                { title: `Task 4: Integration`, desc: `Connect ${topic} to the main app.`, code: `// Connecting...\napp.register(${topic});` },
                { title: `Task 5: Debug`, desc: `Test and verify ${topic}.`, code: `// Testing\nassert(module.isWorking());` }
            ];
            
            section.days[dayNum].meta = {
                title: `Day ${dayNum}: ${topic}`,
                tech: `${section.tech} | Intermediate`
            };
        }
    }
}

// ======================================================
// 3. STATE MANAGEMENT & LOGIC
// ======================================================
let currentTrackId = "flutter-basics"; // Default
let userProgress = {}; // Stores { "flutter-basics": {day:1, step:0, xp:0}, ... }

function init() {
    generateFullCurriculum(); 

    // 1. Get Track ID from URL (e.g., ?track=ios-native)
    const urlParams = new URLSearchParams(window.location.search);
    currentTrackId = urlParams.get('track') || "flutter-basics";

    // 2. Load Global Progress
    const savedData = localStorage.getItem("unibolt_app_progress"); // Different key from AI
    if (savedData) {
        userProgress = JSON.parse(savedData);
    }

    // 3. Initialize specific section if missing
    if (!userProgress[currentTrackId]) {
        userProgress[currentTrackId] = {
            day: 1,
            step: 0,
            xp: 0,
            lastDate: null
        };
    }

    // 4. Check Day/Lock Status
    checkDayStatus();

    // 5. Setup Listeners
    const runBtn = document.getElementById('run-btn');
    if(runBtn) runBtn.addEventListener('click', runCurrentStep);
    
    startTimer(45 * 60);
}

function checkDayStatus() {
    const todayStr = new Date().toDateString();
    const sectionState = userProgress[currentTrackId];

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
                alert("Track Complete! You are a Certified Mobile Developer.");
                window.location.href = 'app-dashboard.html';
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
    localStorage.setItem("unibolt_app_progress", JSON.stringify(userProgress));
}

// ======================================================
// 4. UI RENDERING
// ======================================================
function renderInterface() {
    const sectionState = userProgress[currentTrackId];
    const project = CURRICULUM[currentTrackId];
    
    // Safety Fallback
    if (!project.days[sectionState.day]) sectionState.day = 1;

    const dayTasks = project.days[sectionState.day];
    const dayMeta = dayTasks.meta || { title: `Day ${sectionState.day}: Fundamentals` };

    // Update Header
    const titleEl = document.getElementById('project-title');
    const metaEl = document.getElementById('project-meta');
    
    if(titleEl) titleEl.innerText = dayMeta.title;
    if(metaEl) metaEl.innerText = `${project.tech} | XP: ${sectionState.xp}`;

    // Render Steps List
    const list = document.getElementById('step-list-container');
    if(list) {
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
            li.innerHTML = `<div class="step-circle">${iconContent}</div><div style="flex:1;"><div style="font-size:13px; font-weight:500; color:white;">${step.title}</div></div>`;
            list.appendChild(li);
        });
    }

    // Progress Bar
    const pct = (sectionState.step / 5) * 100;
    const progBar = document.getElementById('overall-progress');
    const progTxt = document.getElementById('progress-text');
    
    if(progBar) progBar.style.width = `${pct}%`;
    if(progTxt) progTxt.innerText = `${pct}%`;

    loadStepInEditor(dayTasks, sectionState.step);
}

function loadStepInEditor(steps, index) {
    if(!steps[index]) return;
    const step = steps[index];
    
    const titleEl = document.getElementById('current-step-title');
    const descEl = document.getElementById('current-step-desc');
    const editorEl = document.getElementById('code-editor');
    const consoleEl = document.getElementById('console-output');

    if(titleEl) titleEl.innerText = step.title;
    if(descEl) descEl.innerText = step.desc;
    
    // Append code or set it if empty
    if(editorEl) {
        // Simple logic: if new step, just set value. In complex app, might want to append.
        if (editorEl.value.indexOf(step.code) === -1) {
             editorEl.value = step.code;
        }
    }
    
    if(consoleEl) consoleEl.innerHTML = '<div style="color:#666;">Waiting for input...</div>';
}

function showLockScreen() {
    const sectionState = userProgress[currentTrackId];
    // Replaces the editor area with a lock screen
    const editorFrame = document.querySelector('.editor-frame');
    if(editorFrame) {
        editorFrame.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; text-align:center; color:white;">
                <div style="background:rgba(14, 165, 233, 0.1); padding:30px; border-radius:50%; margin-bottom:20px;">
                    <i class="fa-solid fa-moon" style="font-size:50px; color:#0ea5e9;"></i>
                </div>
                <h1 style="margin:0 0 10px;">Day ${sectionState.day} Complete!</h1>
                <p style="color:#a1a1aa; max-width:400px; line-height:1.6; margin-bottom:30px;">
                    You earned <strong>+20 XP</strong> today.<br>
                    Day ${sectionState.day + 1} will unlock tomorrow.
                </p>
                <button onclick="window.location.href='app-dashboard.html'" class="btn-primary" style="background:#27272a; border:1px solid #444; color:white; padding:10px 20px; border-radius:6px; cursor:pointer;">
                    Return to Dashboard
                </button>
            </div>
        `;
    }
}

// ======================================================
// 5. RUNNER & XP LOGIC
// ======================================================
function runCurrentStep() {
    const btn = document.getElementById('run-btn');
    if (btn.innerHTML.includes("Running")) return;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';
    const consoleEl = document.getElementById('console-output');
    if(consoleEl) consoleEl.innerHTML = '';

    // Simulation steps
    setTimeout(() => log("Build", "Compiling resources..."), 300);
    setTimeout(() => log("Build", "Linking dependencies..."), 800);
    
    setTimeout(() => {
        log("Output", "Build Successful [Exit 0]");
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Run Code';

        const sectionState = userProgress[currentTrackId];
        sectionState.step++;
        
        // IF DAY COMPLETE (5 Tasks)
        if (sectionState.step >= 5) {
            sectionState.lastDate = new Date().toDateString(); // Mark done for today
            sectionState.xp += 20; // AWARD 20 XP
            saveProgress();
            
            // Show Success Modal
            const modal = document.getElementById('result-modal');
            if(modal) {
                modal.classList.remove('hidden');
            }
            
            if (typeof confetti === "function") confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#0ea5e9', '#ffffff'] });
        } else {
            saveProgress();
            renderInterface();
        }
    }, 1500);
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
    div.innerHTML = `<strong style="color:#0ea5e9;">${type}:</strong> ${msg}`;
    const consoleEl = document.getElementById('console-output');
    if(consoleEl) consoleEl.appendChild(div);
}