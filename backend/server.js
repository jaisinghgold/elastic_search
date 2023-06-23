const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Import the upload router
const uploadRouter = require("./routers/upload");

// Use middleware
app.use(cors());
app.use(express.json());

// Use the upload router for the root path
app.use("/", uploadRouter);

// Start the server
const port = process.env.PORT || 6000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
