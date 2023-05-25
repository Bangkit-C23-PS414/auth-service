const express = require("express");
const app = express();
const signupRouter = require("./../auth/signup");
const signinRouter = require("./../auth/signin");
const forgotpassRouter = require("../auth/forgotpass");
const verifycodeRouter = require("./../auth/verifycode");
const resetpassRouter = require("./../auth/resetpass");

// Middleware untuk mengizinkan body request dalam format JSON
app.use(express.json());

// Routes
app.use("/signup", signupRouter);
app.use("/signin", signinRouter);
app.use("/forgot-password", forgotpassRouter);
app.use("/verify-code", verifycodeRouter);
app.use("/reset-password", resetpassRouter);

// Mulai server
app.listen(8080, () => {
  console.log("Server started on port http://localhost:8080");
});
