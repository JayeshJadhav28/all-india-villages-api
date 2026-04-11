import { Request, Response } from 'express';
import * as geoService from '../services/geo.service.js';

// Health check
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const health = await geoService.getHealth();
    return res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
      },
    });
  }
};

// Get all states
export const getAllStates = async (req: Request, res: Response) => {
  try {
    const states = await geoService.getAllStates();
    
    return res.json({
      success: true,
      count: states.length,
      data: states,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch states',
      },
    });
  }
};

// Get districts by state
export const getDistrictsByState = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const districts = await geoService.getDistrictsByState(stateId);
    
    return res.json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch districts',
      },
    });
  }
};

// Get sub-districts by district
export const getSubDistrictsByDistrict = async (req: Request, res: Response) => {
  try {
    const { districtId } = req.params;
    const subdistricts = await geoService.getSubDistrictsByDistrict(districtId);
    
    return res.json({
      success: true,
      count: subdistricts.length,
      data: subdistricts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch sub-districts',
      },
    });
  }
};

// Get villages by sub-district (paginated)
export const getVillagesBySubDistrict = async (req: Request, res: Response) => {
  try {
    const { subdistrictId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    const result = await geoService.getVillagesBySubDistrict(subdistrictId, page, limit);
    
    return res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch villages',
      },
    });
  }
};

// Get village by ID
export const getVillageById = async (req: Request, res: Response) => {
  try {
    const { villageId } = req.params;
    const village = await geoService.getVillageById(villageId);
    
    if (!village) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Village not found',
        },
      });
    }
    
    return res.json({
      success: true,
      data: village,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch village',
      },
    });
  }
};

// Search villages
export const searchVillages = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Search query must be at least 2 characters',
        },
      });
    }
    
    const filters = {
      state: req.query.state as string,
      district: req.query.district as string,
      subDistrict: req.query.subDistrict as string,
    };
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    const result = await geoService.searchVillages(query, filters, page, limit);
    
    return res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Search failed',
      },
    });
  }
};

// Autocomplete villages
export const autocompleteVillages = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Query must be at least 2 characters',
        },
      });
    }
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    const results = await geoService.autocompleteVillages(query, limit);
    
    return res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Autocomplete failed',
      },
    });
  }
};