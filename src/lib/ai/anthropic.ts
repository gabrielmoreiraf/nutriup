/**
 * Camada de acesso à Anthropic API — SERVIDOR APENAS.
 * A chave nunca vai pro cliente. Envia o prompt de sistema com prompt caching
 * (cache_control: ephemeral) para reduzir custo, como no prompt-mestre.
 */
const MODEL = "claude-haiku-4-5";
const ENDPOINT = "https://api.anthropic.com/v1/messages";

export function anthropicEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

type CallArgs = {
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
};

export async function callAnthropicText({
  system,
  user,
  maxTokens,
  temperature,
}: CallArgs): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text?: string }[];
  };
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

/** Limpa crases eventuais e faz JSON.parse. Lança se inválido (chame em try/catch). */
export function parseJsonLoose<T>(text: string): T {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}
