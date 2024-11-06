import { writable, derived, get } from 'svelte/store'
import { currentLocation } from '$lib/shared/stores/locationStore'
import { dateTime, currentDateTime, differenceHours, getMonth, dateString, focusDay } from '$lib/shared/stores/timeStore'
import fetchForecastJSON from "$lib/weather/metoffice";
import { fetchForecastMeteo } from "$lib/weather/openMeteo.ts";
import { fuelMoistureCalcs } from "$lib/model/fuelMoisture.js";

export const forecastOpenMeteo = writable({
  time: [1403984000],
  temperature2m: [15.05],
  relativeHumidity2m: [78.61],
  precipitation: [0],
  weatherCode: [3],
  cloudCover: [75],
  windSpeed10m: [3.12],
  windDirection10m: [150],
  windGusts10m: [5.05],
  globalTiltedIrradiance: [0],
})

export const forecastTimeSeries = writable([{
  feelsLikeTemperature: 15.05,
  max10mWindGust: 5.05,
  maxScreenAirTemp: 15.94,
  minScreenAirTemp: 15.66,
  mslp: 102390,
  precipitationRate: 0,
  probOfPrecipitation: 1,
  screenDewPointTemperature: 12.26,
  screenRelativeHumidity: 78.61,
  screenTemperature: 15.93,
  significantWeatherCode: 3,
  time: "2024-06-03T09:00Z",
  totalPrecipAmount: 0,
  totalSnowAmount: 0,
  uvIndex: 4,
  visibility: 19389,
  windDirectionFrom10m: 330,
  windGustSpeed10m: 5.05,
  windSpeed10m: 3.12
}])

export const forecastLocation = writable({ coordinates: [-3, 53, 100], name: "" })
export const forecastMode = writable('forecast')
export const forecastModes = ['forecast', 'historical']
export const fetchingForecast = writable(true)
export const forecastDays = writable(5)
export const forecastDaysPast = writable(1)

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

Date.prototype.subtractDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() - days);
  return date;
}

export async function getForecastOpenMeteo(dateTime) {
  if ((get(currentLocation).latitude) && (get(currentLocation).userLocation)) {
    // console.log("fetching forecast openMeteo")
    try {
      let hourlyVars = []
      let result = {}
      if (get(currentLocation).distanceFromPrevious > 4000) {
        console.log("fetching forecast distanceFromPrevious > 4000", get(currentLocation).distanceFromPrevious)
        hourlyVars = ["global_tilted_irradiance",
          "temperature_2m",
          "relative_humidity_2m",
          "precipitation",
          "weather_code",
          "cloud_cover",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
          "vapour_pressure_deficit",
        ]
        result = await fetchForecastMeteo(
          get(currentLocation).latitude,
          get(currentLocation).longitude,
          get(currentLocation).slope,
          get(currentLocation).aspect,
          get(forecastMode),
          hourlyVars,
          dateTime,
        );
        // console.log("fetch forecast result", result)

      } else {
        console.log("fetching forecast distanceFromPrevious < 4000", get(currentLocation).distanceFromPrevious)

        hourlyVars = ["global_tilted_irradiance"]
        const gti = await fetchForecastMeteo(
          get(currentLocation).latitude,
          get(currentLocation).longitude,
          get(currentLocation).slope,
          get(currentLocation).aspect,
          get(forecastMode),
          hourlyVars,
          dateTime,
        );

        result = get(forecastOpenMeteo)
        result["global_tilted_irradiance"] = gti["global_tilted_irradiance"]


      }

      // Second promise
      const resultMoist = await fuelMoistureCalcs(
        result,
        5,
        get(currentLocation).slope,
        get(currentLocation).aspect,
        get(currentLocation).elevation,
      );

      // Update stores
      forecastOpenMeteo.set(resultMoist);
      fetchingForecast.set(false);
      currentDateTime.set(new Date(dateTime));
    } catch (error) {
      console.error("Error fetching forecast:", error);
      fetchingForecast.set(false);
    }
  }
}
export function getIndexOf(dateObject) {
  return get(forecastOpenMeteo).time.indexOf(dateObject.getTime())
}

export const daysInForecast = derived([forecastOpenMeteo], ([$forecastOpenMeteo]) => {
  let days = []
  // skiping past days
  days.push((new Date($forecastOpenMeteo.time[0]).addDays(get(forecastDaysPast)).valueOf()))
  for (let i = 1; i < get(forecastDays); i++) {
    days.push((new Date(days[i - 1]).addDays(1)).valueOf())
  }
  // console.log("daysInForecast", days)
  return days
})

// export function getForecast() {
//   if ((get(currentLocation).latitude) && (get(currentLocation).userLocation) && (get(currentLocation).distanceFromPrevious > 5000)) {
//     // console.log("fetching forecast")
//     var promise = fetchForecastJSON(
//       get(currentLocation).latitude,
//       get(currentLocation).longitude,
//     );
//     promise.then(function (result) {
//       console.log("setting forecast location")
//       forecastLocation.set({ coordinates: result.features[0].geometry.coordinates, name: result.features[0].properties.location.name })
//       console.log("setting forecast timeSerie")
//       forecastTimeSeries.set(result.features[0].properties.timeSeries)
//     })
//   }
// }

export const forecastTimeIndex = derived(forecastTimeSeries, ($forecastTimeSeries) => {
  let indexMap = new Map()
  for (const [i, value] of $forecastTimeSeries.entries()) {
    indexMap.set(3600000 * (Math.round(new Date(value.time) / 3600000)), value)
  }
  return indexMap
})

export const currentWeather = derived([forecastTimeSeries, dateTime], ([$forecastTimeSeries, $dateTime]) => {
  let currForecast = {}
  const indexCurrent = differenceHours(new Date($dateTime), new Date($forecastTimeSeries[0].time))
  if (indexCurrent < 5) {
    currForecast = $forecastTimeSeries[indexCurrent]
  } else {
    currForecast = $forecastTimeSeries[0]
  }
  return currForecast
});


export const elevationDiff = derived([forecastLocation, currentLocation], ([$forecastLocation, $currentLocation]) => {
  return $forecastLocation.coordinates[2] - $currentLocation.elevation
})

export const currentTimeIndex = derived([dateTime], ([$dateTime]) => {
  // console.log("dateTime", $dateTime)
  const index = get(forecastOpenMeteo).time.indexOf($dateTime)
  return index > -1 ? index : 0
})

export const focusDayIndex = derived([focusDay], ([$focusDay]) => {
  const timeIndex = get(forecastOpenMeteo).time
  const indexMin = timeIndex.indexOf($focusDay.valueOf())
  const indexMax = timeIndex.indexOf($focusDay.valueOf() + 86400000);
  // console.log("time index calc", indexMin, indexMax, new Date($focusDay), new Date(timeIndex[0]), new Date(timeIndex[23]), new Date(timeIndex[-1]))
  return [indexMin, indexMax]
})
// export const currentDayTimeIndex = derived([dateTime], ([$dateTime]) => {
//   console.log("dateTime", $dateTime)
//   const index = get(forecastOpenMeteo).time.indexOf($dateTime)
//   return index > -1 ? index : 0
// })
