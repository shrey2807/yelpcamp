const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary/index");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    if(geoData.body.features[0])
    {
        campground.geometry = geoData.body.features[0].geometry;
    }
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await campground.save();
    req.flash('success', 'Successfully added the campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.updateCampground = async (req, res) => {
    const geoData = await geocoder
       .forwardGeocode({
          query: req.body.campground.location,
          limit: 1,
       })
       .send();
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated the campground');
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    // below line can be used to delete all reviews of a campground, but i have done it in the campground model itself
    // await Review.deleteMany({ _id: { $in: campground.reviews } });

    // deleting images from cloudinary except seed images
    const seeds = [
        'Yelp-Camp/eycnyhxaok7w1lf0jqja',
        'Yelp-Camp/j5nm4hmfwpfqrzuefvga',
        'Yelp-Camp/h02p2m1tc9gjq0ngyn7a'
    ]
    if (campground.images) {
        for (const img of campground.images) {
           if (seeds.indexOf(img.filename) === -1) {
                console.log(img.filename)
                await cloudinary.uploader.destroy(img.filename);
            }
        }
    }
    req.flash('success', 'Successfully deleted the campground');
    res.redirect(`/campgrounds`);
}

module.exports.renderNewForm = (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in')
        res.redirect('/login');
    }
    else
        res.render('campgrounds/new');
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
        {
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }
    ).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.editFormRender = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}
