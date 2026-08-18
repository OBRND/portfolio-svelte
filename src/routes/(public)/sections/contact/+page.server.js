import { supabaseServer } from "$lib/server/supabase.js";
import { sendContactNotification } from "$lib/server/email.js";
import { checkRateLimit } from "$lib/server/rate-limit.js";
import { fail } from "@sveltejs/kit";

const CONTACT_FALLBACK = "obsannew@gmail.com";

// One shared string: the honeypot and too-fast paths return the same success
// text as a real send, so a bot cannot tell the difference between them.
const SENT_MESSAGE = "It's in my inbox, I read every message that comes through here and will get back to you shortly.";

// Bots tend to submit the instant the DOM is parsed. Real people need at least
// a few seconds to type four fields.
const MIN_FILL_MS = 3000;

// This handles the form submission from the contact page: it stores the message
// in Supabase and emails it to me. The two are deliberately independent, so one
// failing does not lose the message.
export const actions = {
  default: async ({ request, getClientAddress }) => {
    try {
      const formData = await request.formData();

      // --- 1. Spam heuristics ---------------------------------------------
      // Both of these return a fake success: a bot that gets a real error just
      // learns what to change.

      // Honeypot: hidden from users, irresistible to form-filling bots.
      if (formData.get("company")?.toString().trim()) {
        return { success: true, message: SENT_MESSAGE };
      }

      const startedAt = Number(formData.get("started_at"));
      if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
        return { success: true, message: SENT_MESSAGE };
      }

      // --- 2. Validation ---------------------------------------------------
      const name = formData.get("name")?.toString().trim();
      const email = formData.get("email")?.toString().trim();
      const subject = formData.get("subject")?.toString().trim();
      const messageContent = formData.get("message")?.toString().trim();

      if (!name || !email || !subject || !messageContent) {
        return fail(400, {
          error: true,
          message: "All fields (Name, Email, Subject, Message) are required."
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return fail(400, {
          error: true,
          message: "Please enter a valid email address."
        });
      }

      // --- 3. Throttle ------------------------------------------------------
      // Deliberately after validation: a typo'd email should not eat someone's
      // quota, and rejected input costs nothing to process. What we are
      // protecting here is the send quota and my inbox.
      const { allowed } = checkRateLimit(getClientAddress());
      if (!allowed) {
        return fail(429, {
          error: true,
          message: `Too many messages sent recently. Please try again in a few minutes, or email me directly at ${CONTACT_FALLBACK}.`
        });
      }

      // --- 4. Store and notify, independently ------------------------------
      const { error: insertError, status } = await supabaseServer.from("messages").insert({
        sender_name: name,
        sender_email: email,
        subject: subject,
        message_content: messageContent
        // 'created_at' and 'read_status' come from Supabase defaults.
      });

      if (insertError) {
        // PostgREST answers a missing table with a 404 and an empty body, so
        // every field on the error object is undefined and it logs as `{}`.
        // The HTTP status is the part that actually identifies the problem:
        // 404 = table missing, 401/403 = RLS policy rejected the insert.
        console.error(
          `[contact] Supabase insert failed (HTTP ${status}):`,
          insertError.message || insertError.code || "no error detail returned"
        );
      }

      const notification = await sendContactNotification({
        name,
        email,
        subject,
        message: messageContent
      });

      // The message is only lost if neither path worked.
      if (insertError && !notification.sent) {
        return fail(500, {
          error: true,
          message: `Something went wrong sending that. Please email me directly at ${CONTACT_FALLBACK}.`
        });
      }

      return { success: true, message: SENT_MESSAGE };
    } catch (err) {
      console.error("[contact] Unexpected error during submission:", err);
      return fail(500, {
        error: true,
        message: "An unexpected error occurred. Please try again later."
      });
    }
  }
};
