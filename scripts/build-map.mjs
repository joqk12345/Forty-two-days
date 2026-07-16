#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const dataDir = path.join(root, "maps", "data");
const outputDir = path.join(root, "maps", "output");
const sourceLake = process.argv[2];
const simplifiedLakePath = path.join(dataDir, "poyang-modern-simplified.geojson");

fs.mkdirSync(outputDir, { recursive: true });

function sqSegDist(p, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0]; y = b[1];
    } else if (t > 0) {
      x += dx * t; y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

function simplify(points, tolerance = 0.004) {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let max = sqTolerance;
    let index = 0;
    for (let i = first + 1; i < last; i += 1) {
      const distance = sqSegDist(points[i], points[first], points[last]);
      if (distance > max) {
        index = i;
        max = distance;
      }
    }
    if (index) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function normalizeLake(raw) {
  const geometry = raw.type === "FeatureCollection" ? raw.features[0].geometry
    : raw.type === "Feature" ? raw.geometry : raw;
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const simplified = polygons.map((polygon) => polygon.map((ring) => simplify(ring)));
  return {
    type: "Feature",
    properties: {
      name: "鄱阳湖（现代岸线参照）",
      source: "OpenStreetMap/Nominatim",
      license: "ODbL 1.0",
      simplification: "Ramer-Douglas-Peucker, tolerance 0.004 degrees"
    },
    geometry: { type: "MultiPolygon", coordinates: simplified }
  };
}

if (sourceLake) {
  const raw = JSON.parse(fs.readFileSync(path.resolve(sourceLake), "utf8"));
  fs.writeFileSync(simplifiedLakePath, `${JSON.stringify(normalizeLake(raw))}\n`);
}

if (!fs.existsSync(simplifiedLakePath)) {
  throw new Error("缺少 maps/data/poyang-modern-simplified.geojson；首次运行请传入 Nominatim GeoJSON。 ");
}

const mapData = JSON.parse(fs.readFileSync(path.join(dataDir, "campaign-map-data.json"), "utf8"));
const lake = JSON.parse(fs.readFileSync(simplifiedLakePath, "utf8"));

const page = { width: 1400, height: 1980 };
const regionalBox = { x: 72, y: 230, width: 1256, height: 870 };
const detailBox = { x: 72, y: 1182, width: 804, height: 650 };
const notesBox = { x: 916, y: 1182, width: 412, height: 650 };

function projector(bounds, box) {
  const [minLon, minLat, maxLon, maxLat] = bounds;
  const meanLat = ((minLat + maxLat) / 2) * Math.PI / 180;
  const lonScale = Math.cos(meanLat);
  const dataWidth = (maxLon - minLon) * lonScale;
  const dataHeight = maxLat - minLat;
  const scale = Math.min(box.width / dataWidth, box.height / dataHeight);
  const usedWidth = dataWidth * scale;
  const usedHeight = dataHeight * scale;
  const ox = box.x + (box.width - usedWidth) / 2;
  const oy = box.y + (box.height - usedHeight) / 2;
  return ([lon, lat]) => [
    ox + (lon - minLon) * lonScale * scale,
    oy + (maxLat - lat) * scale
  ];
}

const regionalProject = projector(mapData.regionalBounds, regionalBox);
const detailProject = projector(mapData.detailBounds, detailBox);

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function pathFromPoints(points, project, close = false) {
  if (!points.length) return "";
  const out = points.map((point, i) => {
    const [x, y] = project(point);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return close ? `${out} Z` : out;
}

function lakePaths(project) {
  return lake.geometry.coordinates.map((polygon) => {
    return polygon.map((ring) => pathFromPoints(ring, project, true)).join(" ");
  }).join(" ");
}

function ellipse(area, project) {
  const [cx, cy] = project(area.center);
  const [rxPoint] = project([area.center[0] + area.radius[0], area.center[1]]);
  const [, ryPoint] = project([area.center[0], area.center[1] + area.radius[1]]);
  return { cx, cy, rx: Math.abs(rxPoint - cx), ry: Math.abs(ryPoint - cy) };
}

function pointMarker(place, project, detail = false) {
  const [x, y] = project([place.lon, place.lat]);
  const classes = `place ${place.kind} ${place.confidence}`;
  const labelClass = detail ? "place-label detail-label" : "place-label";
  const labelPositions = {
    qiaoshe: [-16, -18, "end"],
    nanchang: [16, 32, "start"],
    wucheng: [14, 31, "start"],
    nankang: [18, 34, "start"],
    jiujiang: [-20, -16, "end"],
    hukou: [20, -8, "start"],
    fengcheng: [15, -12, "start"],
    zhangshu: [14, 30, "start"],
    raozhou: [16, -12, "start"],
    anqing: [16, -12, "start"]
  };
  const [dx, dy, anchor] = labelPositions[place.id] || [14, -10, "start"];
  return `<g class="${classes}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/><text class="${labelClass}" x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${esc(place.name)}</text></g>`;
}

const regionalPlaces = mapData.places.filter((p) => !["excluded"].includes(p.kind));
const detailPlaces = mapData.places.filter((p) => ["nanchang", "qiaoshe"].includes(p.id));
const huang = mapData.areas.find((a) => a.id === "huangjiadu");
const qiaoshe = mapData.areas.find((a) => a.id === "qiaoshe-battle");
const ruanzi = mapData.areas.find((a) => a.id === "ruanzijiang");
const hE = ellipse(huang, detailProject);
const qE = ellipse(qiaoshe, detailProject);
const rE = ellipse(ruanzi, regionalProject);
const [b1x, b1y] = detailProject(mapData.battleSequence[1].from);
const [b2x, b2y] = detailProject(mapData.battleSequence[1].to);

const routeSvg = mapData.routes.map((route) => {
  return `<path class="route ${route.kind}" d="${pathFromPoints(route.points, regionalProject)}" marker-end="url(#arrow-${route.kind})"/>`;
}).join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(mapData.title)}</title>
  <desc id="desc">宁王之乱战役路线、可定位地点及黄家渡、八字脑、阮子江的不确定性分层地图。</desc>
  <defs>
    <pattern id="range-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="12" stroke="#a45a3a" stroke-width="3" opacity=".28"/></pattern>
    <pattern id="hypothesis-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="14" stroke="#826d91" stroke-width="3" opacity=".24"/></pattern>
    <marker id="arrow-rebel" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#9d3b2e"/></marker>
    <marker id="arrow-return" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#c0603d"/></marker>
    <marker id="arrow-government" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#315f73"/></marker>
    <marker id="arrow-sequence" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#8f755e"/></marker>
    <style><![CDATA[
      svg{background:#f5f0e5;color:#26231e;font-family:"Noto Serif CJK SC","Source Han Serif SC","Songti SC",serif}
      .frame{fill:#f8f4ea;stroke:#aa9d86;stroke-width:1.5}
      .grid{stroke:#c8bdab;stroke-width:1;stroke-dasharray:4 8;opacity:.45}
      .lake{fill:#c8dde0;stroke:#78a2a9;stroke-width:1.3;fill-rule:evenodd}
      .route{fill:none;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
      .route.rebel{stroke:#9d3b2e}.route.return{stroke:#c0603d;stroke-dasharray:16 10}.route.government{stroke:#315f73}
      .place circle{fill:#f8f4ea;stroke:#332d27;stroke-width:3}.place.battle circle{fill:#9d3b2e}.place.siege circle{fill:#9d3b2e}.place.assembly circle{fill:#315f73}
      .place-label{font-size:24px;font-weight:650;paint-order:stroke;stroke:#f8f4ea;stroke-width:7;stroke-linejoin:round}.detail-label{font-size:27px}
      .range{fill:url(#range-hatch);stroke:#a45a3a;stroke-width:3;stroke-dasharray:9 7}.hypothesis{fill:url(#hypothesis-hatch);stroke:#826d91;stroke-width:3;stroke-dasharray:4 8}
      .sequence{fill:none;stroke:#8f755e;stroke-width:4;stroke-dasharray:8 7}
      .battle-number{fill:#9d3b2e;stroke:#f8f4ea;stroke-width:4}.battle-number-text{fill:white;font-family:system-ui,sans-serif;font-size:20px;font-weight:800;text-anchor:middle;dominant-baseline:central}
      .small{font-size:20px}.tiny{font-size:17px}.muted{fill:#6f6659}.panel-title{font-size:28px;font-weight:700;letter-spacing:.08em}.legend-line{stroke-width:6}
    ]]></style>
  </defs>

  <rect width="1400" height="1980" fill="#f5f0e5"/>
  <text x="72" y="92" font-size="52" font-weight="750" letter-spacing=".04em">${esc(mapData.title)}</text>
  <text x="74" y="142" font-size="25" fill="#655c50">${esc(mapData.subtitle)}</text>
  <line x1="72" y1="178" x2="1328" y2="178" stroke="#51483d" stroke-width="2"/>

  <text class="panel-title" x="72" y="214">一　区域战役路线</text>
  <rect class="frame" x="${regionalBox.x}" y="${regionalBox.y}" width="${regionalBox.width}" height="${regionalBox.height}"/>
  <svg x="${regionalBox.x}" y="${regionalBox.y}" width="${regionalBox.width}" height="${regionalBox.height}" viewBox="0 0 ${regionalBox.width} ${regionalBox.height}" overflow="hidden">
    <rect width="${regionalBox.width}" height="${regionalBox.height}" fill="#f8f4ea"/>
    <g transform="translate(-${regionalBox.x} -${regionalBox.y})">
      <path class="lake" d="${lakePaths(regionalProject)}"/>
      <ellipse class="hypothesis" cx="${rE.cx.toFixed(1)}" cy="${rE.cy.toFixed(1)}" rx="${rE.rx.toFixed(1)}" ry="${rE.ry.toFixed(1)}"/>
      ${routeSvg}
      ${regionalPlaces.map((place) => pointMarker(place, regionalProject)).join("\n")}
      <text class="small muted" x="${(rE.cx - 24).toFixed(1)}" y="${(rE.cy - 6).toFixed(1)}" text-anchor="end">阮子江？</text>
      <text class="tiny muted" x="${(rE.cx - 24).toFixed(1)}" y="${(rE.cy + 19).toFixed(1)}" text-anchor="end">“罂子口”异文候选区</text>
    </g>
  </svg>
  <text class="tiny muted" x="96" y="270">实线红：宁王军东下　　虚线红：解安庆后回师　　蓝线：王守仁军北上攻南昌</text>

  <text class="panel-title" x="72" y="1165">二　南昌—樵舍战区详图</text>
  <rect class="frame" x="${detailBox.x}" y="${detailBox.y}" width="${detailBox.width}" height="${detailBox.height}"/>
  <svg x="${detailBox.x}" y="${detailBox.y}" width="${detailBox.width}" height="${detailBox.height}" viewBox="0 0 ${detailBox.width} ${detailBox.height}" overflow="hidden">
    <rect width="${detailBox.width}" height="${detailBox.height}" fill="#f8f4ea"/>
    <g transform="translate(-${detailBox.x} -${detailBox.y})">
      <path class="lake" d="${lakePaths(detailProject)}"/>
      <ellipse class="range" cx="${hE.cx.toFixed(1)}" cy="${hE.cy.toFixed(1)}" rx="${hE.rx.toFixed(1)}" ry="${hE.ry.toFixed(1)}"/>
      <ellipse class="range" cx="${qE.cx.toFixed(1)}" cy="${qE.cy.toFixed(1)}" rx="${qE.rx.toFixed(1)}" ry="${qE.ry.toFixed(1)}"/>
      <path class="sequence" d="M${b1x.toFixed(1)},${b1y.toFixed(1)} Q${((b1x+b2x)/2+36).toFixed(1)},${((b1y+b2y)/2).toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}" marker-end="url(#arrow-sequence)"/>
      ${detailPlaces.map((place) => pointMarker(place, detailProject, true)).join("\n")}
      <circle class="battle-number" cx="${hE.cx.toFixed(1)}" cy="${hE.cy.toFixed(1)}" r="17"/><text class="battle-number-text" x="${hE.cx.toFixed(1)}" y="${hE.cy.toFixed(1)}">1</text>
      <circle class="battle-number" cx="${((b1x+b2x)/2+24).toFixed(1)}" cy="${((b1y+b2y)/2-12).toFixed(1)}" r="17"/><text class="battle-number-text" x="${((b1x+b2x)/2+24).toFixed(1)}" y="${((b1y+b2y)/2-12).toFixed(1)}">2</text>
      <circle class="battle-number" cx="${qE.cx.toFixed(1)}" cy="${qE.cy.toFixed(1)}" r="17"/><text class="battle-number-text" x="${qE.cx.toFixed(1)}" y="${qE.cy.toFixed(1)}">3</text>
      <text class="small" x="${(hE.cx+26).toFixed(1)}" y="${(hE.cy+7).toFixed(1)}">黄家渡范围</text>
      <text class="small" x="${((b1x+b2x)/2+50).toFixed(1)}" y="${((b1y+b2y)/2-5).toFixed(1)}">八字脑：只示次序</text>
      <text class="small" x="${(qE.cx+28).toFixed(1)}" y="${(qE.cy+7).toFixed(1)}">樵舍战场水域未定</text>
    </g>
  </svg>
  <text class="tiny muted" x="88" y="1802">斜线范围表示史料检索区或战场可能水域，不表示现代行政边界。</text>

  <rect class="frame" x="${notesBox.x}" y="${notesBox.y}" width="${notesBox.width}" height="${notesBox.height}"/>
  <text class="panel-title" x="944" y="1230">定位等级</text>
  <circle cx="955" cy="1280" r="7" fill="#f8f4ea" stroke="#332d27" stroke-width="3"/><text class="small" x="980" y="1287">实点：CHGIS 坐标</text>
  <rect x="944" y="1318" width="24" height="24" fill="url(#range-hatch)" stroke="#a45a3a" stroke-width="2"/><text class="small" x="980" y="1338">斜线：范围定位</text>
  <rect x="944" y="1368" width="24" height="24" fill="url(#hypothesis-hatch)" stroke="#826d91" stroke-width="2"/><text class="small" x="980" y="1388">紫线：异文假说</text>
  <text class="panel-title" x="944" y="1454">三场战斗</text>
  <text class="small" x="944" y="1500">1　七月二十四　黄家渡</text>
  <text class="small" x="944" y="1542">2　败后退保　　八字脑</text>
  <text class="small" x="944" y="1584">3　二十五至二十六　樵舍</text>
  <text class="panel-title" x="944" y="1652">制图边界</text>
  <text class="tiny muted" x="944" y="1690"><tspan x="944" dy="0">黄家渡：南昌府东三十里、通余干，</tspan><tspan x="944" dy="25">不对应任何未经证实的现代同名村。</tspan><tspan x="944" dy="32">八字脑：同名与路线冲突，故不落点。</tspan><tspan x="944" dy="32">樵舍：镇名可定位，古河槽与火攻水面</tspan><tspan x="944" dy="25">仍不能精确到坐标。</tspan></text>

  <line x1="72" y1="1880" x2="1328" y2="1880" stroke="#8c806f" stroke-width="1.5"/>
  <text class="tiny muted" x="72" y="1915">历史地名与坐标：CHGIS（复旦大学—哈佛大学）；战役次序：《擒获宸濠捷音疏》；方位：《读史方舆纪要》。</text>
  <text class="tiny muted" x="72" y="1943">现代湖岸参照：© OpenStreetMap contributors，ODbL 1.0。现代岸线仅作空间参照，不代表1519年湖岸。</text>
  <text class="tiny muted" x="1328" y="1943" text-anchor="end">制图：42天项目｜2026-07-16｜WGS84</text>
</svg>`;

fs.writeFileSync(path.join(outputDir, "42-days-campaign-map.svg"), svg);
console.log(`已生成 ${path.relative(root, path.join(outputDir, "42-days-campaign-map.svg"))}`);
