// PM2 Ecosystem Configuration pour CertiProofX
// Plus simple et sécurisé que Docker !

module.exports = {
  apps: [
    {
      // Backend API
      name: 'certiproof-backend',
      cwd: './backend',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      restart_delay: 4000
    },
    {
      // Frontend (avec serve)
      name: 'certiproof-frontend', 
      cwd: './frontend',
      script: 'npx',
      args: 'serve -s build -l 3000',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/certiproofx.git',
      path: '/var/www/certiproofx',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};