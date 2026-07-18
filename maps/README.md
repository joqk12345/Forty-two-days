# 《42天》出版地图说明

## 交付文件

- `output/42-days-campaign-map.svg`：出版主文件，可无损缩放和继续编辑。
- `output/42-days-campaign-map.pdf`：印前交换文件。
- `output/42-days-campaign-map.png`：4200像素宽预览图。
- `output/nanchang-city-1519.svg`：南昌城叙事空间图主文件，标示七门、三湖、水关、王府示意位置与攻城方向。
- `output/nanchang-city-1519.pdf`：南昌城图印前交换文件。
- `output/nanchang-city-1519.png`：南昌城图预览图。
- `output/anqing-defense-1519.svg`：安庆守城战术图主文件，标示云楼、天梯、填堑与守军的守御动作。
- `output/anqing-defense-1519.pdf`：安庆守城图印前交换文件。
- `output/anqing-defense-1519.png`：安庆守城图预览图。
- `data/campaign-map-data.json`：地点、路线、范围和证据等级数据。
- `data/poyang-modern-simplified.geojson`：经简化的现代鄱阳湖岸线参照。

## 地图表达原则

这是一张“证据精确地图”，不是把所有史名强行钉到现代坐标上的示意图。

- 南昌、丰城、樟树、樵舍、吴城、南康、九江、湖口、饶州、安庆采用 CHGIS 坐标。
- 黄家渡按“南昌府东三十里、通余干”画史料检索范围，不使用现代同名村点位。
- 八字脑只画在“黄家渡败后退保、继而再退樵舍”的战役次序中，不落现代坐标。
- 樵舍镇名可精确定位，但古驿、古河槽和火攻水面仍画为范围。
- 阮子江保留奏疏原名；地图上的紫色范围只表示后出异文“罂子口”的候选解释，不表示二者已经等同。
- 现代鄱阳湖岸线只作读图参照。五百年来河湖变化显著，不可把现代岸线理解为正德十四年原貌。

## 南昌城图表达原则

南昌城图服务于第1天王府夜宴与第18—23天七门攻城的共同叙事空间。它不是按现代坐标或考古平面复原的城图。

- 七门名称、七门分攻、三湖与水关有文献或方志依据。
- 王府确在城内；图上位置、院落轮廓、街巷和水面形状只表达相互关系，不主张精确院址。
- 红色箭头只表达七门附城的攻势方向，不表示各军精确集结点、梯绳位置或射程。
- 图例明确标出上述边界，避免把示意图误读为1519年测绘图。

## 安庆守城图表达原则

安庆守城图服务于安庆围城段落，解释攻守双方如何围绕城防、壕堑、攻具与民力拉锯，不作城池复原图。

- 云楼、天梯、填堑、飞楼、夜缒焚楼、浸油点燃苇束、投石沸汤、民夫运石、南昌告急后的解围都有史料依据。
- 城垣方位、门楼、壕堑宽度、军营位置、攻具数量与动作时序均为关系示意，不主张精确复原。
- “浸油点燃苇束”不得简化成“泼火油”；未获直接依据前，不画炮击裂墙或秘密地道。

## 坐标与来源

坐标系为 WGS84。历史地点主要来自复旦大学—哈佛大学 CHGIS 时空地名辞典；战役次序来自王守仁《擒获宸濠捷音疏》；黄家渡相对方位来自《读史方舆纪要》。现代湖岸来自 OpenStreetMap/Nominatim，遵循 ODbL 1.0，署名已写入图面。

CHGIS 对樵舍给出同一坐标：1820年 `hvd_19231`、1911年 `hvd_140402`，即 `115.97886, 28.85644`。CHGIS 对黄家渡、八字脑、阮子江没有检索结果，现代开放地名数据也没有给出可与战役链可靠对应的同名点。

## 重建

已有简化湖岸数据时：

```bash
node scripts/build-map.mjs
node scripts/build-nanchang-city-map.mjs
node scripts/build-anqing-defense-map.mjs
rsvg-convert -f pdf -o maps/output/42-days-campaign-map.pdf maps/output/42-days-campaign-map.svg
rsvg-convert -w 4200 -o maps/output/42-days-campaign-map.png maps/output/42-days-campaign-map.svg
rsvg-convert -f pdf -o maps/output/nanchang-city-1519.pdf maps/output/nanchang-city-1519.svg
rsvg-convert -w 2800 -o maps/output/nanchang-city-1519.png maps/output/nanchang-city-1519.svg
rsvg-convert -f pdf -o maps/output/anqing-defense-1519.pdf maps/output/anqing-defense-1519.svg
rsvg-convert -w 2800 -o maps/output/anqing-defense-1519.png maps/output/anqing-defense-1519.svg
```

首次更新现代湖岸时，把 Nominatim 返回的 GeoJSON 作为参数：

```bash
node scripts/build-map.mjs /path/to/poyang.geojson
```
