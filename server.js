const express = require("express");
const errorHandler = require("./middleware/errorhandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();

connectDb();
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route handler for contacts
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use(errorHandler);
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});