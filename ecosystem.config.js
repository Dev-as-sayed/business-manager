module.exports = {
  apps: [
    {
      name: "business-manager",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        PORT: 3032,
        NODE_ENV: "production",
      },
      cwd: "/var/www/business-manager/web",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
