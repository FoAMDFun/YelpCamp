const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    const { language } = req.session;
    res.render("users/register", { language, langData: req.session.langData });
};

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash("success", `Hello, ${username}! ${req.session.langData.welcome}`);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
};

module.exports.renderLogin = (req, res) => {
    const { language, langData } = req.session;
    res.render("users/login", { language, langData });
};

module.exports.login = (req, res) => {
    req.flash("success", `${req.session.langData.welcomeBack}, ${req.user.username}`);
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", req.session.langData.logoutSuccess);
    res.redirect("/campgrounds");
};
