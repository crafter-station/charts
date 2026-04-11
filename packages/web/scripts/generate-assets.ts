import sharp from "sharp";
import { writeFileSync } from "node:fs";

const BG = "#1a2328";
const BG_CARD = "#1e2a2f";
const ACCENT = "#d4943a";
const TEXT = "#e8e0d4";
const MUTED = "#6b7c72";
const CYAN = "#06b6d4";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const BORDER = "#2e3e44";

function ogSvg(width: number, height: number): string {
	const chartY = height * 0.35;
	const chartH = height * 0.35;
	const chartX = width * 0.08;
	const chartW = width * 0.84;

	const points = Array.from({ length: 40 }, (_, i) => {
		const x = chartX + (i / 39) * chartW;
		const y = chartY + chartH - Math.sin(i / 5) * chartH * 0.4 - chartH * 0.3;
		return `${x},${y}`;
	}).join(" ");

	const points2 = Array.from({ length: 40 }, (_, i) => {
		const x = chartX + (i / 39) * chartW;
		const y = chartY + chartH - Math.cos(i / 3) * chartH * 0.25 - chartH * 0.15;
		return `${x},${y}`;
	}).join(" ");

	const sparkChars = "▁▂▃▅▇█▇▅▃▁▂▄▆█▆▄▂▁▃▅▇█▇▅▃▁▂▄▆";

	return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
	<rect width="${width}" height="${height}" fill="${BG}"/>

	<!-- Subtle grid -->
	${Array.from({ length: 5 }, (_, i) => {
		const y = chartY + (i / 4) * chartH;
		return `<line x1="${chartX}" y1="${y}" x2="${chartX + chartW}" y2="${y}" stroke="${BORDER}" stroke-width="0.5"/>`;
	}).join("\n\t")}

	<!-- Line charts -->
	<polyline points="${points}" fill="none" stroke="${GREEN}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
	<polyline points="${points2}" fill="none" stroke="${CYAN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>

	<!-- Y-axis -->
	<line x1="${chartX}" y1="${chartY}" x2="${chartX}" y2="${chartY + chartH}" stroke="${MUTED}" stroke-width="1"/>

	<!-- Sparkline row -->
	<text x="${chartX}" y="${chartY + chartH + 55}" font-family="monospace" font-size="22" fill="${ACCENT}" letter-spacing="1">${sparkChars}</text>

	<!-- Title -->
	<text x="${width * 0.08}" y="${height * 0.88}" font-family="monospace" font-size="18" fill="${MUTED}">@crafter/</text>
	<text x="${width * 0.08 + 145}" y="${height * 0.88}" font-family="Georgia, serif" font-size="28" fill="${TEXT}">charts</text>

	<!-- Tagline -->
	<text x="${width * 0.08}" y="${height * 0.94}" font-family="monospace" font-size="14" fill="${MUTED}">Recharts for your terminal</text>

	<!-- Bar chart mini -->
	${Array.from({ length: 6 }, (_, i) => {
		const bx = width * 0.7 + i * 22;
		const bh = [30, 55, 40, 70, 50, 65][i]! * 0.8;
		const by = height * 0.82 - bh;
		return `<rect x="${bx}" y="${by}" width="16" height="${bh}" fill="${BLUE}" opacity="0.7" rx="2"/>`;
	}).join("\n\t")}

	<!-- Candlestick mini -->
	${Array.from({ length: 4 }, (_, i) => {
		const cx = width * 0.7 + i * 30 + 160;
		const isUp = i % 2 === 0;
		const bodyH = 20 + Math.random() * 15;
		const bodyY = height * 0.78 - bodyH - i * 8;
		const wickY = bodyY - 8;
		const wickH = bodyH + 16;
		const color = isUp ? GREEN : RED;
		return `<line x1="${cx + 6}" y1="${wickY}" x2="${cx + 6}" y2="${wickY + wickH}" stroke="${color}" stroke-width="1.5"/>
		<rect x="${cx}" y="${bodyY}" width="12" height="${bodyH}" fill="${color}" rx="1"/>`;
	}).join("\n\t")}
</svg>`;
}

function faviconSvg(): string {
	return `<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
	<rect width="48" height="48" rx="10" fill="${BG}"/>
	<text x="6" y="22" font-family="monospace" font-size="14" fill="${ACCENT}">▅▇█</text>
	<polyline points="8,38 16,28 24,32 32,24 40,30" fill="none" stroke="${CYAN}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

async function main() {
	const outDir = new URL("../public/", import.meta.url).pathname;

	const og = Buffer.from(ogSvg(1200, 630));
	await sharp(og).png({ quality: 90 }).toFile(`${outDir}og.png`);
	console.log("og.png (1200x630)");

	const ogTwitter = Buffer.from(ogSvg(1200, 600));
	await sharp(ogTwitter).png({ quality: 90 }).toFile(`${outDir}og-twitter.png`);
	console.log("og-twitter.png (1200x600)");

	const fav = Buffer.from(faviconSvg());
	writeFileSync(`${outDir}favicon.svg`, faviconSvg());

	const fav16 = await sharp(fav).resize(16, 16).png().toBuffer();
	const fav32 = await sharp(fav).resize(32, 32).png().toBuffer();
	const fav48 = await sharp(fav).resize(48, 48).png().toBuffer();

	await sharp(fav32).toFile(`${outDir}favicon.ico`);
	console.log("favicon.ico + favicon.svg");

	await sharp(fav).resize(180, 180).png().toFile(`${outDir}apple-touch-icon.png`);
	console.log("apple-touch-icon.png (180x180)");

	console.log(`\nAll assets generated in ${outDir}`);
}

main().catch(console.error);
