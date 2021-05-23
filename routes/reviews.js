const express = require("express");

const router = express.Router({ mergeParams: true });
const { getLanguage, validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const reviews = require("../controllers/reviews");

router.post("/", getLanguage, isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", getLanguage, isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
