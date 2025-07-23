const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./Config/database");
const cors = require("cors");
const routers = require("./Routes/routers");
const cloudinaryStorage = require("./Config/cloudinary");
const fileupload = require("express-fileupload");
const router = require("./Routes/fileUpload");
const adminRouter = require("./Routes/admin");
const addressrouter = require("./Routes/addressRoutes");
const couponrouter = require("./Routes/couponRoutes");

// --- Middleware ---
app.use(fileupload({ useTempFiles: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // cookieParser should typically be used before routes that might need to access cookies

// --- Routes ---
app.use("/api/v1", routers);
app.use("/api/v1/fileUpload", router);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/address", addressrouter);
app.use("/api/v1/coupon", couponrouter);


const PORT = process.env.PORT || 4000;

// Connect to the database and then start the server
connectDB()
  .then(() => {
    // Only start the server if the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database. Server not started.", error);
    process.exit(1); // Exit the process with an error code
  });


cloudinaryStorage();