const request = require('supertest');

// Mock the IPFS service before requiring the server
jest.mock('./services/ipfsService', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue({
      hash: 'mock_hash',
      url: 'https://ipfs.io/ipfs/mock_hash',
      gateway: 'https://ipfs.io/ipfs/mock_hash',
      size: 1024,
      type: 'application/pdf',
      filename: 'test.pdf',
      uploadTime: 100,
      provider: 'mock',
      mock: true
    }),
    uploadMetadata: jest.fn().mockResolvedValue({
      hash: 'mock_metadata_hash',
      url: 'https://ipfs.io/ipfs/mock_metadata_hash'
    }),
    retrieveFile: jest.fn().mockResolvedValue({
      content: Buffer.from('test content'),
      metadata: { filename: 'test.pdf' }
    }),
    fileExists: jest.fn().mockResolvedValue(true),
    getFileMetadata: jest.fn().mockResolvedValue({
      filename: 'test.pdf',
      size: 1024,
      type: 'application/pdf'
    }),
    getStatus: jest.fn().mockResolvedValue({
      provider: 'mock',
      status: 'connected'
    })
  }))
}));

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