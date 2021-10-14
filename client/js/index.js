
$(window).scroll(function(e) {

  // add/remove class to navbar when scrolling to hide/show
  $('.navbar')[$(window).scrollTop() >= 150 ? 'addClass' : 'removeClass']('navbar-hide');

});

let mymap = L.map('mapid').locate({setView: true});


  


	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
    }).addTo(mymap); //Adding the Map
    
   let control = L.Routing.control({
 
  routeWhileDragging: false,
  draggableWaypoints : false,
  //autoRoute: false,
  
  geocoder: L.Control.Geocoder.bing('Amet3CuxhPoE-ATl8on8j9I-1cs-6vkJASpFkDPZCXuqOJ0e4UH3ExO5LSqLC4e2'),
  router: L.Routing.graphHopper('b4602847-f10d-46d9-bc14-6774bef56b9a' , {

    
    
    urlParameters: {
        vehicle: 'foot',  //default method
        details: 'edge_id',
        debug: true,
       
        
    } 
   
  })
}).addTo(mymap);

control.once('waypointschanged', function(e){ 
  
    var initial = control.getWaypoints();  

    

    var lat = initial[0].latLng.lat;

    var lng = initial[0].latLng.lng;


    mymap.panTo([lat, lng], 8);


});

let count = 0;

mymap.on('click', function(e){ //function to be able to click to the map for choosing points

  if (count == 1 ){
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
    count++;
  control.route();
  }

  
 else if (count % 2 !== 0){
  control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);  
  count++;
  control.route();
  }

 else {
  control.spliceWaypoints(0, 1, e.latlng);
  count++;
  control.route();
  

 }
  
});

control.on('routesfound', async function(e) { //start the calculations once a route has been found

  
  var markerArray = new Array();
   markerArray = control.getWaypoints();

   var i;

   document.getElementById("location").innerHTML = "";

   for(i=0; i<markerArray.length; i++){ //finding the latitude and longitude of the origin and destination point

    const lat = markerArray[i].latLng.lat;
    const lng = markerArray[i].latLng.lng;

    
   let point_location = markerArray[i].name;


   const response = await fetch(`/weather/${lat},${lng}`); //sending request to server-side
   

   const json = await response.json();

   console.log(json); //getting the weather data from server-side

   


   if (json.minutely === undefined){
   var point_summary = JSON.stringify(json.currently.summary).replace(/"/g,'');  

   }
   else{
     point_summary = JSON.stringify(json.minutely.summary).replace(/"/g,'');  
   }

 

   if (i === 0 ){ // displaying the start and end point
    
   document.getElementById("location").innerHTML +="<strong>Start point:</strong> " + point_location + "<br>";
   }
   else if (i === (markerArray.length - 1)) {
    document.getElementById("location").innerHTML +="<strong>End point:</strong> " + point_location + "<br> ";
   }
   else{
    document.getElementById("location").innerHTML +="<strong>Mid point:</strong> " + point_location + "<br>";

   }

   
    

   document.getElementById("location").innerHTML += point_summary+ "<br>"+ "<br>";

   


   
   }

  document.getElementById("breakinfo0").style.display = "inline";
   

   $("#location").fadeIn();

   

   

  var coords = new Array(); 


  coords = e.routes[0].coordinates; //the coordinates of the current route

  var j;

  
  



  var timeinsecs = Math.floor((e.routes[0].summary.totalTime)); //total time of the route in seconds

  var distanceinmeters = e.routes[0].summary.totalDistance; //total distance of the route in meters

  var meterspersecond = (distanceinmeters / timeinsecs); //calculating the speed of the user according to their transporation method

  
  var weather_arr = new Array();
  var minutetoreacharray = new Array();

  for(j=0.1; j<Math.floor((coords.length-1) * j); j+=0.1){ //For loop that gets the weather data along the route for each 10% of the route

    if(j<1){

    

    var actualndex = Math.floor((coords.length-1) * j); //the index of the coordinates array for each percentage

    var coord_lat = coords[actualndex].lat; //latitude of each percentage
    var coord_lng = coords[actualndex].lng; //longitude of each percentage


    var distancepercent = Math.floor(distanceinmeters * j); // The meters of each percentage of the route

    var minutetoreachpercentage = Math.floor(distancepercent/meterspersecond  / 60); //Minutes which the user will reach that percentage

    minutetoreacharray.push(minutetoreachpercentage);

    console.log (`${minutetoreachpercentage} minutes to reach ${distancepercent} meters which is ${(j*100).toFixed(0)}% of the route`);


    

    const coord_response = await fetch(`/weather/${coord_lat},${coord_lng}`); //Getting the weather data for each 10%  of the route
   

    var coord_json = await coord_response.json();

    weather_arr.push(coord_json);

    
    

  }
  else{

    break;
    
  }

  console.log(weather_arr);
  console.log(minutetoreacharray);

  for (var i = 0; i<=weather_arr.length-1; i++){ //finding the weather summary and alerts of the route

    var temparray = new Array();
    var apparentarray = new Array();

    var temperature = weather_arr[i].currently.temperature;
    temparray.push(temperature);

    var apparent = weather_arr[i].currently.apparentTemperature;
    apparentarray.push(apparent);


    if (weather_arr[0].alerts === undefined){

      var warnings = "none";
    
    }
    else{
       warnings = weather_arr[0].alerts[0].title;
    }
    

    

  }

 var tempavg =  temparray.reduce((a,b) => (a+b)) / temparray.length;
 var apparentavg =  apparentarray.reduce((a,b) => (a+b)) / apparentarray.length;


 var summary = weather_arr[0].currently.summary;

 var icon = weather_arr[0].currently.icon;


 function getIcon(icon){ //function for icons of weather
   var actual_icon;
   if (icon == "clear-day"){
      actual_icon = '<i class="wi wi-day-sunny display-2"></i>';
      return actual_icon;
   }
   else if (icon == "clear-night"){
      actual_icon = '<i class="wi wi-night-clear display-2"></i>';
      return actual_icon;


   }
   else if (icon == "rain"){
    actual_icon = '<i class="wi wi-rain display-2"></i>';
    return actual_icon;

   }
   else if (icon == "snow"){
    actual_icon = '<i class="wi wi-snow display-2"></i>';
    return actual_icon;

   }
   else if (icon == "sleet"){
    actual_icon = '<i class="wi wi-sleet display-2"></i>';
    return actual_icon;

   }
   else if (icon == "wind"){
    actual_icon = '<i class="wi wi-strong-wind display-2"></i>';
    return actual_icon;

   }
   else if (icon == "fog"){
    actual_icon = '<i class="wi wi-fog display-2"></i>';
    return actual_icon;

   }
   else if (icon == "cloudy"){
    actual_icon = '<i class="wi wi-cloudy display-2"></i>';
    return actual_icon;

   }

   else if (icon == "partly-cloudy-day"){
    actual_icon = '<i class="wi wi-day-cloudy display-2"></i>';
    return actual_icon;

   }

   else if (icon == "partly-cloudy-night"){
    actual_icon = '<i class=" wi wi-night-alt-cloudy display-2"></i>';
    return actual_icon;

   }
 }

 console.log(icon);
 


  document.getElementById("routesummary").innerHTML = "";

  document.getElementById("routesummarylabel").innerHTML = "";


  document.getElementById("routesummarylabel").innerHTML += "Route Summary:" + "<br>";

  document.getElementById("routesummary").innerHTML += `Travelling by: ${control.getRouter().options.urlParameters.vehicle} <br>`;

  document.getElementById("routesummary").innerHTML += `Distance: ${Math.floor(distanceinmeters)} meters <br>`;

  document.getElementById("routesummary").innerHTML += `Duration of Journey: ${Math.floor(timeinsecs/60)} minutes <br>`;

  

  $("#routesummarylabel").fadeIn();

  $("#routesummary").fadeIn();

  document.getElementById("breakinfo1").style.display = "inline";


  document.getElementById("weathersummarylabel").innerHTML = "";

  document.getElementById("weathersummary").innerHTML = "";


  document.getElementById("weathersummarylabel").innerHTML += "Weather Summary:" + "<br>";


  document.getElementById("weathersummary").innerHTML += ` ${getIcon(icon)}  ${summary} <br> <br>`;


  if(warnings == "none"){
    document.getElementById("weathersummary").innerHTML += `Alerts: None <br>`;
  }
  else{
    document.getElementById("weathersummary").innerHTML += `Alerts: ${warnings} <br>`;
    
  }

  var celsius = '&#8451';
  var f = '&#8457';


if(weather_arr[0].flags.units == "us"){ //weather units are automatically changed based on the location of the route

  document.getElementById("weathersummary").innerHTML += `Average Temperature of Journey: ${tempavg} ${f} <br>`;
  document.getElementById("weathersummary").innerHTML += `Average Apparent Temperature of Journey: ${apparentavg} ${f} <br>`;

}
else{
  document.getElementById("weathersummary").innerHTML += `Average Temperature of Journey: ${tempavg} ${celsius} <br>`;
  document.getElementById("weathersummary").innerHTML += `Average Apparent Temperature of Journey: ${apparentavg} ${celsius} <br>`;
}







$("#weathersummarylabel").fadeIn();

$("#weathersummary").fadeIn();

document.getElementById("breakinfo2").style.display = "inline";

var itercards;


for (itercards = 0; itercards<=6; itercards++){ //weather cards for weekly forecast


  var weekdays = new Array(
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  );

  
var d = new Date();

var today = d.getDay();

var card = "card";

var card_day = "cardday";


var card_summary = "cardsummary";

var card_temp = "cardtemp";

var card_precip = "cardprecip";

var card_wind = "cardwind";












document.getElementById(card_day.concat(itercards)).innerHTML = weekdays[(today + itercards ) % 7];



document.getElementById(card_summary.concat(itercards)).innerHTML = weather_arr[0].daily.data[itercards].summary;

var icon_for_card = weather_arr[0].daily.data[itercards].icon;




document.getElementById(card_temp.concat(itercards)).innerHTML = `${getIcon(icon_for_card)} ${Math.round(weather_arr[0].daily.data[itercards].apparentTemperatureHigh)}&deg; `;

document.getElementById(card_precip.concat(itercards)).innerHTML = `${Math.round(weather_arr[0].daily.data[itercards].precipProbability * 100)}%`;

document.getElementById(card_wind.concat(itercards)).innerHTML = `${Math.floor(weather_arr[0].daily.data[itercards].windSpeed)} km/h `;


document.getElementById(card.concat(itercards)).style.display = "inline";

$(card.concat(itercards)).fadeIn();


}


document.getElementById("breakinfo6").style.display = "inline";




  
}



    function getexpected(n){ //function for finding the expected rain intensity for each 10% of the route

      let coord_array_now = new Array();

      
      for (var point = 0; point<=weather_arr.length-1; point++){
        

     var time = minutetoreacharray[point];


  
      var precipIntensity= weather_arr[point].minutely.data[time+n].precipIntensity/ 60; // mm per hour, converting to mm per minute by dividing by 60
      var precipProbability = weather_arr[point].minutely.data[time+n].precipProbability;
      
      var expectedvalue = precipProbability * precipIntensity;

    
 
      coord_array_now.push(expectedvalue);

      }

    
    
    return coord_array_now;
  }

    
  

   console.log(Math.floor((timeinsecs/60)));

   var g = new Array();

   g.push(getexpected(0)); //gets the weather if departure time is now

   console.log(g);

   var timeallowed =Math.floor( 60 - timeinsecs/60);

   console.log(timeallowed);





  document.getElementById("timechartlabel").innerHTML = `Expected rain intensity along your route:`;

  $("#timechartlabel").fadeIn();
   
   
  var timechart = new Chartist.Line('#timechart', {
    labels: minutetoreacharray, //Minutes into the route

    series: g //the expected value of each minute into the route

  }, 

  {
   
    chartPadding: {
      top: 20,
      right: 0,
      bottom: 30,
      left: 40
    },
   
    plugins: [
      Chartist.plugins.ctAxisTitle({
        axisX: {
          axisTitle: 'Minutes into the route',
          axisClass: 'ct-axis-title',
          offset: {
            x: 0,
            y: 50
          },
          textAnchor: 'middle'
        },
        axisY: {
          axisTitle: 'Millimeters per minute',
          axisClass: 'ct-axis-title',
          offset: {
            x: 0,
            y: -2
          },
          textAnchor: 'middle',
          flipTitle: false,
            high: 1,
            low: 0
        
        }
      })
     
    ]

  });

  $("#timechart").fadeIn();

  document.getElementById("minlabel").textContent="Leave in: ";

  document.getElementById("breakinfo3").style.display = "inline";


  document.getElementById("minutes").style.display = "inline";


  document.getElementById("minutes").options.length = 0;
  
  var select = document.getElementById("minutes"); 

  for(var i = 0; i <= timeallowed; i++) {
    
    var el = document.createElement("option");

    if (i == 0){
      el.textContent = "Now"
    }

   else if (i == 1 ){
    el.textContent = i + " Minute";
    }
    else {
      el.textContent = i + " Minutes";
    }
    el.value = i;
    select.appendChild(el);
 
}

var timespent = [];

for (var i = 0; i< minutetoreacharray.length - 1; i++){


 timespent[i] = minutetoreacharray[i+1] - minutetoreacharray[i];
 
}

console.log(timespent);


var all_intensities = [];

var sum_intensity = [];

var j = 0;

var s =0;

var timeallowedarray = [];

var finalarray = [];

for (var i=0; i<=timeallowed; i++){

 all_intensities.push(getexpected(i));

 }

 for (var i=0; i<=timeallowed -1 ; i++){

 timeallowedarray.push(i);

 }

 console.log(all_intensities);

 
 for (var i = 0 ; i < all_intensities.length -1; i++){ //finding the total amount of rainfall for each possible departure time

  for (var j =0; j < all_intensities[i].length -1; j++){

    sum_intensity[i] = timespent[j] * all_intensities[i][j];

    
  }
 }

 console.log(sum_intensity);

 



$("#minutes").on("change",function(){
  
  var selValue = $("#minutes").val();

  var valuetoint = parseInt(selValue,10);

  var t = new Array();

  t.push(getexpected(valuetoint));

  
  timechart.update({
    labels: minutetoreacharray, //Minutes into the route

    series: t

  });

}); 

finalarray.push(sum_intensity);


console.log(finalarray);


document.getElementById("sumchartlabel").innerHTML = `Total amount of rainfall for all possible departure times:`;



$("#sumchartlabel").fadeIn();



var sumchart = new Chartist.Line('#sumchart', {
  labels: timeallowedarray, //Minutes into the route

  series: finalarray //the expected value of each possible departure time

}, 

{
  chartPadding: {
    top: 20,
    right: 0,
    bottom: 30,
    left: 40
  },
 
  plugins: [
    Chartist.plugins.ctAxisTitle({
      axisX: {
        axisTitle: 'Possible departure times in minutes',
        axisClass: 'ct-axis-title',
        offset: {
          x: 0,
          y: 50
        },
        textAnchor: 'middle'
      },
      axisY: {
        axisTitle: 'Millimeters per minute',
        axisClass: 'ct-axis-title',
        offset: {
          x: 0,
          y: -2
        },
        textAnchor: 'middle',
        flipTitle: false,
          high: 1,
          low: 0
      
      }
    })
   
  ]

});



$("#sumchart").fadeIn();


var today = new Date();
var time = today.getHours() + ":" + today.getMinutes();

console.log(`The current time is ${time}`);



if (!warnings.includes("none")){
  if (control.getRouter().options.urlParameters.vehicle == 'foot' || control.getRouter().options.urlParameters.vehicle == 'bike'){
  document.getElementById("alerts").style.display = "inline";

  document.getElementById('alerts').innerHTML = `<i class='fas fa-exclamation-triangle'></i>  An Alert (${warnings}) has been issued. You are advised not to travel long journeys by foot or bike until the alert is cleared off.`;
  }
}



let best_time_rain = (Math.min(...sum_intensity));

let best_time = sum_intensity.indexOf(Math.min(...sum_intensity)); 

//By finding the sum of rainfall of each possible route, we then can find the route with the least rain

document.getElementById("breakinfo5").style.display = "inline";


if (best_time_rain > 0){
  document.getElementById("besttime").style.display = "inline";

document.getElementById('besttime').innerHTML =`<i class='fas fa-cloud-rain'></i>  The best time to leave is in ${best_time} minutes but you might experience some rain along your way, be sure to dress properly!`;
}
else{
  document.getElementById("besttime").style.display = "inline";

  document.getElementById('besttime').innerHTML = `<i class="fa fa-check"></i>  The best time to leave is in ${best_time} minutes. It doesn't look that it is going to rain for that time!`;
}


 async function check_past_rain(){ //function for checking if it recently rained on the selected route
  
  const past_response = await fetch(`/past/${markerArray[0].latLng.lat},${markerArray[0].latLng.lng}`); //sending request to server-side

  const past_rain = await past_response.json();
 
 if (past_rain.currently.precipIntensity > 0 && past_rain.currently.precipProbability >= 0.5 ){

  document.getElementById("puddles").style.display = "inline";

  document.getElementById('puddles').innerHTML = "<i class='fas fa-exclamation'></i>  It has recently rained, please watch out for muddy tracks or puddles.";
   
  }

 }

 check_past_rain();

 


control.getRouter().options.urlParameters.avoid = 'track';




document.getElementById("breakinfo4").style.display = "inline";


var x = document.getElementById("emailtext");

document.body.appendChild(x);

var btn = document.getElementById("emailbtn");
  btn.innerHTML = "Send";
  
  document.body.appendChild(btn);

document.getElementById("emailbtn").style.display = "inline";

document.getElementById("emailtext").style.display = "inline";




  document.getElementById("emaillabel").innerHTML = "Do you want an e-mail reminder? Input your e-mail below and click 'Send'";

document.getElementById("emaillabel").style.display = "inline";


  btn.onclick = async function(){

  const response = await fetch(`/email/${x.value}~${markerArray[0].name}~${markerArray[1].name}~${best_time}~${apparentavg}~${summary}~${Math.floor(timeinsecs/60)}~${control.getRouter().options.urlParameters.vehicle}`);


  const json2 = await response.json();

   console.log(json2);

    console.log(x.value);

    var emailresult = document.getElementById("emailsuccess");


    emailresult.innerHTML = json2;

    if(emailresult.innerHTML.includes("error")){
      emailresult.style.color = "red";
    }
    else{
      emailresult.style.color = "green";

    }


  }


});





L.easyButton('fas fa-walking', function(btn, map){

  
  
  control.getRouter().options.urlParameters.vehicle = 'foot';
  
  control.route();
}).addTo(mymap);


L.easyButton('fas fa-bicycle', function(btn, map){



  control.getRouter().options.urlParameters.vehicle = 'bike';

  control.route();
}).addTo(mymap);


L.easyButton('fas fa-car', function(btn, map){
  
  control.getRouter().options.urlParameters.vehicle = 'car';
  
  control.route();
}).addTo(mymap);


L.easyButton('fas fa-search-location', function(btn, map){

  map.locate({setView: true}).on('locationfound', function(e){
      var marker = L.marker(e.latlng);
  
      console.log(e.latlng); 

      control.spliceWaypoints(0, 1, e.latlng);  

      var a = document.getElementsByClassName('leaflet-routing-remove-waypoint');

      a[0].addEventListener('click',function(e){
        map.removeLayer(marker);
        map.removeLayer(marker);
        control.route();
      });
  })
 .on('locationerror', function(e){
      console.log(e);
      alert("Location access denied.");
  });
  control.route();
}).addTo(mymap);


let hideUnhide = L.easyButton({
  states: [{
          stateName: 'Hide',     
          icon:      'far fa-eye-slash',               
          title:     'Hide the toolbar',      
          onClick: function(btn, map) {       
              control.hide();
              btn.state('Show');    
          }
      }, {
          stateName: 'Show',
          icon:      'far fa-eye',
          title:     'Show the toolbar',
          onClick: function(btn, map) {
              control.show();
              btn.state('Hide');
          }
  }]
});

hideUnhide.addTo(mymap);

