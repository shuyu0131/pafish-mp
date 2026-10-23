// 纸鱼品牌手绘插画生成器
// 风格：深灰粗描边 + 2–3 个 pastel 填充 + 大量留白，透明背景。
// 输出：docs/illustrations/src/*.svg（可编辑源）与 docs/illustrations/png/*.png（评审/集成用）
// 运行：node scripts/gen-brand-illus.mjs
import sharp from 'sharp'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_SRC = path.join(ROOT, 'docs', 'illustrations', 'src')
const OUT_PNG = path.join(ROOT, 'docs', 'illustrations', 'png')

const C = {
  ink: '#3E4652',
  ink2: '#6B7685',
  sky: '#BFE6FF',
  skyL: '#E6F6FF',
  skyD: '#5FB8E8',
  yellow: '#FFE08A',
  yellowL: '#FFF3C9',
  pink: '#FFB7C5',
  pinkL: '#FFE1E7',
  mint: '#C9F0D8',
  mintL: '#E7F8EE',
  lav: '#D9CCF5',
  lavL: '#F0EAFB',
  cream: '#FFF4E0',
  white: '#FFFFFF',
  orange: '#F5A65B',
}

const sq = (x, y, w, color = C.ink2, opacity = 0.3) =>
  `<path d="M${x} ${y} c 12 -8 24 8 36 0 c 12 -8 24 8 36 0" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity="${opacity}"/>`

const sparkle = (x, y, r, color = C.orange) =>
  `<path d="M${x} ${y - r} V${y + r} M${x - r} ${y} H${x + r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`

const svg = (body, w = 400, h = 400) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`

const stroke = (w = 9, color = C.ink) =>
  `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`

/* ---------------- sky header ---------------- */

const skyBg = `
  <defs>
    <filter id="sky-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.6"/>
    </filter>
  </defs>
  <rect width="1080" height="800" fill="#BEEBFF"/>
  <g filter="url(#sky-soft)">
  <circle cx="906" cy="102" r="40" fill="${C.yellow}" stroke="${C.ink}" stroke-width="8"/>
  <path d="M906 40 V22 M906 184 V166 M844 102 H826 M986 102 H968 M862 58 L848 44 M964 146 L950 132 M950 58 L964 44 M848 146 L862 132" ${stroke(7, C.orange)}/>

  <g transform="translate(60 0)">
  <path d="M96 156 C64 156 48 128 74 112 C72 78 112 68 132 92 C150 64 194 68 202 100 C234 94 250 128 224 146 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  </g>
  <path d="M392 108 C370 108 362 86 380 76 C378 54 404 46 420 60 C430 38 462 40 470 62 C494 60 504 82 486 96 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M694 92 C674 92 666 74 682 64 C680 46 702 38 714 50 C724 32 752 34 758 54 C778 52 786 72 770 84 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>

  <path d="M598 168 C608 158 618 158 626 166 M636 164 C646 154 656 154 664 162" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" opacity=".45"/>
  ${sparkle(320, 126, 10)}
  ${sparkle(612, 74, 8, C.skyD)}

  </g>

  <path d="M300 390 C380 354 432 336 496 310" fill="none" stroke="${C.ink2}" stroke-width="5" stroke-linecap="round" opacity=".3" stroke-dasharray="3 14"/>
  <g transform="translate(518 300) rotate(-10) scale(1.15)">
    <path d="M0 0 L52 -28 L34 28 L18 6 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M18 6 L34 28 L52 -28" ${stroke(6)}/>
    <path d="M8 2 L22 6" stroke="${C.ink}" stroke-width="3.5" opacity=".35"/>
  </g>

  <path d="M676 650 C712 604 724 520 752 460" fill="none" stroke="${C.skyD}" stroke-width="6" stroke-linecap="round" opacity=".5" stroke-dasharray="2 14"/>
  <g transform="translate(792 440) rotate(-7) scale(1.12)">
    <path d="M-50 0 C-30 -26 18 -30 40 -4 C18 22 -30 24 -50 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M-38 2 C-24 -14 10 -16 30 -4" fill="none" stroke="${C.white}" stroke-width="4" opacity=".55"/>
    <path d="M40 -4 L64 -24 L59 0 L64 24 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M55 -12 L59 -4 L55 4" fill="none" stroke="${C.ink}" stroke-width="3.5" opacity=".4"/>
    <path d="M-8 -22 C-2 -38 10 -40 18 -26" fill="${C.mint}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M-14 8 C-8 14 0 14 6 8 M-2 0 C4 -6 12 -6 18 0" fill="none" stroke="${C.ink}" stroke-width="3.5" opacity=".4" stroke-linecap="round"/>
    <circle cx="-20" cy="-5" r="5" fill="${C.ink}"/>
    <circle cx="-18" cy="-7" r="1.5" fill="${C.white}"/>
    <path d="M-32 8 C-24 14 -14 14 -6 8" ${stroke(5)}/>
  </g>
  <circle cx="700" cy="540" r="6" fill="${C.white}" stroke="${C.skyD}" stroke-width="3"/>
  <circle cx="726" cy="510" r="4" fill="${C.white}" stroke="${C.skyD}" stroke-width="3"/>
  <circle cx="684" cy="500" r="3" fill="${C.white}" stroke="${C.skyD}" stroke-width="2.5"/>

  <path d="M0 650 C90 620 170 682 260 648 C350 614 430 682 520 648 C610 614 690 682 780 648 C870 614 950 682 1040 648 V800 H0 Z" fill="${C.mintL}" stroke="${C.ink}" stroke-width="8"/>
  <path d="M0 700 C90 670 170 732 260 698 C350 664 430 732 520 698 C610 664 690 732 780 698 C870 664 950 732 1040 698" ${stroke(7, C.skyD)}/>
  <path d="M0 742 C90 714 170 774 260 742 C350 710 430 774 520 742 C610 710 690 774 780 742 C870 710 950 774 1040 742" fill="none" stroke="${C.sky}" stroke-width="6" opacity=".8"/>

  <g transform="translate(232 560) rotate(-3) scale(1.12)">
    <path d="M0 28 V-58" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M0 28 L0 -28 L58 16 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M0 28 L0 -18 L-52 16 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-64 28 H64 L44 58 H-46 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  </g>
  <path d="M286 634 C310 626 334 638 358 630" fill="none" stroke="${C.skyD}" stroke-width="5" stroke-linecap="round" opacity=".5"/>

  <g transform="translate(890 500) rotate(8) scale(.72)">
    <path d="M-34 0 C-18 -16 12 -18 26 0 C12 16 -18 16 -34 0 Z" fill="${C.lavL}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M26 0 L40 -12 L36 0 L40 12 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="-15" cy="-3" r="3" fill="${C.ink}"/>
  </g>
  ${sparkle(130, 390, 8, C.skyD)}
  ${sparkle(462, 520, 7, C.orange)}
`

/* ---------------- category illustrations ---------------- */

const catTech = `
  <ellipse cx="200" cy="330" rx="82" ry="10" fill="${C.skyL}" opacity=".75"/>
  <g transform="translate(94 104) rotate(-10)">
    <path d="M0 -30 L25 -15 L25 15 L0 30 L-25 15 L-25 -15 Z" fill="${C.lavL}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
    <circle r="10" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>
    <circle r="3" fill="${C.lav}" opacity=".8"/>
  </g>
  <path d="M200 68 C150 68 116 106 116 158 C116 192 136 216 156 232 V262 C156 274 166 282 178 282 H222 C234 282 244 274 244 262 V232 C264 216 284 192 284 158 C284 106 250 68 200 68 Z" fill="${C.yellowL}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M143 148 C132 174 134 204 149 226" fill="none" stroke="${C.white}" stroke-width="10" stroke-linecap="round" opacity=".7"/>
  <rect x="170" y="282" width="60" height="27" rx="9" fill="${C.skyL}" stroke="${C.ink}" stroke-width="8"/>
  <path d="M178 292 H222 M178 302 H222" stroke="${C.ink}" stroke-width="4" opacity=".3"/>
  <g transform="translate(200 174)">
    <path d="M-50 0 C-30 -26 18 -30 40 -4 C18 22 -30 24 -50 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M-38 2 C-24 -14 10 -16 30 -4" fill="none" stroke="${C.white}" stroke-width="4" opacity=".55"/>
    <path d="M40 -4 L64 -24 L59 0 L64 24 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M55 -12 L59 -4 L55 4" fill="none" stroke="${C.ink}" stroke-width="3.5" opacity=".4"/>
    <path d="M-14 -8 C-8 -14 0 -14 6 -8 M-2 0 C4 -6 12 -6 18 0 M-22 8 C-16 2 -8 2 -2 8" fill="none" stroke="${C.ink}" stroke-width="3.5" opacity=".4" stroke-linecap="round"/>
    <circle cx="-20" cy="-5" r="5" fill="${C.ink}"/>
    <circle cx="-18" cy="-7" r="1.5" fill="${C.white}"/>
    <path d="M-32 8 C-24 14 -14 14 -6 8" ${stroke(5)}/>
    <path d="M-8 -22 C-2 -36 8 -38 14 -26" fill="${C.mint}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="-42" cy="-28" r="5" fill="${C.white}" stroke="${C.ink}" stroke-width="3.5"/>
    <circle cx="-30" cy="-38" r="3.5" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
    <circle cx="-18" cy="-46" r="2.5" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
  </g>
  <g transform="translate(310 258) rotate(10)">
    <path d="M0 0 L46 -24 L30 24 L17 5 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M30 24 L21 7 L46 -24" ${stroke(6)}/>
    <path d="M7 4 L19 7" stroke="${C.ink}" stroke-width="3.5" opacity=".35"/>
  </g>
  <path d="M270 268 C280 260 290 260 300 266" fill="none" stroke="${C.ink2}" stroke-width="4" stroke-linecap="round" opacity=".35" stroke-dasharray="4 10"/>
  ${sparkle(322, 98, 13)}
  ${sparkle(86, 226, 10, C.skyD)}
  ${sparkle(336, 330, 8, C.skyD)}
  ${sq(120, 350, 150)}
`

const catBuild = `
  <ellipse cx="200" cy="352" rx="132" ry="10" fill="${C.skyL}" opacity=".7"/>
  <path d="M86 116 C66 116 58 98 74 88 C72 70 94 62 106 74 C116 56 144 58 150 78 C170 76 178 96 162 108 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <rect x="102" y="94" width="196" height="198" rx="15" fill="${C.skyL}" stroke="${C.ink}" stroke-width="9"/>
  <path d="M102 128 H298" stroke="${C.ink}" stroke-width="6"/>
  <circle cx="120" cy="111" r="5" fill="${C.pink}"/>
  <circle cx="138" cy="111" r="5" fill="${C.yellow}"/>
  <circle cx="156" cy="111" r="5" fill="${C.mint}"/>
  <path d="M174 111 H220" stroke="${C.ink2}" stroke-width="5" stroke-linecap="round" opacity=".25"/>
  <path d="M284 106 C284 102 287 100 290 100 C293 100 296 102 296 106 V110 H284 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M116 138 C126 130 138 130 148 138" fill="none" stroke="${C.white}" stroke-width="4" opacity=".5"/>
  <path d="M158 216 L200 178 L242 216 V254 H158 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M158 216 L200 178 L242 216" ${stroke(9)}/>
  <path d="M198 178 V160 H210 V170" fill="${C.cream}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M208 160 C212 152 220 152 224 158" fill="none" stroke="${C.ink2}" stroke-width="4" stroke-linecap="round" opacity=".4"/>
  <path d="M190 254 V226 H210 V254" fill="${C.sky}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <circle cx="205" cy="240" r="2.5" fill="${C.ink}"/>
  <rect x="216" y="222" width="16" height="16" rx="3" fill="${C.sky}" stroke="${C.ink}" stroke-width="5"/>
  <rect x="214" y="238" width="22" height="8" rx="3" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="4"/>
  <path d="M220 238 C218 232 220 228 224 226 M229 238 C227 232 229 228 233 226" fill="none" stroke="${C.green}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="224" cy="226" r="3" fill="${C.yellow}" stroke="${C.ink}" stroke-width="2.5"/>
  <circle cx="233" cy="226" r="3" fill="${C.pink}" stroke="${C.ink}" stroke-width="2.5"/>
  <path d="M242 178 V148" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>
  <path d="M242 150 L266 158 L242 166 Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M92 292 H308 L334 334 H66 Z" fill="${C.lavL}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M108 306 H292" stroke="${C.ink2}" stroke-width="5" opacity=".22"/>
  <path d="M178 316 H222" stroke="${C.ink2}" stroke-width="4" opacity=".22" stroke-linecap="round"/>
  <g transform="rotate(22 322 250)">
    <rect x="306" y="206" width="18" height="92" rx="6" fill="${C.yellow}" stroke="${C.ink}" stroke-width="7"/>
    <path d="M306 298 L315 320 L324 298" fill="${C.cream}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M306 224 H324" stroke="${C.ink2}" stroke-width="5" opacity=".3"/>
    <path d="M309 236 V282" stroke="${C.white}" stroke-width="3" opacity=".5" stroke-linecap="round"/>
  </g>
  <path d="M336 118 L340 128 L350 132 L340 136 L336 146 L332 136 L322 132 L332 128 Z" fill="${C.yellow}" opacity=".8"/>
  ${sparkle(314, 150, 11)}
  ${sparkle(80, 244, 9, C.skyD)}
  ${sq(120, 356, 120)}
`

const catLife = `
  <ellipse cx="200" cy="344" rx="120" ry="9" fill="${C.skyL}" opacity=".65"/>
  <circle cx="306" cy="96" r="33" fill="${C.yellow}" stroke="${C.ink}" stroke-width="8"/>
  <circle cx="306" cy="96" r="22" fill="${C.yellowL}" opacity=".7"/>
  <path d="M306 44 V30 M306 162 V148 M254 96 H240 M372 96 H358 M270 60 L260 50 M352 142 L342 132 M342 50 L352 60 M260 142 L270 132" ${stroke(7, C.orange)}/>
  <path d="M90 120 C70 120 62 102 78 92 C76 74 98 66 110 78 C120 60 148 62 154 82 C174 80 182 100 166 112 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M322 132 C330 126 342 126 350 132 C358 126 370 126 378 132" ${stroke(5, C.ink2)}/>
  <path d="M200 286 V178" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
  <path d="M200 170 L228 178 L200 186 Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M200 286 L200 188 L258 250 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M200 286 L200 198 L150 250 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M200 216 L232 248" stroke="${C.ink2}" stroke-width="4" opacity=".3"/>
  <path d="M118 286 H282 L252 330 H148 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M140 300 H260" stroke="${C.ink2}" stroke-width="4" opacity=".22" stroke-linecap="round"/>
  <path d="M158 286 L148 330" stroke="${C.ink2}" stroke-width="3.5" opacity=".2"/>
  <g transform="translate(112 234) rotate(-12)">
    <path d="M-34 0 C-18 -18 12 -20 26 0 C12 18 -18 18 -34 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-24 2 C-14 -10 8 -10 18 -2" fill="none" stroke="${C.white}" stroke-width="3.5" opacity=".5"/>
    <path d="M26 0 L42 -14 L38 0 L42 14 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="-15" cy="-3" r="3.5" fill="${C.ink}"/>
    <path d="M-22 6 C-16 10 -10 10 -4 6" ${stroke(4)}/>
    <path d="M-10 -8 C-6 -12 0 -12 4 -8 M-2 0 C2 -4 8 -4 12 0" fill="none" stroke="${C.ink}" stroke-width="3" opacity=".4"/>
  </g>
  <g transform="translate(332 224) rotate(8)">
    <path d="M-24 0 C-14 -13 8 -14 18 0 C8 13 -14 13 -24 0 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M18 0 L30 -10 L27 0 L30 10 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="-10" cy="-2" r="2.5" fill="${C.ink}"/>
  </g>
  <path d="M56 330 C84 312 108 348 136 330 C164 312 188 348 216 330 C244 312 268 348 296 330 C324 312 348 348 376 330" ${stroke(9, C.skyD)}/>
  <path d="M56 352 C84 334 108 370 136 352 C164 334 188 370 216 352 C244 334 268 370 296 352 C324 334 348 370 376 352" ${stroke(8, C.mint)}/>
  <path d="M72 368 C100 352 124 386 152 368 C180 350 204 386 232 368 C260 350 284 386 312 368" fill="none" stroke="${C.sky}" stroke-width="6" opacity=".8"/>
  <path d="M150 338 C176 344 200 344 226 338" fill="none" stroke="${C.white}" stroke-width="4" opacity=".55" stroke-linecap="round"/>
  <circle cx="84" cy="200" r="5" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>
  <circle cx="104" cy="184" r="3.5" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>
  <path d="M282 162 C292 152 302 152 310 160 C318 152 328 152 338 162" ${stroke(5, C.ink2)}/>
  <path d="M342 344 C360 348 378 344 392 336" fill="none" stroke="${C.skyD}" stroke-width="4" opacity=".4" stroke-linecap="round"/>
  ${sparkle(358, 186, 9)}
  ${sparkle(80, 152, 7, C.skyD)}
`

const catEssay = `
  <ellipse cx="200" cy="330" rx="118" ry="9" fill="${C.skyL}" opacity=".7"/>
  <rect x="82" y="92" width="236" height="218" rx="16" fill="${C.lav}" stroke="${C.ink}" stroke-width="9"/>
  <path d="M102 112 H194 V292 H102 C96 292 92 288 92 282 V122 C92 116 96 112 102 112 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M206 112 H298 C304 112 308 116 308 122 V282 C308 288 304 292 298 292 H206 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M200 112 V292" stroke="${C.ink}" stroke-width="7"/>
  <path d="M292 278 L304 292 H282 Z" fill="${C.lavL}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M112 144 H178 M112 168 H178 M112 192 H178 M112 216 H178 M112 240 H160 M218 144 H286 M218 168 H286 M218 192 H286 M218 216 H286 M218 240 H264" stroke="${C.ink2}" stroke-width="5" opacity=".28" stroke-linecap="round"/>
  <path d="M216 136 C224 130 238 140 248 134" fill="none" stroke="${C.ink2}" stroke-width="4" opacity=".35" stroke-linecap="round"/>
  <g transform="translate(136 190) rotate(-6)">
    <path d="M-22 0 C-12 -10 8 -10 16 0 C8 10 -12 10 -22 0 Z" fill="none" stroke="${C.ink2}" stroke-width="3" opacity=".45"/>
    <path d="M16 0 L24 -7 L22 0 L24 7 Z" fill="none" stroke="${C.ink2}" stroke-width="3" opacity=".45"/>
    <circle cx="-8" cy="-2" r="1.6" fill="${C.ink2}" opacity=".5"/>
    <path d="M-30 16 C-18 10 4 10 18 16" fill="none" stroke="${C.ink2}" stroke-width="3" opacity=".25"/>
  </g>
  <path d="M102 120 V150 C102 158 112 158 112 150 V114" fill="none" stroke="${C.ink2}" stroke-width="4" stroke-linecap="round" opacity=".45"/>
  <g transform="translate(238 96)">
    <path d="M0 0 C14 -12 34 -10 42 2 C34 14 14 16 0 4 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M42 2 L58 -8 L54 2 L58 12 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="12" cy="1" r="3" fill="${C.ink}"/>
    <circle cx="13" cy="0" r="1" fill="${C.white}"/>
    <path d="M22 2 C26 -2 31 -2 34 2" fill="none" stroke="${C.ink}" stroke-width="2.5" opacity=".4"/>
  </g>
  <g transform="rotate(24 302 246)">
    <rect x="288" y="202" width="18" height="104" rx="6" fill="${C.pink}" stroke="${C.ink}" stroke-width="7"/>
    <path d="M288 306 L297 328 L306 306" fill="${C.cream}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M288 220 H306" stroke="${C.ink2}" stroke-width="5" opacity=".3"/>
    <path d="M292 214 V240" stroke="${C.white}" stroke-width="3" opacity=".55" stroke-linecap="round"/>
    <path d="M305 210 V232" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
  </g>
  <ellipse cx="126" cy="364" rx="40" ry="8" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>
  <path d="M96 318 H156 L148 360 H104 Z" fill="${C.mintL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M156 330 C174 330 174 352 154 352" fill="none" stroke="${C.ink}" stroke-width="6"/>
  <path d="M156 332 L172 342 L168 352 L160 346 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M112 306 C106 296 118 292 112 282 M132 306 C126 296 138 292 132 282" fill="none" stroke="${C.ink2}" stroke-width="4" opacity=".4"/>
  ${sparkle(320, 150, 10)}
  ${sq(120, 380, 120)}
`

const catDesign = `
  <ellipse cx="200" cy="330" rx="128" ry="10" fill="${C.skyL}" opacity=".7"/>
  <path d="M124 196 C124 132 182 104 244 114 C304 124 334 174 314 224 C304 254 274 256 252 244 C232 234 220 254 199 264 C160 282 124 252 124 196 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <ellipse cx="268" cy="214" rx="17" ry="13" fill="${C.white}" stroke="${C.ink}" stroke-width="7"/>
  <circle cx="168" cy="174" r="15" fill="${C.sky}" stroke="${C.ink}" stroke-width="5"/>
  <circle cx="208" cy="150" r="13" fill="${C.pink}" stroke="${C.ink}" stroke-width="5"/>
  <circle cx="252" cy="146" r="12" fill="${C.mint}" stroke="${C.ink}" stroke-width="5"/>
  <circle cx="288" cy="178" r="11" fill="${C.yellow}" stroke="${C.ink}" stroke-width="5"/>
  <circle cx="176" cy="232" r="12" fill="${C.lav}" stroke="${C.ink}" stroke-width="5"/>
  <circle cx="240" cy="176" r="9" fill="${C.orange}" stroke="${C.ink}" stroke-width="4"/>
  <path d="M154 254 C146 268 150 280 162 286" fill="none" stroke="${C.sky}" stroke-width="5" stroke-linecap="round"/>
  <path d="M196 266 C192 278 198 288 208 292" fill="none" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/>
  <g transform="translate(212 204) rotate(-6)">
    <path d="M-28 0 C-16 -14 10 -16 22 0 C10 14 -16 14 -28 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M22 0 L34 -10 L31 0 L34 10 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="-12" cy="-2" r="2.5" fill="${C.ink}"/>
    <path d="M-17 4 C-13 7 -9 7 -5 4" fill="none" stroke="${C.ink}" stroke-width="2.5" opacity=".5"/>
  </g>
  <path d="M146 216 C162 204 180 212 190 226" fill="none" stroke="${C.pink}" stroke-width="5" stroke-linecap="round" opacity=".7"/>
  <g transform="rotate(34 318 220)">
    <rect x="300" y="150" width="16" height="104" rx="7" fill="${C.pink}" stroke="${C.ink}" stroke-width="7"/>
    <rect x="300" y="244" width="16" height="18" fill="${C.skyL}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M300 262 L308 286 L316 262 Z" fill="${C.ink}"/>
    <path d="M304 252 V260 M310 252 V260" stroke="${C.ink}" stroke-width="2.5" opacity=".4"/>
    <path d="M305 166 V232" stroke="${C.white}" stroke-width="3" opacity=".55" stroke-linecap="round"/>
  </g>
  ${sparkle(96, 120, 10)}
  ${sparkle(320, 100, 8, C.skyD)}
  ${sparkle(340, 300, 7, C.pink)}
`

/* ---------------- empty states ---------------- */

const emptyPosts = `
  <path d="M158 318 H242 L256 342 H144 Z" fill="${C.lavL}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M200 86 C120 86 78 144 78 212 C78 278 130 318 200 318 C270 318 322 278 322 212 C322 144 280 86 200 86 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <defs><clipPath id="bowlClip"><path d="M200 86 C120 86 78 144 78 212 C78 278 130 318 200 318 C270 318 322 278 322 212 C322 144 280 86 200 86 Z"/></clipPath></defs>
  <g clip-path="url(#bowlClip)">
    <rect x="70" y="196" width="260" height="130" fill="${C.sky}" opacity=".55"/>
    <path d="M70 208 C100 194 130 220 160 208 C190 196 220 220 250 208 C280 196 310 220 330 208" ${stroke(7, C.skyD)}/>
  </g>
  <path d="M124 154 C112 178 110 202 116 226" fill="none" stroke="${C.white}" stroke-width="7" stroke-linecap="round" opacity=".9"/>
  <g transform="translate(200 238)">
    <path d="M-42 18 H42 L26 38 H-26 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M0 18 V-18" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
    <path d="M0 18 L0 -8 L30 12 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
  </g>
  <circle cx="150" cy="170" r="7" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>
  <circle cx="170" cy="146" r="4.5" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>
  <circle cx="246" cy="160" r="5" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>
  <g transform="translate(300 288) rotate(-10)">
    <path d="M-34 0 C-18 -16 12 -18 26 0 C12 16 -18 16 -34 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M26 0 L40 -12 L36 0 L40 12 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="-15" cy="-3" r="3" fill="${C.ink}"/>
  </g>
  ${sparkle(96, 110, 10)}
`

const emptyComments = `
  <path d="M92 88 H308 C332 88 348 104 348 128 V228 C348 252 332 268 308 268 H188 L144 306 L150 268 H92 C68 268 52 252 52 228 V128 C52 104 68 88 92 88 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <g transform="translate(196 184) rotate(-6)">
    <path d="M-58 0 C-36 -26 14 -30 42 -2 C14 26 -36 26 -58 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M42 -2 L66 -20 L61 0 L66 20 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="-26" cy="-4" r="4.5" fill="${C.ink}"/>
    <path d="M-38 9 C-30 15 -20 15 -12 9" ${stroke(4)}/>
  </g>
  <circle cx="108" cy="132" r="5" fill="${C.ink2}"/>
  <circle cx="128" cy="132" r="5" fill="${C.ink2}"/>
  <circle cx="148" cy="132" r="5" fill="${C.ink2}"/>
  <circle cx="290" cy="128" r="7" fill="${C.skyL}" stroke="${C.ink}" stroke-width="4"/>
  <circle cx="306" cy="104" r="4" fill="${C.skyL}" stroke="${C.ink}" stroke-width="4"/>
  ${sparkle(84, 210, 9)}
`

const emptyOffline = `
  <path d="M120 126 C90 126 76 98 100 84 C98 54 136 46 152 70 C170 46 212 52 218 82 C246 78 260 108 236 124 Z" fill="${C.lavL}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M120 156 L112 170 M156 152 L148 166 M196 156 L188 170 M236 152 L228 166 M276 156 L268 170" stroke="${C.skyD}" stroke-width="6" stroke-linecap="round"/>
  <path d="M88 232 C94 176 150 148 202 176 C226 190 244 214 252 232 C232 244 210 240 194 230 C178 244 152 244 136 230 C120 242 100 244 88 232 Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M170 232 V300 C170 318 190 326 204 312" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
  <g transform="translate(218 286) rotate(-8)">
    <path d="M-46 0 C-28 -22 16 -26 40 -2 C16 22 -28 22 -46 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M40 -2 L62 -20 L57 0 L62 20 Z" fill="${C.skyL}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="-20" cy="-3" r="4" fill="${C.ink}"/>
    <path d="M-32 7 C-24 13 -14 13 -6 7" ${stroke(4)}/>
  </g>
  <ellipse cx="210" cy="338" rx="82" ry="12" fill="${C.mintL}" stroke="${C.ink}" stroke-width="6"/>
  ${sparkle(310, 180, 9)}
`

/* ---------------- tabbar icons ---------------- */

function tabIcon(kind, active) {
  const line = active ? C.ink : '#A8B4C8'
  const fill = active ? '#60C2FF' : 'none'
  const detail = active ? C.ink : '#A8B4C8'
  const sw = 4.5
  if (kind === 'posts') {
    return `
      <path d="M14 12 H42 L52 22 V52 H14 Z" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
      <path d="M42 12 V22 H52" fill="none" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
      <path d="M22 30 H36 M22 38 H34" fill="none" stroke="${detail}" stroke-width="3.6" stroke-linecap="round" opacity=".8"/>
    `
  }
  if (kind === 'micro') {
    return `
      <path d="M14 14 H50 C55 14 58 17 58 22 V38 C58 43 55 46 50 46 H30 L20 54 L22 46 H14 C9 46 6 43 6 38 V22 C6 17 9 14 14 14 Z" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
      <circle cx="21" cy="30" r="2.6" fill="${detail}"/>
      <circle cx="32" cy="30" r="2.6" fill="${detail}"/>
      <circle cx="43" cy="30" r="2.6" fill="${detail}"/>
    `
  }
  if (kind === 'category') {
    return `
      <rect x="12" y="12" width="18" height="18" rx="4" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
      <rect x="34" y="12" width="18" height="18" rx="4" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
      <rect x="12" y="34" width="18" height="18" rx="4" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
      <rect x="34" y="34" width="18" height="18" rx="4" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
      <path d="M17 21 H25 M17 43 H25 M39 21 H47 M39 43 H47" fill="none" stroke="${detail}" stroke-width="2.8" stroke-linecap="round" opacity=".7"/>
    `
  }
  return `
    <path d="M14 34 C14 22 24 16 34 19 C42 21 47 28 44 35 C41 43 30 48 21 44 C16 41 14 38 14 34 Z" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M44 32 C49 27 55 25 57 28 C54 31 54 35 57 38 C55 40 49 38 44 35 Z" fill="${active ? C.skyL : 'none'}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M29 24 C32 20 37 20 40 24" fill="none" stroke="${detail}" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="23" cy="30" r="2.2" fill="${detail}"/>
    <path d="M28 36 C32 39 37 38 40 35" fill="none" stroke="${detail}" stroke-width="3" stroke-linecap="round"/>
  `
}

/* ---------------- share fallback ---------------- */

const shareBrand = `
  <rect width="500" height="400" fill="${C.skyL}"/>
  <circle cx="92" cy="82" r="28" fill="${C.yellow}" stroke="${C.ink}" stroke-width="7"/>
  <path d="M420 66 C402 66 394 50 408 42 C406 26 426 20 436 30 C444 14 468 16 474 34 C490 32 498 50 484 60 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M250 120 V236" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
  <path d="M250 236 L250 148 L322 210 Z" fill="${C.pinkL}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M250 236 L250 162 L196 210 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M142 236 H358 L318 300 H182 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M70 300 C104 280 132 318 166 300 C200 282 228 318 262 300 C296 282 324 318 358 300 C392 282 418 318 444 300" fill="none" stroke="${C.skyD}" stroke-width="8"/>
  <path d="M70 326 C104 306 132 344 166 326 C200 308 228 344 262 326 C296 308 324 344 358 326 C392 308 418 344 444 326" fill="none" stroke="${C.mint}" stroke-width="7"/>
  <g transform="translate(392 224) rotate(-10)">
    <path d="M-34 0 C-18 -16 12 -18 26 0 C12 16 -18 16 -34 0 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M26 0 L40 -12 L36 0 L40 12 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="-15" cy="-3" r="3" fill="${C.ink}"/>
  </g>
  ${sparkle(132, 348, 9, C.skyD)}
  ${sparkle(360, 354, 8, C.orange)}
`

/* ---------------- generate ---------------- */

await mkdir(OUT_SRC, { recursive: true })
await mkdir(OUT_PNG, { recursive: true })

const jobs = [
  ['cat-tech', catTech, 400, 200],
  ['cat-build', catBuild, 400, 200],
  ['cat-life', catLife, 400, 200],
  ['cat-essay', catEssay, 400, 200],
  ['cat-design', catDesign, 400, 200],
  ['empty-posts', emptyPosts, 400, 320],
  ['empty-comments', emptyComments, 400, 320],
  ['empty-offline', emptyOffline, 400, 320],
  ['tab-posts', tabIcon('posts', false), 64, 96],
  ['tab-posts-on', tabIcon('posts', true), 64, 96],
  ['tab-micro', tabIcon('micro', false), 64, 96],
  ['tab-micro-on', tabIcon('micro', true), 64, 96],
  ['tab-category', tabIcon('category', false), 64, 96],
  ['tab-category-on', tabIcon('category', true), 64, 96],
  ['tab-mine', tabIcon('mine', false), 64, 96],
  ['tab-mine-on', tabIcon('mine', true), 64, 96],
]

let total = 0
for (const [name, body, viewSize, outSize] of jobs) {
  const source = svg(body, viewSize, viewSize)
  const svgPath = path.join(OUT_SRC, `${name}.svg`)
  const pngPath = path.join(OUT_PNG, `${name}.png`)
  await writeFile(svgPath, source)
  await sharp(Buffer.from(source))
    .resize(outSize, outSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ palette: true, compressionLevel: 9 })
    .toFile(pngPath)
  const { size } = await stat(pngPath)
  total += size
  console.log(name.padEnd(20), `${outSize}px`, `${(size / 1024).toFixed(1)} KB`)
}

// share card (5:4)
{
  const source = svg(shareBrand, 500, 400)
  const svgPath = path.join(OUT_SRC, 'share-brand.svg')
  const pngPath = path.join(OUT_PNG, 'share-brand.png')
  await writeFile(svgPath, source)
  await sharp(Buffer.from(source))
    .resize(500, 400, { fit: 'fill' })
    .png({ palette: true, compressionLevel: 9 })
    .toFile(pngPath)
  const { size } = await stat(pngPath)
  total += size
  console.log('share-brand'.padEnd(20), '500x400', `${(size / 1024).toFixed(1)} KB`)
}

// sky header (non-square)
{
  const source = svg(skyBg, 1080, 800)
  const svgPath = path.join(OUT_SRC, 'sky-bg.svg')
  const pngPath = path.join(OUT_PNG, 'sky-bg.png')
  await writeFile(svgPath, source)
  await sharp(Buffer.from(source))
    .resize(780, 578, { fit: 'fill' })
    .png({ palette: true, compressionLevel: 9 })
    .toFile(pngPath)
  const { size } = await stat(pngPath)
  total += size
  console.log('sky-bg'.padEnd(20), '780x578', `${(size / 1024).toFixed(1)} KB`)
}

console.log('-'.repeat(36))
console.log('合计'.padEnd(20), `${(total / 1024).toFixed(1)} KB`)
if (total > 120 * 1024) {
  console.error('超出品牌插画 120K 预算')
  process.exit(1)
}
