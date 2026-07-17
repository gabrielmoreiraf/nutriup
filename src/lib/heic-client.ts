// Só roda no client — heic2any depende de APIs de browser (Blob, Web Worker).

const HEIC_TYPES = ["image/heic", "image/heif"];

/** iPhone salva fotos em HEIC por padrão; nem todo navegador/servidor aceita esse formato. */
export function looksLikeHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type.toLowerCase())) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

const CONVERT_TIMEOUT_MS = 15_000;

export async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;

  // Arquivo corrompido/incompatível pode deixar o decoder (WASM) pendurado sem nunca
  // rejeitar — sem esse timeout o usuário fica preso em "Convertendo..." pra sempre.
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), CONVERT_TIMEOUT_MS);
  });

  const converted = await Promise.race([heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 }), timeout]);
  const blob = Array.isArray(converted) ? converted[0] : converted;
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
}
