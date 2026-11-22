module.exports = {
  apps: [
    {
      name: "omnia",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3034",
      cwd: __dirname,
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
  ],
};
