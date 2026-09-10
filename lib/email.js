import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = "notifications@nsywnails.com";

export async function notifyOwnerEmail(subject, message) {
    if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) {
        console.warn("Resend not configured — skipping owner email.");
        return;
    }
    await resend.emails.send({
        from: FROM_ADDRESS,
        to: process.env.NOTIFY_EMAIL,
        subject,
        text: message,
    });
}

export async function sendClientEmail(toEmail, subject, text, html) {
    if (!process.env.RESEND_API_KEY || !toEmail) {
        console.warn("Resend not configured or missing client email — skipping client email.");
        return;
    }
    await resend.emails.send({
        from: FROM_ADDRESS,
        to: toEmail,
        subject,
        text,
        html,
    });
}