// backend/server.js

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors()); // Allows your frontend to talk to this backend
app.use(bodyParser.json());

// --- CONFIGURATION ---
const PORT = process.env.PORT || 5000;
const ZOHO_USER = process.env.ZOHO_USER || "admin@unibolt.in";
const ZOHO_PASS = process.env.ZOHO_PASSWORD;

// --- EMAIL SENDING FUNCTION ---
if (!ZOHO_PASS) {
    console.error("❌ ZOHO_PASSWORD environment variable is not set. Email functionality will not work.");
}

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,
    auth: {
        user: ZOHO_USER,
        pass: ZOHO_PASS
    }
});

// --- API ROUTE: SEND EMAIL ---
app.post('/api/send-email', async (req, res) => {
    const { type, email, name, subject, html } = req.body;
    console.log(`📩 Request received: ${type} email to ${name || 'Everyone'}`);

    try {
        if (type === 'bulk') {
            // OPTION A: If you have a Database, fetch students here.
            // OPTION B: For now, we will assume you send the list from Frontend (easier for start)
            const students = req.body.studentsList; // You must send this list from frontend

            if (!students || students.length === 0) {
                return res.json({ success: false, message: "No students provided" });
            }

            console.log(`🚀 Sending to ${students.length} students...`);

            // Send to everyone
            for (let student of students) {
                await transporter.sendMail({
                    from: `"UniBolt Admin" <${ZOHO_USER}>`,
                    to: student.email,
                    subject: subject,
                    html: `
                        <div style="font-family: Arial; padding: 20px; background: #f4f6f8;">
                            <div style="background: white; padding: 30px; border-radius: 10px;">
                                <h2 style="color: #0f172a;">Hello ${student.name},</h2>
                                ${html}
                                <hr style="margin-top:20px; border:0; border-top:1px solid #eee;">
                                <p style="font-size: 12px; color: #888;">UniBolt Admin Team</p>
                            </div>
                        </div>
                    `
                });
            }
            res.json({ success: true, message: `Sent to ${students.length} students` });

        } else {
            // SINGLE EMAIL
            await transporter.sendMail({
                from: `"UniBolt Admin" <${ZOHO_USER}>`,
                to: email,
                subject: subject,
                html: `
                    <div style="font-family: Arial; padding: 20px; background: #f4f6f8;">
                        <div style="background: white; padding: 30px; border-radius: 10px;">
                            <h2 style="color: #0f172a;">Hello ${name},</h2>
                            ${html}
                        </div>
                    </div>
                `
            });
            res.json({ success: true, message: "Email Sent Successfully" });
        }

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});