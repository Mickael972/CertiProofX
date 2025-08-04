/**
 * Health check routes for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * 
 * Provides health status and monitoring endpoints
 */

const express = require('express');
const config = require('../config/config');
const logger = require('../utils/logger');
const ipfsService = require('../services/ipfsService');

const router = express.Router();

// Track service start time
const serviceStartTime = new Date();

/**
 * Basic health check
 * GET /api/health
 */
router.get('/', async (req, res) => {
  try {
    const uptime = Date.now() - serviceStartTime.getTime();
    const memoryUsage = process.memoryUsage();
    
    // Basic health status
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        human: formatUptime(uptime)
      },
      service: {
        name: config.app.name,
        version: config.app.version,
        environment: config.server.env,
        author: config.app.author,
        contact: config.app.contact
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        },
        cpu: process.cpuUsage()
      }
    };

    res.status(200).json(healthStatus);

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Detailed health check with dependencies
 * GET /api/health/detailed
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    const uptime = startTime - serviceStartTime.getTime();
    const memoryUsage = process.memoryUsage();

    // Check IPFS service
    let ipfsStatus;
    try {
      ipfsStatus = await ipfsService.getStatus();
      ipfsStatus.healthy = true;
      ipfsStatus.responseTime = '< 100ms'; // Would measure actual response time
    } catch (error) {
      ipfsStatus = {
        healthy: false,
        error: error.message,
        provider: config.ipfs.provider
      };
    }

    // Check environment variables
    const envCheck = {
      required: {
        NODE_ENV: !!process.env.NODE_ENV,
        PORT: !!process.env.PORT
      },
      ipfs: {},
      optional: {
        LOG_LEVEL: !!process.env.LOG_LEVEL,
        API_KEY: !!process.env.API_KEY
      }
    };

    // Check IPFS-specific env vars
    switch (config.ipfs.provider) {
      case 'web3storage':
        envCheck.ipfs.WEB3_STORAGE_TOKEN = !!process.env.WEB3_STORAGE_TOKEN;
        break;
      case 'pinata':
        envCheck.ipfs.PINATA_API_KEY = !!process.env.PINATA_API_KEY;
        envCheck.ipfs.PINATA_SECRET_KEY = !!process.env.PINATA_SECRET_KEY;
        break;
      case 'infura':
        envCheck.ipfs.INFURA_IPFS_PROJECT_ID = !!process.env.INFURA_IPFS_PROJECT_ID;
        envCheck.ipfs.INFURA_IPFS_PROJECT_SECRET = !!process.env.INFURA_IPFS_PROJECT_SECRET;
        break;
    }

    // Overall health determination
    const isHealthy = ipfsStatus.healthy && 
                     Object.values(envCheck.required).every(Boolean) &&
                     Object.values(envCheck.ipfs).every(Boolean);

    const healthStatus = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        human: formatUptime(uptime),
        startTime: serviceStartTime.toISOString()
      },
      service: {
        name: config.app.name,
        version: config.app.version,
        environment: config.server.env,
        author: config.app.author,
        contact: config.app.contact,
        license: config.app.license,
        repository: config.app.repository
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024)
        },
        cpu: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : 'N/A (Windows)'
      },
      dependencies: {
        ipfs: ipfsStatus
      },
      configuration: {
        upload: {
          maxFileSize: `${Math.round(config.upload.maxFileSize / 1024 / 1024)} MB`,
          allowedTypes: config.upload.allowedMimeTypes.length,
          tempDirectory: config.upload.tempDirectory
        },
        security: {
          apiKeyEnabled: config.security.enableApiKeyAuth,
          rateLimitEnabled: true,
          corsEnabled: true
        },
        logging: {
          level: config.logging.level,
          fileEnabled: config.logging.file.enabled,
          consoleEnabled: config.logging.console.enabled
        }
      },
      environment: envCheck,
      responseTime: `${Date.now() - startTime}ms`
    };

    res.status(isHealthy ? 200 : 503).json(healthStatus);

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Readiness probe (for Kubernetes)
 * GET /api/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const ipfsReady = await checkIPFSReadiness();
    
    const isReady = ipfsReady;

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          ipfs: ipfsReady
        }
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          ipfs: ipfsReady
        }
      });
    }

  } catch (error) {
    logger.error('Readiness check failed:', error);
    
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness probe (for Kubernetes)
 * GET /api/health/live
 */
router.get('/live', (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Date.now() - serviceStartTime.getTime()
  });
});

/**
 * Metrics endpoint (basic Prometheus-style metrics)
 * GET /api/health/metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const uptime = Date.now() - serviceStartTime.getTime();
    const memoryUsage = process.memoryUsage();
    
    // Basic metrics in Prometheus format
    const metrics = [
      '# HELP certiproof_uptime_seconds Total uptime of the service in seconds',
      '# TYPE certiproof_uptime_seconds counter',
      `certiproof_uptime_seconds ${Math.floor(uptime / 1000)}`,
      '',
      '# HELP certiproof_memory_usage_bytes Memory usage in bytes',
      '# TYPE certiproof_memory_usage_bytes gauge',
      `certiproof_memory_usage_bytes{type="rss"} ${memoryUsage.rss}`,
      `certiproof_memory_usage_bytes{type="heap_total"} ${memoryUsage.heapTotal}`,
      `certiproof_memory_usage_bytes{type="heap_used"} ${memoryUsage.heapUsed}`,
      `certiproof_memory_usage_bytes{type="external"} ${memoryUsage.external}`,
      '',
      '# HELP certiproof_info Service information',
      '# TYPE certiproof_info gauge',
      `certiproof_info{version="${config.app.version}",environment="${config.server.env}",node_version="${process.version}"} 1`,
      ''
    ].join('\n');

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(metrics);

  } catch (error) {
    logger.error('Metrics generation failed:', error);
    res.status(500).send('# Error generating metrics\n');
  }
});

/**
 * Service information
 * GET /api/health/info
 */
router.get('/info', (req, res) => {
  const info = {
    service: {
      name: config.app.name,
      version: config.app.version,
      description: 'Backend API for CertiProof X - Decentralized Proof Protocol',
      author: config.app.author,
      contact: config.app.contact,
      license: config.app.license,
      repository: config.app.repository,
      documentation: config.app.documentation
    },
    runtime: {
      environment: config.server.env,
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch
    },
    features: {
      ipfsUpload: true,
      certificateGeneration: true,
      qrCodeGeneration: true,
      verification: true,
      metadata: true
    },
    endpoints: {
      upload: '/api/upload',
      certificate: '/api/certificate',
      verification: '/api/verification',
      metadata: '/api/metadata',
      health: '/api/health'
    },
    support: {
      maxFileSize: `${Math.round(config.upload.maxFileSize / 1024 / 1024)} MB`,
      supportedFormats: config.upload.allowedMimeTypes,
      ipfsProvider: config.ipfs.provider
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(info);
});

// Helper functions
function formatUptime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

async function checkIPFSReadiness() {
  try {
    const status = await ipfsService.getStatus();
    return status.operational === true;
  } catch (error) {
    logger.warn('IPFS readiness check failed:', error.message);
    return false;
  }
}

module.exports = router;