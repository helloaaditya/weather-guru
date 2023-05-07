const apiKey = '5717bd65a240df95236c9074f5d570a9';

// Get user's current location
navigator.geolocation.getCurrentPosition(function(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  // Use OpenWeatherMap API to get city and country
  var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=5717bd65a240df95236c9074f5d570a9&units=metric";
  $.getJSON(url, function(data) {
    var city = data.name;
    var country = data.sys.country;
    
    // Use the city and country information to populate the input fields
    $("#city").val(city);
    $("#country").val(country);
  });
});


function getWeatherReport(city, country) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}`;
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.error(error);
      throw new Error('Unable to fetch weather data.');
    });
}

function getWeatherForecast(city, country) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${apiKey}`;
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.error(error);
      throw new Error('Unable to fetch weather forecast data.');
    });
}

const formElement = document.querySelector('form');
const weatherReportElement = document.querySelector('#weather-report');
const weatherForecastElement = document.querySelector('#weather-forecast');

formElement.addEventListener('submit', event => {
  event.preventDefault();

  const city = document.querySelector('#city').value;
  const country = document.querySelector('#country').value;

  Promise.all([getWeatherReport(city, country), getWeatherForecast(city, country)])
    .then(([reportData, forecastData]) => {
      console.log(reportData);
      console.log(forecastData);

      const temperature = Math.round(reportData.main.temp - 273.15);
      const feelsLike = Math.round(reportData.main.feels_like - 273.15);
      const humidity = reportData.main.humidity;
      const pressure = reportData.main.pressure;
      const windSpeed = reportData.wind.speed;
      const windDirection = reportData.wind.deg;
      const cloudiness = reportData.clouds.all + '%';
      const sunrise = new Date(reportData.sys.sunrise * 1000);
      const sunset = new Date(reportData.sys.sunset * 1000);
      const uvIndex = reportData?.current?.uvi || 'N/A'; // optional chaining (?.) used to handle undefined values
      const visibility = reportData.visibility;
      const precipitationLastHour = reportData?.rain?.['1h'] || reportData?.snow?.['1h'] || 'none'; // optional chaining and dynamic property access used to handle undefined values

      const report = `Current weather in ${city}, ${country}:
      ----------------------------------------------------
      Temperature: ${temperature} °C
      Feels like: ${feelsLike} °C
      Humidity: ${humidity}%
      Pressure: ${pressure} hPa
      Wind speed: ${windSpeed} m/s
      Wind direction: ${windDirection} degrees
      Cloudiness: ${cloudiness}
      Sunrise: ${sunrise.toLocaleTimeString()}
      Sunset: ${sunset.toLocaleTimeString()}
      UV index: ${uvIndex}
      Visibility: ${visibility / 1000} km
      Precipitation (last hour): ${precipitationLastHour}`;

      weatherReportElement.innerText = report;
      
      function displayForecast(data) {
        var forecastTable = $("#forecast");
        forecastTable.empty();
        var forecastData = data.list;
      
        // Loop through each day of the forecast
        for (var i = 0; i < forecastData.length; i += 10) {
          var date = new Date(forecastData[i].dt * 1000).toLocaleDateString("en-US", {weekday: "long", month: "short", day: "numeric"});
          var description = forecastData[i].weather[0].description;
          var high = Math.round(forecastData[i].main.temp_max);
          var low = Math.round(forecastData[i].main.temp_min);
          var humidity = forecastData[i].main.humidity;
          var wind = Math.round(forecastData[i].wind.speed);
      
          // Create a new table row and insert the forecast data
          var newRow = $("<tr>");
          newRow.append("<td>" + date + "</td>");
          newRow.append("<td>" + description + "</td>");
          newRow.append("<td>" + high + " / " + low + "</td>");
          newRow.append("<td>" + humidity + "%</td>");
          newRow.append("<td>" + wind + " mph</td>");
          forecastTable.append(newRow);
        }
      }
      
      displayForecast(forecastData);
    })
    .catch(error => {
      console.error(error);
      weatherReportElement.innerText = error.message;
    }
    );
});



