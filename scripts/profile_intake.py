#!/usr/bin/env python3
"""Turn a parsed "profile" issue form into a people/<slug>.md (+ optional avatar).

Run by .github/workflows/profile-intake.yml. Reads the issue-parser JSON from
$ISSUE_JSON (passed via env, never interpolated into a shell — no injection),
writes the Markdown + downloads any attached photo, and leaves the result in the
working tree for create-pull-request to commit. Output is always a reviewed PR.

Security: the slug is sanitised (no path traversal), the photo URL is host-
allowlisted to GitHub's attachment CDNs (no SSRF to arbitrary hosts), and the
download is size-capped and content-type checked.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

PEOPLE = Path("src/content/people")
AVATARS = PEOPLE / "avatars"
MAX_BYTES = 8 * 1024 * 1024  # 8 MB cap on a downloaded photo
# Only fetch from GitHub's own attachment CDNs — never an arbitrary URL.
ALLOWED_HOST_RE = re.compile(
    r"^https://(github\.com/user-attachments/|[a-z0-9-]+\.githubusercontent\.com/)"
)
EXT_BY_TYPE = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif"}
# Optional string fields in schema order, each with the same validator the
# content schema enforces. A value that fails is DROPPED (with a warning) so the
# generated card is always schema-valid — a GITHUB_TOKEN PR doesn't trigger CI,
# so an invalid field would otherwise only surface as a broken deploy on merge.
STRING_FIELDS: list[tuple[str, "re.Pattern[str] | None"]] = [
    ("email", re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")),
    ("website", re.compile(r"^https?://")),
    ("github", re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$")),
    ("linkedin", re.compile(r"^https?://([a-z0-9-]+\.)?linkedin\.com/")),
    ("youtube", re.compile(r"^https?://([a-z0-9-]+\.)?(youtube\.com|youtu\.be)/")),
    ("orcid", re.compile(r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$")),
    ("scholar", re.compile(r"^https://scholar\.google\.com/")),
    ("ieee", re.compile(r"^https://ieeexplore\.ieee\.org/")),
    ("years", None),  # free text
]


def clean(value: object) -> str | None:
    """Empty / unanswered form fields come through as "" or "_No response_"."""
    if not isinstance(value, str):
        return None
    v = value.strip()
    return None if v == "" or v == "_No response_" else v


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not s or "/" in s or ".." in s:
        sys.exit(f"::error::cannot derive a safe slug from name {name!r}")
    return s


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def existing_meta(md_path: Path) -> dict[str, str]:
    """Preserve order / lead when a teammate updates an existing card."""
    meta: dict[str, str] = {}
    if md_path.exists():
        text = md_path.read_text(encoding="utf-8")
        if m := re.search(r"^order:\s*(\d+)", text, re.M):
            meta["order"] = m.group(1)
        if re.search(r"^lead:\s*true", text, re.M):
            meta["lead"] = "true"
    return meta


def download_photo(markdown: str, slug: str) -> str | None:
    """Pull the first image URL out of the photo field and save it. Returns the
    frontmatter-relative path, or None (then we fall back to GitHub avatar / initials)."""
    m = re.search(r"\((<)?(https://[^)\s>]+)>?\)", markdown) or re.search(r"(https://\S+)", markdown)
    if not m:
        return None
    url = m.group(2) if m.lastindex and m.lastindex >= 2 else m.group(1)
    if not ALLOWED_HOST_RE.match(url):
        print(f"::warning::ignoring photo URL from a non-GitHub host: {url}")
        return None
    req = urllib.request.Request(url, headers={"User-Agent": "ldqis-profile-intake"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310 (host-allowlisted above)
            ctype = (resp.headers.get("Content-Type") or "").split(";")[0].strip().lower()
            ext = EXT_BY_TYPE.get(ctype)
            if not ext:
                print(f"::warning::attachment is not a supported image ({ctype!r}); skipping")
                return None
            data = resp.read(MAX_BYTES + 1)
    except Exception as e:  # noqa: BLE001 — a bad photo must not fail the whole intake
        print(f"::warning::could not download the photo: {e}")
        return None
    if len(data) > MAX_BYTES:
        print("::warning::photo exceeds 8 MB; skipping")
        return None
    AVATARS.mkdir(parents=True, exist_ok=True)
    (AVATARS / f"{slug}.{ext}").write_bytes(data)
    return f"./avatars/{slug}.{ext}"


def main() -> None:
    fields = json.loads(os.environ["ISSUE_JSON"])
    name = clean(fields.get("name")) or sys.exit("::error::name is required")
    initials = clean(fields.get("initials")) or "?"
    role = clean(fields.get("role")) or ""
    cohort = clean(fields.get("cohort")) or "current"
    if cohort not in ("current", "past"):
        cohort = "current"
    slug = slugify(name)
    md_path = PEOPLE / f"{slug}.md"
    meta = existing_meta(md_path)

    avatar = download_photo(fields.get("photo") or "", slug)

    lines = [f"initials: {yaml_quote(initials[:3])}", f"name: {yaml_quote(name)}", f"role: {yaml_quote(role)}"]
    for key, validator in STRING_FIELDS:
        val = clean(fields.get(key))
        if not val:
            continue
        if validator and not validator.match(val):
            print(f"::warning::dropping {key}={val!r} — doesn't match the expected format")
            continue
        lines.append(f"{key}: {yaml_quote(val)}")
    lines.append(f"cohort: {cohort}")
    lines.append(f"order: {meta.get('order', '100')}")
    if avatar:
        lines.append(f"avatar: {avatar}")
    if meta.get("lead"):
        lines.append("lead: true")

    md_path.write_text("---\n" + "\n".join(lines) + "\n---\n", encoding="utf-8")
    print(f"wrote {md_path} (photo: {'yes' if avatar else 'no'})")

    if gh_out := os.environ.get("GITHUB_OUTPUT"):
        action = "Update" if meta else "Add"
        safe_name = name.replace("\n", " ").replace("\r", " ")
        with open(gh_out, "a", encoding="utf-8") as f:
            f.write(f"slug={slug}\nname={safe_name}\naction={action}\n")


if __name__ == "__main__":
    main()
