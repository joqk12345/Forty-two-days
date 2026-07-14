#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TITLE="42天"
AUTHOR="kai.qiao"
LANGUAGE="zh-CN"
DRAFT_DIR="$PROJECT_DIR/drafts"
OUTPUT="$PROJECT_DIR/build/42-days.epub"
COVER=""

if [[ -f "$PROJECT_DIR/cover.png" ]]; then
  COVER="$PROJECT_DIR/cover.png"
fi

usage() {
  cat <<'EOF'
用法：scripts/build-epub.sh [选项]

将 drafts/chapter-*.md 按文件名顺序合并为 EPUB。

选项：
  -o, --output FILE     输出文件（默认：build/42-days.epub）
  -t, --title TITLE     书名（默认：42天）
  -a, --author AUTHOR   作者名（默认：kai.qiao）
  -c, --cover FILE      封面图片（默认使用项目根目录的 cover.png）
      --lang LANG       语言标签（默认：zh-CN）
      --draft-dir DIR   正文章节目录（默认：drafts）
  -h, --help            显示帮助

示例：
  scripts/build-epub.sh
  scripts/build-epub.sh --author "作者名" --cover cover.jpg
  scripts/build-epub.sh -o build/novel.epub -t "42天"
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
[[ -d "$DRAFT_DIR" ]] || die "章节目录不存在：$DRAFT_DIR"
[[ -z "$COVER" || -f "$COVER" ]] || die "封面文件不存在：$COVER"

# chapter-001.md 这样的补零命名可以保证 shell 展开顺序就是章节顺序。
chapters=("$DRAFT_DIR"/chapter-*.md)
[[ -e "${chapters[0]}" ]] || die "没有找到章节：$DRAFT_DIR/chapter-*.md"

mkdir -p "$(dirname "$OUTPUT")"

pandoc_args=(
  --quiet
  --from=markdown
  --to=epub3
  --output="$OUTPUT"
  --metadata="title=$TITLE"
  --metadata="lang=$LANGUAGE"
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

pandoc "${pandoc_args[@]}" "${chapters[@]}"

echo "已生成：$OUTPUT"
echo "章节数：${#chapters[@]}"
