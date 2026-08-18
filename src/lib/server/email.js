import { Resend } from "resend";
import { env } from "$env/dynamic/private";

// Dynamic (not static) private env: the build must not fail on a machine or a
// preview deploy that has no RESEND_API_KEY set. A missing key degrades to a
// logged warning at send time instead.

/** @type {Resend | null} */
let client = null;
let warned = false;

function getClient() {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    if (!warned) {
      console.warn(
        "[email] RESEND_API_KEY / CONTACT_TO_EMAIL not set, contact notifications are disabled."
      );
      warned = true;
    }
    return null;
  }
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

/** @param {string} value */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails a contact-form submission to the site owner.
 * Never throws: the caller decides whether a failed send is fatal.
 *
 * @param {{ name: string, email: string, subject: string, message: string }} submission
 * @returns {Promise<{ sent: boolean, id?: string, reason?: string, error?: unknown }>}
 */
export async function sendContactNotification({ name, email, subject, message }) {
  const resend = getClient();
  if (!resend) return { sent: false, reason: "not-configured" };

  const text = [
    `New message from your portfolio contact form.`,
    ``,
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subject}`,
    ``,
    `---`,
    ``,
    message
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 560px;">
      <p style="margin: 0 0 20px; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280;">
        New portfolio message
      </p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="padding: 4px 12px 4px 0; color: #6b7280; vertical-align: top;">Name</td>
          <td style="padding: 4px 0;"><strong>${escapeHtml(name)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 12px 4px 0; color: #6b7280; vertical-align: top;">Email</td>
          <td style="padding: 4px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 4px 12px 4px 0; color: #6b7280; vertical-align: top;">Subject</td>
          <td style="padding: 4px 0;">${escapeHtml(subject)}</td>
        </tr>
      </table>
      <div style="padding: 16px; border-left: 3px solid #d1d5db; background: #f9fafb; white-space: pre-wrap;">${escapeHtml(message)}</div>
      <p style="margin: 20px 0 0; font-size: 12px; color: #9ca3af;">
        Reply to this email to answer ${escapeHtml(name)} directly.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Portfolio contact — ${subject}`,
      text,
      html
    });

    if (error) {
      console.error("[email] Resend rejected the message:", error);
      return { sent: false, error };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    console.error("[email] Failed to reach Resend:", err);
    return { sent: false, error: err };
  }
}
