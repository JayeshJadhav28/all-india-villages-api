-- Enable pg_trgm extension for trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN index on village searchableText (use camelCase as in Prisma schema)
CREATE INDEX IF NOT EXISTS village_searchable_gin 
ON villages USING gin ("searchableText" gin_trgm_ops);

-- Add composite index for filtered searches (use camelCase)
CREATE INDEX IF NOT EXISTS village_subdistrict_name 
ON villages ("subDistrictId", name);