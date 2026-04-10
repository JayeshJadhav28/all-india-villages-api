"""
Inspect cleaned data
"""
import pandas as pd
from pathlib import Path

# Load cleaned data
cleaned_file = Path(__file__).parent.parent / "cleaned" / "all_villages_cleaned.csv"
df = pd.read_csv(cleaned_file, nrows=10)  # First 10 rows

print("=" * 80)
print("CLEANED DATA STRUCTURE")
print("=" * 80)

print("\n📋 Columns:")
print(list(df.columns))

print("\n📊 Sample Data (First 5 rows):")
print(df[['state_name', 'district_name', 'subdistrict_name', 'village_name']].head())

print("\n🔍 Full Address Sample:")
print(df['full_address'].head(3).to_list())

print("\n🔎 Searchable Text Sample:")
print(df['searchable_text'].head(3).to_list())

print("\n✅ Data looks good!" if len(df.columns) >= 12 else "⚠️ Check data structure")