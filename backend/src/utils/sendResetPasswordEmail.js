import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (email, token) => {
  const resetPasswordUrl = new URL("/reset-password", process.env.FRONTEND_URL);
  resetPasswordUrl.searchParams.set("token", token);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password - Stream</title>
</head>

<body style="margin:0; padding:32px 20px; background-color:#ffffff; font-family:Arial,Helvetica,sans-serif; color:#222222;">

  <div style="max-width:560px; margin:0 auto;">

    <h1 style="margin:0 0 36px; font-size:28px; font-weight:800; letter-spacing:-1px; color:#111111;">
      STREAM<span style="color:#8b5cf6;">.</span>
    </h1>

    <h2 style="margin:0 0 20px; font-size:24px; font-weight:700; color:#111111;">
      Reset your password
    </h2>

    <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#444444;">
      Hello!
    </p>

    <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#444444;">
      We received a request to reset the password associated with your Stream account.
      Click the button below to create a new password.
    </p>

    <a
      href="${resetPasswordUrl.toString()}"
      target="_blank"
      style="display:inline-block; padding:14px 24px; background-color:#7c3aed; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:0;"
    >
      Reset Password
    </a>

    <p style="margin:28px 0 12px; font-size:14px; line-height:1.7; color:#555555;">
      This password reset link expires in 5 minutes. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>

    <p style="margin:24px 0 8px; font-size:13px; color:#666666;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>

    <p style="margin:0; font-size:13px; line-height:1.7; word-break:break-all;">
      <a href="${resetPasswordUrl.toString()}" style="color:#7c3aed;">
        ${resetPasswordUrl.toString()}
      </a>
    </p>

    <p style="margin:36px 0 0; padding-top:18px; border-top:1px solid #eeeeee; font-size:12px; line-height:1.6; color:#888888;">
      Made for what you love to watch.<br />
      © ${new Date().getFullYear()} Stream. All rights reserved.
    </p>

  </div>

</body>
</html>
    `;

  const { data, error } = await resend.emails.send({
    from: "Stream <onboarding@resend.dev>",
    to: [email],
    subject: "Reset your password | Stream",
    html,
  });

  if (error) {
    console.error("Reset Password failed:", error);
    throw new Error("Unable to send reset password email");
  }

  return data;
};
