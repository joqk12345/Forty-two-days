#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TITLE="四十二天"
AUTHOR="kai.qiao"
LANGUAGE="zh-CN"
DRAFT_DIR="$PROJECT_DIR/drafts"
OUTPUT="$PROJECT_DIR/build/42-days.epub"
VERSION_FILE="$PROJECT_DIR/VERSION"
CHANGELOG="$PROJECT_DIR/CHANGELOG.md"
MAP="$PROJECT_DIR/maps/output/42-days-campaign-map.png"
MAP_PAGE="$PROJECT_DIR/epub/campaign-map.md"
CITY_MAP="$PROJECT_DIR/maps/output/nanchang-city-1519.png"
CITY_MAP_PAGE="$PROJECT_DIR/epub/nanchang-city-map.md"
ANQING_MAP="$PROJECT_DIR/maps/output/anqing-defense-1519.png"
ANQING_MAP_PAGE="$PROJECT_DIR/epub/anqing-defense-map.md"
COVER=""
VERSION="0.0.0"
RELEASE_DATE=""

if [[ -f "$VERSION_FILE" ]]; then
  VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
fi

if [[ -f "$CHANGELOG" ]]; then
  RELEASE_DATE="$(sed -n "s/^## \[$VERSION\] - \([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]\)$/\1/p" "$CHANGELOG" | head -1)"
fi

if [[ -z "$RELEASE_DATE" ]]; then
  RELEASE_DATE="$(date +%F)"
fi

if [[ -f "$PROJECT_DIR/cover.png" ]]; then
  COVER="$PROJECT_DIR/cover.png"
fi

usage() {
  cat <<'EOF'
用法：scripts/build-epub.sh [选项]

将南昌城图、安庆守城图、战役地图和 drafts/chapter-*.md 按顺序合并为 EPUB，并嵌入封面。

选项：
  -o, --output FILE     输出文件（默认：build/42-days.epub）
  -t, --title TITLE     书名（默认：四十二天）
  -a, --author AUTHOR   作者名（默认：kai.qiao）
  -c, --cover FILE      封面图片（默认使用项目根目录的 cover.png）
  -m, --map FILE        战役地图（默认使用 maps/output/42-days-campaign-map.png）
      --lang LANG       语言标签（默认：zh-CN）
      --draft-dir DIR   正文章节目录（默认：drafts）
  -h, --help            显示帮助

示例：
  scripts/build-epub.sh
  scripts/build-epub.sh --author "作者名" --cover cover.jpg
  scripts/build-epub.sh --map maps/output/42-days-campaign-map.png
  scripts/build-epub.sh -o build/novel.epub -t "四十二天"
EOF
}

die() {
  echo "错误：$*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--output)
      [[ $# -ge 2 ]] || die "$1 缺少参数"
      OUTPUT="$2"
      shift 2
      ;;
    -t|--title)
      [[ $# -ge 2 ]] || die "$1 缺少参数"
      TITLE="$2"
      shift 2
      ;;
    -a|--author)
      [[ $# -ge 2 ]] || die "$1 缺少参数"
      AUTHOR="$2"
      shift 2
      ;;
    -c|--cover)
      [[ $# -ge 2 ]] || die "$1 缺少参数"
      COVER="$2"
      shift 2
      ;;
    -m|--map)
      [[ $# -ge 2 ]] || die "$1 缺少参数"
      MAP="$2"
      shift 2
      ;;
    --lang)
      [[ $# -ge 2 ]] || die "$1 缺少参数"
      LANGUAGE="$2"
      shift 2
      ;;
    --draft-dir)
      [[ $# -ge 2 ]] || die "$1 缺少参数"
      DRAFT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "未知选项：$1（使用 --help 查看帮助）"
      ;;
  esac
done

command -v pandoc >/dev/null 2>&1 || die "未找到 pandoc，请先安装 Pandoc"
command -v unzip >/dev/null 2>&1 || die "未找到 unzip，无法验证 EPUB 内容"
[[ -d "$DRAFT_DIR" ]] || die "章节目录不存在：$DRAFT_DIR"
[[ -n "$VERSION" ]] || die "VERSION 文件内容为空"
[[ -n "$COVER" && -f "$COVER" ]] || die "封面文件不存在：${COVER:-<未设置>}"
[[ -f "$MAP" ]] || die "战役地图不存在：$MAP（请先运行 node scripts/build-map.mjs）"
[[ -f "$CITY_MAP" ]] || die "南昌城图不存在：$CITY_MAP（请先运行 node scripts/build-nanchang-city-map.mjs）"
[[ -f "$ANQING_MAP" ]] || die "安庆守城图不存在：$ANQING_MAP（请先运行 node scripts/build-anqing-defense-map.mjs）"
[[ -f "$MAP_PAGE" ]] || die "地图前置页不存在：$MAP_PAGE"
[[ -f "$CITY_MAP_PAGE" ]] || die "南昌城图前置页不存在：$CITY_MAP_PAGE"
[[ -f "$ANQING_MAP_PAGE" ]] || die "安庆守城图前置页不存在：$ANQING_MAP_PAGE"

# chapter-001.md 这样的补零命名可以保证 shell 展开顺序就是章节顺序。
chapters=("$DRAFT_DIR"/chapter-*.md)
[[ -e "${chapters[0]}" ]] || die "没有找到章节：$DRAFT_DIR/chapter-*.md"
sources=("$CITY_MAP_PAGE" "$ANQING_MAP_PAGE" "$MAP_PAGE" "${chapters[@]}")

mkdir -p "$(dirname "$OUTPUT")"

pandoc_args=(
  --quiet
  --from=markdown+hard_line_breaks
  --to=epub3
  --output="$OUTPUT"
  --metadata="title=$TITLE"
  --metadata="lang=$LANGUAGE"
  --metadata="identifier=urn:42-days:$VERSION"
  --metadata="version=$VERSION"
  --metadata="date=$RELEASE_DATE"
  --table-of-contents
  --toc-depth=1
  --split-level=1
  --epub-title-page=true
  --css="$SCRIPT_DIR/epub.css"
  --resource-path="$PROJECT_DIR:$DRAFT_DIR"
)

if [[ -n "$AUTHOR" ]]; then
  pandoc_args+=(--metadata="author=$AUTHOR")
fi

if [[ -n "$COVER" ]]; then
  pandoc_args+=(--epub-cover-image="$COVER")
fi

pandoc "${pandoc_args[@]}" "${sources[@]}"

archive_entries="$(unzip -Z1 "$OUTPUT")"
grep -q '^EPUB/text/cover.xhtml$' <<<"$archive_entries" || die "EPUB 缺少封面页"
unzip -p "$OUTPUT" EPUB/content.opf | grep -q 'properties="cover-image"' || die "EPUB 清单缺少封面图片标记"
unzip -p "$OUTPUT" EPUB/text/ch001.xhtml | grep -q 'id="nanchang-city-map-image"' || die "EPUB 缺少南昌城图页或地图图片"
unzip -p "$OUTPUT" EPUB/text/ch002.xhtml | grep -q 'id="anqing-defense-map-image"' || die "EPUB 缺少安庆守城图页或地图图片"
unzip -p "$OUTPUT" EPUB/text/ch003.xhtml | grep -q 'id="campaign-map-image"' || die "EPUB 缺少战役地图页或地图图片"
unzip -p "$OUTPUT" EPUB/nav.xhtml | grep -q 'text/ch001.xhtml#南昌城图夜宴与攻城' || die "EPUB 目录缺少南昌城图"
unzip -p "$OUTPUT" EPUB/nav.xhtml | grep -q 'text/ch002.xhtml#安庆守城图云楼天梯与守御' || die "EPUB 目录缺少安庆守城图"
unzip -p "$OUTPUT" EPUB/nav.xhtml | grep -q 'text/ch003.xhtml#战役地图' || die "EPUB 目录缺少战役地图"

poem_breaks="$(unzip -p "$OUTPUT" EPUB/text/ch*.xhtml | grep -o '<br />' | wc -l | tr -d ' ')"
[[ "$poem_breaks" -ge 126 ]] || die "EPUB 章首诗缺少换行（检测到 ${poem_breaks:-0} 个换行，预期至少126个）"

echo "已生成：$OUTPUT"
echo "版本：$VERSION"
echo "章节数：${#chapters[@]}"
echo "封面：已嵌入"
echo "南昌城图、安庆守城图与战役地图：已嵌入"
