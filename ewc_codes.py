"""UK List of Waste helpers. Standard library only; keep ewc-codes.json beside this file."""
import json
import re
from pathlib import Path

# Return independent dictionaries: callers cannot change later lookup/search results.
_DATA = json.loads(Path(__file__).with_name("ewc-codes.json").read_text(encoding="utf-8"))
_BY_CODE = {entry["code"]: entry for entry in _DATA}
_CODE = re.compile(r"\s*(?:([0-9]{6})|([0-9]{2})([ .-])\s*([0-9]{2})\3\s*([0-9]{2}))\s*\*?\s*", re.ASCII)


def _copy(entry):
    return json.loads(json.dumps(entry))


def normalise_code(value: str):
    """Syntax only: six digits, or paired digits with spaces, hyphens or dots."""
    match = _CODE.fullmatch(value)
    return (match[1] or match[2] + match[4] + match[5]) if match else None


def validate_code_format(value: str) -> bool:
    return normalise_code(value) is not None


def lookup(value: str):
    entry = _BY_CODE.get(normalise_code(value))
    return _copy(entry) if entry else None


def is_hazardous(value: str):
    """Official asterisk status, or None for an unknown code."""
    entry = _BY_CODE.get(normalise_code(value))
    return entry["hazardous"] if entry else None


def mirror_partners(value: str):
    entry = _BY_CODE.get(normalise_code(value))
    return [_copy(_BY_CODE[code]) for code in entry["mirrorPartners"]] if entry else []


def search(query: str):
    query = query.strip()
    if not query:
        return []
    if validate_code_format(query):
        entry = lookup(query)
        return [entry] if entry else []
    if re.fullmatch(r"[0-9][0-9 .-]*", query):
        prefix = re.sub(r"[ .-]", "", query)
        return [_copy(entry) for entry in _DATA if entry["code"].startswith(prefix)]
    words = query.lower().split()
    return [_copy(entry) for entry in _DATA if all(word in (
        entry["description"] + " " + entry["chapter"]["title"] + " " + entry["subChapter"]["title"]
    ).lower() for word in words)]


def reference_url(value: str):
    code = normalise_code(value)
    return f"https://complyonsite.com/tools/ewc-code-finder?code={code[:2]}-{code[2:4]}-{code[4:]}" if code in _BY_CODE else None
