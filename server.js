var express = require('express');
var request = require('request');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cityweather');

var citySchema = mongoose.Schema({
  city: String,
  description: String,
  picto: String,
  temp_min: Number,
  temp_max: Number,
  sortOrder: Number,
  lat: Number,
  lon: Number
});

var CityModel = mongoose.model('city', citySchema);
var cityList;
CityModel.find(null, null, {sort: {sortOrder : 1}}, function(error, cities) {
  if (error) {
    console.log("Erreur de récupération des villes");
    return;
  }
  cityList = cities;
});

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function (req, res) {
  CityModel.find(null, null, {sort: {sortOrder : 1}}, function(error, cities) {
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
  
  var cityAlreadyExists = false;
  CityModel.find({city: req.query.city}, function(err, citiesFound){
    if (citiesFound.length) {
      cityAlreadyExists = true;
    }

    if (!cityAlreadyExists) {
      var requestUrl = "http://api.openweathermap.org/data/2.5/weather?q="+req.query.city+"&APPID=9b754f1f40051783e4f72c176953866e&units=metric&lang=fr";
      request(requestUrl, function(error, response, body) {
        body = JSON.parse(body);      
        if(body.main.temp_min != undefined) {  

          // Initialisation de la propriété "sortOrder" à 0
          var newCitySortOrder = 0;
          //Si au moins 1 element dans le tableau, recuperer la propriété "sortOrder" du dernier élément et lui ajouter +1
          if(cityList.length > 0) {
             newCitySortOrder = cityList[cityList.length-1].sortOrder + 1;
          }

          var city = new CityModel({
            city:        body.name,
            temp_max:    body.main.temp_max,
            temp_min:    body.main.temp_min,
            description: body.weather[0].description,
            picto:       body.weather[0].icon,
            sortOrder:   newCitySortOrder,
            lat:         body.coord.lat,
            lon:         body.coord.lon

          });

          city.save(function (err, city) {
            if (err) return console.error(err);
            cityList.push(city);
            res.redirect('/');
          });
        }
      });
    } else {
      res.redirect('/');
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

    res.redirect('/');
  });
});

app.get('/sort', function (req, res) {
  var index;
  var cityListTmp = [];
  
  var sortedIndexList = req.query.sortData;

  for(var i=0; i<sortedIndexList.length; i++) {
    initialIndex = sortedIndexList[i];
    console.log(cityList, initialIndex);
    currentCity = cityList[initialIndex];
    cityListTmp.push(currentCity);
    // Mise à jour de la propriété "sortOrder" ayant comme valeur l'index de la boucle (qui va en ordre croissant)
    console.log('update de la ville'+currentCity.id, i);
    CityModel.update({ _id: currentCity.id}, { sortOrder : i}, function(error, raw) {});
  }
  cityList = cityListTmp;
});

app.listen(80, function () {
  console.log("Server listening on port 80");
});