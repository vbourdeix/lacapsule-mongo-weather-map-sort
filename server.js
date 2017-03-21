var express = require('express');
var request = require('request');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cityweather');

var citySchema = mongoose.Schema({
  city: String,
  description: String,
  picto: String,
  temp_min: Number,
  temp_max: Number
});

var CityModel = mongoose.model('city', citySchema);
var cityList;

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));





app.get('/', function (req, res) {
  CityModel.find(function(error, cities) {
    if (error) {
      console.log("Erreur de récupération des villes");
      return;
    }
    cityList = cities;

    res.render('meteo', {
      list : cityList
    });
  });
});

app.get('/add', function (req, res) {
  
  request("http://api.openweathermap.org/data/2.5/weather?q="+req.query.city+"&APPID=9b754f1f40051783e4f72c176953866e&units=metric&lang=fr", function(error, response, body) {
  
    body = JSON.parse(body);
    
    console.log(req.query);
    if(body.main.temp_min != undefined) {   

      var city = new CityModel({
        city: body.name,
        temp_max: body.main.temp_max,
        temp_min: body.main.temp_min,
        description: body.weather[0].description,
        picto: body.weather[0].icon
      });

      city.save(function (err, city) {
        if (err) return console.error(err);
        cityList.push(city);
        res.render('meteo', {
          list : cityList
        });
      });
    }
  
  });

 
 
});



app.get('/delete', function (req, res) {
  
  var indexToRemove = req.query.indice;
  var cityToRemove = cityList[indexToRemove];
  CityModel.remove({_id: cityToRemove.id}, function(error){
    if (error) {
      console.log("erreur lors de la suppression");
    }
    cityList.splice(req.query.indice, 1);

    res.render('meteo', {
      list : cityList
    });
  });
});

app.listen(80, function () {
  console.log("Server listening on port 80");
});