const Campground = require("./models/campground");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review");
const langData = require("./public/data/language.json");

module.exports.getLanguage = (req, res, next) => {
    if (req.session.language) {
        return next();
    }
    if (!req.session.language) {
        req.session.language = "en";
    }
    req.session.langData = langData.languages[req.session.language];
    next();
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

// Middleware for validateReview

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground.author.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that!");
            return res.redirect(`/campgrounds/${id}`);
        }
    } catch (error) {
        req.flash("error", "That campground doesn't exists!");
        return res.redirect(`/campgrounds`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review.author.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that!");
            return res.redirect(`/campgrounds/${id}`);
        }
    } catch (error) {
        req.flash("error", "That campground/review doesn't exists!");
        return res.redirect(`/campgrounds`);
    }
    next();
};
