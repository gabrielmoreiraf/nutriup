"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, users, subscriptions } from "@/db";
import { requireUser } from "@/lib/session";
import { PLAN_PRICE, type PlanType } from "@/lib/pricing";
import {
  createCustomer,
  createSubscription,
  cancelSubscription as asaasCancelSubscription,
  getLatestSubscriptionPayment,
  getPixQrCode,
  type BillingCycle,
} from "@/lib/asaas";

type Result = { ok: boolean; error?: string };
type PixResult =
  | { ok: true; qrCodeImage: string; copyPaste: string }
  | { ok: false; error: string };

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function cycleForPlan(plan: PlanType): BillingCycle {
  return plan === "anual" ? "YEARLY" : "MONTHLY";
}

/** Cria (ou reaproveita) o cliente na Asaas pra esse usuário. */
async function ensureAsaasCustomer(
  userId: string,
  name: string,
  email: string | null,
  cpfCnpj: string,
): Promise<string> {
  const [u] = await db
    .select({ asaasCustomerId: users.asaasCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (u?.asaasCustomerId) return u.asaasCustomerId;

  const customer = await createCustomer({ name, email, cpfCnpj });
  await db.update(users).set({ asaasCustomerId: customer.id, cpfCnpj }).where(eq(users.id, userId));
  return customer.id;
}

/** Assina via Pix: cria a assinatura recorrente e devolve o QR do 1º pagamento. */
export async function subscribeWithPix(plan: PlanType, cpfCnpjRaw: string): Promise<PixResult> {
  const user = await requireUser();
  const cpfCnpj = onlyDigits(cpfCnpjRaw);
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    return { ok: false, error: "CPF ou CNPJ inválido." };
  }

  try {
    const asaasCustomerId = await ensureAsaasCustomer(user.id, user.name ?? "Cliente", user.email ?? null, cpfCnpj);

    const subscription = await createSubscription({
      customerId: asaasCustomerId,
      value: PLAN_PRICE[plan],
      description: `NutriUp Premium — ${plan === "anual" ? "Anual" : "Mensal"}`,
      nextDueDate: tomorrowISODate(),
      cycle: cycleForPlan(plan),
      billingType: "PIX",
    });

    const payment = await getLatestSubscriptionPayment(subscription.id);
    if (!payment) return { ok: false, error: "Não foi possível gerar o Pix. Tente de novo." };

    const qr = await getPixQrCode(payment.id);

    const values = {
      userId: user.id,
      asaasSubscriptionId: subscription.id,
      status: "pending",
      plan,
      paymentMethod: "PIX",
      lastInvoiceUrl: payment.invoiceUrl,
    };
    await db
      .insert(subscriptions)
      .values(values)
      .onConflictDoUpdate({ target: subscriptions.userId, set: values });

    revalidatePath("/assinar");
    return { ok: true, qrCodeImage: qr.encodedImage, copyPaste: qr.payload };
  } catch (err) {
    console.error("[subscribeWithPix] falhou:", err);
    return { ok: false, error: "Não foi possível gerar o Pix agora. Tente de novo." };
  }
}

export interface CardSubscribeInput {
  cpfCnpj: string;
  email: string;
  phone: string;
  postalCode: string;
  addressNumber: string;
  holderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

/** Assina via cartão de crédito recorrente. Dados do cartão só de passagem — nunca gravados. */
export async function subscribeWithCard(plan: PlanType, input: CardSubscribeInput): Promise<Result> {
  const user = await requireUser();

  const cpfCnpj = onlyDigits(input.cpfCnpj);
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    return { ok: false, error: "CPF ou CNPJ inválido." };
  }
  const postalCode = onlyDigits(input.postalCode);
  if (postalCode.length !== 8) return { ok: false, error: "CEP inválido." };
  const phone = onlyDigits(input.phone);
  if (phone.length < 10) return { ok: false, error: "Telefone inválido." };
  const cardNumber = onlyDigits(input.cardNumber);
  if (cardNumber.length < 13) return { ok: false, error: "Número do cartão inválido." };

  try {
    const asaasCustomerId = await ensureAsaasCustomer(user.id, user.name ?? "Cliente", user.email ?? null, cpfCnpj);
    const h = await headers();
    const remoteIp =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";

    const subscription = await createSubscription({
      customerId: asaasCustomerId,
      value: PLAN_PRICE[plan],
      description: `NutriUp Premium — ${plan === "anual" ? "Anual" : "Mensal"}`,
      nextDueDate: tomorrowISODate(),
      cycle: cycleForPlan(plan),
      billingType: "CREDIT_CARD",
      creditCard: {
        holderName: input.holderName,
        number: cardNumber,
        expiryMonth: input.expiryMonth,
        expiryYear: input.expiryYear,
        ccv: input.cvv,
      },
      creditCardHolderInfo: {
        name: input.holderName,
        email: input.email,
        cpfCnpj,
        postalCode,
        addressNumber: input.addressNumber,
        phone,
      },
      remoteIp,
    });

    const values = {
      userId: user.id,
      asaasSubscriptionId: subscription.id,
      status: "pending",
      plan,
      paymentMethod: "CREDIT_CARD",
    };
    await db
      .insert(subscriptions)
      .values(values)
      .onConflictDoUpdate({ target: subscriptions.userId, set: values });

    revalidatePath("/assinar");
    return { ok: true };
  } catch (err) {
    console.error("[subscribeWithCard] falhou:", err);
    return { ok: false, error: "Não foi possível processar o cartão. Verifique os dados e tente de novo." };
  }
}

/** Estado mais recente da assinatura, pra polling depois de gerar o Pix. */
export async function getSubscriptionStatus(): Promise<{ status: string } | null> {
  const user = await requireUser();
  const [row] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);
  return row ? { status: row.status ?? "pending" } : null;
}

export async function cancelUserSubscription(): Promise<Result> {
  const user = await requireUser();
  const [row] = await db
    .select({ asaasSubscriptionId: subscriptions.asaasSubscriptionId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);
  if (!row?.asaasSubscriptionId) return { ok: false, error: "Não há assinatura ativa." };

  try {
    await asaasCancelSubscription(row.asaasSubscriptionId);
    await db
      .update(subscriptions)
      .set({ status: "canceled" })
      .where(eq(subscriptions.userId, user.id));
    await db.update(users).set({ isPremium: false }).where(eq(users.id, user.id));
    revalidatePath("/conta");
    return { ok: true };
  } catch (err) {
    console.error("[cancelUserSubscription] falhou:", err);
    return { ok: false, error: "Não foi possível cancelar agora. Tente de novo." };
  }
}
