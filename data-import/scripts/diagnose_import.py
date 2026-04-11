"""
Diagnose import issues
"""
import psycopg2
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))
from config import DATABASE_URL

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

print("=" * 80)
print("DATABASE DIAGNOSTIC")
print("=" * 80)

# Table counts
cursor.execute("""
    SELECT 
      (SELECT COUNT(*) FROM countries) as countries,
      (SELECT COUNT(*) FROM states) as states,
      (SELECT COUNT(*) FROM districts) as districts,
      (SELECT COUNT(*) FROM sub_districts) as sub_districts,
      (SELECT COUNT(*) FROM villages) as villages
""")
counts = cursor.fetchone()
print(f"\n📊 Table Counts:")
print(f"  Countries:      {counts[0]:,}")
print(f"  States:         {counts[1]:,}")
print(f"  Districts:      {counts[2]:,}")
print(f"  Sub-Districts:  {counts[3]:,}")
print(f"  Villages:       {counts[4]:,}")

# Sample state
cursor.execute('SELECT id, code, name FROM states LIMIT 1')
state = cursor.fetchone()
if state:
    print(f"\n🏛️  Sample State:")
    print(f"  ID:   {state[0]}")
    print(f"  Code: '{state[1]}'")
    print(f"  Name: {state[2]}")

# Check orphans
cursor.execute("""
    SELECT COUNT(*) FROM districts d
    LEFT JOIN states s ON d."stateId" = s.id
    WHERE s.id IS NULL
""")
orphan_districts = cursor.fetchone()[0]

cursor.execute("""
    SELECT COUNT(*) FROM sub_districts sd
    LEFT JOIN districts d ON sd."districtId" = d.id
    WHERE d.id IS NULL
""")
orphan_subdistricts = cursor.fetchone()[0]

cursor.execute("""
    SELECT COUNT(*) FROM villages v
    LEFT JOIN sub_districts sd ON v."subDistrictId" = sd.id
    WHERE sd.id IS NULL
""")
orphan_villages = cursor.fetchone()[0]

print(f"\n⚠️  Orphaned Records (missing parents):")
print(f"  Districts:      {orphan_districts:,}")
print(f"  Sub-Districts:  {orphan_subdistricts:,}")
print(f"  Villages:       {orphan_villages:,}")

if orphan_districts > 0 or orphan_subdistricts > 0 or orphan_villages > 0:
    print(f"\n❌ PROBLEM: Orphaned records found!")
    print(f"   → Re-run import with fixed code matching")
else:
    print(f"\n✅ No orphaned records - hierarchy is correct")

# Sample hierarchy
cursor.execute("""
    SELECT 
        s.name as state,
        d.name as district,
        sd.name as subdistrict,
        COUNT(v.id) as villages
    FROM states s
    LEFT JOIN districts d ON d."stateId" = s.id
    LEFT JOIN sub_districts sd ON sd."districtId" = d.id
    LEFT JOIN villages v ON v."subDistrictId" = sd.id
    GROUP BY s.name, d.name, sd.name
    ORDER BY villages DESC
    LIMIT 5
""")

print(f"\n📈 Top 5 Sub-Districts by Village Count:")
for row in cursor.fetchall():
    print(f"  {row[0]} > {row[1]} > {row[2]}: {row[3]:,} villages")

conn.close()
print("\n" + "=" * 80)