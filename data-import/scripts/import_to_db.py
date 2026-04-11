"""
Import cleaned village data to PostgreSQL database
"""
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
import sys
import json
from pathlib import Path
from datetime import datetime
from tqdm import tqdm

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from config import (
    DATABASE_URL, CLEANED_FILE, REPORT_FILE, BATCH_SIZE
)


class VillageImporter:
    def __init__(self):
        self.conn = None
        self.cursor = None
        self.stats = {
            'start_time': datetime.now().isoformat(),
            'countries': 0,
            'states': 0,
            'districts': 0,
            'subdistricts': 0,
            'villages': 0,
            'errors': 0,
        }
    
    def connect(self):
        """Connect to database"""
        print("\n🔌 Connecting to database...")
        try:
            self.conn = psycopg2.connect(DATABASE_URL)
            self.cursor = self.conn.cursor()
            print("✓ Connected successfully")
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            sys.exit(1)
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✓ Database connection closed")
    
    def check_existing_data(self):
        """Check if database already has data"""
        self.cursor.execute("SELECT COUNT(*) FROM villages")
        existing_villages = self.cursor.fetchone()[0]
        
        if existing_villages > 0:
            print(f"\n⚠️  WARNING: Database already has {existing_villages:,} villages!")
            print(f"  Running import again will create DUPLICATES.")
            response = input("  Continue anyway? (yes/no): ")
            if response.lower() != 'yes':
                print("\n  ❌ Import aborted.")
                print("  To reset database, run: npx prisma migrate reset")
                sys.exit(0)
    
    def load_data(self):
        """Load cleaned data"""
        print(f"\n📂 Loading cleaned data...")
        cleaned_path = Path(__file__).parent.parent / CLEANED_FILE
        
        if not cleaned_path.exists():
            print(f"✗ File not found: {cleaned_path}")
            sys.exit(1)
        
        self.df = pd.read_csv(cleaned_path, dtype=str)
        
        # 🔧 FIX: Ensure codes are normalized during import too
        print("  Normalizing codes...")
        self.df['state_code'] = self.df['state_code'].astype(str).str.strip().str.zfill(2)
        self.df['district_code'] = self.df['district_code'].astype(str).str.strip()
        self.df['subdistrict_code'] = self.df['subdistrict_code'].astype(str).str.strip()
        self.df['village_code'] = self.df['village_code'].astype(str).str.strip()
        
        print(f"✓ Loaded {len(self.df):,} rows")
        return self.df
    
    def insert_country(self):
        """Insert India"""
        print("\n🇮🇳 Inserting country: India...")
        
        query = """
            INSERT INTO countries (id, name, code, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, NOW(), NOW())
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        """
        
        try:
            self.cursor.execute(query, ('India', 'IN'))
            self.country_id = self.cursor.fetchone()[0]
            self.conn.commit()
            self.stats['countries'] = 1
            print(f"✓ Country inserted (ID: {self.country_id})")
        except Exception as e:
            print(f"✗ Error inserting country: {e}")
            self.conn.rollback()
            raise
    
    def insert_states(self):
        """Insert unique states"""
        print("\n🏛️  Inserting states...")
        
        # Extract unique states
        states_df = self.df[['state_code', 'state_name', 'state_slug']].drop_duplicates()
        
        query = """
            INSERT INTO states (id, "countryId", code, name, slug, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (code) DO UPDATE SET 
                name = EXCLUDED.name,
                slug = EXCLUDED.slug
            RETURNING id, code;
        """
        
        self.state_map = {}  # code -> id mapping
        
        for _, row in tqdm(states_df.iterrows(), total=len(states_df), desc="States"):
            try:
                self.cursor.execute(query, (
                    self.country_id,
                    row['state_code'],
                    row['state_name'],
                    row['state_slug']
                ))
                state_id, state_code = self.cursor.fetchone()
                self.state_map[state_code] = state_id
                self.stats['states'] += 1
            except Exception as e:
                print(f"\n✗ Error inserting state {row['state_name']}: {e}")
                self.stats['errors'] += 1
        
        self.conn.commit()
        print(f"✓ Inserted {self.stats['states']} states")
        
        # 🔍 DEBUG: Show sample mapping
        if len(self.state_map) > 0:
            sample_state = list(self.state_map.items())[0]
            print(f"  Sample: Code '{sample_state[0]}' → ID {sample_state[1]}")
    
    def insert_districts(self):
        """Insert unique districts"""
        print("\n🏙️  Inserting districts...")
        
        # Extract unique districts
        districts_df = self.df[[
            'state_code', 'district_code', 'district_name', 'district_slug'
        ]].drop_duplicates()
        
        query = """
            INSERT INTO districts (id, "stateId", code, name, slug, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT ("stateId", code) DO UPDATE SET 
                name = EXCLUDED.name,
                slug = EXCLUDED.slug
            RETURNING id, code;
        """
        
        self.district_map = {}  # (state_code, district_code) -> id
        skipped = 0
        
        for _, row in tqdm(districts_df.iterrows(), total=len(districts_df), desc="Districts"):
            try:
                state_id = self.state_map.get(row['state_code'])
                if not state_id:
                    skipped += 1
                    continue
                
                self.cursor.execute(query, (
                    state_id,
                    row['district_code'],
                    row['district_name'],
                    row['district_slug']
                ))
                district_id, district_code = self.cursor.fetchone()
                self.district_map[(row['state_code'], district_code)] = district_id
                self.stats['districts'] += 1
            except Exception as e:
                print(f"\n✗ Error inserting district {row['district_name']}: {e}")
                self.stats['errors'] += 1
        
        self.conn.commit()
        print(f"✓ Inserted {self.stats['districts']} districts")
        if skipped > 0:
            print(f"  ⚠  Skipped {skipped} districts (missing parent state)")
    
    def insert_subdistricts(self):
        """Insert unique sub-districts"""
        print("\n🏘️  Inserting sub-districts...")
        
        # Extract unique sub-districts
        subdistricts_df = self.df[[
            'state_code', 'district_code', 'subdistrict_code', 
            'subdistrict_name', 'subdistrict_slug'
        ]].drop_duplicates()
        
        query = """
            INSERT INTO sub_districts (id, "districtId", code, name, slug, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT ("districtId", code) DO UPDATE SET 
                name = EXCLUDED.name,
                slug = EXCLUDED.slug
            RETURNING id, code;
        """
        
        self.subdistrict_map = {}  # (state_code, district_code, subdistrict_code) -> id
        skipped = 0
        
        for _, row in tqdm(subdistricts_df.iterrows(), total=len(subdistricts_df), desc="Sub-Districts"):
            try:
                district_id = self.district_map.get((row['state_code'], row['district_code']))
                if not district_id:
                    skipped += 1
                    continue
                
                self.cursor.execute(query, (
                    district_id,
                    row['subdistrict_code'],
                    row['subdistrict_name'],
                    row['subdistrict_slug']
                ))
                subdistrict_id, subdistrict_code = self.cursor.fetchone()
                key = (row['state_code'], row['district_code'], subdistrict_code)
                self.subdistrict_map[key] = subdistrict_id
                self.stats['subdistricts'] += 1
            except Exception as e:
                print(f"\n✗ Error inserting sub-district {row['subdistrict_name']}: {e}")
                self.stats['errors'] += 1
        
        self.conn.commit()
        print(f"✓ Inserted {self.stats['subdistricts']} sub-districts")
        if skipped > 0:
            print(f"  ⚠  Skipped {skipped} sub-districts (missing parent district)")
    
    def insert_villages(self):
        """Batch insert villages"""
        print(f"\n🏡 Inserting villages (batch size: {BATCH_SIZE})...")
        
        query = """
            INSERT INTO villages (
                id, "subDistrictId", code, name, slug, 
                "fullAddress", "searchableText", "createdAt", "updatedAt"
            )
            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (code) DO NOTHING;
        """
        
        # Prepare batch data
        batch_data = []
        skipped = 0
        
        for _, row in tqdm(self.df.iterrows(), total=len(self.df), desc="Villages"):
            try:
                key = (row['state_code'], row['district_code'], row['subdistrict_code'])
                subdistrict_id = self.subdistrict_map.get(key)
                
                if not subdistrict_id:
                    skipped += 1
                    continue
                
                batch_data.append((
                    subdistrict_id,
                    row['village_code'],
                    row['village_name'],
                    row['village_slug'],
                    row['full_address'],
                    row['searchable_text']
                ))
                
                # Execute batch when size reached
                if len(batch_data) >= BATCH_SIZE:
                    execute_batch(self.cursor, query, batch_data)
                    self.stats['villages'] += len(batch_data)
                    self.conn.commit()
                    batch_data = []
                    
            except Exception as e:
                print(f"\n✗ Error preparing village {row.get('village_name')}: {e}")
                self.stats['errors'] += 1
        
        # Insert remaining batch
        if batch_data:
            execute_batch(self.cursor, query, batch_data)
            self.stats['villages'] += len(batch_data)
            self.conn.commit()
        
        print(f"✓ Inserted {self.stats['villages']:,} villages")
        if skipped > 0:
            print(f"  ⚠  Skipped {skipped:,} villages (missing parent sub-district)")
    
    def save_report(self):
        """Save import report"""
        self.stats['end_time'] = datetime.now().isoformat()
        
        report_path = Path(__file__).parent.parent / REPORT_FILE
        report_path.parent.mkdir(exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(self.stats, f, indent=2)
        
        print(f"\n📊 Report saved: {report_path}")
    
    def run(self):
        """Main import pipeline"""
        print("=" * 80)
        print("DATABASE IMPORT PIPELINE")
        print("=" * 80)
        
        try:
            self.connect()
            
            # 🛡️ Check for existing data
            self.check_existing_data()
            
            self.load_data()
            self.insert_country()
            self.insert_states()
            self.insert_districts()
            self.insert_subdistricts()
            self.insert_villages()
            self.save_report()
            
            print("\n" + "=" * 80)
            print("✅ IMPORT COMPLETE")
            print("=" * 80)
            print(f"Countries:      {self.stats['countries']}")
            print(f"States:         {self.stats['states']}")
            print(f"Districts:      {self.stats['districts']}")
            print(f"Sub-Districts:  {self.stats['subdistricts']}")
            print(f"Villages:       {self.stats['villages']:,}")
            print(f"Errors:         {self.stats['errors']}")
            print("=" * 80)
            
        except Exception as e:
            print(f"\n❌ Import failed: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
        
        finally:
            self.disconnect()


if __name__ == "__main__":
    importer = VillageImporter()
    importer.run()