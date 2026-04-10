import prisma from '../config/db.js';
import { cacheGet, cacheSet, normalizeQuery, safeKeyPart } from '../utils/cache.js';

const TTL_24H = 60 * 60 * 24;
const TTL_1H = 60 * 60;

// Health check (no cache)
export const getHealth = async () => {
  const [stateCount, villageCount] = await Promise.all([
    prisma.state.count(),
    prisma.village.count(),
  ]);
  
  return {
    status: 'ok',
    database: 'connected',
    states: stateCount,
    villages: villageCount,
    timestamp: new Date().toISOString(),
  };
};

// Get all states (cached)
export const getAllStates = async () => {
  const key = `geo:states`;

  const cached = await cacheGet<any[]>(key);
  if (cached) return cached;

  const states = await prisma.state.findMany({
    select: { id: true, code: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  await cacheSet(key, states, TTL_24H);
  return states;
};

// Get districts by state (cached)
export const getDistrictsByState = async (stateId: string) => {
  const key = `geo:districts:${stateId}`;

  const cached = await cacheGet<any[]>(key);
  if (cached) return cached;

  const districts = await prisma.district.findMany({
    where: { stateId },
    select: { id: true, code: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  await cacheSet(key, districts, TTL_24H);
  return districts;
};

// Get sub-districts by district (cached)
export const getSubDistrictsByDistrict = async (districtId: string) => {
  const key = `geo:subdistricts:${districtId}`;

  const cached = await cacheGet<any[]>(key);
  if (cached) return cached;

  const subdistricts = await prisma.subDistrict.findMany({
    where: { districtId },
    select: { id: true, code: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  await cacheSet(key, subdistricts, TTL_24H);
  return subdistricts;
};

// Get villages by sub-district (paginated) (NOT cached by default)
export const getVillagesBySubDistrict = async (subdistrictId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [villages, total] = await Promise.all([
    prisma.village.findMany({
      where: { subDistrictId: subdistrictId },
      select: { id: true, code: true, name: true, slug: true, fullAddress: true },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.village.count({
      where: {
        subDistrictId: subdistrictId,
      },
    }),
  ]);
  
  return {
    data: villages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get village by ID with full hierarchy (not cached; optional if you want)
export const getVillageById = async (villageId: string) => {
  return prisma.village.findUnique({
    where: { id: villageId },
    select: {
      id: true,
      code: true,
      name: true,
      slug: true,
      fullAddress: true,
      subDistrict: {
        select: {
          id: true,
          name: true,
          district: {
            select: {
              id: true,
              name: true,
              state: {
                select: {
                  id: true,
                  name: true,
                  country: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
};

// Search villages (not cached)
export const searchVillages = async (
  query: string,
  filters: { state?: string; district?: string; subDistrict?: string },
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    searchableText: { contains: query.toLowerCase() },
  };

  if (filters.state) {
    where.subDistrict = {
      district: {
        state: {
          name: { contains: filters.state, mode: 'insensitive' },
        },
      },
    };
  }

  if (filters.district) {
    where.subDistrict = {
      ...where.subDistrict,
      district: {
        ...where.subDistrict?.district,
        name: { contains: filters.district, mode: 'insensitive' },
      },
    };
  }

  if (filters.subDistrict) {
    where.subDistrict = {
      ...where.subDistrict,
      name: { contains: filters.subDistrict, mode: 'insensitive' },
    };
  }

  const [villages, total] = await Promise.all([
    prisma.village.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        fullAddress: true,
        subDistrict: {
          select: {
            name: true,
            district: { select: { name: true, state: { select: { name: true } } } },
          },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.village.count({ where }),
  ]);
  
  return {
    data: villages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Autocomplete villages (cached)
export const autocompleteVillages = async (query: string, limit: number) => {
  const q = normalizeQuery(query);
  const key = `autocomplete:${safeKeyPart(q)}:${limit}`;

  const cached = await cacheGet<any[]>(key);
  if (cached) return cached;

  const villages = await prisma.village.findMany({
    where: {
      searchableText: {
        contains: q,
      },
    },
    select: {
      id: true,
      code: true,
      name: true,
      fullAddress: true,
      subDistrict: {
        select: {
          name: true,
          district: {
            select: {
              name: true,
              state: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    take: limit,
    orderBy: { name: 'asc' },
  });

  const formatted = villages.map((v) => ({
    value: v.id,
    label: v.name,
    fullAddress: v.fullAddress,
    hierarchy: {
      village: v.name,
      subDistrict: v.subDistrict.name,
      district: v.subDistrict.district.name,
      state: v.subDistrict.district.state.name,
      country: 'India',
    },
  }));

  await cacheSet(key, formatted, TTL_1H);
  return formatted;
};