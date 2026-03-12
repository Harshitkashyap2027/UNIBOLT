// api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { type, email, name, subject, html } = req.body;
    
    // 2. Securely get Password from Vercel Environment Variables
    // (I will show you how to set this in Step 4)
    const ZOHO_PASS = process.env.ZOHO_PASSWORD; 

    if (!ZOHO_PASS) {
        return res.status(500).json({ success: false, message: 'Server Configuration Error: Password missing' });
    }

    // 3. Configure Transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        secure: true,
        auth: {
            user: "admin@unibolt.in",
            pass: ZOHO_PASS
        }
    });

    try {
        // 4. Send Email
        await transporter.sendMail({
            from: '"UniBolt Admin" <admin@unibolt.in>',
            to: email, // This works for single emails. For bulk, loop logic is needed here or in frontend.
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f6f8;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h2 style="color: #0f172a; margin-top:0;">Hello ${name},</h2>
                        <div style="font-size: 16px; color: #334155; line-height: 1.6;">
                            ${html}
                        </div>
                        <hr style="border:0; border-top:1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                            Sent via UniBolt Admin Console
                        </p>
                    </div>
                </div>
            `
        });

        return res.status(200).json({ success: true, message: `Email sent to ${name}` });

    } catch (error) {
        console.error("Email Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}