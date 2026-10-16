import nodemailer from 'nodemailer'

// Source - https://stackoverflow.com/a/79412835
// Posted by Ssekabira Robert Sims, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-16, License - CC BY-SA 4.0

const transporter = nodemailer.createTransport({
   port: 465,
   host: "smtp.gmail.com",
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
   },
   secure: true,
   tls: {
      rejectUnauthorized: false
   }
});


export const sendVerificationEmail = async (email, token) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.FRONTEND_URL) {
        throw new Error("Email verification is not configured");
    }

    const verificationUrl = new URL("/verify-email", process.env.FRONTEND_URL);
    verificationUrl.searchParams.set("token", token);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your stream account",
        html:
        `
            <h2>Welcome to Stream!</h2>
            <p>Click the button below to verify your email.</p>
            <a href="${verificationUrl.toString()}">
                Verify Email
            </a>
            <p>This link expires in 15 minutes.</p>
        `,
    })

}