const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [{
        url: String,
        filename: String
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    description: String,
    location: String,
    author:
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

// virtual properties can be applied on schemas... to know more, check colt's campground model,
//  he has an imageSchema with a thumbnail virtual property
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.location}<br>₹ ${this.price}/night</p>`
});

// this has to be defined here.... before the model is exported, 
// because this middleware is like a property of this model
CampgroundSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);