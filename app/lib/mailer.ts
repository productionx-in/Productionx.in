import nodemailer from "nodemailer";

/**
 * Sends through the studio's existing Hostinger mailbox (info@productionx.in)
 * over SMTP — no third-party email API needed. Requires SMTP_HOST, SMTP_PORT,
 * SMTP_USER and SMTP_PASS in the environment (Hostinger's SMTP is
 * smtp.hostinger.com:465 with SSL, but any SMTP host works). Never throws for
 * a missing config — callers check `ok` and log the reason to email_log
 * instead of crashing the request that triggered the send.
 */
export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return { ok: false as const, error: "SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing)." };
  }

  const port = Number(SMTP_PORT) || 465;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transport.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Unknown SMTP error" };
  }
}
