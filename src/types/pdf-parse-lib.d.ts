// Importamos o worker interno do pdf-parse direto (ver assessment.ts) porque o
// index.js do pacote quebra sob bundler. Esse caminho não tem tipos publicados.
declare module "pdf-parse/lib/pdf-parse.js" {
  function PdfParse(dataBuffer: Buffer, options?: unknown): Promise<{ text: string }>;
  export default PdfParse;
}
