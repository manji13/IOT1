const serverless = require("serverless-http");
const app = require("../app");
const connectDB = require("../config/db");

// Connect DB (Vercel needs inside function)
connectDB();

// Export serverless app
module.exports = serverless(app);
