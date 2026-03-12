import { db, auth } from "./firebase-config.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. UI Elements ---
const filterSelect = document.querySelector('select');
const podium = {
    r1: { name: document.getElementById("r1-name"), xp: document.getElementById("r1-xp"), course: document.getElementById("r1-course"), avatar: document.querySelector(".r1-avatar") },
    r2: { name: document.getElementById("r2-name"), xp: document.getElementById("r2-xp"), course: document.getElementById("r2-course"), avatar: document.querySelector(".r2-avatar") },
    r3: { name: document.getElementById("r3-name"), xp: document.getElementById("r3-xp"), course: document.getElementById("r3-course"), avatar: document.querySelector(".r3-avatar") }
};
const tableBody = document.getElementById("leaderboard-body");

let allUsersData = [];
let currentUserId = null;

// --- 2. Helper Function for Course Badges ---
function getCourseBadge(programName) {
    if (!programName) return `<span class="badge" style="background:#333; border:1px solid #444; color:#888;">General</span>`;

    const name = programName.toLowerCase();
    const badgeStyle = `display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap;`;

    if (name.includes('ai') || name.includes('data')) {
        return `<span style="${badgeStyle} background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3);">
            <i class="fa-solid fa-brain"></i> AI & Data Science
        </span>`;
    }
    if (name.includes('web') || name.includes('stack')) {
        return `<span style="${badgeStyle} background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3);">
            <i class="fa-solid fa-code"></i> Full Stack Web
        </span>`;
    }
    if (name.includes('app') || name.includes('flutter')) {
        return `<span style="${badgeStyle} background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
            <i class="fa-solid fa-mobile-screen"></i> App Dev
        </span>`;
    }
    
    return `<span style="${badgeStyle} background:#222; border:1px solid #333; color:#aaa;">${programName}</span>`;
}

// --- 3. Main Logic ---
async function fetchLeaderboard() {
    try {
        const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        
        allUsersData = [];
        querySnapshot.forEach((doc) => {
            allUsersData.push({ id: doc.id, ...doc.data() });
        });

        renderLeaderboard("all");

    } catch (error) {
        console.error("Error:", error);
        if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#ef4444;">Error loading data.</td></tr>`;
    }
}

function renderLeaderboard(filterType) {
    let displayedUsers = allUsersData;
    
    if (filterType !== "all") {
        displayedUsers = allUsersData.filter(user => {
            const prog = (user.enrolledProgram || "").toLowerCase();
            if (filterType === "web") return prog.includes("web");
            if (filterType === "ai") return prog.includes("ai") || prog.includes("data");
            if (filterType === "app") return prog.includes("app");
            return false;
        });
    }

    updatePodium(displayedUsers);

    if(tableBody) {
        tableBody.innerHTML = ""; 

        if(displayedUsers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color: #666;">No students found.</td></tr>`;
            return;
        }

        displayedUsers.forEach((user, index) => {
            const rank = index + 1;
            let rankColor = rank === 1 ? "#ffd700" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : "#fff";
            let rowBg = user.id === currentUserId ? "rgba(139, 92, 246, 0.1)" : "transparent";
            let borderStyle = user.id === currentUserId ? "3px solid #8b5cf6" : "3px solid transparent";

            const row = document.createElement("tr");
            row.style.background = rowBg;
            row.style.borderLeft = borderStyle;
            row.style.borderBottom = "1px solid rgba(255,255,255,0.05)";

            // --- UPDATED AVATAR LOGIC ---
            // 1. Check for 'avatarIcon' (The emoji you saved)
            // 2. Fallback to Initial Letter
            const avatarContent = user.avatarIcon ? user.avatarIcon : (user.name ? user.name.charAt(0).toUpperCase() : "?");
            
            const programName = user.enrolledProgram || "General";

            row.innerHTML = `
                <td style="padding: 15px; color: ${rankColor}; font-weight: 800; font-size: 16px; text-align: center; width: 60px;">#${rank}</td>
                
                <td style="padding: 12px 15px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        
                        <div style="
                            width: 38px; height: 38px; min-width: 38px; min-height: 38px; 
                            background: linear-gradient(135deg, #333, #444); 
                            border-radius: 50%; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 18px; /* Larger font for Emoji */
                            border: 1px solid rgba(255,255,255,0.1);
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        ">${avatarContent}</div>
                        
                        <div style="display: flex; flex-direction: column;">
                            <span style="color: white; font-weight: 600; font-size: 14px;">
                                ${user.name || "Anonymous"} 
                                ${user.id === currentUserId ? "<span style='color:#8b5cf6; font-size:10px; margin-left:4px;'>(You)</span>" : ""}
                            </span>
                        </div>
                    </div>
                </td>

                <td style="padding: 15px; vertical-align: middle;">
                    ${getCourseBadge(programName)}
                </td>

                <td style="padding: 15px; vertical-align: middle; color: #fbbf24; font-weight: 600;">
                    🔥 ${user.streak || 0}
                </td>

                <td style="padding: 15px; text-align: right; color: #10b981; font-weight: 800; font-family: monospace; font-size: 15px;">
                    ${(user.xp || 0).toLocaleString()} XP
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}

function updatePodium(users) {
    const setPodiumData = (user, rankObj) => {
        if (!user) {
            if(rankObj.name) rankObj.name.innerText = "-";
            if(rankObj.xp) rankObj.xp.innerText = "";
            if(rankObj.course) rankObj.course.innerHTML = "";
            // Reset Avatar if no user
            if(rankObj.avatar) rankObj.avatar.innerHTML = ""; 
            return;
        }

        // Set Name & XP
        if(rankObj.name) rankObj.name.innerText = user.name || "Anonymous";
        if(rankObj.xp) rankObj.xp.innerText = `${(user.xp || 0).toLocaleString()} XP`;
        if(rankObj.course) rankObj.course.innerHTML = getCourseBadge(user.enrolledProgram || "General");

        // Set Podium Avatar (If element exists in your HTML)
        // Note: You might need to add class .r1-avatar, .r2-avatar etc to your HTML podium circles
        /* if(rankObj.avatar) {
            const avContent = user.avatarIcon ? user.avatarIcon : (user.name ? user.name.charAt(0).toUpperCase() : "?");
            rankObj.avatar.innerHTML = avContent;
            rankObj.avatar.style.fontSize = "24px"; // Make emoji big
        }
        */
    };

    setPodiumData(users[0], podium.r1);
    setPodiumData(users[1], podium.r2);
    setPodiumData(users[2], podium.r3);
}

// --- 4. Events ---
if(filterSelect) {
    filterSelect.addEventListener('change', (e) => {
        renderLeaderboard(e.target.value);
    });
}

onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
    fetchLeaderboard(); 
});