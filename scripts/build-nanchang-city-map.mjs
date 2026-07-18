#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const outputDir = path.join(root, "maps", "output");
fs.mkdirSync(outputDir, { recursive: true });

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1980" viewBox="0 0 1400 1980" role="img" aria-labelledby="title desc">
  <title id="title">正德十四年南昌城：王府夜宴与七门攻城</title>
  <desc id="desc">南昌城叙事空间示意图，标示七门、宁王府示意位置、城内三湖和水关，以及王守仁军七门攻城的方向。图例区分史料硬锚点与示意元素。</desc>
  <defs>
    <marker id="attack-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#9d3b2e"/></marker>
    <marker id="callout-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#8d795d"/></marker>
    <pattern id="water-hatch" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="11" stroke="#5f929a" stroke-width="2" opacity=".25"/></pattern>
    <style><![CDATA[
      svg{background:#f5f0e5;color:#29251f;font-family:"Noto Serif CJK SC","Source Han Serif SC","Songti SC",serif}.frame{fill:#faf6ec;stroke:#a99b84;stroke-width:1.5}.wall{fill:#e8dfcf;stroke:#4e463b;stroke-width:9;stroke-linejoin:round}.moat{fill:none;stroke:#7aa7ae;stroke-width:17;opacity:.55;stroke-linejoin:round}.water{fill:#c9e0e1;stroke:#60969d;stroke-width:3}.water-hatch{fill:url(#water-hatch);stroke:#60969d;stroke-width:3}.road{fill:none;stroke:#c2b69e;stroke-width:8;stroke-linecap:round}.gate-line{stroke:#f5f0e5;stroke-width:20}.gate{fill:#4e463b}.gate-label{font-size:29px;font-weight:700;paint-order:stroke;stroke:#faf6ec;stroke-width:8;stroke-linejoin:round}.minor{font-size:22px;fill:#635a4e}.small{font-size:20px}.tiny{font-size:17px}.panel-title{font-size:27px;font-weight:700;letter-spacing:.08em}.attack{fill:none;stroke:#9d3b2e;stroke-width:7;stroke-linecap:round;marker-end:url(#attack-arrow)}.attack-label{font-size:22px;font-weight:700;fill:#8a3429;paint-order:stroke;stroke:#faf6ec;stroke-width:7;stroke-linejoin:round}.palace{fill:#d6a856;stroke:#725a2c;stroke-width:4}.palace-roof{fill:#8b4331}.callout{fill:none;stroke:#8d795d;stroke-width:3;stroke-dasharray:7 7;marker-end:url(#callout-arrow)}.note{font-size:20px;fill:#544b40}.legend{font-size:21px}.north{font-family:system-ui,sans-serif;font-size:20px;font-weight:800}.number{fill:#9d3b2e;stroke:#faf6ec;stroke-width:4}.number-text{fill:white;font-family:system-ui,sans-serif;font-size:18px;font-weight:800;text-anchor:middle;dominant-baseline:central}
    ]]></style>
  </defs>
  <rect width="1400" height="1980" fill="#f5f0e5"/>
  <text x="72" y="92" font-size="51" font-weight="750" letter-spacing=".04em">正德十四年南昌城：王府夜宴与七门攻城</text>
  <text x="74" y="140" font-size="24" fill="#655c50">叙事空间示意图｜城门与攻城分工可核；王府位置、街巷与水面仅示关系，不作精确复原</text>
  <line x1="72" y1="176" x2="1328" y2="176" stroke="#51483d" stroke-width="2"/>
  <rect class="frame" x="72" y="214" width="900" height="1282"/><text class="panel-title" x="96" y="258">城内空间与攻城方向</text>
  <path class="moat" d="M226,395 L440,316 L674,316 L865,414 L912,620 L888,992 L754,1248 L494,1353 L241,1242 L125,1004 L129,699 Z"/>
  <path class="wall" d="M252,421 L446,345 L665,345 L836,433 L879,633 L854,974 L730,1215 L501,1318 L270,1214 L158,988 L162,707 Z"/>
  <path class="water" d="M450,448 C515,400 624,410 671,479 C702,526 672,594 599,612 C518,629 435,592 422,535 C413,494 426,468 450,448 Z"/><text class="minor" x="548" y="521" text-anchor="middle">北湖</text>
  <path class="water" d="M277,742 C350,690 471,704 507,777 C533,829 491,904 414,922 C331,941 250,894 244,829 C240,791 253,761 277,742 Z"/><text class="minor" x="378" y="821" text-anchor="middle">西湖</text>
  <path class="water" d="M601,775 C673,728 781,748 808,813 C831,865 785,932 713,941 C640,950 575,900 578,842 C579,812 586,790 601,775 Z"/><text class="minor" x="696" y="853" text-anchor="middle">东湖</text>
  <path class="water-hatch" d="M458,1119 C538,1088 657,1098 724,1150 L700,1200 C619,1173 537,1175 466,1198 Z"/><text class="small" x="588" y="1158" text-anchor="middle">城内水路—水关（示意）</text>
  <path class="road" d="M510,395 C520,570 537,710 546,1118"/><path class="road" d="M226,810 C411,805 615,815 850,812"/><path class="road" d="M350,1100 C468,1000 633,960 774,900"/><path class="road" d="M706,493 C650,620 664,690 739,768"/>
  <g transform="translate(585 647)"><rect class="palace" x="0" y="0" width="170" height="120" rx="5"/><path class="palace-roof" d="M-13,28 L85,-24 L183,28 Z"/><path class="palace-roof" d="M18,82 L85,42 L152,82 Z"/><rect fill="#f8e3a4" x="30" y="41" width="20" height="42"/><rect fill="#f8e3a4" x="119" y="41" width="20" height="42"/></g>
  <text class="gate-label" x="670" y="800" text-anchor="middle">宁王府</text><text class="small" x="670" y="830" text-anchor="middle">城内位置示意</text><path class="callout" d="M762,680 C825,618 848,555 842,480"/><text class="note" x="735" y="470">第1天：生日夜宴</text><text class="tiny" x="735" y="496">六月十三日“如例张宴”</text>
  <g><line class="gate-line" x1="545" y1="335" x2="565" y2="355"/><circle class="gate" cx="555" cy="345" r="12"/><text class="gate-label" x="555" y="300" text-anchor="middle">德胜门</text><text class="small" x="555" y="326" text-anchor="middle">李美</text></g>
  <g><line class="gate-line" x1="837" y1="506" x2="862" y2="520"/><circle class="gate" cx="850" cy="513" r="12"/><text class="gate-label" x="900" y="530">永和门</text><text class="small" x="900" y="556">戴德孺</text></g>
  <g><line class="gate-line" x1="866" y1="786" x2="888" y2="786"/><circle class="gate" cx="877" cy="786" r="12"/><text class="gate-label" x="898" y="755">顺化门</text><text class="small" x="898" y="781">邢珣</text></g>
  <g><line class="gate-line" x1="795" y1="1119" x2="810" y2="1143"/><circle class="gate" cx="802" cy="1131" r="12"/><text class="gate-label" x="846" y="1161">进贤门</text><text class="small" x="846" y="1187">余恩</text></g>
  <g><line class="gate-line" x1="579" y1="1284" x2="597" y2="1310"/><circle class="gate" cx="588" cy="1297" r="12"/><text class="gate-label" x="620" y="1362">惠民门</text><text class="small" x="620" y="1388">徐琏</text></g>
  <g><line class="gate-line" x1="359" y1="1264" x2="376" y2="1288"/><circle class="gate" cx="367" cy="1276" r="12"/><text class="gate-label" x="300" y="1350" text-anchor="middle">广润门</text><text class="small" x="300" y="1376" text-anchor="middle">伍文定</text></g>
  <g><line class="gate-line" x1="150" y1="860" x2="172" y2="860"/><circle class="gate" cx="161" cy="860" r="12"/><text class="gate-label" x="202" y="830">章江门</text><text class="small" x="202" y="856">胡尧元、童琦</text></g>
  <path class="attack" d="M552,225 L555,280"/><path class="attack" d="M954,430 L884,470"/><path class="attack" d="M958,788 L895,788"/><path class="attack" d="M902,1238 L813,1145"/><path class="attack" d="M684,1425 L602,1320"/><path class="attack" d="M212,1421 L350,1296"/><path class="attack" d="M84,860 L144,860"/><text class="attack-label" x="555" y="210" text-anchor="middle">七门并攻</text>
  <g transform="translate(914 291)"><path d="M0,58 L18,0 L36,58 L18,44 Z" fill="#4e463b"/><line x1="18" y1="58" x2="18" y2="106" stroke="#4e463b" stroke-width="4"/><text class="north" x="18" y="130" text-anchor="middle">北</text></g>
  <rect class="frame" x="1004" y="214" width="324" height="1282"/><text class="panel-title" x="1032" y="258">读图说明</text>
  <text class="legend" x="1032" y="310">同一座城，两个阶段</text><circle class="number" cx="1045" cy="354" r="15"/><text class="number-text" x="1045" y="354">1</text><text class="small" x="1072" y="361">第1天：王府夜宴</text><text class="tiny" x="1032" y="391"><tspan x="1032" dy="0">六月十三日，三司官入府</tspan><tspan x="1032" dy="24">贺生日，“如例张宴”。</tspan></text>
  <circle class="number" cx="1045" cy="447" r="15"/><text class="number-text" x="1045" y="447">2</text><text class="small" x="1072" y="454">第20天：七门攻城</text><text class="tiny" x="1032" y="484"><tspan x="1032" dy="0">七月二十日黎明，各军以</tspan><tspan x="1032" dy="24">梯绳附城；城破后封府库、</tspan><tspan x="1032" dy="24">收印信。</tspan></text>
  <text class="panel-title" x="1032" y="590">图例与精度</text><line x1="1032" y1="630" x2="1066" y2="630" stroke="#4e463b" stroke-width="9"/><text class="small" x="1080" y="637">城墙与七门：可核</text><path d="M1032,671 L1067,671" class="attack"/><text class="small" x="1080" y="678">红箭：七门主攻方向</text><rect x="1032" y="708" width="34" height="20" class="water-hatch"/><text class="small" x="1080" y="726">三湖、水关：关系示意</text><rect x="1032" y="752" width="34" height="22" class="palace"/><text class="small" x="1080" y="770">王府：城内示意位置</text>
  <text class="tiny" x="1032" y="816"><tspan x="1032" dy="0">不表示王府院落、城门、</tspan><tspan x="1032" dy="24">街巷、城濠或攻击集结点</tspan><tspan x="1032" dy="24">的精确比例和坐标。</tspan></text>
  <text class="panel-title" x="1032" y="926">叙事作用</text><text class="tiny" x="1032" y="968"><tspan x="1032" dy="0">夜宴发生在王府的礼制</tspan><tspan x="1032" dy="24">中心；起兵后，城门、</tspan><tspan x="1032" dy="24">水路、府库和街巷成为</tspan><tspan x="1032" dy="24">控制全城的机制。</tspan><tspan x="1032" dy="32">七门同时受压，令守军</tspan><tspan x="1032" dy="24">无法把有限兵力只守住</tspan><tspan x="1032" dy="24">一处王府或一个城门。</tspan></text>
  <text class="panel-title" x="1032" y="1178">写作提示</text><text class="tiny" x="1032" y="1220"><tspan x="1032" dy="0">府城：两县分辖，赣江节点</tspan><tspan x="1032" dy="24">城门：军令、梯绳、旗号</tspan><tspan x="1032" dy="24">城内水：灭火、排水、绕行</tspan><tspan x="1032" dy="24">王府：宴礼、文书、府库</tspan><tspan x="1032" dy="32">内河转运，不作海港或</tspan><tspan x="1032" dy="24">直达珠江水路来写。</tspan></text>
  <line x1="72" y1="1554" x2="1328" y2="1554" stroke="#8c806f" stroke-width="1.5"/><text x="72" y="1604" font-size="32" font-weight="700">图例说明</text>
  <text class="note" x="72" y="1650"><tspan x="72" dy="0">七门名称、攻城分工与梯绳登城：王守仁《江西捷音疏》《擒获宸濠捷音疏》；南昌城七门、城濠、三湖与水关：后出《南昌县志》及《古今图书集成》所载城池志。</tspan><tspan x="72" dy="32">宁王府在城内、六月十三日生日宴、王府乐人及起兵后收库藏：〈明武宗实录〉正德十四年六月十四日条。王府绘于城内仅为叙事关系示意，不主张具体院址。</tspan><tspan x="72" dy="32">本图只帮助理解“夜宴—起兵—夺城”的共同空间：王府不能替代城防，七门强攻才是攻复南昌的决定性机制。</tspan></text>
  <text class="tiny" x="72" y="1780">资料与边界：source-ledger/nanchang-assault.md、battle-geography.md、material-world-1519.md、nanchang-1519-institutions.md。</text><text class="tiny" x="1328" y="1780" text-anchor="end">《四十二天》项目｜示意图｜2026-07-18</text>
</svg>`;

const output = path.join(outputDir, "nanchang-city-1519.svg");
fs.writeFileSync(output, svg);
console.log(`已生成 ${path.relative(root, output)}`);
