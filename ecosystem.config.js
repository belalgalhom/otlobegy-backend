module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/src/api.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'ws',
      script: 'dist/src/ws.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '200M',
    },
    {
      name: 'worker',
      script: 'dist/src/worker.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '200M',
    },
  ],
};