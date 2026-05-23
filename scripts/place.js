const currentYear = document.querySelector("#currentyear");
const lastModified = document.querySelector("#lastModified");
const temperatureDisplay = document.querySelector("#temperature");
const windDisplay = document.querySelector("#wind");
const windChillDisplay = document.querySelector("#wind-chill");

const temperature = 10;
const windSpeed = 5;

function calculateWindChill(temperature, windSpeed) {
    return 13.12 + 0.6215 * temperature - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temperature * Math.pow(windSpeed, 0.16);
}

currentYear.textContent = new Date().getFullYear();
lastModified.textContent = document.lastModified;

temperatureDisplay.textContent = temperature;
windDisplay.textContent = windSpeed;

windChillDisplay.textContent =
    temperature <= 10 && windSpeed > 4.8
        ? `${calculateWindChill(temperature, windSpeed).toFixed(1)} °C`
        : "N/A";