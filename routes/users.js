const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { getLanguage } = require("../middleware");
const users = require("../controllers/users");

router.route("/register").get(getLanguage, users.renderRegister).post(getLanguage, catchAsync(users.register));
router
    .route("/login")
    .get(getLanguage, users.renderLogin)
    .post(
        getLanguage,
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        users.login
    );
router.get("/logout", getLanguage, users.logout);

module.exports = router;
