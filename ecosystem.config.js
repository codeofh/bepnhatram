module.exports = {
  apps: [{
    name: 'bepnhatram-dev',
    script: 'npm',
    args: 'run dev',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: ['src'],
    ignore_watch: ['node_modules', '.next', '.git'],
    autorestart: true,
    max_memory_restart: '1G'
  }]
};