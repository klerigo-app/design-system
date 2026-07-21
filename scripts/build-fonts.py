#!/usr/bin/env python3
"""Build the native font bundle in native-fonts/ from upstream Google Fonts.

The TTFs are committed rather than generated on install: `prepare` runs
`npm run build`, and klerigo-app installs this package straight from git, so
`prepare` executes on every developer and CI machine that installs the app.
Putting fonttools in that path is not acceptable. This script is therefore run
by hand when the fonts need to change, and its output is committed.

    pip install 'fonttools[woff]'
    python3 scripts/build-fonts.py

What it does, and why each step is needed:

  * Upstream ships only VARIABLE fonts for Baloo 2 and DM Sans. There are no
    static instances to download, so each weight is instanced with
    varLib.instancer. (DM Mono is the exception and ships real statics.)
  * Static instances rather than shipping the variable fonts directly: React
    Native's variable-font handling is inconsistent across iOS and Android
    versions, and a weight silently snapping to the default instance is hard to
    notice.
  * Baloo 2 is then subset. Its Devanagari coverage is 86% of its weight
    (412 KB -> 58 KB) and no Klerigo surface renders it. DM Sans and DM Mono
    carry no Devanagari and are left at full coverage.

Sources are pinned by blob SHA so a rebuild cannot silently pick up an upstream
revision. src/native/fonts.test.ts asserts the committed output still covers
every language below; it does not re-run this script.
"""

from __future__ import annotations

import hashlib
import io
import sys
import urllib.request
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    from fontTools import subset
except ImportError:
    sys.exit("fonttools is required: pip install 'fonttools[woff]'")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "native-fonts"

RAW = "https://raw.githubusercontent.com/google/fonts/main/ofl"

# Blob SHAs read from the GitHub contents API on 2026-07-21. Pinning by content
# hash rather than by branch means an upstream release cannot change what this
# script produces without the pin changing too — `fetch` refuses to proceed.
SOURCES = {
    "baloo2": (f"{RAW}/baloo2/Baloo2%5Bwght%5D.ttf", "bc1b9f1191c0d6d23cb2ce0af66aba82ddbf8d6c"),
    "dmsans": (f"{RAW}/dmsans/DMSans%5Bopsz,wght%5D.ttf", "c672f98060af9b2c85fca704ebd5ad9a8717c1df"),
    "dmmono-Regular": (f"{RAW}/dmmono/DMMono-Regular.ttf", "1cdda9146d31e5dfb28cf299548b73f502142ccc"),
    "dmmono-Medium": (f"{RAW}/dmmono/DMMono-Medium.ttf", "3e7a7634be5f0c2414f71f459c63c521ce59c5f2"),
}

LICENSES = {
    "baloo2": (f"{RAW}/baloo2/OFL.txt", "72adb492d4f0ede2a9dbdefed607f33ad3a6fc68"),
    "dmsans": (f"{RAW}/dmsans/OFL.txt", "4430b85ac62998e2edb914360f9ebdfe43f4deaa"),
    "dmmono": (f"{RAW}/dmmono/OFL.txt", "01450afc0769581ef9548569b1214d88ee28cd1a"),
}

WEIGHTS = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}

# Google's stock "latin" subset is NOT enough, and both additions below were
# found by testing rather than by reasoning about the range:
#
#   U+0100-017F (Latin Extended-A) — omitting it costs Czech and Slovak 12 of
#     their 20 accented letters (cdeklnrstuz with carons/rings) to save 16 KB
#     per weight.
#   U+0218-021B (comma-below S and T) — Romanian's correct s/t-comma live here,
#     OUTSIDE Latin Extended-A, while their cedilla lookalikes sit inside it.
#     Omitting this range makes Romanian render half-right, which is worse than
#     failing outright. It costs 0.1 KB.
SUBSET_UNICODES = ",".join(
    [
        "U+0000-00FF",  # Latin-1: es/fr/de/pt/it, and ¿¡«»ñçßÿæ
        "U+0100-017F",  # Latin Extended-A: cs/sk/pl/hu/hr/tr
        "U+0218-021B",  # comma-below S/T: ro
        "U+0131",  # dotless i (tr)
        "U+0152-0153",  # OE/oe (fr)
        "U+02BB-02BC",
        "U+02C6",
        "U+02DA",
        "U+02DC",
        "U+2000-206F",  # general punctuation, incl. the Catalan middle dot
        "U+2074",
        "U+20AC",  # euro
        "U+2122",
        "U+2191",
        "U+2193",
        "U+2212",
        "U+2215",
        "U+FEFF",
        "U+FFFD",
    ]
)


def fetch(url: str, expect_blob: str) -> bytes:
    """Download and verify against git's blob hash, which is what the API reports."""
    with urllib.request.urlopen(url) as r:
        data = r.read()
    actual = hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()
    if actual != expect_blob:
        raise SystemExit(
            f"{url}\n  expected blob {expect_blob}\n  got          {actual}\n"
            "Upstream changed. Verify the new file, then update the pin."
        )
    return data


def instance(data: bytes, axes: dict[str, float]) -> TTFont:
    font = TTFont(io.BytesIO(data))
    return instancer.instantiateVariableFont(font, axes, inplace=True, updateFontNames=True)


def subset_font(font: TTFont) -> None:
    opts = subset.Options()
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    subsetter = subset.Subsetter(options=opts)
    subsetter.populate(unicodes=subset.parse_unicodes(SUBSET_UNICODES))
    subsetter.subset(font)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    written: list[tuple[str, int]] = []

    baloo = fetch(*SOURCES["baloo2"])
    for weight, name in WEIGHTS.items():
        font = instance(baloo, {"wght": weight})
        subset_font(font)  # Devanagari is 86% of this face and unused.
        path = OUT / f"Baloo2-{name}.ttf"
        font.save(path)
        written.append((path.name, path.stat().st_size))

    dmsans = fetch(*SOURCES["dmsans"])
    for weight, name in WEIGHTS.items():
        # opsz is pinned to 14 — the optical size DM Sans is drawn for at body
        # text, and an axis native components never vary.
        font = instance(dmsans, {"wght": weight, "opsz": 14})
        path = OUT / f"DMSans-{name}.ttf"
        font.save(path)
        written.append((path.name, path.stat().st_size))

    for name in ("Regular", "Medium"):
        path = OUT / f"DMMono-{name}.ttf"
        path.write_bytes(fetch(*SOURCES[f"dmmono-{name}"]))  # already static upstream
        written.append((path.name, path.stat().st_size))

    (OUT / "OFL.txt").write_text(
        "\n\n".join(
            f"=== {family} ===\n\n" + fetch(url, blob).decode()
            for family, (url, blob) in LICENSES.items()
        )
    )

    total = sum(size for _, size in written)
    for name, size in written:
        print(f"  {name:22} {size / 1024:7.1f} KB")
    print(f"  {'TOTAL':22} {total / 1024:7.1f} KB")


if __name__ == "__main__":
    main()
