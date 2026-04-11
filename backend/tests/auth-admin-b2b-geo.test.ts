import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/app.js';
import { adminLogin, registerClient, approveClient, clientLogin, createApiKey } from './helpers';

describe('Core flows', () => {
  it('register -> pending login blocked -> admin approve -> client login -> create api key -> geo autocomplete', async () => {
    const email = `client_${Date.now()}@example.com`;

    // Register creates PENDING
    const userId = await registerClient(app, email);

    // Pending login should be blocked with 403
    const pendingLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password@123' });

    expect(pendingLogin.status).toBe(403);
    expect(pendingLogin.body.success).toBe(false);
    expect(pendingLogin.body.error.code).toBe('PENDING_APPROVAL');

    // Admin approves
    const adminToken = await adminLogin(app);
    await approveClient(app, adminToken, userId);

    // Client can login
    const clientToken = await clientLogin(app, email);

    // Create API key
    const key = await createApiKey(app, clientToken);

    expect(key.key.startsWith('ak_')).toBe(true);
    expect(key.secret.startsWith('as_')).toBe(true);

    // Geo autocomplete requires api key/secret
    const geo = await request(app)
      .get('/api/v1/autocomplete?q=ma&limit=5')
      .set('X-API-Key', key.key)
      .set('X-API-Secret', key.secret);

    expect(geo.status).toBe(200);
    expect(geo.body.success).toBe(true);
    expect(Array.isArray(geo.body.data)).toBe(true);

    // Admin logs endpoint should work
    const logs = await request(app)
      .get('/api/admin/logs?limit=10&page=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(logs.status).toBe(200);
    expect(logs.body.success).toBe(true);
    expect(Array.isArray(logs.body.data)).toBe(true);
  });

  it('geo autocomplete rejects missing api key headers', async () => {
    const res = await request(app).get('/api/v1/autocomplete?q=ma&limit=5');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_API_KEY');
  });
});