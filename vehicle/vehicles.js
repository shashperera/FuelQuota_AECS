require("dotenv").config();
const express = require('express');

// Connect
require('../db/db');

const Vehicle = require('./Vehicle');
const Auth = require("../auth/Auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
app.use(express.json())

app.post('/vehicle', (req, res) => {
  const newVehicle = new Vehicle({...req.body});
  newVehicle.save().then(() => {
    res.send('New Vehicle created successfully!')
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  })
})

app.post("/vregister", async (req, res) => {
  // Our vehicle register logic starts here

  try {
    // Get vehicle input
    const { vehicleRegistrationNumber, registeredDate, chassisNumber } = req.body;

    // Validate vehicle input
    if (!(vehicleRegistrationNumber && registeredDate && chassisNumber)) {
      res.status(400).send("All input is required");
    }

    // check if vehicle already exist
    // Validate if vehicle exist in our database
    const oldVehicle = await Vehicle.findOne({ vehicleRegistrationNumber });

    if (oldVehicle) {
      return res.status(409).send("Vehicle Already Exist. Please enter another one");
    }

     // Create vehicle in our database
    const vehicle = await Vehicle.create({
      vehicleRegistrationNumber,
      registeredDate,
      chassisNumber,
    });

    // Create token
    const token = jwt.sign(
        { vehicle_id: vehicle._id, vehicleRegistrationNumber },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
    );

    // return new vehicle
    res.status(201).json({ token });
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

app.get('/vehicles', (req, res) => {
  Vehicle.find().then((vehicles) => {
    if (vehicles.length !== 0) {
      res.json(vehicles)
    } else {
      res.status(404).send('Vehicles not found');
    }
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  });
})

app.get('/vehicle/:id', (req, res) => {
  Vehicle.findById(req.params.id).then((vehicle) => {
    if (vehicle) {
      res.json(vehicle)
    } else {
      res.status(404).send('Vehicles not found');
    }
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  });
})

app.delete('/vehicle/:id', (req, res) => {
  Vehicle.findOneAndRemove(req.params.id).then((vehicle) => {
    if (vehicle) {
      res.json('Vehicle deleted Successfully!')
    } else {
      res.status(404).send('Vehicle Not found!');
    }
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  });
});




app.listen(port, () => {
  console.log(`Up and Running on port ${port} - This is Vehicle service`);
})