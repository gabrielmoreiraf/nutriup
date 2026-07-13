import { eq } from "drizzle-orm";
import { db, users, subscriptions } from "@/db";

export const runtime = "nodejs";

interface AsaasWebhookBody {
  event: string;
  payment?: {
    id: string;
    customer?: string;
    subscription?: string;
    status: string;
    value?: number;
    dueDate: string;
    billingType: string;
    invoiceUrl: string;
  };
}

const CONFIRMED = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const OVERDUE = new Set(["PAYMENT_OVERDUE"]);
const CANCELED = new Set([
  "PAYMENT_DELETED",
  "SUBSCRIPTION_DELETED",
  "SUBSCRIPTION_INACTIVATED",
]);

/**
 * POST — eventos de cobrança da Asaas. Autenticado pelo token estático
 * configurado na Asaas ao cadastrar o webhook (header `asaas-access-token`,
 * não é HMAC). Sempre responde 200 rápido pra Asaas não reentregar em loop;
 * idempotente porque só fazemos "set" de status.
 */
export async function POST(req: Request) {
  const token = req.headers.get("asaas-access-token");
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: AsaasWebhookBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const subscriptionId = body.payment?.subscription;
  const customerId = body.payment?.customer;
  if (!subscriptionId && !customerId) {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  try {
    const [row] = subscriptionId
      ? await db
          .select({ userId: subscriptions.userId })
          .from(subscriptions)
          .where(eq(subscriptions.asaasSubscriptionId, subscriptionId))
          .limit(1)
      : await db
          .select({ userId: users.id })
          .from(users)
          .where(eq(users.asaasCustomerId, customerId!))
          .limit(1);

    if (!row) return new Response("EVENT_RECEIVED", { status: 200 });
    const userId = row.userId;

    if (CONFIRMED.has(body.event)) {
      await db.update(users).set({ isPremium: true }).where(eq(users.id, userId));
      await db
        .update(subscriptions)
        .set({
          status: "active",
          lastPaymentAt: new Date(),
          lastInvoiceUrl: body.payment?.invoiceUrl ?? null,
        })
        .where(eq(subscriptions.userId, userId));
    } else if (OVERDUE.has(body.event)) {
      // Fica em carência: continua atendendo, só sinaliza pro usuário no painel.
      await db
        .update(subscriptions)
        .set({ status: "overdue", lastInvoiceUrl: body.payment?.invoiceUrl ?? null })
        .where(eq(subscriptions.userId, userId));
    } else if (CANCELED.has(body.event)) {
      await db.update(users).set({ isPremium: false }).where(eq(users.id, userId));
      await db
        .update(subscriptions)
        .set({ status: "canceled" })
        .where(eq(subscriptions.userId, userId));
    }
  } catch (err) {
    console.error("[webhook/asaas] falhou:", err);
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
