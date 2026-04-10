"""
Configuration for MDDS Village Data Import
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import glob

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).parent.parent
RAW_DIR = BASE_DIR / "raw"
CLEANED_DIR = BASE_DIR / "cleaned"
LOGS_DIR = BASE_DIR / "logs"
REPORTS_DIR = BASE_DIR / "reports"

# Create directories
for directory in [RAW_DIR, CLEANED_DIR, LOGS_DIR, REPORTS_DIR]:
    directory.mkdir(exist_ok=True)

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

# Import settings
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 3000))
MAX_ERRORS = int(os.getenv("MAX_ERRORS", 1000))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Find all .xls files in raw directory
SOURCE_FILES = sorted(glob.glob(str(RAW_DIR / "*.xls")))

# Output files
CLEANED_FILE = CLEANED_DIR / "all_villages_cleaned.csv"
ERROR_FILE = LOGS_DIR / "invalid_rows.csv"
DUPLICATE_FILE = LOGS_DIR / "duplicate_rows.csv"
REPORT_FILE = REPORTS_DIR / "import_summary.json"

# MDDS Column mappings (exact column names from your files)
COLUMN_MAPPING = {
    "MDDS STC": "state_code",
    "STATE NAME": "state_name",
    "MDDS DTC": "district_code",
    "DISTRICT NAME": "district_name",
    "MDDS Sub_DT": "subdistrict_code",
    "SUB-DISTRICT NAME": "subdistrict_name",
    "MDDS PLCN": "village_code",
    "Area Name": "village_name",
}

# Required columns after mapping
REQUIRED_COLUMNS = [
    "state_code",
    "state_name",
    "district_code",
    "district_name",
    "subdistrict_code",
    "subdistrict_name",
    "village_code",
    "village_name",
]

print(f"✓ Configuration loaded")
print(f"  Database: {DATABASE_URL[:40]}...")
print(f"  Batch size: {BATCH_SIZE}")
print(f"  Found {len(SOURCE_FILES)} state files")