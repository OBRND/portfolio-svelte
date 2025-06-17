import { supabaseServer } from "$lib/server/supabase.js";
import { fail } from "@sveltejs/kit";

// This action handles the form submission from the contact page.
export const actions = {
  default: async ({ request }) => {
    console.log("Contact form submission received.");
    try {
      const formData = await request.formData();

      // Extract form data
      const name = formData.get("name")?.toString().trim();
      const email = formData.get("email")?.toString().trim();
      const subject = formData.get("subject")?.toString().trim();
      const messageContent = formData.get("message")?.toString().trim();

      // --- 1. Server-side Validation ---
      if (!name || !email || !subject || !messageContent) {
        console.error("Validation error: All fields are required.");
        return fail(400, {
          error: true,
          message: "All fields (Name, Email, Subject, Message) are required."
        });
      }

      // Basic email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error("Validation error: Invalid email format.");
        return fail(400, {
          error: true,
          message: "Please enter a valid email address."
        });
      }

      // --- 2. Save Message to Supabase ---
      console.log("Attempting to save message to Supabase...");
      const { data, error: insertError } = await supabaseServer
        .from("messages") // Ensure you have a 'messages' table in Supabase
        .insert({
          sender_name: name,
          sender_email: email,
          subject: subject,
          message_content: messageContent,
          // 'created_at' and 'read_status' can be handled by Supabase defaults
        })
        .select(); // Select the inserted data to confirm success

      if (insertError) {
        console.error("Supabase insert error:", insertError.message);
        return fail(500, {
          error: true,
          message: `Failed to save message: ${insertError.message}.`
        });
      }

      console.log("Message saved to Supabase successfully:", data);

      // --- 3. Send Email Notification (Placeholder) ---
      // In a real application, you would integrate with an email service here
      // (e.g., SendGrid, Mailgun, Resend, Nodemailer with a transactional provider).
      // This is a placeholder as direct email sending requires external service configuration.

      console.log("--- SIMULATING EMAIL SENDING ---");
      console.log(`To: your_email@example.com`); // Replace with your actual email
      console.log(`From: ${name} <${email}>`);
      console.log(`Subject: New Contact Form Message: ${subject}`);
      console.log(`Content: ${messageContent}`);
      console.log("---------------------------------");
      console.log("Email sending simulated. Please configure a real email service for production.");

      return { success: true, message: "Your message has been sent successfully!" };

    } catch (err) {
      console.error("Unexpected error during contact form submission:", err);
      return fail(500, {
        error: true,
        message: "An unexpected error occurred. Please try again later."
      });
    }
  }
};

// No PageServerLoad function is needed for this page as it's just a form.
// export async function load() { ... }
