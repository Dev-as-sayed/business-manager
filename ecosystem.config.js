module.exports = {
  apps: [
    {
      // Omnia web frontend -> https://omnia.amsayed.store
      name: "omnia",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3034",
      cwd: "/var/www/omnia/business-manager/web",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: 3034,
      },
    },
    {
      // Business Manager CRM API -> https://server.omnia.amsayed.store
      name: "business-manager",
      script: "dist/server.js",
      cwd: "/var/www/omnia/business-manager/CRM/server",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: 4001,
      },
    },
  ],
};
