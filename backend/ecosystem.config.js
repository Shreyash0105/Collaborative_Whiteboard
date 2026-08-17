module.exports = {
  apps: [{
    name: "drawing-api",
    script: "./server.js", // Update this to match your actual entry file (e.g., index.js)
    env: {
      NODE_ENV: "production",
      PORT: 5000 // Or whichever port your backend uses
    }
  }]
};