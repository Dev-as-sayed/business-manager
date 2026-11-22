import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const pages = [
  {
    file: "og-home.png",
    title: ["From product idea", "to profitable brand."],
    subtitle: "Sourcing · Development · Website · Content · Marketing",
    chips: ["Sourcing", "Development", "Software", "Content", "Marketing"],
  },
  {
    file: "og-about.png",
    title: ["We built the bridge", "between idea and factory."],
    subtitle: "One team in China. One platform for your launch.",
    chips: ["China team", "Factory vetting", "Quality checks", "Door-to-door"],
  },
  {
    file: "og-services.png",
    title: ["Everything your brand", "needs. One team."],
    subtitle: "Five connected services. One timeline.",
    chips: ["Sourcing", "Development", "Software", "Content", "Marketing"],
  },
  {
    file: "og-contact.png",
    title: ["Let's talk about", "your brand."],
    subtitle: "Get a free product quote or book a consultation.",
    chips: ["Free quote", "24-hour reply", "No obligation"],
  },
];

function escapeXml(value) {
  return value.replace(
    /[<>&'"]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char],
  );
}

function buildSvg(page) {
  const chips = [];
  let x = 80;
  for (const label of page.chips) {
    const width = label.length * 11 + 30;
    if (x + width > 800) break;
    chips.push(
      `<g transform="translate(${x}, 480)">
        <rect width="${width}" height="40" rx="20" fill="#FFFFFF" fill-opacity="0.06" stroke="#3A2424"/>
        <text x="${width / 2}" y="26" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#F0C24B">${escapeXml(label)}</text>
      </g>`,
    );
    x += width + 10;
  }

  const pipeline = ["Idea", "Factory", "Product", "Store", "Content", "Customer"];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#C8102E"/>
        <stop offset="1" stop-color="#D4A017"/>
      </linearGradient>
      <radialGradient id="redGlow">
        <stop offset="0" stop-color="#C8102E" stop-opacity="0.45"/>
        <stop offset="1" stop-color="#C8102E" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="goldGlow">
        <stop offset="0" stop-color="#D4A017" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#D4A017" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="#140A0A"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <circle cx="1100" cy="80" r="320" fill="url(#goldGlow)"/>
    <circle cx="60" cy="600" r="360" fill="url(#redGlow)"/>

    <g transform="translate(80,64)">
      <rect width="64" height="64" rx="16" fill="url(#logo)"/>
      <g transform="translate(16,14) scale(0.8)">
        <path d="M20 0C31 8 36 20 36 32c0 10-4 20-10 28l-6-10-6 10c-6-8-10-18-10-28C4 20 9 8 20 0Z" fill="#FFFFFF"/>
        <circle cx="20" cy="24" r="5" fill="#C8102E"/>
        <path d="M10 40l-8 12 12-4M30 40l8 12-12-4" fill="#FFFFFF"/>
      </g>
    </g>
    <text x="164" y="88" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="5" fill="#D4A017">THE BRAND</text>
    <text x="164" y="118" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#FDF6EC">LAUNCHER</text>

    <rect x="820" y="150" width="300" height="390" rx="28" fill="#FFFFFF" fill-opacity="0.04" stroke="#3A2424"/>
    <text x="852" y="196" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#D4A017">THE LAUNCH PIPELINE</text>
    ${pipeline
      .map((item, index) => {
        const y = 236 + index * 46;
        const isLast = index === pipeline.length - 1;
        return `<g>
          ${
            index < pipeline.length - 1
              ? `<line x1="866" y1="${y + 10}" x2="866" y2="${y + 46}" stroke="#3A2424" stroke-width="2" stroke-dasharray="4 6"/>`
              : ""
          }
          <circle cx="866" cy="${y + 10}" r="9" fill="${isLast ? "#D4A017" : "#C8102E"}"/>
          <text x="890" y="${y + 16}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="600" fill="${isLast ? "#F0C24B" : "#FDF6EC"}">${escapeXml(item)}</text>
        </g>`;
      })
      .join("")}

    ${page.title
      .map(
        (line, index) =>
          `<text x="80" y="${280 + index * 66}" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="800" fill="#FDF6EC">${escapeXml(line)}</text>`,
      )
      .join("")}
    <text x="80" y="420" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#D8C6B8">${escapeXml(page.subtitle)}</text>
    ${chips.join("")}
    <text x="80" y="585" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" letter-spacing="1" fill="#9A8878">omnia.amsayed.store</text>
    <rect x="0" y="620" width="1200" height="10" fill="url(#logo)"/>
  </svg>`;
}

await mkdir("public", { recursive: true });

for (const page of pages) {
  const svg = buildSvg(page);
  const output = path.join("public", page.file);
  await sharp(Buffer.from(svg)).png().toFile(output);
  console.log(`wrote ${output}`);
}
