// main.ts — "The World in One Page": sums up the world news of Friday
// 20 November 2026 in a single 1024x1024 newspaper-style image.
//
// Node 22, standard library only. The program draws every pixel itself
// from an embedded 16px bitmap font (DejaVu Sans Bold, ASCII 32..126),
// so it needs no assets, no network and no system fonts. It takes no
// input, reads no clock and uses no randomness: two runs produce
// byte-identical output.
//
// Run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Writes: $MAKEFUN_OUTPUT_DIR/entry.png  (1024x1024, under 1 MiB)

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

// ---------------------------------------------------------------- font
// Each glyph: advance width in px at 16px, bitmap width, top offset from
// the baseline (negative = above), and one hex string per bitmap row.
type Glyph = { adv: number; w: number; top: number; rows: string[] };
const FONT: Record<string, Glyph> = JSON.parse(String.raw`{" ":{"adv":5.578125,"w":0,"top":0,"rows":[]},"!":{"adv":7.296875,"w":4,"top":-12,"rows":["e0","e0","e0","e0","e0","e0","e0","60","00","e0","e0","e0"]},"\"":{"adv":8.34375,"w":6,"top":-12,"rows":["cc","cc","cc","cc"]},"#":{"adv":13.40625,"w":12,"top":-12,"rows":["0cc0","0cc0","0d80","7fe0","7fe0","1980","1900","ffc0","ffc0","3300","3200","2600"]},"$":{"adv":11.140625,"w":10,"top":-12,"rows":["0800","0800","3e00","7f00","e900","e800","7e00","3f80","0b80","cb80","ff80","7f00","0800","0800"]},"%":{"adv":16.03125,"w":16,"top":-12,"rows":["3c30","6c30","6660","6640","6cc0","3d80","019c","0336","0267","0667","0c36","0c1c"]},"&":{"adv":13.953125,"w":14,"top":-12,"rows":["0f00","1f80","1c80","1c00","1c00","3e38","7f38","73f0","71f0","79e0","3ff0","1f78"]},"'":{"adv":4.90625,"w":3,"top":-12,"rows":["c0","c0","c0","c0"]},"(":{"adv":7.3125,"w":5,"top":-12,"rows":["38","30","70","70","60","e0","e0","e0","e0","60","70","70","30","38"]},")":{"adv":7.3125,"w":5,"top":-12,"rows":["e0","70","70","30","38","38","38","38","38","38","30","70","70","e0"]},"*":{"adv":8.375,"w":8,"top":-12,"rows":["18","5b","7e","3c","7e","5b","18"]},"+":{"adv":13.40625,"w":11,"top":-10,"rows":["0600","0600","0600","0600","7fe0","7fe0","0600","0600","0600","0600"]},",":{"adv":6.078125,"w":5,"top":-3,"rows":["38","38","70","70","60"]},"-":{"adv":6.640625,"w":6,"top":-6,"rows":["7c","7c"]},".":{"adv":6.078125,"w":4,"top":-3,"rows":["70","70","70"]},"/":{"adv":5.84375,"w":6,"top":-12,"rows":["0c","08","18","18","10","30","30","30","60","60","60","c0","c0"]},"0":{"adv":11.140625,"w":11,"top":-12,"rows":["1f00","3f80","79c0","71c0","71c0","71c0","71c0","71c0","71c0","7bc0","3f80","1f00"]},"1":{"adv":11.140625,"w":10,"top":-12,"rows":["3c00","7c00","5c00","1c00","1c00","1c00","1c00","1c00","1c00","1c00","7f80","7f80"]},"2":{"adv":11.140625,"w":9,"top":-12,"rows":["7e00","ff00","c780","0380","0780","0700","0e00","1c00","3800","7000","ff80","ff80"]},"3":{"adv":11.140625,"w":9,"top":-12,"rows":["3e00","7f00","4780","0700","3e00","3f00","0780","0380","0380","8780","ff00","7e00"]},"4":{"adv":11.140625,"w":11,"top":-12,"rows":["0780","0f80","0f80","1f80","3b80","3380","7380","6380","7fc0","7fc0","0380","0380"]},"5":{"adv":11.140625,"w":9,"top":-12,"rows":["7f00","7f00","6000","6000","7e00","7f00","4780","0380","0380","c780","ff00","7e00"]},"6":{"adv":11.140625,"w":10,"top":-12,"rows":["1f00","3f80","7080","e000","fe00","ff80","f380","e380","e380","7380","7f00","3e00"]},"7":{"adv":11.140625,"w":9,"top":-12,"rows":["ff80","ff80","0780","0700","0700","0e00","0e00","1c00","1c00","3800","3800","3800"]},"8":{"adv":11.140625,"w":10,"top":-12,"rows":["3f00","ff80","e380","e380","7f00","7f00","e380","e380","e380","e380","7f00","3e00"]},"9":{"adv":11.140625,"w":11,"top":-12,"rows":["1f00","3f80","73c0","71c0","71c0","73c0","7fc0","1fc0","01c0","2380","3f80","3e00"]},":":{"adv":6.40625,"w":4,"top":-9,"rows":["70","70","70","00","00","00","70","70","70"]},";":{"adv":6.40625,"w":4,"top":-9,"rows":["70","70","70","00","00","00","70","70","60","e0","c0"]},"<":{"adv":13.40625,"w":11,"top":-10,"rows":["0060","03e0","0f80","7c00","7000","7c00","0f80","03e0","0060"]},"=":{"adv":13.40625,"w":11,"top":-8,"rows":["7fe0","7fe0","0000","0000","7fe0","7fe0"]},">":{"adv":13.40625,"w":11,"top":-10,"rows":["4000","7800","3f00","07c0","01e0","07c0","3f00","7800","4000"]},"?":{"adv":9.28125,"w":8,"top":-12,"rows":["7c","fe","8e","0e","0e","1c","38","38","00","38","38","38"]},"@":{"adv":16.0,"w":14,"top":-12,"rows":["0fc0","1870","3018","67d8","cccc","cccc","cccc","cccc","cccc","ccd8","67f0","2000","1820","0fc0"]},"A":{"adv":12.390625,"w":13,"top":-12,"rows":["0f00","0f80","1f80","1f80","1dc0","39c0","39c0","38e0","7fe0","7fe0","7070","e070"]},"B":{"adv":12.203125,"w":11,"top":-12,"rows":["ff00","ff80","f3c0","f3c0","f380","ff80","ff80","f1c0","f1c0","f1c0","ffc0","ff00"]},"C":{"adv":11.75,"w":11,"top":-12,"rows":["0fc0","1fe0","3c20","7800","7000","7000","7000","7000","7800","3c20","1fe0","0fc0"]},"D":{"adv":13.28125,"w":12,"top":-12,"rows":["ff00","ffc0","f1e0","f0e0","f0e0","f0e0","f0e0","f0e0","f0e0","f1e0","ffc0","ff00"]},"E":{"adv":10.9375,"w":9,"top":-12,"rows":["ff80","ff80","f000","f000","f000","ff00","ff00","f000","f000","f000","ff80","ff80"]},"F":{"adv":10.9375,"w":9,"top":-12,"rows":["ff80","ff80","f000","f000","f000","ff00","ff00","f000","f000","f000","f000","f000"]},"G":{"adv":13.140625,"w":12,"top":-12,"rows":["0fe0","1ff0","3c30","7800","7000","7000","71f0","71f0","7870","3c70","1ff0","0fe0"]},"H":{"adv":13.390625,"w":11,"top":-12,"rows":["f0e0","f0e0","f0e0","f0e0","f0e0","ffe0","ffe0","f0e0","f0e0","f0e0","f0e0","f0e0"]},"I":{"adv":5.953125,"w":4,"top":-12,"rows":["f0","f0","f0","f0","f0","f0","f0","f0","f0","f0","f0","f0"]},"J":{"adv":5.953125,"w":6,"top":-12,"rows":["3c","3c","3c","3c","3c","3c","3c","3c","3c","3c","3c","38","38","f8","f0"]},"K":{"adv":12.40625,"w":12,"top":-12,"rows":["f1e0","f3c0","f780","ff00","fe00","fc00","fe00","ff00","f780","f3c0","f1c0","f0e0"]},"L":{"adv":10.203125,"w":9,"top":-12,"rows":["f000","f000","f000","f000","f000","f000","f000","f000","f000","f000","ff80","ff80"]},"M":{"adv":15.921875,"w":14,"top":-12,"rows":["f87c","f87c","f87c","fcfc","fcfc","efdc","e79c","e79c","e79c","e31c","e01c","e01c"]},"N":{"adv":13.390625,"w":11,"top":-12,"rows":["f0e0","f8e0","f8e0","fce0","fce0","eee0","e6e0","e7e0","e3e0","e3e0","e1e0","e1e0"]},"O":{"adv":13.609375,"w":13,"top":-12,"rows":["0fc0","3fe0","38f0","7870","7078","7038","7038","7078","7870","38f0","3fe0","0fc0"]},"P":{"adv":11.734375,"w":11,"top":-12,"rows":["ff00","ff80","f3c0","f1c0","f1c0","f3c0","ff80","ff00","f000","f000","f000","f000"]},"Q":{"adv":13.609375,"w":13,"top":-12,"rows":["0fc0","3fe0","38f0","7870","7078","7038","7038","7078","7870","38f0","3fe0","0fc0","00e0","00e0"]},"R":{"adv":12.328125,"w":11,"top":-12,"rows":["ff00","ff80","f3c0","f3c0","f380","ff00","ff00","f780","f3c0","f1c0","f1c0","f0e0"]},"S":{"adv":11.53125,"w":10,"top":-12,"rows":["3f00","7f80","e180","e000","f000","7f00","3f80","0780","0380","c380","ff80","7f00"]},"T":{"adv":10.921875,"w":11,"top":-12,"rows":["ffe0","ffe0","0e00","0e00","0e00","0e00","0e00","0e00","0e00","0e00","0e00","0e00"]},"U":{"adv":13.0,"w":11,"top":-12,"rows":["f1e0","f1e0","f1e0","f1e0","f1e0","f1e0","f1e0","f1e0","71c0","71c0","7fc0","1f00"]},"V":{"adv":12.390625,"w":13,"top":-12,"rows":["e070","7070","70e0","70e0","38e0","39c0","39c0","1dc0","1f80","1f80","0f80","0f00"]},"W":{"adv":17.65625,"w":18,"top":-12,"rows":["71c380","71e380","71e380","71e700","73e700","3b7700","3b3700","3f3f00","3f3e00","1e3e00","1e1e00","1e1e00"]},"X":{"adv":12.34375,"w":12,"top":-12,"rows":["70f0","78e0","39c0","1fc0","1f80","0f00","0f00","1f80","1fc0","39c0","78e0","70f0"]},"Y":{"adv":11.59375,"w":13,"top":-12,"rows":["7870","38f0","3ce0","1de0","0fc0","0f80","0780","0700","0700","0700","0700","0700"]},"Z":{"adv":11.609375,"w":11,"top":-12,"rows":["7fe0","7fe0","01c0","03c0","0780","0f00","1e00","1c00","3c00","7800","7fe0","7fe0"]},"[":{"adv":7.3125,"w":6,"top":-12,"rows":["f8","f8","e0","e0","e0","e0","e0","e0","e0","e0","e0","e0","f8","f8"]},"\\":{"adv":5.84375,"w":6,"top":-12,"rows":["c0","c0","60","60","60","30","30","30","10","18","18","08","0c"]},"]":{"adv":7.3125,"w":5,"top":-12,"rows":["f8","f8","38","38","38","38","38","38","38","38","38","38","f8","f8"]},"^":{"adv":13.40625,"w":11,"top":-12,"rows":["0e00","1f00","3980","60c0"]},"_":{"adv":8.0,"w":8,"top":3,"rows":["ff"]},"a":{"adv":10.796875,"w":10,"top":-9,"rows":["7f00","7f80","0380","3fc0","7fc0","71c0","73c0","7fc0","3fc0"]},"b":{"adv":11.453125,"w":10,"top":-12,"rows":["e000","e000","e000","ef00","ff80","f380","e1c0","e1c0","e1c0","f380","ff80","ef00"]},"c":{"adv":9.484375,"w":9,"top":-9,"rows":["1f00","3f00","7800","7000","7000","7000","7800","3f00","1f00"]},"d":{"adv":11.453125,"w":11,"top":-12,"rows":["01c0","01c0","01c0","1fc0","3fc0","71c0","71c0","71c0","71c0","71c0","3fc0","1fc0"]},"e":{"adv":10.859375,"w":11,"top":-9,"rows":["1f00","3f80","71c0","7fc0","7fc0","7000","70c0","3fc0","1f80"]},"f":{"adv":6.96875,"w":8,"top":-12,"rows":["1e","3e","38","fe","fe","38","38","38","38","38","38","38"]},"g":{"adv":11.453125,"w":11,"top":-9,"rows":["1fc0","3fc0","71c0","71c0","71c0","71c0","71c0","3fc0","1fc0","21c0","3f80","1f00"]},"h":{"adv":11.390625,"w":10,"top":-12,"rows":["e000","e000","e000","ef00","ff80","f380","e380","e380","e380","e380","e380","e380"]},"i":{"adv":5.484375,"w":4,"top":-12,"rows":["e0","e0","00","e0","e0","e0","e0","e0","e0","e0","e0","e0"]},"j":{"adv":5.484375,"w":6,"top":-12,"rows":["38","38","00","38","38","38","38","38","38","38","38","38","38","f8","f0"]},"k":{"adv":10.640625,"w":10,"top":-12,"rows":["e000","e000","e000","e380","e700","ee00","fc00","fc00","fe00","ef00","e780","e3c0"]},"l":{"adv":5.484375,"w":4,"top":-12,"rows":["e0","e0","e0","e0","e0","e0","e0","e0","e0","e0","e0","e0"]},"m":{"adv":16.671875,"w":15,"top":-9,"rows":["ef78","fffc","f3dc","e38c","e38c","e38c","e38c","e38c","e38c"]},"n":{"adv":11.390625,"w":10,"top":-9,"rows":["ef00","ff80","f380","e380","e380","e380","e380","e380","e380"]},"o":{"adv":11.0,"w":11,"top":-9,"rows":["1f00","3f80","71c0","71c0","71c0","71c0","71c0","3f80","1f00"]},"p":{"adv":11.453125,"w":10,"top":-9,"rows":["ef00","ff80","f380","e1c0","e1c0","e1c0","f380","ff80","ef00","e000","e000","e000"]},"q":{"adv":11.453125,"w":11,"top":-9,"rows":["1fc0","3fc0","71c0","71c0","71c0","71c0","71c0","3fc0","1fc0","01c0","01c0","01c0"]},"r":{"adv":7.890625,"w":7,"top":-9,"rows":["ee","fe","f0","e0","e0","e0","e0","e0","e0"]},"s":{"adv":9.53125,"w":9,"top":-9,"rows":["3e00","7f00","7100","7000","3f00","0780","4380","7f80","3f00"]},"t":{"adv":7.65625,"w":8,"top":-11,"rows":["30","30","fe","fe","30","30","30","30","38","3e","1e"]},"u":{"adv":11.390625,"w":10,"top":-9,"rows":["e380","e380","e380","e380","e380","e380","f780","7f80","3f80"]},"v":{"adv":10.4375,"w":11,"top":-9,"rows":["e1c0","71c0","7380","3380","3b80","3f00","1f00","1e00","1e00"]},"w":{"adv":14.78125,"w":15,"top":-9,"rows":["639c","739c","739c","7798","36f8","3ef8","3ef8","3cf0","1c70"]},"x":{"adv":10.328125,"w":11,"top":-9,"rows":["71c0","7380","3f00","1e00","1e00","1f00","3f00","7380","71c0"]},"y":{"adv":10.4375,"w":11,"top":-9,"rows":["e1c0","71c0","7380","3380","3b00","3f00","1f00","1e00","0e00","0c00","3c00","3800"]},"z":{"adv":9.3125,"w":9,"top":-9,"rows":["7f80","7f80","0700","0e00","1c00","3800","7000","7f80","7f80"]},"{":{"adv":11.390625,"w":8,"top":-12,"rows":["0e","1e","3c","38","38","38","38","f0","f8","38","38","38","38","1e","0e"]},"|":{"adv":5.84375,"w":2,"top":-12,"rows":["c0","c0","c0","c0","c0","c0","c0","c0","c0","c0","c0","c0","c0","c0","c0","c0"]},"}":{"adv":11.390625,"w":8,"top":-12,"rows":["f0","f8","38","38","38","38","3c","1e","1e","38","38","38","38","f8","f0"]},"~":{"adv":13.40625,"w":11,"top":-7,"rows":["0000","3c20","7fe0","47c0","0000"]}}`);

// ------------------------------------------------------------- colours
const PAPER: [number, number, number] = [252, 250, 243];
const INK: [number, number, number] = [20, 20, 20];
const RED: [number, number, number] = [166, 25, 46];
const GRAY: [number, number, number] = [107, 107, 107];
const RULE: [number, number, number] = [201, 194, 180];
const LIGHT: [number, number, number] = [238, 234, 224];

// --------------------------------------------------------- framebuffer
const W = 1024;
const H = 1024;
const fb = new Uint8Array(W * H * 3);
for (let i = 0; i < W * H; i++) {
  fb[i * 3] = PAPER[0];
  fb[i * 3 + 1] = PAPER[1];
  fb[i * 3 + 2] = PAPER[2];
}

function setPixel(x: number, y: number, c: [number, number, number]): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  fb[i] = c[0];
  fb[i + 1] = c[1];
  fb[i + 2] = c[2];
}

function fillRect(
  x: number,
  y: number,
  w: number,
  h: number,
  c: [number, number, number],
): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(xx, yy, c);
  }
}

// -------------------------------------------------------------- text
// Draw one glyph with its baseline at baselineY, top-left at x.
// Fractional scales use nearest-neighbour mapping.
function drawGlyph(
  ch: string,
  x: number,
  baselineY: number,
  scale: number,
  c: [number, number, number],
): void {
  const g = FONT[ch];
  if (!g || g.rows.length === 0) return;
  const dw = Math.max(1, Math.round(g.w * scale));
  const dh = Math.max(1, Math.round(g.rows.length * scale));
  const y0 = Math.round(baselineY + g.top * scale);
  for (let dy = 0; dy < dh; dy++) {
    const row = g.rows[Math.min(g.rows.length - 1, Math.floor(dy / scale))];
    for (let dx = 0; dx < dw; dx++) {
      const col = Math.min(g.w - 1, Math.floor(dx / scale));
      const byte = parseInt(row.slice(col >> 3 << 1, (col >> 3 << 1) + 2), 16);
      if ((byte >> (7 - (col & 7))) & 1) setPixel(x + dx, y0 + dy, c);
    }
  }
}

function textWidth(text: string, scale: number): number {
  let w = 0;
  for (const ch of text) {
    const g = FONT[ch];
    if (g) w += g.adv * scale;
  }
  return w;
}

function drawText(
  text: string,
  x: number,
  baselineY: number,
  scale: number,
  c: [number, number, number],
): void {
  let cx = x;
  for (const ch of text) {
    const g = FONT[ch];
    if (!g) continue;
    drawGlyph(ch, Math.round(cx), baselineY, scale, c);
    cx += g.adv * scale;
  }
}

function lineHeight(scale: number): number {
  return Math.round(16 * scale * 1.22);
}

// Draw one line with its top at yTop; returns the next line top.
function drawLine(
  text: string,
  x: number,
  yTop: number,
  scale: number,
  c: [number, number, number],
): number {
  drawText(text, x, yTop + Math.round(13 * scale), scale, c);
  return yTop + lineHeight(scale);
}

function wrapText(text: string, scale: number, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? cur + " " + w : w;
    if (textWidth(trial, scale) <= width) {
      cur = trial;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitText(
  text: string,
  width: number,
  maxLines: number,
  startScale: number,
  minScale: number,
): { scale: number; lines: string[] } {
  let scale = startScale;
  while (scale >= minScale) {
    const lines = wrapText(text, scale, width);
    if (lines.length <= maxLines) return { scale, lines };
    scale = Math.round((scale - 0.125) * 1000) / 1000;
  }
  return { scale: minScale, lines: wrapText(text, minScale, width).slice(0, maxLines) };
}

function drawLines(
  lines: string[],
  x: number,
  yTop: number,
  scale: number,
  c: [number, number, number],
  leading?: number,
): number {
  let y = yTop;
  for (const line of lines) {
    drawText(line, x, y + Math.round(13 * scale), scale, c);
    y += leading ?? lineHeight(scale);
  }
  return y;
}

function rule(x: number, y: number, width: number, height = 1, c = RULE): void {
  fillRect(x, y, width, height, c);
}

// ------------------------------------------------------------- stories
type Story = { kicker: string; head: string; summary: string };
const STORIES: Story[] = [
  {
    kicker: "MARKETS - NEW YORK",
    head: "Anthropic lists on Nasdaq and closes 17% higher",
    summary:
      "The first frontier AI lab to go public raises $81.3 billion; shares open at $111.50 and close at $97.17.",
  },
  {
    kicker: "MARKETS - NEW YORK",
    head: "Nvidia slides a sixth day as US stocks sink",
    summary:
      "The S&P 500 falls 2.02% for a sixth straight loss; the Dow drops below 50,000.",
  },
  {
    kicker: "JUSTICE - THE HAGUE",
    head: "World court: Myanmar committed genocide",
    summary:
      "The ICJ rules Myanmar's forces committed genocide against the Rohingya - a first for a state.",
  },
  {
    kicker: "MIDDLE EAST - RIYADH",
    head: "Houthi missile hits Riyadh's tallest tower",
    summary:
      "The strike blows out windows across eight floors of the Saudi sovereign wealth fund tower.",
  },
  {
    kicker: "EUROPE - KYIV",
    head: "Russian barrage hits Kyiv embassies and cathedral",
    summary:
      "A daytime attack damages the Austrian and Dutch missions; Brussels summons Moscow's envoy.",
  },
  {
    kicker: "UNITED STATES - WASHINGTON",
    head: "Trump fires White House cyber chief",
    summary:
      "The dismissal follows a wave of tech outages rattling US government systems.",
  },
  {
    kicker: "TECH POLICY - WASHINGTON",
    head: "US curbs remote access to advanced AI chips",
    summary:
      "A new BIS rule takes effect: remote computing above 12M TPP needs a licence, with 90 days to comply.",
  },
  {
    kicker: "AI - MOUNTAIN VIEW",
    head: "Gemini 4 Neon tops independent AI benchmarks",
    summary:
      "Google's Neon leads a 35-model business test; Genie 4 opens to Ultra subscribers.",
  },
];

// -------------------------------------------------------------- layout
const M = 36;
const CW = W - 2 * M;

function drawPage(): void {
  let y = 34;

  // Masthead
  const mast = "THE WORLD IN ONE PAGE";
  const mastScale = 4;
  const mastW = textWidth(mast, mastScale);
  drawText(mast, Math.round((W - mastW) / 2), y + Math.round(13 * mastScale), mastScale, INK);
  y += lineHeight(mastScale) + 10;
  rule(M, y, CW, 3, INK);
  y += 8;

  // Date line
  const date = "FRIDAY, 20 NOVEMBER 2026";
  const dateScale = 1.75;
  const dateW = textWidth(date, dateScale);
  drawText(date, Math.round((W - dateW) / 2), y + Math.round(13 * dateScale), dateScale, RED);
  y += lineHeight(dateScale) + 2;

  // Subline
  const sub = "Eight stories that defined the day";
  const subScale = 1.0625;
  const subW = textWidth(sub, subScale);
  drawText(sub, Math.round((W - subW) / 2), y + Math.round(13 * subScale), subScale, GRAY);
  y += lineHeight(subScale) + 8;
  rule(M, y, CW, 1, INK);
  y += 12;

  // Lead story (full width)
  const lead = STORIES[0];
  y = drawLine(lead.kicker, M, y, 1, RED);
  y += 2;
  const headFit = fitText(lead.head, CW, 2, 2.375, 1.75);
  y = drawLines(headFit.lines, M, y, headFit.scale, INK);
  y += 2;
  y = drawLines(wrapText(lead.summary, 1.25, CW), M, y, 1.25, INK);
  y += 8;
  rule(M, y, CW, 2, INK);
  y += 12;

  // Grid: 2 columns x 4 rows; the last cell is the markets box.
  const gap = 28;
  const colW = Math.floor((CW - gap) / 2);
  const rows: Array<[Story, Story | null]> = [
    [STORIES[1], STORIES[2]],
    [STORIES[3], STORIES[4]],
    [STORIES[5], STORIES[6]],
    [STORIES[7], null],
  ];
  const rowH = 134;
  for (let r = 0; r < rows.length; r++) {
    const top = y;
    for (let c = 0; c < 2; c++) {
      const x = M + c * (colW + gap);
      const st = rows[r][c];
      if (st === null) {
        fillRect(x, top, colW, rowH - 12, LIGHT);
        const bx = x + 14;
        let by = drawLine("MARKETS AT THE CLOSE", bx, top + 12, 1, RED);
        by += 2;
        drawLines(
          [
            "S&P 500  -2.02%    Dow  -2.19%",
            "Nasdaq  -2.25%    ANT  +17.07%",
            "NVDA  -3.30%    Gold  -4.90%",
          ],
          bx,
          by,
          1.0625,
          INK,
          Math.round(16 * 1.0625 * 1.35),
        );
        continue;
      }
      let yy = drawLine(st.kicker, x, top, 1, RED);
      yy += 2;
      const hf = fitText(st.head, colW, 3, 1.5, 1.1875);
      yy = drawLines(hf.lines, x, yy, hf.scale, INK);
      yy += 1;
      const slines = wrapText(st.summary, 1.0625, colW).slice(0, 3);
      drawLines(slines, x, yy, 1.0625, INK, Math.round(16 * 1.0625 * 1.2));
    }
    if (r < 3) rule(M, top + rowH, CW);
    y = top + rowH + (r < 3 ? 8 : 0);
  }

  // Footer
  const footY = H - 44;
  rule(M, footY, CW, 1, INK);
  const foot =
    "All events of Friday, 20 November 2026, as reported that day.  |  Sources: public wires and filings.";
  const footW = textWidth(foot, 1);
  drawText(foot, Math.round((W - footW) / 2), footY + 8 + 13, 1, GRAY);
}

// ------------------------------------------------------------ png out
const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}

function encodePng(): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(W, 0);
  header.writeUInt32BE(H, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type 2: RGB
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let row = 0; row < H; row++) {
    raw[row * (1 + W * 3)] = 0; // filter: none
    raw.set(fb.subarray(row * W * 3, (row + 1) * W * 3), row * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --------------------------------------------------------------- main
function main(): void {
  drawPage();
  const png = encodePng();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.png");
  writeFileSync(outPath, png);
  console.log(`wrote ${outPath} (${png.length} bytes, ${W}x${H})`);
}

main();
