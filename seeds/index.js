const port = 3000;
const dataBaseURL = "mongodb://localhost:27017/yelp-camp";

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect(dataBaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Clear db

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    const geoData = {
        type: "Point",
        coordinates: [20.3747, 47.8989],
    };
    const eger = new Campground({
        author: "60a7b12eefe3f25ce075cef3",
        location: "Eger, Heves",
        title: `${sample(descriptors)} ${sample(places)}`,
        geometry: geoData,
        images: [
            {
                url: "https://res.cloudinary.com/foamdfun/image/upload/v1621330048/YelpCamp/photo-1499610691959-76499b25d940_vwyhl9.jpg",
                filename: "photo-1499610691959-76499b25d940_vwyhl9",
            },
            {
                url: "https://res.cloudinary.com/foamdfun/image/upload/v1621330195/YelpCamp/photo-1499696010180-025ef6e1a8f9_pipkmd.jpg",
                filename: "photo-1499696010180-025ef6e1a8f9_pipkmd",
            },
        ],
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta rem ea, sequi eligendi.",
        price: 20,
    });
    await eger.save();

    for (let i = 0; i < 229; i++) {
        // const random230 = Math.floor(Math.random() * 230);
        const random230 = i;
        const price = Math.floor(Math.random() * 20) + 10;
        const locationQuery = `${cities[random230].city}, ${cities[random230].state}`;
        console.log(locationQuery);
        const geoData = {
            type: "Point",
            coordinates: [cities[random230].longitude, cities[random230].latitude],
        };
        const camp = new Campground({
            author: "60a386116780e4299c5ea1b1",
            location: locationQuery,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: geoData,
            images: [
                {
                    url: "https://res.cloudinary.com/foamdfun/image/upload/v1621330048/YelpCamp/photo-1499610691959-76499b25d940_vwyhl9.jpg",
                    filename: "photo-1499610691959-76499b25d940_vwyhl9",
                },
                {
                    url: "https://res.cloudinary.com/foamdfun/image/upload/v1621330195/YelpCamp/photo-1499696010180-025ef6e1a8f9_pipkmd.jpg",
                    filename: "photo-1499696010180-025ef6e1a8f9_pipkmd",
                },
            ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta rem ea, sequi eligendi.",
            price,
        });

        await camp.save();
    }
};

console.log("clearing and rewriting of the database with random elements has started...");
seedDB().then(() => {
    mongoose.connection.close();
});
console.log("done");
