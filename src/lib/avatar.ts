/** Cor de avatar determinística a partir do nome (portado do protótipo). */
export function avatarColor(s: string): string {
  const g = [
    ["#1570EF", "#16B26B"],
    ["#F79009", "#EF6820"],
    ["#7A5AF8", "#2E90FA"],
    ["#EC4A82", "#F79009"],
    ["#12B76A", "#0BA5A5"],
    ["#6172F3", "#7A5AF8"],
  ];
  let h = 0;
  for (const c of s) h += c.charCodeAt(0);
  const [a, b] = g[h % g.length];
  return `linear-gradient(135deg,${a},${b})`;
}
