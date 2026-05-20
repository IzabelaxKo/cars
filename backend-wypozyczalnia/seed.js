require("dotenv").config();
const mongoose = require("mongoose");
const Car = require("./models/Car");
const cars = require("./data/cars");

// !!! DODANIE PRZYKLADOWYCH DANYCH DO BAZY DANYCH MONGO DB !!!

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Car.deleteMany({});
  await Car.insertMany(cars);
  console.log("Seed done");
  process.exit();
});
