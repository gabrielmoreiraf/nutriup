const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

/** Tira @ inicial, espaços e deixa minúsculo — pronto pra validar/gravar. */
export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@+/, "");
}

export function isValidHandle(handle: string): boolean {
  return HANDLE_RE.test(handle);
}
