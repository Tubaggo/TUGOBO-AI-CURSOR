import { Inngest } from "inngest";
import { Resend } from "resend";

export const inngest = new Inngest({ id: "tugobo-ai" });

/**
 * Inngest workflow: process an inbound WhatsApp message through the agent pipeline.
 * Day 4: wire intake agent
 * Day 5: wire pricing agent
 */
export const processInboundMessage = inngest.createFunction(
  { id: "process-inbound-message", name: "Process Inbound WhatsApp Message" },
  { event: "whatsapp/message.received" },
  async ({ event, step }) => {
    const { conversationId, messageId, hotelId } = event.data as {
      conversationId: string;
      messageId: string;
      hotelId: string;
    };

    // Step 1: echo reply (Day 1 MVP - replaced with agents from Day 4)
    const reply = await step.run("generate-reply", async () => {
      return {
        conversationId,
        messageId,
        hotelId,
        status: "reply_queued",
      };
    });

    return reply;
  }
);

/**
 * Inngest workflow: send internal notification email when a demo lead is captured.
 * Triggered by the /api/demo route after a successful DB insert.
 * Phone / PII are never included in the email — only the lead ID and hotel metadata.
 */
export const notifyNewLead = inngest.createFunction(
  { id: "notify-new-lead", name: "Notify Team: New Demo Lead" },
  { event: "demo/lead.created" },
  async ({ event, step }) => {
    const { leadId, hotelName, rooms, timestamp } = event.data as {
      leadId: string | null;
      hotelName: string;
      rooms: string | null;
      timestamp: string;
    };

    await step.run("send-notification-email", async () => {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        // Not configured yet — skip silently in dev
        console.warn("[notifyNewLead] RESEND_API_KEY not set, skipping email");
        return { skipped: true };
      }

      const resend = new Resend(apiKey);
      const to = process.env.NOTIFICATION_EMAIL ?? "team@tugobo.ai";

      await resend.emails.send({
        from: "Tugobo AI <noreply@tugobo.ai>",
        to,
        subject: `Yeni Demo Talebi: ${hotelName}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#111;margin-bottom:4px;">Yeni Demo Talebi 🎯</h2>
            <p style="color:#555;margin-top:0;">Landing page üzerinden gelen yeni demo isteği.</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <tr>
                <td style="padding:8px 0;color:#777;width:140px;">Tesis / İşletme</td>
                <td style="padding:8px 0;font-weight:600;color:#111;">${hotelName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#777;">Oda Sayısı</td>
                <td style="padding:8px 0;color:#111;">${rooms ?? "Belirtilmedi"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#777;">DB Lead ID</td>
                <td style="padding:8px 0;font-family:monospace;font-size:12px;color:#555;">${leadId ?? "DB not configured"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#777;">Zaman</td>
                <td style="padding:8px 0;color:#111;">${new Date(timestamp).toLocaleString("tr-TR")}</td>
              </tr>
            </table>
            <p style="margin-top:24px;font-size:13px;color:#888;">
              İletişim bilgileri (telefon) yalnızca veritabanında saklanmaktadır.
            </p>
          </div>
        `,
      });

      return { sent: true, to };
    });

    return { leadId, hotelName };
  }
);
