const request = require('supertest');
const express = require('express');
const exampleRoute = require('../routes/example'); // Ajusta la ruta si es necesario

const app = express();
app.use('/api', exampleRoute);

describe('GET /api/ping', () => {
  it('should return pong', async () => {
    const response = await request(app).get('/api/ping');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('pong');
  });
});
