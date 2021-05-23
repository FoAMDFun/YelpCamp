const Campground = require("../models/campground");
const Review = require("../models/review");
const langData = require("../public/data/language.json");

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", req.session.langData.successReview);
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const { language } = req.session;
    Campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", req.session.langData.successDeleteReview);
    res.redirect(`/campgrounds/${id}`);
};
