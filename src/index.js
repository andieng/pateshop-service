import "express-async-errors";
import "dotenv/config";
import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import passportConfig from "./config/passport";
import authRouter from "./routes/authRoute";
import ordersRouter from "./routes/ordersRoute";
import customersRouter from "./routes/customersRoute";
import productsRouter from "./routes/productsRoute";
import categoriesRouter from "./routes/categoriesRoute";
import checkAuthentication from "./middlewares/checkAuthentication";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/categories", productsRouter);
app.use("/api/customers", customersRouter);
// app.use("/api/orders", checkAuthentication, ordersRouter);
// app.use("/api/categories", checkAuthentication, categoriesRouter);
app.use("/api/products", checkAuthentication, productsRouter);
// app.use("/api/customers", checkAuthentication, customersRouter);

app.get("/", (req, res) => {
  res.json({ msg: "Hello World!" });
});

// Custom error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const status = res.statusCode || 500;
  console.error(err);
  res.status(status).json({
    error: err.message,
  });
});

export default app;
