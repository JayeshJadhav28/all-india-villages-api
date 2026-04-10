"""
Inspect Madhya Pradesh file
"""
import pandas as pd
from pathlib import Path

mp_file = Path("raw/Rdir_2011_23_MADHYA_PRADESH.xls")

print(f"Inspecting: {mp_file}")
print(f"File size: {mp_file.stat().st_size / 1024 / 1024:.2f} MB\n")

# Try reading with xlrd
try:
    df = pd.read_excel(mp_file, engine='xlrd')
    print(f"✓ Loaded {len(df):,} rows")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst 5 rows:")
    print(df.head())
    print(f"\nLast 5 rows:")
    print(df.tail())
    
    # Check for multiple sheets
    xls = pd.ExcelFile(mp_file, engine='xlrd')
    print(f"\nSheets in file: {xls.sheet_names}")
    
except Exception as e:
    print(f"✗ Error: {e}")