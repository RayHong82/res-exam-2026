// 生成小红书 9 张轮播图 (1080x1440 竖版) —— Chrome headless 截图
// 用法: node build-rednote-images.mjs  → 输出 images/rednote/01..09.png
import { execFile } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
const run = promisify(execFile);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('./images/rednote/', import.meta.url);
const TMP = new URL('./.tmp-slides/', import.meta.url);

const RED = '#ff2442', INK = '#1a1a1a', GREY = '#8a8a8a', BG = '#fff7f8';

const slides = [
  { type: 'cover', kicker: 'RES 考试', big: '倒计时 14 天', sub: '10 个必背核心数字 · 考前自测',
    foot: '对照 IRAS / MAS / HDB 官网核对 · 2026 现行' },
  { type: 'num', tag: '01 / 及格线', big: '60%', line: '不是 75%！', note: '75% 是「上课出勤率」，不是考试及格线' },
  { type: 'num', tag: '02 / LTV 贷款成数', big: '75 / 45 / 35', line: '银行首贷 / 二贷 / 三贷', note: 'HDB 贷款也是 75%（2024-08 由 80% 下调）' },
  { type: 'num', tag: '03 / 偿债比率', big: 'TDSR 55%', line: 'MSR 30%', note: 'MSR 只管组屋 & 向开发商买的 EC' },
  { type: 'num', tag: '04 / ABSD 额外买方印花税', big: '外国人 60%', line: '公民 0/20/30 · PR 5/30/35 · 实体 65%', note: '2023-04-27 起，2026 不变' },
  { type: 'num', tag: '05 / SSD 卖方印花税', big: '16/12/8/4%', line: '2025-07-04 后买入', note: '持有满 4 年才免；按售价与市值孰高' },
  { type: 'num', tag: '06 / 印花税速算', big: '$1.2m → $32,600', line: 'BSD 买方印花税', note: '⚠️ 按揭印花税 0.4%、上限 $500（超多人漏！）' },
  { type: 'num', tag: '07 / 组屋', big: 'MOP 5 年', line: '收入顶限 BTO $14,000 · EC $16,000', note: 'EHG 家庭最高 $120,000 · 二手房补贴合计约 $23 万' },
  { type: 'end', big: '你能背出几个？', sub: '评论区扣「1」\n领完整版《核心数字闪卡 + 模拟卷》',
    foot: '每天过一遍，比刷 100 道题还管用 💪' },
];

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>');}

function html(s){
  const base = `<style>*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,'PingFang SC','Hiragino Sans GB',sans-serif}
  body{width:1080px;height:1440px;background:${BG};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:90px;text-align:center}
  .kicker{font-size:52px;color:${RED};font-weight:800;letter-spacing:4px}
  .cover-big{font-size:150px;color:${INK};font-weight:900;margin:30px 0}
  .sub{font-size:56px;color:${INK};font-weight:600;line-height:1.5}
  .foot{position:absolute;bottom:70px;font-size:34px;color:${GREY};line-height:1.6;width:100%;left:0}
  .tag{font-size:46px;color:${RED};font-weight:800;margin-bottom:50px}
  .big{font-size:132px;color:${INK};font-weight:900;line-height:1.1}
  .line{font-size:58px;color:${INK};font-weight:700;margin-top:36px;line-height:1.4}
  .note{font-size:42px;color:${GREY};margin-top:60px;line-height:1.6;max-width:880px}
  .card{background:#fff;border-radius:48px;padding:110px 70px;box-shadow:0 30px 80px rgba(255,36,66,.10);width:100%;position:relative}
  .badge{position:absolute;top:-38px;left:50%;transform:translateX(-50%);background:${RED};color:#fff;font-size:34px;font-weight:800;padding:18px 44px;border-radius:100px;white-space:nowrap}
  .end-big{font-size:104px;color:${RED};font-weight:900}
  </style>`;
  if(s.type==='cover') return base+`<body><div class="kicker">${esc(s.kicker)}</div><div class="cover-big">${esc(s.big)}</div><div class="sub">${esc(s.sub)}</div><div class="foot">${esc(s.foot)}</div></body>`;
  if(s.type==='end') return base+`<body><div class="card"><div class="end-big">${esc(s.big)}</div><div class="sub" style="margin-top:50px">${esc(s.sub)}</div></div><div class="foot">${esc(s.foot)}</div></body>`;
  return base+`<body><div class="card"><div class="badge">${esc(s.tag)}</div><div class="big">${esc(s.big)}</div><div class="line">${esc(s.line)}</div><div class="note">${esc(s.note)}</div></div></body>`;
}

await rm(TMP,{recursive:true,force:true}); await mkdir(TMP,{recursive:true}); await mkdir(OUT,{recursive:true});
for(let i=0;i<slides.length;i++){
  const n=String(i+1).padStart(2,'0');
  const f=new URL(`s${n}.html`,TMP);
  await writeFile(f, html(slides[i]));
  await run(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1',
    `--window-size=1080,1440`,`--screenshot=${new URL(`${n}.png`,OUT).pathname}`,f.pathname]);
  process.stdout.write(`✓ ${n}.png  `);
}
await rm(TMP,{recursive:true,force:true});
console.log('\nDONE → social-posts/images/rednote/');
