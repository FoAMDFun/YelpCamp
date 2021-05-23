const express = require("express");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const router = express.Router();
const { getLanguage, isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const campgrounds = require("../controllers/campgrounds");

router
    .route("/")
    .get(getLanguage, catchAsync(campgrounds.index))
    .post(getLanguage, isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

router.get("/new", getLanguage, isLoggedIn, campgrounds.renderNewForm);
router
    .route("/:id")
    .get(getLanguage, catchAsync(campgrounds.showCampground))
    .put(getLanguage, isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(getLanguage, isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
router.get("/:id/edit", getLanguage, isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
