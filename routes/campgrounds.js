const express = require("express");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.get(
    "/",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post(
    "/",
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();
        req.flash("success", "Successfully made a new campground!");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        try {
            const campground = await Campground.findById(id)
                .populate({ path: "reviews", populate: { path: "author" } })
                .populate("author");
            if (!campground) {
                req.flash("error", "Cannot find that campground!");
                return res.redirect("/campgrounds");
            }
            res.render("campgrounds/show", { campground });
        } catch (error) {
            req.flash("error", "Cannot find that campground!");
            return res.redirect("/campgrounds");
        }
    })
);

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        try {
            const { id } = req.params;
            const campground = await Campground.findById(id);
            if (!campground) {
                req.flash("error", "Cannot find that campground!");
                return res.redirect("/campgrounds");
            }
            res.render("campgrounds/edit", { campground });
        } catch (error) {
            req.flash("error", "Cannot find that campground!");
            return res.redirect("/campgrounds");
        }
    })
);

router.put(
    "/:id",
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
        });
        req.flash("success", "Successfully updated campground!");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:id",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted campground!");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
