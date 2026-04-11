import request from 'supertest';

export async function adminLogin(app: any) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

  if (!res.body?.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(res.body)}`);
  }

  return res.body.data.token as string;
}

export async function registerClient(app: any, email: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    businessName: 'Test Client Pvt Ltd',
    phone: '+919999999999',
    password: 'Password@123',
    gstNumber: '27ABCDE1234F1Z5',
  });

  if (!res.body?.success) throw new Error(`Register failed: ${JSON.stringify(res.body)}`);

  return res.body.data.id as string;
}

export async function approveClient(app: any, adminToken: string, userId: string) {
  const res = await request(app)
    .post(`/api/admin/users/${userId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send();

  if (!res.body?.success) throw new Error(`Approve failed: ${JSON.stringify(res.body)}`);
}

export async function clientLogin(app: any, email: string) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Password@123' });

  if (!res.body?.success) throw new Error(`Client login failed: ${JSON.stringify(res.body)}`);

  return res.body.data.token as string;
}

export async function createApiKey(app: any, clientToken: string) {
  const res = await request(app)
    .post('/api/b2b/keys')
    .set('Authorization', `Bearer ${clientToken}`)
    .send({ name: 'test-key' });

  if (!res.body?.success) throw new Error(`Create key failed: ${JSON.stringify(res.body)}`);

  // response: { id, name, key, createdAt, secret }
  return res.body.data as { id: string; key: string; secret: string };
}