/**
 * Cliente Asaas (gateway de pagamento brasileiro — Pix, cartão, boleto).
 * Checkout 100% nosso: nunca redireciona pro Asaas. Pix devolve o pagamento
 * pra buscarmos o QR Code; cartão processa direto e o resultado chega pelo webhook.
 */
function baseUrl(): string {
  return process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";
}

export function asaasEnabled(): boolean {
  return !!process.env.ASAAS_API_KEY;
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: process.env.ASAAS_API_KEY!,
      ...init?.headers,
    },
  });
  if (!r.ok) throw new Error(`asaas ${path} ${r.status}: ${await r.text()}`);
  return (await r.json()) as T;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string | null;
  cpfCnpj: string;
}

/** Cria um cliente na Asaas (a Asaas não deduplica sozinha — guardamos o id). */
export async function createCustomer(data: {
  name: string;
  email?: string | null;
  cpfCnpj: string;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email || undefined,
      cpfCnpj: data.cpfCnpj.replace(/\D/g, ""),
    }),
  });
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  status: string;
  nextDueDate: string;
  value: number;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string; // "MM"
  expiryYear: string; // "YYYY"
  ccv: string;
}

export type BillingCycle = "MONTHLY" | "YEARLY";

/** Cria a assinatura recorrente (mensal ou anual), via Pix ou cartão. */
export async function createSubscription(
  data:
    | {
        customerId: string;
        value: number;
        description: string;
        nextDueDate: string; // YYYY-MM-DD
        cycle: BillingCycle;
        billingType: "PIX";
      }
    | {
        customerId: string;
        value: number;
        description: string;
        nextDueDate: string;
        cycle: BillingCycle;
        billingType: "CREDIT_CARD";
        creditCard: CreditCardData;
        creditCardHolderInfo: CreditCardHolderInfo;
        remoteIp: string;
      },
): Promise<AsaasSubscription> {
  const body: Record<string, unknown> = {
    customer: data.customerId,
    billingType: data.billingType,
    cycle: data.cycle,
    value: data.value,
    nextDueDate: data.nextDueDate,
    description: data.description,
  };
  if (data.billingType === "CREDIT_CARD") {
    body.creditCard = data.creditCard;
    body.creditCardHolderInfo = data.creditCardHolderInfo;
    body.remoteIp = data.remoteIp;
  }
  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface AsaasPayment {
  id: string;
  status: string;
  invoiceUrl: string;
  dueDate: string;
  billingType: string;
}

/** Pega o pagamento mais recente da assinatura (usado logo após criar, pra achar o 1º Pix). */
export async function getLatestSubscriptionPayment(
  subscriptionId: string,
): Promise<AsaasPayment | null> {
  const res = await asaasFetch<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscriptionId}/payments?limit=1&order=desc`,
  );
  return res.data[0] ?? null;
}

export interface PixQrCode {
  encodedImage: string; // base64 PNG, sem o prefixo data:
  payload: string; // "copia e cola"
  expirationDate: string;
}

/** QR Code + copia-e-cola do pagamento Pix, pra renderizar no nosso modal. */
export async function getPixQrCode(paymentId: string): Promise<PixQrCode> {
  return asaasFetch<PixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await asaasFetch(`/subscriptions/${subscriptionId}`, { method: "DELETE" });
}
