const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const langData = require("../public/data/language.json");

module.exports.index = async (req, res) => {
    const { language } = req.session;
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds, language, langData: req.session.langData });
};

module.exports.renderNewForm = (req, res) => {
    const { language } = req.session;
    res.render("campgrounds/new", { language, langData: req.session.langData });
};

module.exports.createCampground = async (req, res) => {
    const { language } = req.session;
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((images) => ({
        url: images.path,
        filename: images.filename,
    }));
    campground.author = req.user._id;
    await campground.save();

    req.flash("success", req.session.langData.successCamp);
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const { language } = req.session;
    try {
        const campground = await Campground.findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("author");
        if (!campground) {
            req.flash("error", langData.cantFindCamp);
            return res.redirect("/campgrounds");
        }
        const geoData = await geocoder
            .forwardGeocode({
                query: campground.location,
                limit: 1,
            })
            .send();
        campground.geometry = geoData.body.features[0].geometry;
        res.render("campgrounds/show", { campground, language, langData: req.session.langData });
    } catch (error) {
        req.flash("error", req.session.langData.cantFindCamp);
        console.log(error);
        return res.redirect("/campgrounds");
    }
};

module.exports.renderEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const { language } = req.session;
        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash("error", req.session.langData.cantFindCamp);
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit", { campground, language, langData: req.session.langData });
    } catch (error) {
        console.log(error.message);
        console.log(error.message);
        req.flash("error", req.session.langData.cantFindCamp);
        return res.redirect("/campgrounds");
    }
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const { language } = req.session;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const imgs = req.files.map((images) => ({
        url: images.path,
        filename: images.filename,
    }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }
    req.flash("success", req.session.langData.successUpgCamp);
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const { language } = req.session;
    await Campground.findByIdAndDelete(id);
    req.flash("success", langData.successDeleteCamp);
    res.redirect("/campgrounds");
};
