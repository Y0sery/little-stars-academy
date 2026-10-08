module.exports = {
  apps: [
    {
      name: 'little-stars-backend',
      script: 'server.js',
      cwd: './backend',
      instances: 1, // Single instance to preserve SQLite file locking integrity
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
