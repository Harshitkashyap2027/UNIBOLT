import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { fromEmail, toEmail, name, subject, html } = req.body;
    const ZOHO_PASS = process.env.ZOHO_PASSWORD; 

    if (!ZOHO_PASS) return res.status(500).json({ success: false, message: 'Password missing' });

    // --- NEW: Determine the Sender Name automatically ---
    let senderName = "UniBolt Team";
    if (fromEmail.includes("support")) senderName = "UniBolt Support";
    if (fromEmail.includes("info"))    senderName = "UniBolt Info";
    if (fromEmail.includes("careers")) senderName = "UniBolt Careers";
    if (fromEmail.includes("admin"))   senderName = "Harshit (UniBolt Admin)";
    // ----------------------------------------------------

    // Configure Transporter (Authenticate as Admin)
    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        secure: true,
        auth: {
            user: "admin@unibolt.in", // Always login with the main account
            pass: ZOHO_PASS
        }
    });

    try {
        // Send Mail
        await transporter.sendMail({
            from: `"${senderName}" <${fromEmail}>`, // Now it uses the correct name + email
            to: toEmail,
            replyTo: fromEmail, // Replies go to the alias inbox (which is your main inbox)
            subject: subject,
            html: html
        });

        return res.status(200).json({ success: true, message: `Sent to ${name}` });

    } catch (error) {
        console.error("Email Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}