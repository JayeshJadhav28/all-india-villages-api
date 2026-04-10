"""Shared helpers for the data import cleaning scripts."""

from __future__ import annotations

import re
import unicodedata
from typing import Any


def clean_text(value: Any) -> str:
    if value is None:
        return ""

    text = str(value).strip()
    if text.lower() == "nan":
        return ""

    return re.sub(r"\s+", " ", text)


def normalize_name(value: Any) -> str:
    text = clean_text(value)
    if not text:
        return ""

    text = unicodedata.normalize("NFKC", text)
    return text.title()


def normalize_code(value: Any) -> str | None:
    if value is None:
        return None

    text = clean_text(value)
    if not text:
        return None

    if re.fullmatch(r"\d+\.0", text):
        return text[:-2]

    return text


def slugify(value: Any) -> str | None:
    text = clean_text(value)
    if not text:
        return None

    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug or None


def build_full_address(village: Any, subdistrict: Any, district: Any, state: Any) -> str:
    parts = [clean_text(village), clean_text(subdistrict), clean_text(district), clean_text(state)]
    return ", ".join(part for part in parts if part)


def build_searchable_text(village: Any, subdistrict: Any, district: Any, state: Any) -> str:
    parts = [clean_text(village), clean_text(subdistrict), clean_text(district), clean_text(state)]
    return " ".join(part for part in parts if part).lower()


def validate_row(row: dict[str, Any], required_columns: list[str]) -> tuple[bool, str | None]:
    missing_columns = [column for column in required_columns if column not in row]
    if missing_columns:
        return False, f"Missing columns: {', '.join(missing_columns)}"

    empty_columns = [column for column in required_columns if clean_text(row.get(column)) == ""]
    if empty_columns:
        return False, f"Empty required values: {', '.join(empty_columns)}"

    return True, None