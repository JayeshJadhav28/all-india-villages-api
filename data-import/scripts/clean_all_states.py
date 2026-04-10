"""
Clean and merge all state files into one dataset
"""
import pandas as pd
import sys
from pathlib import Path
from tqdm import tqdm

sys.path.append(str(Path(__file__).parent))

from config import (
    SOURCE_FILES, CLEANED_FILE, ERROR_FILE, DUPLICATE_FILE,
    COLUMN_MAPPING, REQUIRED_COLUMNS
)
from utils import (
    clean_text, normalize_name, normalize_code,
    slugify, build_full_address, build_searchable_text,
    validate_row
)


def load_single_file(file_path: str) -> pd.DataFrame:
    """Load a single state file"""
    try:
        # Read Excel file (supports old .xls format)
        df = pd.read_excel(file_path, engine='xlrd')
        
        # Get state name from filename
        file_name = Path(file_path).stem
        
        print(f"  ✓ {file_name}: {len(df):,} rows")
        
        return df
        
    except Exception as e:
        print(f"  ✗ Error loading {file_path}: {e}")
        return pd.DataFrame()


def load_all_files() -> pd.DataFrame:
    """Load and combine all state files"""
    print(f"\n📂 Loading {len(SOURCE_FILES)} state files...")
    
    all_dataframes = []
    
    for file_path in tqdm(SOURCE_FILES, desc="Loading files"):
        df = load_single_file(file_path)
        if not df.empty:
            all_dataframes.append(df)
    
    # Combine all dataframes
    if not all_dataframes:
        raise ValueError("No data loaded from any file!")
    
    combined_df = pd.concat(all_dataframes, ignore_index=True)
    
    print(f"\n✓ Combined data loaded")
    print(f"  Total rows: {len(combined_df):,}")
    print(f"  Columns: {list(combined_df.columns)}")
    
    return combined_df


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names using mapping"""
    print("\n🔄 Normalizing column names...")
    
    # Rename columns
    df = df.rename(columns=COLUMN_MAPPING)
    
    # Check for missing required columns
    missing = set(REQUIRED_COLUMNS) - set(df.columns)
    if missing:
        print(f"  Available columns: {list(df.columns)}")
        raise ValueError(f"Missing required columns: {missing}")
    
    # Keep only required columns
    df = df[REQUIRED_COLUMNS]
    
    print(f"✓ Columns normalized: {list(df.columns)}")
    return df


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and transform data"""
    print("\n🧹 Cleaning data...")
    
    # Remove completely empty rows
    df = df.dropna(how='all')
    
    # Clean text fields
    print("  Cleaning text fields...")
    df['state_name'] = df['state_name'].apply(normalize_name)
    df['district_name'] = df['district_name'].apply(normalize_name)
    df['subdistrict_name'] = df['subdistrict_name'].apply(normalize_name)
    df['village_name'] = df['village_name'].apply(normalize_name)
    
    # Clean code fields with CONSISTENT formatting
    print("  Cleaning code fields...")
    
    # 🔧 FIX: Normalize codes consistently
    # State codes: pad to 2 digits (e.g., "2" → "02", "09" → "09")
    df['state_code'] = df['state_code'].apply(normalize_code).astype(str).str.zfill(2)
    
    # District codes: keep as-is but ensure string
    df['district_code'] = df['district_code'].apply(normalize_code).astype(str)
    
    # Sub-district codes: keep as-is but ensure string
    df['subdistrict_code'] = df['subdistrict_code'].apply(normalize_code).astype(str)
    
    # Village codes: keep as-is but ensure string
    df['village_code'] = df['village_code'].apply(normalize_code).astype(str)
    
    # Add derived fields
    print("  Adding derived fields...")
    
    # Slugs
    df['state_slug'] = df['state_name'].apply(lambda x: slugify(x) if x else None)
    df['district_slug'] = df['district_name'].apply(lambda x: slugify(x) if x else None)
    df['subdistrict_slug'] = df['subdistrict_name'].apply(lambda x: slugify(x) if x else None)
    df['village_slug'] = df['village_name'].apply(lambda x: slugify(x) if x else None)
    
    # Full address
    df['full_address'] = df.apply(
        lambda row: build_full_address(
            row['village_name'],
            row['subdistrict_name'],
            row['district_name'],
            row['state_name']
        ),
        axis=1
    )
    
    # Searchable text for trigram search
    df['searchable_text'] = df.apply(
        lambda row: build_searchable_text(
            row['village_name'],
            row['subdistrict_name'],
            row['district_name'],
            row['state_name']
        ),
        axis=1
    )
    
    print(f"✓ Data cleaned: {len(df):,} rows")
    return df


def validate_dataframe(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Validate rows"""
    print("\n✅ Validating data...")
    
    valid_rows = []
    invalid_rows = []
    
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Validating"):
        is_valid, error = validate_row(row.to_dict(), REQUIRED_COLUMNS)
        
        if is_valid:
            valid_rows.append(row)
        else:
            row_with_error = row.copy()
            row_with_error['error'] = error
            invalid_rows.append(row_with_error)
    
    valid_df = pd.DataFrame(valid_rows) if valid_rows else pd.DataFrame()
    invalid_df = pd.DataFrame(invalid_rows) if invalid_rows else pd.DataFrame()
    
    print(f"✓ Validation complete")
    print(f"  Valid: {len(valid_df):,}")
    print(f"  Invalid: {len(invalid_df):,}")
    
    return valid_df, invalid_df


def remove_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Remove duplicate village codes"""
    print("\n🔍 Removing duplicates...")
    
    # Find duplicates based on village_code
    duplicates = df[df.duplicated(subset=['village_code'], keep='first')]
    
    # Keep only first occurrence
    df_unique = df.drop_duplicates(subset=['village_code'], keep='first')
    
    print(f"✓ Deduplication complete")
    print(f"  Unique: {len(df_unique):,}")
    print(f"  Duplicates removed: {len(duplicates):,}")
    
    return df_unique, duplicates


def get_statistics(df: pd.DataFrame):
    """Print dataset statistics"""
    print("\n📊 Dataset Statistics:")
    print("=" * 60)
    
    print(f"Total villages: {len(df):,}")
    print(f"Total states: {df['state_name'].nunique()}")
    print(f"Total districts: {df['district_name'].nunique()}")
    print(f"Total sub-districts: {df['subdistrict_name'].nunique()}")
    
    print("\n🏆 Top 10 States by Village Count:")
    print(df['state_name'].value_counts().head(10))
    
    print("\n" + "=" * 60)


def main():
    """Main cleaning pipeline"""
    print("=" * 60)
    print("MDDS VILLAGE DATA CLEANING PIPELINE")
    print("=" * 60)
    
    try:
        # Step 1: Load all files
        df = load_all_files()
        
        # Step 2: Normalize columns
        df = normalize_columns(df)
        
        # Step 3: Clean data
        df = clean_dataframe(df)
        
        # Step 4: Validate
        valid_df, invalid_df = validate_dataframe(df)
        
        # Step 5: Remove duplicates
        clean_df, duplicates_df = remove_duplicates(valid_df)
        
        # Step 6: Statistics
        get_statistics(clean_df)
        
        # Step 7: Save cleaned data
        print(f"\n💾 Saving cleaned data...")
        clean_df.to_csv(CLEANED_FILE, index=False)
        print(f"  ✓ Saved: {CLEANED_FILE}")
        print(f"  Total rows: {len(clean_df):,}")
        
        # Step 8: Save errors
        if len(invalid_df) > 0:
            invalid_df.to_csv(ERROR_FILE, index=False)
            print(f"\n⚠️  Saved invalid rows: {ERROR_FILE}")
            print(f"  Total: {len(invalid_df):,}")
        
        # Step 9: Save duplicates
        if len(duplicates_df) > 0:
            duplicates_df.to_csv(DUPLICATE_FILE, index=False)
            print(f"\n⚠️  Saved duplicates: {DUPLICATE_FILE}")
            print(f"  Total: {len(duplicates_df):,}")
        
        print("\n" + "=" * 60)
        print("✅ CLEANING COMPLETE")
        print("=" * 60)
        print(f"✓ Valid rows: {len(clean_df):,}")
        print(f"✗ Invalid rows: {len(invalid_df):,}")
        print(f"⚠  Duplicate rows: {len(duplicates_df):,}")
        print(f"\n📁 Output: {CLEANED_FILE}")
        
        return clean_df
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()