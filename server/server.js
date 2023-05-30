const express = require("express");
const app = express();
const signupRouter = require("./../auth/signup");
const signinRouter = require("./../auth/signin");
const forgotpassRouter = require("../auth/forgotpass");
const verifycodeRouter = require("./../auth/verifycode");
const resetpassRouter = require("./../auth/resetpass");
const profileRouter = require("./../auth/profile");

// Middleware untuk mengizinkan body request dalam format JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Routes
app.get("/", (req, res) => {
  res.send("Hello World! This is the main page of the server. Please use the correct routes. #LifeAtBangkit");
});
app.use("/auth/register", signupRouter);
app.use("/auth/login", signinRouter);
app.use("/auth/forgot-password", forgotpassRouter);
app.use("/auth/verify-code", verifycodeRouter);
app.use("/auth/reset-password", resetpassRouter);
app.use("/profile", profileRouter);

// Mulai server
app.listen(8080, () => {
  console.log("Server started on port http://localhost:8080");
});
