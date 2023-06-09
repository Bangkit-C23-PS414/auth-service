const express = require("express");
const app = express();
const signupRouter = require("./../auth/signup");
const signinRouter = require("./../auth/signin");
const forgotpassRouter = require("../auth/forgotpass");
const verifycodeRouter = require("./../auth/verifycode");
const resetpassRouter = require("./../auth/resetpass");

const authMiddleware = require("./auth-middleware")
const profileRouter = require("../profile/get-profile");
const editProfileRouter = require("../profile/edit-profile");
const updateAvatarRouter = require("../profile/update-avatar");
const changePasswordRouter = require("../profile/change-password");

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
app.use("/profile/me", profileRouter);
app.use("/profile/edit", editProfileRouter);
app.use("/profile/update-avatar", authMiddleware, updateAvatarRouter);
app.use("/profile/change-password", authMiddleware, changePasswordRouter);

// Mulai server
app.listen(8080, () => {
  console.log("Server started on port http://localhost:8080");
});
