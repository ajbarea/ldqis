#!/usr/bin/env python3
"""Turn a parsed "project" or "publication" issue form into the matching
src/content/<collection>/<slug>.md, left in the working tree for
create-pull-request to commit.

Routed by content-intake.yml on the `project` / `publication` labels. The issue
body reaches this via $ISSUE_JSON and the name/title via $ISSUE_TITLE (both env, never shell-interpolated).
People references (a project's `contributors`, a paper's `author_ids`) are
deliberately NOT set from the form — a maintainer attaches them on review, so a
mistyped name can't mis-credit anyone or fail the build. Any references already
on the file are preserved across an update.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path("src/content")


def clean(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    v = value.strip()
    return None if v == "" or v == "_No response_" else v


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    if not s or "/" in s or ".." in s:
        sys.exit(f"::error::cannot derive a safe slug from {text!r}")
    return s


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def is_url(value: str | None) -> bool:
    return bool(value and re.match(r"^https?://", value))


def preserve_order(md_path: Path) -> str:
    if md_path.exists():
        m = re.search(r"^order:\s*(\d+)", md_path.read_text(encoding="utf-8"), re.M)
        if m:
            return m.group(1)
    return "100"


def preserve_refs(md_path: Path, key: str) -> str | None:
    """Re-emit an existing `contributors:` / `author_ids:` block verbatim so an
    update keeps the people-links a maintainer added on review."""
    if not md_path.exists():
        return None
    m = re.search(rf"^{key}:.*(?:\n[ \t].*)*", md_path.read_text(encoding="utf-8"), re.M)
    return m.group(0) if m else None


def preserve_body(md_path: Path) -> str:
    """Keep an existing Markdown body (an abstract / about-this-book blurb) when an
    update leaves the form's abstract field blank — same spirit as preserve_refs."""
    if not md_path.exists():
        return ""
    m = re.match(r"^---\n.*?\n---\n(.*)$", md_path.read_text(encoding="utf-8"), re.S)
    return m.group(1) if m else ""


def build_project(f: dict, name: str) -> tuple[Path, list[str]]:
    if not name:
        sys.exit("::error::project name (the issue title) is required")
    md_path = ROOT / "projects" / f"{slugify(name)}.md"
    tags = [t.strip() for t in (clean(f.get("tags")) or "").split(",") if t.strip()]
    stack = [s.strip() for s in (clean(f.get("stack")) or "").split(",") if s.strip()]
    links: list[tuple[str, str]] = []
    for key, label in (("github", "GitHub ↗"), ("site", "Site ↗"), ("docs", "Docs ↗")):
        u = clean(f.get(key))
        if u and is_url(u):
            links.append((label, u))
        elif u:
            print(f"::warning::ignoring {key} (not a URL): {u}")
    if not links:
        sys.exit("::error::a project needs at least one valid link (GitHub / site / docs)")
    out = [
        f"name: {yaml_quote(name)}",
        f"tagline: {yaml_quote(clean(f.get('tagline')) or '')}",
    ]
    out.append("tags: []" if not tags else "tags:")
    out += [f"  - {yaml_quote(t)}" for t in tags]
    out.append("stack: []" if not stack else "stack:")
    out += [f"  - {yaml_quote(s)}" for s in stack]
    out.append(f"desc: {yaml_quote(clean(f.get('desc')) or '')}")
    out.append("links:")
    out += [f"  - {{ label: {yaml_quote(la)}, href: {yaml_quote(h)} }}" for la, h in links]
    out.append(f"order: {preserve_order(md_path)}")
    if refs := preserve_refs(md_path, "contributors"):
        out.append(refs)
    return md_path, out


def build_publication(f: dict, title: str) -> tuple[Path, list[str]]:
    if not title:
        sys.exit("::error::paper title (the issue title) is required")
    md_path = ROOT / "publications" / f"{slugify(title)[:60].rstrip('-')}.md"
    link_url = clean(f.get("link_url"))
    if not is_url(link_url):
        sys.exit("::error::a valid link URL (DOI or paper) is required")
    venue_type = clean(f.get("venue_type"))
    if venue_type not in ("journal", "conference", "book"):
        venue_type = "conference"
    out = [
        f"year: {yaml_quote(clean(f.get('year')) or '')}",
        f"venue: {yaml_quote(clean(f.get('venue')) or '')}",
        f"venue_type: {venue_type}",
    ]
    if isbn := clean(f.get("isbn")):
        out.append(f"isbn: {yaml_quote(isbn)}")
    out += [
        f"title: {yaml_quote(title)}",
        f"authors: {yaml_quote(clean(f.get('authors')) or '')}",
        f"link: {{ label: {yaml_quote(clean(f.get('link_label')) or 'DOI ↗')}, href: {yaml_quote(link_url)} }}",
    ]
    if refs := preserve_refs(md_path, "author_ids"):
        out.append(refs)
    return md_path, out


def main() -> None:
    ctype = os.environ.get("CONTENT_TYPE")
    fields = json.loads(os.environ["ISSUE_JSON"])
    # Name/title is the issue's own title (category prefix stripped) — not asked twice.
    title = re.sub(r"^\s*\[[^\]]*\]\s*", "", os.environ.get("ISSUE_TITLE", "")).strip()
    if ctype == "project":
        md_path, out = build_project(fields, title)
    elif ctype == "publication":
        md_path, out = build_publication(fields, title)
    else:
        sys.exit(f"::error::unknown CONTENT_TYPE {ctype!r}")
    md_path.parent.mkdir(parents=True, exist_ok=True)
    body = ""
    if ctype == "publication":
        abstract = clean(fields.get("abstract"))
        body = f"\n{abstract}\n" if abstract else preserve_body(md_path)
    md_path.write_text("---\n" + "\n".join(out) + "\n---\n" + body, encoding="utf-8")
    print(f"wrote {md_path}")
    if gh_out := os.environ.get("GITHUB_OUTPUT"):
        with open(gh_out, "a", encoding="utf-8") as fh:
            fh.write(f"slug={md_path.stem}\ntype={ctype}\n")


if __name__ == "__main__":
    main()
