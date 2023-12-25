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
import { ERROR_FAILED_CONNECTION, MSG_DATABASE_CONNECTED } from "./constants";
import checkConnection from "./middlewares/checkConnection";
import checkAuthentication from "./middlewares/checkAuthentication";
import {
  initializeConnection,
  isConnected,
  currentHost,
  currentDatabase,
  currentUser,
  currentPassword,
} from "./models";
import reportsRouter from "./routes/reportsRoute";

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
app.use("/api/auth", checkConnection, authRouter);
app.use("/api/orders", checkConnection, checkAuthentication, ordersRouter);
app.use(
  "/api/categories",
  checkConnection,
  checkAuthentication,
  categoriesRouter
);
app.use(
  "/api/customers",
  checkConnection,
  checkAuthentication,
  customersRouter
);
app.use("/api/products", checkConnection, checkAuthentication, productsRouter);
app.use("/api/reports", checkConnection, checkAuthentication, reportsRouter);

app.post("/api/connect", async (req, res) => {
  const { pgServer, pgDatabase, pgUsername, pgPassword } = req.body;
  if (
    !isConnected ||
    currentHost !== pgServer ||
    currentDatabase !== pgDatabase ||
    currentUser !== pgUsername ||
    currentPassword !== pgPassword
  ) {
    if (
      !(await initializeConnection(
        pgServer,
        pgDatabase,
        pgUsername,
        pgPassword
      ))
    ) {
      res.status(400);
      throw new Error(ERROR_FAILED_CONNECTION);
    }
  }

  return res.status(200).json({ message: MSG_DATABASE_CONNECTED });
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
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
