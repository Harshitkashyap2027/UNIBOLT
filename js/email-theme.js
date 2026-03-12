// --- 1. THE MASTER SHELL (Responsive & Dark Mode Compatible) ---
export const masterShell = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>\${SUBJECT}</title>
    <style>
        body { margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width:100%; table-layout:fixed; background-color:#f1f5f9; padding-bottom:40px; }
        .main { background-color:#ffffff; margin:0 auto; max-width:600px; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05); }
        
        /* BRAND HEADER */
        .header { background: #000000; padding:30px; text-align:center; border-bottom: 4px solid #ef4444; }
        .header h1 { margin:0; font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.5px; }
        .header span { color: #ef4444; }

        /* CONTENT AREA */
        .content { padding:40px; color:#334155; line-height:1.6; font-size:16px; }
        .content h2 { margin-top:0; color:#0f172a; font-size:22px; font-weight:700; }
        .content p { margin-bottom:20px; }
        
        /* BUTTONS */
        .btn-primary { background-color:#ef4444; color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block; margin-top:10px; }
        .btn-secondary { background-color:#f1f5f9; color:#334155; padding:12px 28px; text-decoration:none; border-radius:6px; font-weight:600; display:inline-block; border:1px solid #e2e8f0; }

        /* UTILITIES */
        .highlight-box { background:#f8fafc; border-left:4px solid #ef4444; padding:15px; margin:20px 0; border-radius:4px; font-size:14px; }
        .stat-grid { display:table; width:100%; margin:20px 0; }
        .stat-item { display:table-cell; width:33%; text-align:center; padding:15px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; }
        .stat-val { display:block; font-size:24px; font-weight:800; color:#0f172a; }
        .stat-lbl { display:block; font-size:11px; text-transform:uppercase; color:#64748b; margin-top:5px; font-weight:700; }

        /* FOOTER */
        .footer { background-color:#f8fafc; padding:30px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
        .footer a { color:#64748b; text-decoration:underline; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div style="height:40px;"></div>
        <div class="main">
            <div class="header">
                <h1>Uni<span>Bolt</span></h1>
            </div>
            <div class="content">
                \${CONTENT}
            </div>
            <div class="footer">
                <p>Sent to {{email}} • <a href="#">Unsubscribe</a></p>
                <p>UniBolt Inc. • Education Park, New Delhi, India</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// --- 2. THE 35 SMART TEMPLATES ---
export const templates = {
    // === GROUP A: ONBOARDING (5) ===
    "welcome": {
        subject: "Welcome to UniBolt, {{name}}! 🚀",
        fields: ["name"], 
        body: `
            <h2>Hi {{name}},</h2>
            <p>Welcome to the future of internships! You have just taken the first step towards accelerating your career.</p>
            <p><strong>Here is what you can do next:</strong></p>
            <ul>
                <li>Complete your profile</li>
                <li>Enroll in your first module</li>
                <li>Join the community Discord</li>
            </ul>
            <div style="text-align:center; margin-top:30px;">
                <a href="https://unibolt.in/dashboard" class="btn-primary">Go to Dashboard</a>
            </div>
        `
    },
    "verify_email": {
        subject: "Action Required: Verify Email",
        fields: ["link"],
        body: `
            <h2>Verify your identity</h2>
            <p>We received a registration request for this email address. Please click the button below to confirm it's you.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="{{link}}" class="btn-primary">Verify Account</a>
            </div>
            <p style="font-size:12px; color:#999;">Link expires in 24 hours.</p>
        `
    },
    "profile_incomplete": {
        subject: "{{name}}, your profile is 80% done 👀",
        fields: ["name"],
        body: `
            <h2>Almost there!</h2>
            <p>Recruiters are <strong>3x more likely</strong> to view profiles that are 100% complete.</p>
            <div class="highlight-box">
                <strong>Missing:</strong> Resume Upload, GitHub Link
            </div>
            <div style="text-align:center;">
                <a href="https://unibolt.in/profile" class="btn-secondary">Finish Profile</a>
            </div>
        `
    },
    "account_approved": {
        subject: "You're In! Account Approved ✅",
        fields: ["name"],
        body: `
            <h2>Congratulations, {{name}}!</h2>
            <p>Your application has been reviewed and <strong>approved</strong> by our team. You now have full access to the platform.</p>
            <p>Start your learning journey today.</p>
            <div style="text-align:center; margin-top:20px;">
                <a href="https://unibolt.in/login" class="btn-primary">Login Now</a>
            </div>
        `
    },
    "account_rejected": {
        subject: "Update on your application",
        fields: ["name", "reason"],
        body: `
            <h2>Application Status</h2>
            <p>Dear {{name}},</p>
            <p>Thank you for your interest in UniBolt. Unfortunately, we cannot move forward with your application at this time.</p>
            <div class="highlight-box" style="border-left-color:#64748b;">
                <strong>Reason:</strong> {{reason}}
            </div>
            <p>You may re-apply in 30 days.</p>
        `
    },

    // === GROUP B: PROGRESS & GAMIFICATION (5) ===
    "streak_alert": {
        subject: "🔥 {{streak}} Day Streak! Keep it up!",
        fields: ["name", "streak"],
        body: `
            <div style="text-align:center;">
                <span style="font-size:60px;">🔥</span>
                <h2 style="color:#ef4444; font-size:32px; margin-top:10px;">{{streak}} DAYS!</h2>
            </div>
            <p style="text-align:center;">Incredible consistency, {{name}}. You are on fire!</p>
            <p style="text-align:center;">Maintain this streak for <strong>7 more days</strong> to unlock the "Dedicated" badge and earn a certificate eligible for your CV.</p>
            <div style="text-align:center; margin-top:30px;">
                <a href="https://unibolt.in/learn" class="btn-primary">Continue Learning</a>
            </div>
        `
    },
    "rank_up": {
        subject: "🏆 LEVEL UP! You reached Rank #{{rank}}",
        fields: ["name", "rank", "xp"],
        body: `
            <div style="text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/3112/3112946.png" width="80" style="margin-bottom:15px;">
                <h2>You're Moving Up!</h2>
            </div>
            <div class="stat-grid">
                <div class="stat-item"><span class="stat-val">#{{rank}}</span><span class="stat-lbl">Global Rank</span></div>
                <div class="stat-item"><span class="stat-val">{{xp}}</span><span class="stat-lbl">Total XP</span></div>
                <div class="stat-item"><span class="stat-val">Gold</span><span class="stat-lbl">Current Tier</span></div>
            </div>
            <p style="text-align:center;">Keep pushing to reach the Top 10!</p>
        `
    },
    "badge_unlocked": {
        subject: "New Badge: JavaScript Master 🛡️",
        fields: ["name", "badge_name"],
        body: `
            <div style="text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/625/625393.png" width="100">
                <h2 style="color:#ca8a04; margin-top:10px;">Badge Unlocked!</h2>
            </div>
            <p style="text-align:center;">Congratulations {{name}}, you have earned the <strong>{{badge_name}}</strong> badge.</p>
            <div style="text-align:center; margin-top:20px;">
                <a href="#" class="btn-secondary">Share on LinkedIn</a>
            </div>
        `
    },
    "leaderboard_alert": {
        subject: "⚠️ You dropped to Rank #{{rank}}",
        fields: ["rank"],
        body: `
            <h2>Don't lose your spot!</h2>
            <p>Others are working hard. You have dropped to <strong>Rank #{{rank}}</strong> on the leaderboard.</p>
            <p>Complete one Daily Challenge to regain your position.</p>
            <div style="text-align:center; margin-top:20px;">
                <a href="https://unibolt.in/challenges" class="btn-primary">Solve Challenge</a>
            </div>
        `
    },
    "weekly_report": {
        subject: "Your Weekly Progress Report 📊",
        fields: ["name", "hours", "tasks"],
        body: `
            <h2>Weekly Summary</h2>
            <p>Great work this week, {{name}}. Here is what you achieved:</p>
            <ul>
                <li><strong>Study Time:</strong> {{hours}} Hours</li>
                <li><strong>Tasks Completed:</strong> {{tasks}}</li>
                <li><strong>Accuracy:</strong> 94%</li>
            </ul>
            <p>Ready for next week?</p>
        `
    },

    // === GROUP C: FINANCIAL & RECEIPTS (5) ===
    "payment_receipt": {
        subject: "Payment Receipt: Transaction Approved ✅",
        fields: ["name", "email", "phone", "amount", "date", "utr"],
        body: `
            <div style="text-align:center; margin-bottom:20px;">
                <img src="https://cdn-icons-png.flaticon.com/512/148/148767.png" width="50">
                <h2 style="margin-top:10px; color:#15803d;">Payment Approved</h2>
            </div>
            <p>Dear {{name}},</p>
            <p>We have received your payment. Below are the transaction details.</p>
            
            <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:14px;">
                <tr style="background:#f8fafc;"><td style="padding:10px; border:1px solid #e2e8f0;"><strong>Student Name</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">{{name}}</td></tr>
                <tr><td style="padding:10px; border:1px solid #e2e8f0;"><strong>Email</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">{{email}}</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:10px; border:1px solid #e2e8f0;"><strong>Phone</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">{{phone}}</td></tr>
                <tr><td style="padding:10px; border:1px solid #e2e8f0;"><strong>Date</strong></td><td style="padding:10px; border:1px solid #e2e8f0;">{{date}}</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:10px; border:1px solid #e2e8f0;"><strong>UTR / Ref No.</strong></td><td style="padding:10px; border:1px solid #e2e8f0; font-family:monospace;">{{utr}}</td></tr>
                <tr><td style="padding:10px; border:1px solid #e2e8f0;"><strong>Amount Paid</strong></td><td style="padding:10px; border:1px solid #e2e8f0; font-weight:bold; color:#15803d;">₹{{amount}}</td></tr>
                <tr style="background:#f0fdf4;"><td style="padding:10px; border:1px solid #e2e8f0;"><strong>Status</strong></td><td style="padding:10px; border:1px solid #e2e8f0; color:#15803d; font-weight:bold;">VERIFIED & APPROVED</td></tr>
            </table>

            <div style="text-align:center; margin-top:30px;">
                <a href="#" class="btn-secondary">Download PDF Invoice</a>
            </div>
        `
    },
    "payment_failed": {
        subject: "Action Required: Payment Failed ❌",
        fields: ["name"],
        body: `
            <h2 style="color:#ef4444;">Transaction Failed</h2>
            <p>Hi {{name}}, we were unable to process your payment for the Pro Plan.</p>
            <p>This could be due to insufficient funds or a bank timeout.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="https://unibolt.in/pay" class="btn-primary">Retry Payment</a>
            </div>
        `
    },
    "subscription_ending": {
        subject: "Your Pro Access expires in 3 days",
        fields: ["name", "expiry_date"],
        body: `
            <h2>Don't lose your streak!</h2>
            <p>{{name}}, your Pro membership is set to expire on <strong>{{expiry_date}}</strong>.</p>
            <p>Renew now to keep access to premium projects and mentorship.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="https://unibolt.in/renew" class="btn-primary">Renew Now</a>
            </div>
        `
    },
    "refund_issued": {
        subject: "Refund Processed: ₹{{amount}}",
        fields: ["amount", "utr"],
        body: `
            <h2>Refund Initiated</h2>
            <p>We have processed a refund of <strong>₹{{amount}}</strong> to your original payment source.</p>
            <p><strong>Reference:</strong> {{utr}}</p>
            <p>It may take 5-7 business days to reflect in your account.</p>
        `
    },
    "scholarship_awarded": {
        subject: "🎉 Scholarship Awarded!",
        fields: ["name", "amount"],
        body: `
            <div style="text-align:center;">
                <h2 style="color:#ca8a04;">You've been selected!</h2>
            </div>
            <p>Dear {{name}}, based on your outstanding performance, you have been awarded a <strong>₹{{amount}}</strong> scholarship.</p>
            <p>This amount has been credited to your UniBolt wallet.</p>
        `
    },

    // === GROUP D: SECURITY (5) ===
    "otp_login": {
        subject: "{{otp}} is your login code",
        fields: ["otp"],
        body: `
            <h2>Login Verification</h2>
            <p>Use the code below to sign in. This code expires in 10 minutes.</p>
            <div style="background:#f1f5f9; padding:20px; text-align:center; border-radius:8px; font-size:32px; font-weight:800; letter-spacing:5px; color:#0f172a; margin:20px 0;">
                {{otp}}
            </div>
            <p style="font-size:12px; color:#999;">If you didn't request this, please change your password immediately.</p>
        `
    },
    "password_reset": {
        subject: "Reset Your Password",
        fields: ["link"],
        body: `
            <h2>Forgot Password?</h2>
            <p>We received a request to reset your password. Click the button below to choose a new one.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="{{link}}" class="btn-primary">Reset Password</a>
            </div>
        `
    },
    "new_login": {
        subject: "Security Alert: New Login Detected",
        fields: ["time", "device", "location"],
        body: `
            <h2 style="color:#ef4444;">New Login Detected</h2>
            <p>We noticed a login to your account from a new device.</p>
            <ul style="background:#fff1f2; padding:20px 20px 20px 40px; border-radius:8px; color:#991b1b;">
                <li><strong>Time:</strong> {{time}}</li>
                <li><strong>Device:</strong> {{device}}</li>
                <li><strong>Location:</strong> {{location}}</li>
            </ul>
            <p>If this wasn't you, secure your account immediately.</p>
        `
    },
    "suspicious_activity": {
        subject: "⚠️ Action Required: Suspicious Activity",
        fields: ["name"],
        body: `
            <h2 style="color:#ef4444;">Account Flagged</h2>
            <p>Dear {{name}}, our system detected unusual activity on your account during the recent exam.</p>
            <p>Your access has been temporarily restricted pending review.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="mailto:support@unibolt.in" class="btn-secondary">Contact Support</a>
            </div>
        `
    },
    "account_locked": {
        subject: "Your account has been locked",
        fields: ["name"],
        body: `
            <h2>Account Locked</h2>
            <p>Due to multiple failed login attempts, your account has been locked for 30 minutes.</p>
            <p>You can try again later or reset your password.</p>
        `
    },

    // === GROUP E: NOTIFICATIONS & SYSTEM (10+) ===
    "maintenance": {
        subject: "Scheduled Maintenance 🛠️",
        fields: ["time"],
        body: `
            <h2>We are upgrading!</h2>
            <p>UniBolt will be undergoing scheduled maintenance on <strong>{{time}}</strong>.</p>
            <p>The platform will be unavailable during this time. We apologize for the inconvenience.</p>
        `
    },
    "new_feature": {
        subject: "Introducing: AI Mock Interviews 🤖",
        fields: ["name"],
        body: `
            <h2>Practice with AI</h2>
            <p>Hi {{name}}, we just launched a new feature! You can now practice coding interviews with our AI bot.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="https://unibolt.in/ai-interview" class="btn-primary">Try it Now</a>
            </div>
        `
    },
    "event_webinar": {
        subject: "Live Webinar: Cracking FAANG Interviews",
        fields: ["date", "link"],
        body: `
            <h2>Join us Live!</h2>
            <p>Expert engineers from Google and Amazon will be sharing their interview secrets.</p>
            <div class="highlight-box"><strong>Date:</strong> {{date}}</div>
            <div style="text-align:center; margin:30px 0;">
                <a href="{{link}}" class="btn-primary">Register Free</a>
            </div>
        `
    },
    "ticket_received": {
        subject: "Support Request Received: #{{ticket_id}}",
        fields: ["ticket_id", "name"],
        body: `
            <h2>We got your message</h2>
            <p>Hi {{name}}, your ticket <strong>#{{ticket_id}}</strong> has been created.</p>
            <p>Our support team usually replies within 24 hours.</p>
        `
    },
    "ticket_resolved": {
        subject: "Ticket #{{ticket_id}} has been Resolved ✅",
        fields: ["ticket_id", "name"],
        body: `
            <h2>Issue Resolved</h2>
            <p>Hi {{name}}, we believe your issue regarding Ticket #{{ticket_id}} has been resolved.</p>
            <p>If you need further help, please reply to this email.</p>
            <p>Happy Learning!</p>
        `
    },
    "assignment_due": {
        subject: "⏰ Assignment Due Tomorrow",
        fields: ["task_name"],
        body: `
            <h2 style="color:#f59e0b;">Clock is ticking!</h2>
            <p>Your assignment <strong>{{task_name}}</strong> is due in 24 hours.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="#" class="btn-primary">Submit Now</a>
            </div>
        `
    },
    "course_completed": {
        subject: "🎓 Course Completed! Here is your Certificate",
        fields: ["course_name", "link"],
        body: `
            <h2>You did it!</h2>
            <p>Congratulations on completing <strong>{{course_name}}</strong>.</p>
            <p>Your verified certificate is ready to download.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="{{link}}" class="btn-primary">Download Certificate</a>
            </div>
        `
    },
    "referral_bonus": {
        subject: "You earned a Referral Bonus! 🎁",
        fields: ["name", "friend_name"],
        body: `
            <h2>Thanks for sharing!</h2>
            <p>Your friend <strong>{{friend_name}}</strong> just signed up using your link.</p>
            <p>You have both earned <strong>500 XP</strong> and 1 Week of Pro Access.</p>
        `
    },
    "inactive_user": {
        subject: "We miss you! 🥺",
        fields: ["name"],
        body: `
            <h2>It's been a while...</h2>
            <p>{{name}}, your learning streak is at risk! You haven't logged in for 30 days.</p>
            <p>Come back and solve today's challenge to get back on track.</p>
            <div style="text-align:center; margin:30px 0;">
                <a href="https://unibolt.in" class="btn-primary">Resume Learning</a>
            </div>
        `
    },
    "community_guidelines": {
        subject: "Reminder: Community Guidelines",
        fields: ["name"],
        body: `
            <h2>Keep it friendly!</h2>
            <p>Hi {{name}}, this is a gentle reminder to follow our community guidelines when posting in the forums.</p>
            <p>Let's keep UniBolt a safe and supportive place for everyone.</p>
        `
    }
};

// --- HELPER TO MERGE & INJECT DATA ---
export function generateEmailHtml(templateKey, data) {
    const t = templates[templateKey];
    if (!t) return null;

    let content = t.body;
    let subject = t.subject;

    // 1. Inject Data into Subject & Body
    Object.keys(data).forEach(key => {
        // Replace {{key}} with actual value
        const regex = new RegExp(\`{{ \${key} }}\`, 'gi'); 
        // Also handle without spaces {{key}}
        const regex2 = new RegExp(\`{{\${key}}}\`, 'gi');
        
        const val = data[key] || "---";
        content = content.replace(regex, val).replace(regex2, val);
        subject = subject.replace(regex, val).replace(regex2, val);
    });

    // 2. Inject Content into Master Shell
    let finalHtml = masterShell.replace('\${CONTENT}', content);
    finalHtml = finalHtml.replace('\${SUBJECT}', subject);
    
    // 3. Inject Email for Footer (if present in data)
    const email = data.email || "student@unibolt.in";
    finalHtml = finalHtml.replace('{{email}}', email);

    return { html: finalHtml, subject: subject };
}