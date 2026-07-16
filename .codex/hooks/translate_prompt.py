#!/usr/bin/env python3
"""Add a translate-display-execute policy to every submitted user prompt."""

import json
import sys


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError) as exc:
        print(f"Invalid UserPromptSubmit payload: {exc}", file=sys.stderr)
        return 2

    if not isinstance(payload.get("prompt"), str):
        print("UserPromptSubmit payload is missing the prompt field", file=sys.stderr)
        return 2

    additional_context = """
For this turn, apply the following prompt-translation workflow before doing any task work:

1. Translate the user's complete request into natural, precise, task-appropriate English. Preserve intent, constraints, technical identifiers, code, commands, paths, quoted text, and requested output format. Improve phrasing for clarity, but do not add requirements or broaden authorization.
2. Before calling tools or beginning substantive work, show the translation to the user in the commentary channel using exactly this compact format:

English prompt: <translated prompt>

3. Then execute that English prompt immediately. Do not ask for confirmation merely because it was translated. Use the original user text to resolve ambiguity or preserve nuances that English cannot carry exactly.
4. If the input is already natural English, display a lightly polished English prompt and execute it in the same way.
5. Do not repeat the English prompt in the final answer unless it is materially needed there.
""".strip()

    output = {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": additional_context,
        }
    }
    json.dump(output, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
