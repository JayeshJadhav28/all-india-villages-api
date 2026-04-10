"""
audit_cleaned_data.py
---------------------
Run this on your all_villages_cleaned.csv to verify data quality
before importing to the database.

Usage:
    python scripts/audit_cleaned_data.py

Place this in data-import/scripts/ and run from data-import/ folder.
"""

import pandas as pd
import os
import json
from datetime import datetime

BASE        = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEANED_DIR = os.path.join(BASE, "cleaned")
LOGS_DIR    = os.path.join(BASE, "logs")
REPORTS_DIR = os.path.join(BASE, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

CSV_PATH = os.path.join(CLEANED_DIR, "all_villages_cleaned.csv")

# Expected village counts per state (Census 2011 reference)
EXPECTED_COUNTS = {
    "UTTAR PRADESH":     106629,   # largest state
    "MADHYA PRADESH":    54903,
    "ODISHA":            51311,
    "BIHAR":             44874,
    "RAJASTHAN":         44672,
    "MAHARASHTRA":       43722,
    "WEST BENGAL":       40782,
    "JHARKHAND":         32615,
    "KARNATAKA":         29736,
    "ANDHRA PRADESH":    28123,
    "ASSAM":             26247,
    "HIMACHAL PRADESH":  20118,
    "CHHATTISGARH":      19823,
    "GUJARAT":           18584,
    "TAMIL NADU":        16317,
    "PUNJAB":            12581,
    "HARYANA":            6848,
    "ARUNACHAL PRADESH":  5616,
    "MEGHALAYA":          6062,
    "NAGALAND":           1307,
    "MIZORAM":             830,
    "TRIPURA":             893,
    "MANIPUR":            2639,
    "KERALA":            1004,    # Note: Kerala has panchayats not villages in census
    "GOA":                411,
    "SIKKIM":             460,
    "JAMMU AND KASHMIR": 6769,
    "LAKSHADWEEP":          10,
    "ANDAMAN AND NICOBAR":  547,
    "DADRA AND NAGAR HAVELI": 72,
    "DAMAN AND DIU":          23,
    "PUDUCHERRY":            93,
}

REQUIRED_COLUMNS = [
    "state_code", "state_name",
    "district_code", "district_name",
    "subdistrict_code", "subdistrict_name",
    "village_code", "village_name",
]


def sep(char="─", width=65):
    print(char * width)


def main():
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: File not found: {CSV_PATH}")
        print("→ Run normalize_and_clean.py first")
        return

    print(f"\n{'='*65}")
    print(f"  DATA QUALITY AUDIT")
    print(f"  File: {CSV_PATH}")
    print(f"{'='*65}\n")

    df = pd.read_csv(CSV_PATH, dtype=str)
    total = len(df)
    print(f"  Total rows loaded: {total:,}\n")

    issues = []
    warnings = []

    # ── 1. Column check ──────────────────────────────────────────────────────
    sep()
    print("CHECK 1 — Required Columns")
    sep()
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    extra_cols   = [c for c in df.columns if c not in REQUIRED_COLUMNS]

    if missing_cols:
        issues.append(f"Missing columns: {missing_cols}")
        for c in missing_cols:
            print(f"  ✗ MISSING: '{c}'")
    else:
        print(f"  ✓ All 8 required columns present")

    if extra_cols:
        print(f"  ℹ  Extra columns (will be ignored in DB import): {extra_cols}")

    # ── 2. Null / empty checks ────────────────────────────────────────────────
    sep()
    print("\nCHECK 2 — Null / Empty Values")
    sep()
    any_nulls = False
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            continue
        null_count = df[col].isnull().sum()
        empty_count = (df[col].fillna("").str.strip() == "").sum()
        total_bad = max(null_count, empty_count)
        if total_bad > 0:
            pct = 100 * total_bad / total
            print(f"  ⚠  '{col}': {total_bad:,} null/empty ({pct:.2f}%)")
            issues.append(f"Nulls in '{col}': {total_bad}")
            any_nulls = True
    if not any_nulls:
        print(f"  ✓ No null/empty values in required columns")

    # ── 3. Village code format ────────────────────────────────────────────────
    sep()
    print("\nCHECK 3 — Village Code Format")
    sep()
    if "village_code" in df.columns:
        codes = df["village_code"].fillna("")

        # Should be 6-digit numeric strings
        non_numeric = codes[~codes.str.match(r"^\d+$")]
        bad_length  = codes[codes.str.match(r"^\d+$") & (codes.str.len() != 6)]
        zero_codes  = codes[codes == "000000"]

        if len(non_numeric) > 0:
            issues.append(f"Non-numeric village codes: {len(non_numeric)}")
            print(f"  ⚠  Non-numeric village codes: {len(non_numeric):,}")
            print(f"     Examples: {list(non_numeric.unique()[:5])}")
        else:
            print(f"  ✓ All village codes are numeric")

        if len(bad_length) > 0:
            warnings.append(f"Village codes not 6 digits: {len(bad_length)}")
            print(f"  ⚠  Village codes not 6 digits: {len(bad_length):,}")
            print(f"     Length distribution: {codes.str.len().value_counts().to_dict()}")
        else:
            print(f"  ✓ All village codes are 6 digits")

        if len(zero_codes) > 0:
            issues.append(f"Summary rows (000000) not filtered: {len(zero_codes)}")
            print(f"  ✗ Summary rows with code '000000' NOT filtered: {len(zero_codes):,}")
        else:
            print(f"  ✓ No '000000' summary rows present")

    # ── 4. Duplicate village codes ────────────────────────────────────────────
    sep()
    print("\nCHECK 4 — Duplicate Village Codes")
    sep()
    if "village_code" in df.columns:
        dupes = df[df["village_code"].duplicated(keep=False)]
        if len(dupes) > 0:
            warnings.append(f"Duplicate village codes: {len(dupes)}")
            print(f"  ⚠  {len(dupes):,} rows share duplicate village codes")
            print(f"  ℹ  This may be OK — Census reuses codes across states")
            print(f"\n  Sample duplicates:")
            sample = dupes.groupby("village_code").agg(
                count=("village_name", "count"),
                states=("state_name", lambda x: list(x.unique()[:3])),
                names=("village_name", lambda x: list(x.unique()[:3])),
            ).reset_index().head(5)
            for _, row in sample.iterrows():
                print(f"    code={row['village_code']} | count={row['count']} | states={row['states']} | names={row['names']}")

            # Check if dupes are cross-state (OK) or same-state (problem)
            if "state_code" in df.columns:
                same_state_dupes = dupes.groupby(["state_code", "village_code"]).filter(lambda x: len(x) > 1)
                if len(same_state_dupes) > 0:
                    issues.append(f"Same-state duplicate village codes: {len(same_state_dupes)}")
                    print(f"\n  ✗ PROBLEM: {len(same_state_dupes):,} same-state duplicates (genuine data issue)")
                else:
                    print(f"\n  ✓ All duplicates are cross-state — village codes re-used across states (Census standard)")
        else:
            print(f"  ✓ No duplicate village codes")

    # ── 5. State coverage ─────────────────────────────────────────────────────
    sep()
    print("\nCHECK 5 — State Coverage & Row Counts")
    sep()
    if "state_name" in df.columns:
        state_counts = df.groupby("state_name").size().sort_values(ascending=False)
        print(f"  States present: {len(state_counts)}")
        print()
        print(f"  {'State':<35} {'Your Count':>10}  {'Expected':>10}  {'Diff':>8}  Status")
        print("  " + "─" * 75)

        suspicious = []
        for state, count in state_counts.items():
            state_upper = state.upper().strip()
            expected = EXPECTED_COUNTS.get(state_upper, 0)
            diff = count - expected
            pct_diff = (100 * diff / expected) if expected > 0 else 0

            if expected == 0:
                status = "ℹ  no reference"
            elif abs(pct_diff) <= 5:
                status = "✓ OK"
            elif abs(pct_diff) <= 15:
                status = "⚠  CHECK"
                warnings.append(f"{state}: count={count}, expected≈{expected} ({pct_diff:+.0f}%)")
            else:
                status = "✗ MISMATCH"
                suspicious.append(f"{state}: got {count:,}, expected ~{expected:,} ({pct_diff:+.0f}%)")
                issues.append(f"{state}: got {count:,}, expected ~{expected:,}")

            exp_str = f"{expected:>10,}" if expected > 0 else f"{'?':>10}"
            diff_str = f"{diff:>+8,}" if expected > 0 else f"{'?':>8}"
            print(f"  {state:<35} {count:>10,}  {exp_str}  {diff_str}  {status}")

        # Check for missing states
        all_states_upper = {s.upper().strip() for s in state_counts.index}
        missing_states = [s for s in EXPECTED_COUNTS if s not in all_states_upper and EXPECTED_COUNTS[s] > 5000]
        if missing_states:
            print(f"\n  ✗ MISSING STATES (>5000 villages expected):")
            for s in missing_states:
                print(f"    → {s} (expected ~{EXPECTED_COUNTS[s]:,} villages)")
            issues.append(f"Missing states: {missing_states}")

    # ── 6. Text quality ───────────────────────────────────────────────────────
    sep()
    print("\nCHECK 6 — Text Quality Samples")
    sep()
    if "village_name" in df.columns:
        # Check for ALL CAPS names (should be title-cased after cleaning)
        all_caps = df["village_name"][df["village_name"].str.isupper()].head(5)
        if len(all_caps) > 0:
            warnings.append("Some village names still ALL CAPS after cleaning")
            print(f"  ⚠  Some names still ALL CAPS:")
            for n in all_caps:
                print(f"     → '{n}'")
        else:
            print(f"  ✓ Village names are not all-caps")

        # Check for extra spaces
        with_spaces = df["village_name"][df["village_name"].str.contains(r"  +", regex=True)].head(3)
        if len(with_spaces) > 0:
            warnings.append("Double spaces found in some village names")
            print(f"  ⚠  Double spaces in names: {list(with_spaces)}")

        # Sample valid villages
        print(f"\n  Sample clean village rows:")
        sample = df[["state_name", "district_name", "subdistrict_name", "village_name", "village_code"]].sample(
            min(5, len(df)), random_state=42
        )
        for _, row in sample.iterrows():
            print(f"    {row['village_code']} | {row['village_name']}, {row['subdistrict_name']}, {row['district_name']}, {row['state_name']}")

    # ── 7. Derived fields check ───────────────────────────────────────────────
    sep()
    print("\nCHECK 7 — Derived Fields")
    sep()
    derived = ["full_address", "searchable_text", "village_slug"]
    for field in derived:
        if field in df.columns:
            null_count = df[field].isnull().sum()
            empty_count = (df[field].fillna("").str.strip() == "").sum()
            print(f"  ✓ '{field}' present — {null_count} nulls, {empty_count} empty")
            # Show sample
            sample_val = df[field].dropna().iloc[0] if len(df) > 0 else ""
            print(f"    Example: '{sample_val[:80]}'")
        else:
            warnings.append(f"Derived field '{field}' missing")
            print(f"  ⚠  '{field}' NOT present — will be generated at DB import")

    # ── Summary ───────────────────────────────────────────────────────────────
    sep("═")
    print("\nAUDIT SUMMARY")
    sep("═")
    print(f"  Total rows         : {total:,}")
    print(f"  Critical issues    : {len(issues)}")
    print(f"  Warnings           : {len(warnings)}")

    if issues:
        print(f"\n  ✗ CRITICAL ISSUES (must fix before import):")
        for i, issue in enumerate(issues, 1):
            print(f"    {i}. {issue}")

    if warnings:
        print(f"\n  ⚠  WARNINGS (review but may be OK):")
        for i, w in enumerate(warnings, 1):
            print(f"    {i}. {w}")

    if not issues:
        print(f"\n  ✅ Data looks clean — safe to proceed with DB import")
    else:
        print(f"\n  ❌ Fix critical issues before running db_import.py")

    # ── Save audit report ─────────────────────────────────────────────────────
    report = {
        "generated_at" : datetime.now().isoformat(),
        "total_rows"   : total,
        "critical_issues": issues,
        "warnings"     : warnings,
        "ready_to_import": len(issues) == 0,
    }
    out = os.path.join(REPORTS_DIR, "audit_report.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\n  Report saved → {out}\n")


if __name__ == "__main__":
    main()