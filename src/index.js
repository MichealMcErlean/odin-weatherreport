import "./styles.css"
import { greeting } from "./greeting.js";

function importAll(req) {
  const images = {};
  req.keys().forEach(key => {
    const filename = key.replace('./', '').split('.')[0];
    images[filename] = req(key);
  });
  return images;
}

const myIcons = require.context("./images", true, /\.svg$/)
const images = importAll(myIcons);

const form = document.querySelector('form');
const townField = document.querySelector('#town');
const stateField = document.querySelector('#state');
const countryField = document.querySelector('#country');
const entryFields = [townField, stateField, countryField];

const clearButton = document.querySelector('#clear');
const submitButton = document.querySelector('#submit');

submitButton.disabled = true;

const weatherTable = document.querySelector('.weather-report');

const baseURL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
const testLocation = 'perth%20western%20australia%20australia';
const tempC = '?unitGroup=metric';
const tempF = '?unitGroup=us';
const tailURL = '&key=X6YH757952SVT57DR6KJCXGJ4&contentType=json';

const testURL = baseURL + testLocation + tempC + tailURL;

form.addEventListener('input', () => {
  if (townField.validity.valid &&
      stateField.validity.valid &&
      countryField.validity.valid) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
});

clearButton.addEventListener('click', () => {
  form.reset();
  submitButton.disabled = true;
});

submitButton.addEventListener('click', () => {
  const town = townField.value;
  const state = stateField.value;
  const country = countryField.value;

  const tempChoice = document.querySelector('input[name="tempType"]:checked');
  let tempType;
  if (tempChoice.value == "metric") {
    tempType = tempC;
  } else {
    tempType = tempF;
  }
  let location = encodeURIComponent(town + ' ' + state + ' ' + country);
  let url = baseURL + location + tempType + tailURL;
  let weatherArr = callWeatherAPI(url);
  weatherArr.then(weatherArr => {
    buildWeatherTable(weatherArr);
  }).catch(() => {
    weatherTable.textContent = 'Couldn\'t resolve that location. Please check again.'
  });
});


async function callWeatherAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const weatherJSON = await response.json();
    let weatherArr = [];
    let address = weatherJSON.address;
    weatherArr.push(address)
    for (let i = 0; i < 5; i++) {
      let targetDay = weatherJSON.days[i];
      let dayWeather = {
        date: targetDay.datetime,
        tempMin: targetDay.tempmin,
        tempMax: targetDay.tempmax,
        feelsLikeMin: targetDay.feelslikemin,
        feelsLikeMax: targetDay.feelslikemax,
        icon: targetDay.icon,
        desc: targetDay.description,
      }
      weatherArr.push(dayWeather)
    }
    // console.log(weatherArr);
    return weatherArr;
  } catch (error) {
    weatherTable.textContent = error.message + ' Couldn\'t find that location';
  }
}

function buildWeatherTable(weatherArr) {
  weatherTable.textContent = '';
  let locationPara = document.createElement('p');
  locationPara.textContent = `Location resolves to ${weatherArr[0]}`;
  weatherTable.appendChild(locationPara);
  let table = document.createElement('table');

  let tableBodyHTML = '<tr><th>Date</th><th>Min. Temp.</th>' +
                        '<th>Max. Temp.</th><th>Feels Like Min.' + 
                        '</th><th>Feels Like Max.</th><th>Icon!' +
                        '</th><th>Forecast</th></tr>';
  
  for (let i = 1; i < 6; i++) {
    tableBodyHTML += '<tr><td>' + weatherArr[i].date +
                        '</td><td>' + weatherArr[i].tempMin + 
                        '</td><td>' + weatherArr[i].tempMax + 
                        '</td><td>' + weatherArr[i].feelsLikeMin + 
                        '</td><td>' + weatherArr[i].feelsLikeMax + 
                        '</td><td class="icon">' + weatherArr[i].icon + 
                        '</td><td>' + weatherArr[i].desc + 
                        '</td></tr>';

  }
  
  table.innerHTML = tableBodyHTML;
  weatherTable.appendChild(table);

  let iconCells = table.querySelectorAll('.icon');
  setBackground(iconCells[0].firstChild.textContent);
  iconCells.forEach(icon => {
    let iconImg = document.createElement('img');
    let iconText = icon.textContent;
    iconImg.src = images[iconText];
    iconImg.alt = iconText;
    icon.textContent = '';
    icon.style.backgroundColor = 'white';
    icon.appendChild(iconImg);
  });
}

function setBackground(str) {
  const background = document.querySelector('main');
  const table = document.querySelector('table');
  const form = document.querySelector('form');
  console.log(str);
  console.log(str == "clear-day");
  console.log(images);
  switch (str.toString()) {
    case 'clear-day':
    case 'partly-cloudy-day':
      // background.style.backgroundColor = "#02CCFE";
      background.style.backgroundImage = "linear-gradient(#72E2FF, #02CCFF, #01718D)";
      background.style.color = "black";
      table.style.color = 'black';
      form.style.color = 'black';
      break;
    case 'clear-night':
    case 'partly-cloudy-night':
      background.style.backgroundImage = "linear-gradient( #1D1C70, #040348, #151537)";
      background.style.color = 'white';
      table.style.color = 'white';
      form.style.color = 'white';
      break;
    case 'rain':
    case 'showers-day':
    case 'showers-night':
    case 'fog':
    case 'wind':
    case 'sleet':
    case 'cloudy':
      background.style.backgroundImage = 'linear-gradient( #CEDBE9, #ACC2D9, #728090)';
      background.style.color = 'black';
      table.style.color = 'black';
      form.style.color = 'black';
      break;
    case 'rain-snow':
    case 'rain-snow-showers-day':
    case 'rain-snow-showers-night':
    case 'snow':
    case 'snow-showers-day':
    case 'snow-showers-night':
      background.style.backgroundImage = "linear-gradient( #E8F8FF, #DEF5FF, #C5D9E2)";
      background.style.color = 'black';
      table.style.color = 'black';
      form.style.color = 'black';
      break;
    case 'hail':
    case 'thunder':
    case 'thunder-rain':
    case 'thunder-showers-day':
    case 'thunder-showers-night':
      background.style.backgroundImage = "linear-gradient( #717486, #585A69, #32333C)";
      table.style.color = 'white';
      form.style.color = 'white';
      break;
    default:
      background.style.backgroundColor = "white";
      background.style.color = 'black';
      table.style.color = 'black';
      form.style.color = 'black';
  }
}





let weatherArr = callWeatherAPI(testURL);
weatherArr.then(weatherArr => {
  buildWeatherTable(weatherArr);
});
