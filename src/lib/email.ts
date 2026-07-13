import { Resend } from "resend";

/** Sem RESEND_API_KEY (dev local), o código só vai pro console — nada quebra. */
export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

const FROM = process.env.RESEND_FROM ?? "NutriUp <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, name: string, code: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY ausente — código de verificação para ${to}: ${code}`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Seu código NutriUp: ${code}`,
    html: verificationEmailHtml(name, code),
  });
}

function verificationEmailHtml(name: string, code: string): string {
  return `
  <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color:#07312A;">Olá, ${escapeHtml(name)}!</h2>
    <p style="color:#5E7A73; font-size:15px; line-height:1.5;">
      Use o código abaixo para confirmar seu e-mail no NutriUp. Ele expira em 10 minutos.
    </p>
    <div style="background:#ECFAF2; border-radius:16px; padding:20px; text-align:center; margin:20px 0;">
      <span style="font-size:32px; font-weight:800; letter-spacing:6px; color:#0E9F5B;">${code}</span>
    </div>
    <p style="color:#5E7A73; font-size:13px;">Se você não pediu isso, pode ignorar este e-mail.</p>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
