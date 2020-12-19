const express = require("express");
const noteRouter = require("./Routes/noteRoutes");
const globalErrorHandler = require("./Controllers/errorController");
const AppError = require("./utils/AppError");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const app = express();

app.use(express.json());
// Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
//Enable CORS
app.use(cors());

app.use(limiter);

//Prevent http param pollution
app.use(hpp());
app.use("/api/notes", noteRouter);
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "/client/build/index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}
app.use(globalErrorHandler);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT,PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
module.exports = app;
