"""Import the public Finnternet travel pages from saved Notion page records.

Usage: python3 scripts/import-travel.py --source ../migration-source
The source records stay outside Git; only articles, photos, and a content manifest
are retained in the site. No Notion credentials or expiring media URLs are saved.
"""

import argparse
import concurrent.futures
import hashlib
import html
import json
import math
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUGS = {
    "14a5d72e-6a06-478b-b9e2-6faef8ecd2dc": "toronto-roadtrip",
    "e74da655-5a81-4a7f-bd00-109fdb723228": "texas-roadtrip",
    "f82285c8-45d9-4d5f-8810-8886b94a66dd": "london-pt-2",
    "7914fd17-2c4e-4175-a42c-888febe67c75": "peru",
    "09574a54-69e2-4a5f-8603-0fb35154b28e": "puerto-rico",
    "38f1bf85-90da-4bbe-a4c8-fcb11b256cb9": "iceland",
    "7e1dea81-7adb-4891-bf9c-f4672bd23eb2": "spain",
    "f337f0ef-fccf-47e5-a3d5-d78888dce018": "san-diego",
    "179a636a-f1da-4222-8667-831a154e3f04": "tennessee",
    "33671054-7351-4ab3-a9f6-e2145d761207": "london",
}


def unwrap(record):
    while isinstance(record, dict) and "value" in record:
        record = record["value"]
    return record


def plain(parts):
    return "".join(part[0] for part in parts)


def markdown_text(parts):
    rendered = []
    for part in parts:
        text = html.escape(part[0], quote=False)
        text = text.replace("{", "&#123;").replace("}", "&#125;")
        text = re.sub(r"([\\`*_\[\]])", r"\\\1", text)
        for annotation in part[1] if len(part) > 1 else []:
            if annotation[0] != "a":
                raise ValueError(f"Unhandled rich text annotation: {annotation[0]}")
            url = annotation[1]
            if not url.startswith(("https://", "http://")):
                raise ValueError("Review this non-HTTP article link before importing")
            text = f"[{text}]({url})"
        rendered.append(text)
    return "".join(rendered)


def youtube_id(source):
    url = urllib.parse.urlsplit(source)
    if url.netloc == "youtu.be":
        video_id = url.path.lstrip("/")
    elif url.netloc in ("www.youtube.com", "youtube.com"):
        video_id = url.path.removeprefix("/embed/") if url.path.startswith("/embed/") else urllib.parse.parse_qs(url.query).get("v", [""])[0]
    else:
        raise ValueError("Review this video provider before importing")
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise ValueError("Invalid YouTube video ID")
    return video_id


def download_photo(item):
    slug, block = item
    block_id = block["id"]
    if not re.fullmatch(r"[a-f0-9-]{36}", block_id):
        raise ValueError("Invalid image block ID")
    directory = ROOT / "src/assets/travel" / slug
    directory.mkdir(parents=True, exist_ok=True)
    existing = list(directory.glob(f"{block_id}.*"))
    if existing:
        path = existing[0]
        data = path.read_bytes()
    else:
        source = plain(block["properties"]["source"])
        parsed = urllib.parse.urlsplit(source)
        if parsed.scheme != "https" or parsed.netloc != "s3-us-west-2.amazonaws.com" or not parsed.path.startswith("/secure.notion-static.com/"):
            raise ValueError("Review this image origin before importing")
        # Notion's public proxy resolves its legacy attachment URLs. The S3
        # originals themselves return 403; never retain the proxy's signed URL.
        url = "https://www.notion.so/image/" + urllib.parse.quote(source, safe="")
        url += "?" + urllib.parse.urlencode({"table": "block", "id": block_id, "cache": "v2"})
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=90) as response:
            data = response.read(50_000_001)
            content_type = response.headers.get_content_type()
        extensions = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif"}
        if content_type not in extensions or not data or len(data) > 50_000_000:
            raise ValueError(f"Invalid image response for block {block_id}")
        path = directory / f"{block_id}{extensions[content_type]}"
        path.write_bytes(data)
    return block_id, {"path": str(path.relative_to(ROOT)), "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    pages = []
    jobs = []
    for page_id, slug in SLUGS.items():
        data = json.loads((args.source / f"{page_id}.json").read_text())
        if data.get("cursor", {}).get("stack"):
            raise ValueError(f"The Notion export is incomplete: {slug}")
        blocks = {key: unwrap(value) for key, value in data["recordMap"]["block"].items()}
        page = blocks[page_id]
        children = [blocks[key] for key in page["content"]]
        if any(block.get("content") for block in children):
            raise ValueError(f"Review nested blocks before importing: {slug}")
        jobs.extend((slug, block) for block in children if block["type"] == "image")
        pages.append((page_id, slug, page, children))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        photos = dict(pool.map(download_photo, jobs))
    manifest = []
    redirects = []
    for page_id, slug, page, children in pages:
        properties = page["properties"]
        title = plain(properties["title"])
        description = plain(properties["~]S<"])
        date = properties["a<ql"][0][1][0][1]["start_date"]
        imports = ["import PostImage from '../../../components/PostImage.astro';"]
        if any(block["type"] == "video" for block in children):
            imports.append("import VideoEmbed from '../../../components/VideoEmbed.astro';")
        body = []
        images = []
        videos = []
        for block in children:
            kind = block["type"]
            props = block.get("properties", {})
            if kind == "text":
                text = markdown_text(props.get("title", []))
                if text.strip():
                    body.append(text)
            elif kind == "header":
                body.append("## " + markdown_text(props.get("title", [])))
            elif kind == "image":
                photo = photos[block["id"]]
                number = len(images) + 1
                name = f"photo{number:02}"
                imports.append(f"import {name} from '../../../assets/travel/{slug}/{Path(photo['path']).name}';")
                caption = plain(props.get("caption", []))
                alt = caption or f"{title} — photo {number}"
                attributes = f"src={{{name}}} alt={{{json.dumps(alt, ensure_ascii=False)}}}"
                if caption:
                    attributes += f" caption={{{json.dumps(caption, ensure_ascii=False)}}}"
                if number == 1:
                    attributes += " priority"
                body.append(f"<PostImage {attributes} />")
                images.append({"blockId": block["id"], **photo, "caption": caption})
            elif kind == "video":
                video_id = youtube_id(plain(props["source"]))
                videos.append(video_id)
                body.append(f"<VideoEmbed id=\"{video_id}\" title={{{json.dumps(title + ' — trip video', ensure_ascii=False)}}} />")
            else:
                raise ValueError(f"Unhandled block type: {kind}")
        words = sum(len(plain(block.get("properties", {}).get("title", [])).split()) for block in children)
        frontmatter = {"title": title, "description": description, "lang": "en", "translationKey": f"travel-{slug}", "path": slug, "published": date, "readingMinutes": max(1, math.ceil(words / 200)), "tags": ["travel"]}
        content = "---\n" + "\n".join(f"{key}: {json.dumps(value, ensure_ascii=False)}" for key, value in frontmatter.items())
        content += "\n---\n\n" + "\n".join(imports) + "\n\n" + "\n\n".join(body) + "\n"
        path = ROOT / "src/content/posts/en" / f"{slug}.mdx"
        if path.exists() and path.read_text() != content:
            raise ValueError(f"Refusing to overwrite an edited post: {path}")
        path.write_text(content)
        manifest.append({"title": title, "published": date, "source": f"https://finnternet.com/{slug}", "notionPageId": page_id, "path": f"/writing/{slug}/", "bodyBlocks": len(children), "photos": images, "videos": videos})
        for legacy in (slug, page_id, page_id.replace("-", "")):
            redirects.append(f"/{legacy} /writing/{slug}/ 301")
            redirects.append(f"/{legacy}/ /writing/{slug}/ 301")
        print(f"Imported {title}: {len(children)} blocks, {len(images)} photos, {len(videos)} videos", flush=True)
    report = ROOT / "src/data/travel-migration.json"
    report.parent.mkdir(exist_ok=True)
    report.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    redirects.extend(["/travel /writing/ 301", "/travel/ /writing/ 301"])
    (ROOT / "public/_redirects").write_text("\n".join(redirects) + "\n")
    print(f"Complete: {len(pages)} posts, {len(photos)} photos, {sum(len(p['videos']) for p in manifest)} videos.")


if __name__ == "__main__":
    main()
