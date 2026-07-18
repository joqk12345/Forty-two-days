# 《四十二天》

《42天》是一部以正德十四年宁王之乱为背景的历史小说。故事围绕王守仁在兵力、信息与名义均不占优势的情况下，如何通过传檄、疑兵、反间、反攻南昌和湖上决战，一步步压缩朱宸濠的选择空间。

本项目不是王阳明传奇爽文、心学语录拼贴或逐日历史复述。写作重点是局势因果、人物选择，以及心学如何落实为乱局中的行动与秩序。

## 当前状态

- 当前预出版版本：`0.3.0`。
- 42章正文完整，约11.6万字符。
- 第二稿已经完成结构去重、史实核验、称谓统一和全稿高频句式精修。
- 主因果链、主要人物弧线、人数与火船数字链已经通过连续性检查。
- 已生成含封面、南昌城图、安庆守城图和战役地图的 EPUB：`build/42-days.epub`。
- 已完成两轮核验：王守仁闻变地点与官职权限、宁王军水路、南昌七门攻城、安庆攻守，以及告变、捷报和献俘时间线；并补入王府宴礼/乐人/库藏、王府内官与厨役、南昌两县分辖与内河交通、战时粮运、夏旱与正文采用边界。

最近一轮正文精修还完成了第11/21章县印回响重构、第30章主题解释删减，以及第38章宫人、近侍与护卫人数连续性修复。

## “42天”的含义

史料常见说法是朱宸濠自举事至败历时四十余日或四十三日。“42天”是小说的叙事结构，以42个昼夜组织王守仁介入、判断、设局、调兵、反攻与决战，不是逐日史表，也不宣称每章事件精确发生在对应日期。

## 目录结构

```text
drafts/                         42章正文
epub/nanchang-city-map.md       EPUB 南昌城图前置页
epub/anqing-defense-map.md      EPUB 安庆守城图前置页
epub/campaign-map.md            EPUB 战役地图前置页
maps/                           地图数据、制图说明与SVG/PDF/PNG产物
source-ledger/                  高风险史实的来源卡与加工边界
review-memos/                   阶段性审读和修订记录
scripts/build-epub.sh           EPUB 构建脚本
scripts/build-nanchang-city-map.mjs  南昌城图构建脚本
scripts/build-anqing-defense-map.mjs 安庆守城图构建脚本
scripts/build-map.mjs           战役地图构建脚本
scripts/epub.css                EPUB 样式
build/42-days.epub              当前构建产物
VERSION                         当前预出版版本号
42-days-novel-plan.md           小说总体方案
42-days-detailed-outline.md     逐章详细大纲
42-days-character-bible.md      人物设定与信息权限
42-days-history-boundaries.md   硬史实、艺术加工与待查问题
42-days-style-guide.md          叙事与语言规范
42-days-project-rules.md        项目级写作规则
continuity-check.md             人物、物件、数字、路线连续性
```

## 构建 EPUB

构建依赖 [Pandoc](https://pandoc.org/)。确认 `pandoc` 可用后，在项目根目录运行：

```bash
./scripts/build-epub.sh
```

默认设置：

- 书名：`四十二天`
- 作者：`kai.qiao`
- 语言：`zh-CN`
- 版本：读取根目录 `VERSION`
- 正文：按文件名顺序读取 `drafts/chapter-*.md`
- 封面：使用根目录的 `cover.png`，缺失时构建失败
- 南昌城图：使用 `maps/output/nanchang-city-1519.png`，置于正文之前
- 安庆守城图：使用 `maps/output/anqing-defense-1519.png`，紧随南昌城图
- 战役地图：使用 `maps/output/42-days-campaign-map.png`，紧随安庆守城图
- 输出：`build/42-days.epub`

构建结束后脚本会检查 EPUB 清单和页面，确认封面图片、封面页、南昌城图页、安庆守城图页及战役地图页均已实际嵌入。

自定义示例：

```bash
./scripts/build-epub.sh \
  --author "作者名" \
  --title "四十二天" \
  --cover cover.png \
  --map maps/output/42-days-campaign-map.png \
  --output build/42-days.epub
```

查看所有参数：

```bash
./scripts/build-epub.sh --help
```

## 写作与修订原则

1. 局势问题先行：每章先有必须解决的问题，再给背景。
2. 史实证据先于顺口叙述：精确日期、数字、官职、路线和战术必须分级记录来源。
3. 条件跟着判断走：军事与政治判断要能追溯到消息、地图、口供、物资或天气。
4. 机制先于评价：写清王守仁如何抢名义、买时间、制造疑心和夺取根本，不直接宣告其“神机妙算”。
5. 普通人只知道其有渠道获知的信息；虚构人物可以见证历史，但不能改写历史结果。

详细规范见 `42-days-project-rules.md` 和 `42-days-style-guide.md`。

## 史实与艺术加工

关键史实的证据、采用结论和未证实细节记录在 `source-ledger/`。目前已有：

- 李士实、刘养正被俘及羁押结局。
- 正德十四年平叛与明武宗亲征时间线。
- 樵舍火攻、风向、火船规模与朱宸濠被擒过程。
- 黄家渡、八字脑、樵舍、阮子江的历史方位与现代定位边界。
- 杭州交俘、南京受俘、通州处刑及未果的午门献俘礼。
- 宁王府生日宴、乐人、服色、库藏、承奉与厨役的制度边界。
- 南昌府城的两县分辖、内河交通、河泊与渡口的采用边界。
- 正德十四年南昌夏旱、全江西战时粮运与战后库空的史料边界。

正文中的8条火船、12束火草、宁王金宝落入浅水等属于小说行动细节，不应作为史实引用。金宝名称有明代亲王制度依据，但现有材料未证实它随朱宸濠上船。正式出版前，在线古籍文本仍需与影印本或可靠点校本复核。

已制作三张出版地图：战役地图为 `maps/output/42-days-campaign-map.svg`（矢量主文件）、PDF及4200像素PNG，采用CHGIS坐标，并以范围或路线次序表达黄家渡、八字脑、阮子江的不确定性；南昌城图为 `maps/output/nanchang-city-1519.svg`，以示意布局说明王府夜宴与七门攻城的共同城市空间；安庆守城图为 `maps/output/anqing-defense-1519.svg`，说明云楼、天梯、填堑与守御动作。后两图均明确不作精确复原。

## 修订检查

改稿后至少执行以下检查：

```bash
git diff --check
./scripts/build-epub.sh
unzip -t build/42-days.epub
```

同时复核 `continuity-check.md` 中刘守绪四百人夜袭、8条火船、人物落点、物件流转和信息权限。

## 版本记录

当前版本为 `0.3.0`。项目变更见 [CHANGELOG.md](CHANGELOG.md)。
