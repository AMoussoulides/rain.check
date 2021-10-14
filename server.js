const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const users = require('./routes/api/users');



const app = express();



//enables cors
app.use(cors({
  'allowedHeaders': ['sessionId', 'Content-Type'],
  'exposedHeaders': ['sessionId'],
  'origin': '*',
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}));



//Getting URI from keys file
const db = require('./config/keys').mongoURI;


//Connect to the Database
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.connect(db, {useNewUrlParser: true})
.then(()=> console.log("Database Connected"))
.catch(err=> console.log(err));

//Route for user routes
app.use('/api/users',users);

const dbport = process.env.PORT || 5000;

app.listen(dbport, () => console.log(`Server started on port ${dbport}`));

app.use(express.static('client')); //serving client side from express
//Json Middleware
app.use(express.json());





app.get('/past/:latlon', async (req,res) =>{ //awating request from client-side

  const latlon = req.params.latlon.split(',');

  console.log(req.params);

  const lat = latlon[0];
  const lon = latlon[1];

  

  const api_key = process.env.API_KEY;
  
  const now = new Date()  
  const secondsSinceEpoch = Math.round(now.getTime() / 1000) 
  
  const weather_url = `https://api.darksky.net/forecast/${api_key}/${lat},${lon},${secondsSinceEpoch-60}?units=auto`; //getting data from weather API
  const fetch_res = await fetch(weather_url);
  const json = await fetch_res.json();
  res.json(json); //sending weather data back to client-side
});


app.get('/weather/:latlon', async (req,res) =>{ //awating request from client-side

    const latlon = req.params.latlon.split(',');

    console.log(req.params);

    const lat = latlon[0];
    const lon = latlon[1];

    console.log(lat,lon);

    const api_key = process.env.API_KEY;
    
    
    
    const weather_url = `https://api.darksky.net/forecast/${api_key}/${lat},${lon}?units=auto`; //getting data from weather API
    const fetch_res = await fetch(weather_url);
    const json = await fetch_res.json();
    res.json(json); //sending weather data back to client-side
});






app.get('/email/:email', async (req,res) =>{ //awaiting request from client-side 


    const info = req.params.email.split('~');

    console.log(req.params);

    const emailname = info[0]; //processing info

    const from = info[1];

    const to = info[2];

    const best_time = info[3];

    const temperature = info[4];

    const summary = info[5];

    const duration = info[6];

    const vehicle = info[7];

    console.log(emailname);
    console.log(from);
    console.log(to);
    console.log(best_time);
    console.log(temperature);
    console.log(summary);

    

    var host_email = process.env.GMAIL_NAME;

    var host_pass = process.env.GMAIL_PASS;

    
    



    var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: host_email,
    pass: host_pass
  }
});

var d = new Date();


var mailOptions = {
  from: host_email ,
  to: emailname,
  subject: 'Rain Check Notification',
  html: ` 
  
  <h2>Hey There,</h2>

  <h3> You have requested an email reminder from Rain-Check </h3>

  <h4> Travelling by: ${vehicle}</h4>

  <h4> Leaving from:  ${from}</h4>

  <h4> And going to:  ${to}</h4>

  <h4> It's going to take about ${duration} minutes to get there</h4>

  <h4> It is going to be ${summary} on your journey, and the average temperature is ${temperature} degrees</h4>
  
  <h4> In order to minimize rain, the best time to leave is in <b>${best_time} minutes</b></h4>

  <h5> Thanks for using the service and don't get caught in the rain! &#9730;</h5>
  
  `
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
    res.json("An error occured, please try again"); 
  } else {
    console.log('Email sent: ' + info.response);
    res.json("E-mail sent successfully!"); //Sending back response to client side
  }
}); 



});

