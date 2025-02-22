const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
require("dotenv").config();

const router = express.Router();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://gitbranch-viewer-backend.onrender.com/auth/github/callback"
          : "http://localhost:5000/auth/github/callback",
      scope: ["repo"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { profile, accessToken });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get("/github", passport.authenticate("github", { scope: ["repo"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect:
      process.env.NODE_ENV === "production"
        ? "https://git-branch-viewer.vercel.app"
        : "http://localhost:5173",
  }),
  (req, res) => {
    res.redirect(
      process.env.NODE_ENV === "production"
        ? "https://git-branch-viewer.vercel.app/dashboard"
        : "http://localhost:5173/dashboard"
    );
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("connect.sid", { path: "/" });
  res.clearCookie("__session", { path: "/" });
  res.clearCookie("__refresh_FOxR-AxE", { path: "/" });
  res.status(200).json({ message: "Logged out" });
});

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;
