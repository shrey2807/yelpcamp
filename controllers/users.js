const User = require('../models/user');

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.loginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = async (req, res) => {
    const { username } = req.body;
    req.flash('success', `Welcome back, ${username}!`)
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}

