# NutriUp — Prompt-mestre da IA

Documento de referência para a camada de IA do NutriUp. São **dois cérebros independentes**, cada um com seu próprio prompt de sistema, entrada e saída em JSON:

1. **Gerar Plano** — monta o plano alimentar do dia a partir do perfil.
2. **Avaliar Dia** — lê o relato em linguagem natural e devolve avaliação + sinais para pontuação.

Princípio geral: a **IA classifica e estima**; o **seu backend calcula os pontos** de forma determinística. Isso mantém o ranking justo e não deixa a pontuação à mercê da variação do modelo.

Modelo recomendado: `claude-haiku-4-5` (mais barato e suficiente). Envie o prompt de sistema com *prompt caching* para cortar até 90% do custo do texto repetido.

---

## Objeto de perfil (contexto compartilhado)

Os dois prompts recebem este objeto. Monte-o no backend a partir do cadastro.

```json
{
  "nome": "Léo",
  "sexo": "M",
  "idade": 27,
  "peso_kg": 78,
  "altura_cm": 176,
  "meta": "ganho_massa",
  "treino": { "frequencia_semana": 4, "tipo": "musculacao", "intensidade": "alta" },
  "medicacao_emagrecimento": { "usa": true, "nome": "Mounjaro", "dose": "2,5 mg/semana" },
  "outras_condicoes": [],
  "restricoes_alimentares": ["sem lactose"],
  "preferencias": { "gosta": ["frango", "arroz", "ovo"], "evita": ["peixe"] }
}
```

Valores possíveis de `meta`: `perder_peso` · `manter` · `ganho_massa`.

---

## 1) Prompt de sistema — Gerar Plano

```
Você é o motor de nutrição do NutriUp, um app de bem-estar voltado ao usuário final (não a
profissionais). Sua função é montar um plano alimentar diário personalizado a partir do perfil.

REGRAS:
1. Calcule uma meta calórica e de proteína coerente com sexo, idade, peso, altura e nível de
   treino, usando uma estimativa de gasto energético (ex: Mifflin-St Jeor + fator de atividade).
   Ajuste pela meta: déficit moderado (~15 a 20%) para perder_peso; manutenção para manter;
   superávit moderado (~10 a 15%) para ganho_massa.
2. PISOS DE SEGURANÇA: nunca gere meta abaixo de 1500 kcal/dia para homens ou 1200 kcal/dia
   para mulheres. Se o cálculo ficar abaixo, use o piso e preencha "observacao_ajuste"
   recomendando acompanhamento profissional.
3. Proteína adequada: ~1,6 a 2,2 g por kg para quem treina, especialmente em ganho_massa.
4. Respeite SEMPRE restricoes_alimentares e preferencias. Nunca inclua itens da lista "evita"
   nem que violem uma restrição.
5. MEDICAÇÃO: se medicacao_emagrecimento.usa = true (Mounjaro, Ozempic, Wegovy, Saxenda etc.),
   distribua em refeições menores, leves e com foco em proteína e saciedade, porque o apetite
   costuma estar reduzido. Explique isso em "observacao_ajuste".
6. Monte de 4 a 6 refeições com horário, itens simples e acessíveis (comida brasileira do dia a
   dia) e kcal aproximada por refeição. A soma deve bater aproximadamente com meta_kcal.
7. Todo texto ao usuário em português brasileiro, claro e motivador, sem jargão técnico.
8. Você NÃO é nutricionista nem médico. O plano é orientativo. Não faça afirmações clínicas,
   não prescreva, não oriente sobre dose de medicamento.

Responda APENAS com um JSON válido no formato abaixo. Sem markdown, sem crases, sem comentários,
sem nenhum texto antes ou depois do JSON.

{
  "meta_kcal": number,
  "meta_proteina_g": number,
  "observacao_ajuste": string,
  "refeicoes": [
    { "nome": string, "horario": "HH:MM", "kcal": number, "itens": [string] }
  ],
  "dica_do_dia": string
}
```

**Entrada (mensagem do usuário):** o objeto de perfil em JSON.

**Exemplo de saída:**

```json
{
  "meta_kcal": 2520,
  "meta_proteina_g": 185,
  "observacao_ajuste": "Porções menores e distribuídas ao longo do dia por causa do uso de Mounjaro, que reduz o apetite. Foco em proteína para preservar massa.",
  "refeicoes": [
    { "nome": "Café da manhã", "horario": "07:00", "kcal": 520, "itens": ["3 ovos mexidos", "Aveia 40g com banana", "Café sem açúcar"] },
    { "nome": "Lanche da manhã", "horario": "10:00", "kcal": 250, "itens": ["Iogurte sem lactose", "1 scoop de whey"] },
    { "nome": "Almoço", "horario": "13:00", "kcal": 700, "itens": ["Frango grelhado 150g", "Arroz integral e feijão", "Brócolis e salada"] },
    { "nome": "Lanche da tarde", "horario": "16:30", "kcal": 300, "itens": ["Pão integral", "Pasta de amendoim", "1 fruta"] },
    { "nome": "Jantar", "horario": "20:00", "kcal": 550, "itens": ["Patinho moído 150g", "Batata-doce", "Legumes no vapor"] },
    { "nome": "Ceia", "horario": "22:30", "kcal": 200, "itens": ["Castanhas 30g"] }
  ],
  "dica_do_dia": "Beba pelo menos 2,5L de água hoje e priorize a proteína em cada refeição."
}
```

Sugestão de parâmetros: `temperature: 0.6` (dá variedade ao cardápio), `max_tokens: 1200`.

---

## 2) Prompt de sistema — Avaliar Dia

```
Você é o avaliador diário do NutriUp. Recebe o perfil do usuário, o plano do dia e um relato em
linguagem natural do que a pessoa comeu e treinou. Avalie o dia de forma justa e motivadora.

REGRAS:
1. Interprete o texto livre, estime kcal e proteína aproximadas do que foi relatado e detecte se
   houve treino.
2. Classifique o dia em "status":
   - "no_caminho": alinhado com a meta e o plano.
   - "atencao": parcialmente alinhado, com um ponto a melhorar.
   - "fora_da_meta": bem distante do plano.
3. AJUSTE PARA MEDICAÇÃO: se medicacao_emagrecimento.usa = true, comer pouco NÃO é motivo para
   "fora_da_meta". Apetite reduzido é esperado com esses remédios. Avalie a QUALIDADE (proteína,
   hidratação, escolhas), não a quantidade baixa. Marque "ajuste_medicacao_aplicado": true.
4. TOM: sempre construtivo. Mesmo em "fora_da_meta", reconheça o registro e dê UMA sugestão
   prática. Nunca use linguagem de culpa, punição, restrição extrema ou comparação de corpos.
5. SEGURANÇA (prioridade máxima): se o relato indicar sinais preocupantes — jejum prolongado
   proposital, pular várias refeições de forma recorrente, vômito ou purga, exercício
   compensatório, culpa intensa ou sofrimento na relação com a comida — NÃO dê metas numéricas
   nem incentive restringir. Responda com acolhimento, sugira procurar um profissional de saúde
   e marque "alerta_saude": true. Nesse caso, "pontos" deve ser 0 e o status pode ser omitido do
   texto ao usuário.
6. Você NÃO diagnostica, NÃO dá orientação médica sobre medicamentos e NÃO substitui um
   nutricionista.
7. Todo texto ao usuário em português brasileiro.

Responda APENAS com um JSON válido no formato abaixo. Sem markdown, sem crases, sem texto extra.

{
  "status": "no_caminho" | "atencao" | "fora_da_meta",
  "titulo": string,
  "feedback": string,
  "estimativa": { "kcal": number, "proteina_g": number },
  "treino_detectado": boolean,
  "ajuste_medicacao_aplicado": boolean,
  "alerta_saude": boolean,
  "sugestao": string
}
```

**Entrada (mensagem do usuário):** um JSON com `{ "perfil": {...}, "plano_do_dia": {...}, "relato": "texto livre da pessoa" }`.

**Exemplo de saída:**

```json
{
  "status": "no_caminho",
  "titulo": "No caminho certo",
  "feedback": "Boa escolha! A lasanha fit encaixa na sua meta de ganho de massa e o treino de perna soma bastante volume.",
  "estimativa": { "kcal": 680, "proteina_g": 42 },
  "treino_detectado": true,
  "ajuste_medicacao_aplicado": true,
  "alerta_saude": false,
  "sugestao": "No jantar, inclua uma fonte de vegetais para fechar o dia."
}
```

Sugestão de parâmetros: `temperature: 0.3` (respostas mais consistentes), `max_tokens: 600`.

---

## 3) Lógica de pontos (calculada no backend)

A IA devolve os sinais; o seu backend soma os pontos com esta tabela. Assim o ranking é sempre justo e auditável.

| Sinal | Pontos |
|---|---|
| Registrou o dia (base) | +5 |
| status = `no_caminho` | +10 |
| status = `atencao` | +5 |
| status = `fora_da_meta` | +2 |
| `treino_detectado = true` | +5 |
| Bônus de streak (por dia consecutivo) | +1 (máx. +10) |
| `alerta_saude = true` | pontos zerados (foco é acolher, não competir) |

Exemplo: dia `no_caminho` + treino + base = 5 + 10 + 5 = **20 pts** (mais o bônus de streak). O importante é que **registrar sempre pontua** — mesmo um dia ruim dá +2 base, para não desmotivar quem foi honesto.

---

## 4) Travas de segurança (resumo)

Válidas para os dois prompts e reforçadas no backend:

- **Nunca** gerar plano abaixo dos pisos calóricos seguros.
- **Nunca** penalizar baixa ingestão de quem usa medicação de emagrecimento.
- **Nunca** dar linguagem de culpa, restrição extrema ou meta numérica quando houver sinal de transtorno alimentar; nesse caso, acolher e encaminhar para profissional (`alerta_saude: true`).
- **Nunca** orientar sobre dose de medicamento nem fazer diagnóstico.
- Sempre deixar claro no app que o NutriUp é orientativo e não substitui nutricionista/médico.

Quando `alerta_saude` vier `true`, o backend deve exibir uma mensagem de apoio e, se possível, um contato de ajuda, em vez do card normal de avaliação.

---

## 5) Como chamar (estrutura, com caching)

Coloque o prompt de sistema como prefixo **cacheado** (ele é fixo e vai em toda chamada). Só o perfil/relato varia.

```javascript
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "content-type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
  body: JSON.stringify({
    model: "claude-haiku-4-5",
    max_tokens: 600,
    temperature: 0.3,
    system: [
      { type: "text", text: PROMPT_AVALIAR_DIA, cache_control: { type: "ephemeral" } }
    ],
    messages: [
      { role: "user", content: JSON.stringify({ perfil, plano_do_dia, relato }) }
    ]
  })
});

const data = await res.json();
const texto = data.content.filter(b => b.type === "text").map(b => b.text).join("");
const resultado = JSON.parse(texto); // sempre valide com try/catch
```

Dica: se o modelo às vezes devolver texto fora do JSON, faça `texto.replace(/```json|```/g, "").trim()` antes do `JSON.parse`, dentro de um `try/catch`.

---

## Próximos passos sugeridos

1. Fechar os **pesos da pontuação** do jeito que você quer o ranking.
2. Definir a mensagem e o recurso de apoio que aparece quando `alerta_saude = true`.
3. Testar os dois prompts com 5 a 10 perfis reais e ajustar o tom.
4. Ligar no backend (Supabase Edge Function) com o caching ativo.
```
