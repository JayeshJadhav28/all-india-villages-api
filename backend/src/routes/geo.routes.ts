import { Router } from 'express';
import * as geoController from '../controllers/geo.controller.js';
import { apiKeyAuth } from '../middlewares/apiKeyAuth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// Public health check (no auth required)
router.get('/health', geoController.healthCheck);

// Protected routes (require API key + rate limiting)
router.use(apiKeyAuth);
router.use(rateLimiter);

// Hierarchy endpoints
router.get('/states', geoController.getAllStates);
router.get('/states/:stateId/districts', geoController.getDistrictsByState);
router.get('/districts/:districtId/subdistricts', geoController.getSubDistrictsByDistrict);
router.get('/subdistricts/:subdistrictId/villages', geoController.getVillagesBySubDistrict);

// Village detail
router.get('/villages/:villageId', geoController.getVillageById);

// Search endpoints
router.get('/search', geoController.searchVillages);
router.get('/autocomplete', geoController.autocompleteVillages);

export default router;