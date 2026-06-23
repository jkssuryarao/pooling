export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function avatarColors(name: string) {
  const bgs = ["#EFF6FC", "#DFF6DD", "#FFF4CE", "#F4EFF9", "#FDE7E9", "#D7F1F1"];
  const fgs = ["#005A9E", "#107C10", "#7A5200", "#5C2D91", "#A4262C", "#006B6B"];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % bgs.length;
  return { bg: bgs[h], fg: fgs[h] };
}

export function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function greeting(name: string) {
  const h = new Date().getHours();
  const first = name.split(" ")[0];
  if (h < 12) return `Good morning, ${first}`;
  if (h < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export function seatColor(available: number) {
  if (available <= 0) return "danger";
  if (available === 1) return "warning";
  return "success";
}
