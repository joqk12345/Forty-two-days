# 《42天》出版地图说明

## 交付文件

- `output/42-days-campaign-map.svg`：出版主文件，可无损缩放和继续编辑。
- `output/42-days-campaign-map.pdf`：印前交换文件。
- `output/42-days-campaign-map.png`：4200像素宽预览图。
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

## 坐标与来源

坐标系为 WGS84。历史地点主要来自复旦大学—哈佛大学 CHGIS 时空地名辞典；战役次序来自王守仁《擒获宸濠捷音疏》；黄家渡相对方位来自《读史方舆纪要》。现代湖岸来自 OpenStreetMap/Nominatim，遵循 ODbL 1.0，署名已写入图面。

CHGIS 对樵舍给出同一坐标：1820年 `hvd_19231`、1911年 `hvd_140402`，即 `115.97886, 28.85644`。CHGIS 对黄家渡、八字脑、阮子江没有检索结果，现代开放地名数据也没有给出可与战役链可靠对应的同名点。

## 重建

已有简化湖岸数据时：

```bash
node scripts/build-map.mjs
rsvg-convert -f pdf -o maps/output/42-days-campaign-map.pdf maps/output/42-days-campaign-map.svg
rsvg-convert -w 4200 -o maps/output/42-days-campaign-map.png maps/output/42-days-campaign-map.svg
```

首次更新现代湖岸时，把 Nominatim 返回的 GeoJSON 作为参数：

```bash
node scripts/build-map.mjs /path/to/poyang.geojson
```

