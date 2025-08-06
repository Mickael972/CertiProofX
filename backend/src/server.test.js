const request = require('supertest');
const app = require('./server');

describe('Server', () => {
  test('health endpoint returns 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  test('root endpoint returns 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
}); 