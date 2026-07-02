// 生成 TikTok 竖屏文字幻灯片视频 (1080x1920) —— Chrome 渲染 PNG + ffmpeg 合成 MP4
// 无需出镜。用法: node build-tiktok-video.mjs
import { execFile } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
const run = promisify(execFile);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR = new URL('./.tiktok/', import.meta.url);
const OUT = new URL('./images/tiktok/', import.meta.url);

// 每张: [文本HTML, 停留秒数]
const slides = [
  { dur: 3.0, bg:'#0b0b0f', accent:'#ff2442', kicker:'SINGAPORE RES EXAM', big:'3 numbers that<br>FAIL candidates', sub:'Save this before July 18' },
  { dur: 3.2, bg:'#12121a', accent:'#ff2442', kicker:'#1', big:'Foreigner ABSD<br><span style="color:#ff2442">= 60%</span>', sub:'Not 20. Not 30. Sixty.' },
  { dur: 3.2, bg:'#12121a', accent:'#37d67a', kicker:'#2', big:'Pass mark<br><span style="color:#37d67a">= 60%</span>', sub:'That 75%? Just class attendance — not the exam.' },
  { dur: 3.4, bg:'#12121a', accent:'#4aa3ff', kicker:'#3', big:'Loan stamp duty<br><span style="color:#4aa3ff">0.4%, cap $500</span>', sub:'Everyone forgets this one.' },
  { dur: 3.2, bg:'#0b0b0f', accent:'#ff2442', kicker:'FREE FLASHCARDS', big:'Comment<br>“RES” 👇', sub:'Full key-numbers set · Exam July 18 · Let\'s go' },
];

function tpl(s){return `<style>*{margin:0;box-sizing:border-box;font-family:-apple-system,'PingFang SC',Arial,sans-serif}
body{width:1080px;height:1920px;background:${s.bg};display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:120px}
.k{font-size:48px;color:${s.accent};font-weight:800;letter-spacing:6px;margin-bottom:70px}
.b{font-size:118px;color:#fff;font-weight:900;line-height:1.15}
.s{font-size:52px;color:#c9c9d2;font-weight:600;margin-top:80px;line-height:1.5;max-width:820px}
</style><body><div class="k">${s.kicker}</div><div class="b">${s.big}</div><div class="s">${s.sub}</div></body>`;}

await rm(DIR,{recursive:true,force:true}); await mkdir(DIR,{recursive:true}); await mkdir(OUT,{recursive:true});
const listLines=[];
for(let i=0;i<slides.length;i++){
  const n=String(i+1).padStart(2,'0');
  const hf=new URL(`s${n}.html`,DIR); await writeFile(hf, tpl(slides[i]));
  const png=new URL(`${n}.png`,OUT).pathname;
  await run(CHROME,['--headless=new','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1','--window-size=1080,1920',`--screenshot=${png}`,hf.pathname]);
  // ffmpeg concat 需要每张图对应时长
  listLines.push(`file '${png}'`); listLines.push(`duration ${slides[i].dur}`);
  process.stdout.write(`✓ ${n}.png `);
}
// concat demuxer 要求最后一张再列一次
listLines.push(`file '${new URL(`0${slides.length}.png`,OUT).pathname}'`);
const listFile=new URL('list.txt',DIR); await writeFile(listFile, listLines.join('\n'));
const mp4=new URL('res-tiktok-1.mp4',OUT).pathname;
console.log('\n合成 MP4 ...');
await run('ffmpeg',['-y','-f','concat','-safe','0','-i',listFile.pathname,
  '-vf','fps=30,format=yuv420p,scale=1080:1920','-c:v','libx264','-preset','medium','-movflags','+faststart',mp4]);
await rm(DIR,{recursive:true,force:true});
console.log('DONE →', mp4);
