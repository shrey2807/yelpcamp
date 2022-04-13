const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { descriptors, places } = require('./campgroundtitle');
const cities = require('./cities');
const indiancities = require('./indiancities');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

mongoose.connection.on("error", console.error.bind(console, 'Connection error!'));
mongoose.connection.once("open", () => {
  console.log('Connected to MongoDB!')
});

const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
  await Review.deleteMany({});
  for (let i = 0; i < 200; i++) {
    // let random1000 = Math.floor(Math.random() * 999);
    let random406 = Math.floor(Math.random() * 405);
    const randomprice = Math.floor(Math.random() * 2000) + 500;
    const camp = new Campground({
      title: `${randomElement(descriptors)} ${randomElement(places)}`,
      // location: `${cities[random1000].city}, ${cities[random1000].state}`,
      location: `${indiancities[random406].city}, ${indiancities[random406].admin_name}`,
      geometry: {
        type: 'Point',
        coordinates: [
          indiancities[random406].lng,
          indiancities[random406].lat
          // cities[random1000].longitude,
          // cities[random1000].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dtmkyq0au/image/upload/v1634749632/Yelp-Camp/j5nm4hmfwpfqrzuefvga.jpg',
          filename: 'Yelp-Camp/j5nm4hmfwpfqrzuefvga'
        },
        {
          url: 'https://res.cloudinary.com/dtmkyq0au/image/upload/v1634749656/Yelp-Camp/h02p2m1tc9gjq0ngyn7a.jpg',
          filename: 'Yelp-Camp/h02p2m1tc9gjq0ngyn7a'
        }
      ],
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Pariatur ea neque qui, expedita laboriosam atque recusandae quis reprehenderit nesciunt quo dignissimos enim veritatis! Exercitationem neque dicta vel in fugit enim?',
      price: randomprice,
      author: '6171c454f78eff559403ca70'
    })
    await camp.save();
  }
}

seedDb()
  .then(() => { mongoose.connection.close(); })