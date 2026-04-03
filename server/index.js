require("dotenv").config();
const app = require("./src/app");
const { initDatabase } = require("./src/db");

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();