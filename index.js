const dateInput = document.querySelector('#date')
const timeInput = document.querySelector('#time')
const startInput = document.querySelector('#start')
const endInput = document.querySelector('#end')
const addStopBtn = document.querySelector('#add-stop')
const waypointsDiv = document.querySelector('#waypoints')
const form = document.querySelector('#input form')
const directionsDiv = document.querySelector('#directions')
const errorOutput = document.querySelector('#errors')

const markers = []
const markerOptionsList = []
const renderers = []
let waypointsIndex = 0
let userGeolocation = null

initPage()

function initPage() {
   const today = new Date(Date.now())
   let todaysMonth = today.getMonth() + 1
   if (todaysMonth < 10) todaysMonth = '0' + todaysMonth

   dateInput.min = `${today.getFullYear()}-${todaysMonth}-${today.getDate()}`
   dateInput.value = `${today.getFullYear()}-${todaysMonth}-${today.getDate()}`

   let hrs = today.getHours() + 2
   if (hrs < 10) hrs = '0' + hrs

   timeInput.value = `${hrs}:00`

   const copywrightDiv = document.querySelector('#copywright')
   copywrightP = document.createElement('p')
   copywrightP.innerHTML = `Copyright &copy; ${today.getFullYear()} Kevin Penney. All Rights Reserved<br />
                        Questions and suggestions are welcome! kevin@penneyprojects.com`
   copywrightDiv.appendChild(copywrightP)
}

function initMap() {
   // callback from google script
   let options = {
      zoom: 4,
      center: {
         lat: 38.440633,
         lng: -98.385672
      }
   }

   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError, { enableHighAccuracy: true })
      function geoSuccess(position) {
         userGeolocation = position.coords.latitude + ',' + position.coords.longitude
         startInput.setAttribute('list', 'my-location')
         endInput.setAttribute('list', 'my-location')
         map.setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
         })
         map.setZoom(11)
      }
      function geoError() {
         console.log('Browser geolocation has been declined')
      }
   }

   map = new google.maps.Map(document.querySelector('#map'), options)
   directionsService = new google.maps.DirectionsService()
   const startAutocomplete = new google.maps.places.Autocomplete(startInput)
   startAutocomplete.setFields(['place_id'])
   const endAutocomplete = new google.maps.places.Autocomplete(endInput)
   endAutocomplete.setFields(['place_id'])

   // add Your location to autocomplete menu
   // setTimeout(() => {
   //    const autocompleteNodes = document.querySelectorAll('.pac-container')
   //    const autoArray = Array.from(autocompleteNodes)
   //    autoArray.forEach((auto, i) => {
   //       const newDiv = document.createElement('div')
   //       const iconSpan = document.createElement('span')
   //       iconSpan.classList.add('my-pac-icon')
   //       const textSpan = document.createElement('span')
   //       textSpan.classList.add('my-pac-text')
   //       newDiv.classList.add('my-pac-item')
   //       newDiv.classList.add('pac-item')
   //       textSpan.textContent = 'Your location'
   //       newDiv.appendChild(iconSpan)
   //       newDiv.appendChild(textSpan)
   //       auto.appendChild(newDiv)
   //       newDiv.addEventListener('mousedown', () => {
   //          const inputEl = document.querySelector(`input[name="input${i}"`)
   //          inputEl.value = 'Your location'
   //       })
   //    })
   // }, 1000)
}

addStopBtn.addEventListener('click', () => {
   // add additional waypoint input
   if (waypointsDiv.childElementCount < 10) {
      const newDiv = document.createElement('div')
      const inputEl = document.createElement('input')
      inputEl.id = `waypoint${waypointsIndex++}`
      inputEl.type = 'text'
      inputEl.placeholder = 'Waypoint'
      if (userGeolocation != null) {
         inputEl.setAttribute('list', 'my-location')
      }
      const selectEl = document.createElement('select')
      selectEl.innerHTML = `
         <option value='0'>layover?</option>
         <option value='15'>15 min</option>
         <option value='30'>30 min</option>
         <option value='45'>45 min</option>
         <option value='1'>1 hr</option>
         <option value='2'>2 hr</option>
         <option value='3'>3 hr</option>
         <option value='4'>4 hr</option>
         <option value='5'>5 hr</option>
         <option value='6'>6 hr</option>
         <option value='7'>7 hr</option>
         <option value='8'>8 hr</option>
         <option value='9'>9 hr</option>
         <option value='10'>10 hr</option>
         <option value='11'>11 hr</option>
         <option value='12'>12 hr</option>
      `
      const waypointAutocomplete = new google.maps.places.Autocomplete(inputEl)
      waypointAutocomplete.setFields(['place_id'])

      // if (navigator.geolocation) {
      //    setTimeout(() => {
      //       const autocompleteNodes = document.querySelectorAll('.pac-container')
      //       const autoArray = Array.from(autocompleteNodes)
      //       autoArray.forEach((auto, i) => {
      //          let yourLocationHasBeenAdded = false
      //          // Check if Your location already exists
      //          for (let i = 0; i < auto.childNodes.length; i++) {
      //             if ((auto.childNodes[i] = 'div.my-pac-item.pac-item')) {
      //                yourLocationHasBeenAdded = true
      //             }
      //          }
      //          if (!yourLocationHasBeenAdded) {
      //             const newDiv = document.createElement('div')
      //             const iconSpan = document.createElement('span')
      //             iconSpan.classList.add('my-pac-icon')
      //             const textSpan = document.createElement('span')
      //             textSpan.classList.add('my-pac-text')
      //             newDiv.classList.add('my-pac-item')
      //             newDiv.classList.add('pac-item')
      //             textSpan.textContent = 'Your location'
      //             newDiv.appendChild(iconSpan)
      //             newDiv.appendChild(textSpan)
      //             auto.appendChild(newDiv)
      //             newDiv.addEventListener('mousedown', () => {
      //                const inputEl = document.querySelector(`#waypoint${localIndex}`)
      //                inputEl.value = 'Your location'
      //             })
      //          }
      //       })
      //    }, 500)
      // }

      waypointsDiv.appendChild(newDiv)
      newDiv.appendChild(inputEl)
      newDiv.appendChild(selectEl)
   }
})

form.addEventListener('submit', async e => {
   //  Directions form is submitted
   e.preventDefault()

   const waypointsLocNodelist = document.querySelectorAll('#waypoints input')
   const waypointsTimeNodelist = document.querySelectorAll('#waypoints select')

   const waypointsLocArray = Array.from(waypointsLocNodelist)
   const waypointsTimeArray = Array.from(waypointsTimeNodelist)

   let trips = [
      {
         start: startInput.value,
         waypoints: []
         // layoverTime
         // end
      }
   ]
   // let needGeolocation = false
   // if (startInput.value.toLowerCase() === 'my current location') {
   //    needGeolocation = true
   // } else if (endInput.value.toLowerCase() === 'my current location') {
   //    needGeolocation = true
   // }

   let tripIndex = 0
   waypointsLocArray.forEach((waypointLoc, wpIndex) => {
      if (waypointLoc.value !== '') {
         if (waypointsTimeArray[wpIndex].value === '0') {
            trips[tripIndex].waypoints.push({
               location: waypointLoc.value,
               stopover: true
            })
         } else {
            trips[tripIndex].layoverTime = +waypointsTimeArray[wpIndex].value
            trips[tripIndex++].end = waypointLoc.value
            trips.push({
               start: waypointLoc.value,
               waypoints: []
            })
         }
         // if (waypointLoc.value.toLowerCase() === 'my current location') needGeolocation = true
      }
   })

   trips[tripIndex].end = endInput.value
   trips[tripIndex].layoverTime = 0

   // add geolocation for 'Your location'
   // if (navigator.geolocation) {
   // const jsonResult = await fetch(
   //    'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAXEdAgTc7DAJ67BeqsaCim9gOJnogeVRQ',
   //    {
   //       method: 'POST'
   //    }
   // )
   // var locationData = await jsonResult.json()

   if (userGeolocation != null) {
      trips.forEach(trip => {
         if (trip.start.toLowerCase() === 'my current location') {
            trip.start = userGeolocation
         }
         if (trip.end.toLowerCase() === 'my current location') {
            trip.end = userGeolocation
         }
         trip.waypoints.forEach(waypoint => {
            if (waypoint.location.toLowerCase() === 'my current location') {
               waypoint.location = userGeolocation
            }
         })
      })
   }
   calcRoute(trips)
})

async function calcRoute(trips) {
   // Set NOW to the top of the hour when the first hourly weather data is available
   const timeOfTravel = new Date()
   timeOfTravel.setFullYear(dateInput.value.split('-')[0])
   timeOfTravel.setMonth(dateInput.value.split('-')[1] - 1)
   timeOfTravel.setDate(dateInput.value.split('-')[2])
   timeOfTravel.setHours(timeInput.value.split(':')[0])
   timeOfTravel.setMinutes(timeInput.value.split(':')[1])
   timeOfTravel.setSeconds(0)

   const nowToTheHour = new Date(Date.now())
   nowToTheHour.setSeconds(0)
   if (nowToTheHour.getMinutes() > 30) {
      nowToTheHour.setMinutes(60)
   } else {
      nowToTheHour.setMinutes(0)
   }

   clearCurrentOutputs()

   let needOriginMarker = true
   let tripsIndex = 0
   let detailsBtnID = 1

   directionsLoop()

   function directionsLoop() {
      // Loops recursively for multiple trip directions
      const { start, end, waypoints, layoverTime } = trips[tripsIndex]

      const directionsRenderer = new google.maps.DirectionsRenderer({
         map,
         panel: directionsDiv,
         suppressInfoWindows: true,
         suppressMarkers: true
      })
      renderers.push(directionsRenderer)

      const request = {
         origin: start,
         destination: end,
         waypoints,
         travelMode: 'DRIVING',
         drivingOptions: {
            departureTime: new Date(timeOfTravel.getTime())
         },
         unitSystem: google.maps.UnitSystem.IMPERIAL
      }

      // console.log('request', request)

      // Request directions from Google
      directionsService.route(request, async (result, status) => {
         if (status == 'OK') {
            // console.log('directions', result)
            directionsRenderer.setDirections(result)
            const legs = result.routes[0].legs
            const todayMidnight = new Date(nowToTheHour.getTime())
            todayMidnight.setHours(0)
            legsIndex = 0

            if (needOriginMarker) {
               // Starting Location
               needOriginMarker = false
               const weatherData = await getWeatherData(
                  legs[0].start_location.lat(),
                  legs[0].start_location.lng()
               )

               let markerOptions = {
                  coords: {
                     lat: legs[0].start_location.lat(),
                     lng: legs[0].start_location.lng()
                  },
                  content: `${legs[0].start_address} <br />
                     ${timeOfTravel.toLocaleString('default', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                     })}`,
                  weatherDetailsDivs: [],
                  detailsBtnID: []
               }

               var hoursFromNow = Math.round((timeOfTravel - nowToTheHour) / (1000 * 60 * 60))
               const dayOfTravelMidnight = new Date(timeOfTravel.getTime())
               dayOfTravelMidnight.setHours(0)
               dayOfTravelMidnight.setMinutes(0)
               const daysFromNow = Math.round(
                  (dayOfTravelMidnight - todayMidnight) / (1000 * 60 * 60 * 24)
               )

               // Display hourly weather if available < 48hrs
               if (hoursFromNow <= 48) {
                  // const localDetailsID = detailsBtnID
                  addHourlyWeather(markerOptions, weatherData.hourly[hoursFromNow], detailsBtnID)

                  const hourlyWeatherContainer = moreHourlyWeatherDetails(
                     weatherData,
                     legs[0].start_address,
                     hoursFromNow
                  )
                  markerOptions.weatherDetailsDivs.push(hourlyWeatherContainer)
                  markerOptions.detailsBtnID.push(detailsBtnID++)

                  markerOptionsList.push(markerOptions)
                  displayLegMarkers(legs)
                  // addMarker(markerOptions, hourlyWeatherContainer, localDetailsID)
                  // detailsID++

                  // Display daily weather if 2 - 7 days away
               } else if (daysFromNow <= 7) {
                  addDailyWeather(markerOptions, weatherData.daily[daysFromNow])
                  markerOptionsList.push(markerOptions)
                  displayLegMarkers(legs)

                  // addMarker(markerOptions)
               } else {
                  markerOptionsList.push(markerOptions)
                  displayLegMarkers(legs)

                  // addMarker(markerOptions)
               }
            } else displayLegMarkers(legs)

            // Get Destination Points weather
            async function displayLegMarkers(legs) {
               const leg = legs[legsIndex]
               const weatherData = await getWeatherData(
                  leg.end_location.lat(),
                  leg.end_location.lng()
               )

               if (leg.duration_in_traffic) {
                  timeOfTravel.setSeconds(leg.duration_in_traffic.value + timeOfTravel.getSeconds())
               } else {
                  timeOfTravel.setSeconds(leg.duration.value + timeOfTravel.getSeconds())
               }

               const markerOptions = {
                  coords: {
                     lat: leg.end_location.lat(),
                     lng: leg.end_location.lng()
                  },
                  content: '',
                  weatherDetailsDivs: [],
                  detailsBtnID: []
               }
               // Combine info windows if visiting a location twice
               markerOptionsList.forEach(previousOption => {
                  if (
                     leg.end_location.lat() == previousOption.coords.lat &&
                     leg.end_location.lng() == previousOption.coords.lng
                  ) {
                     markerOptions.content += `${previousOption.content}<br><hr>`
                     markerOptions.detailsBtnID = [...previousOption.detailsBtnID]
                     // previousOption.detailsBtnId.length = 0
                     markerOptions.weatherDetailsDivs = [...previousOption.weatherDetailsDivs]
                     previousOption.coords = {
                        lat: null,
                        lng: null
                     }
                  }
               })

               markerOptions.content += `${leg.end_address}<br />
               ${timeOfTravel.toLocaleString('default', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
               })}`

               const hoursFromNow = Math.round((timeOfTravel - nowToTheHour) / (1000 * 60 * 60))
               const dayOfTravelMidnight = new Date(timeOfTravel.getTime())
               dayOfTravelMidnight.setHours(0)
               dayOfTravelMidnight.setMinutes(0)
               const daysFromNow = Math.round(
                  (dayOfTravelMidnight - todayMidnight) / (1000 * 60 * 60 * 24)
               )

               // Display hourly weather if available < 48hrs
               if (hoursFromNow <= 48) {
                  // const localDetailsID = detailsID
                  addHourlyWeather(markerOptions, weatherData.hourly[hoursFromNow], detailsBtnID)

                  const hourlyWeatherContainer = moreHourlyWeatherDetails(
                     weatherData,
                     leg.end_address,
                     hoursFromNow
                  )
                  addLayover()
                  markerOptions.weatherDetailsDivs.push(hourlyWeatherContainer)
                  markerOptions.detailsBtnID.push(detailsBtnID++)

                  markerOptionsList.push(markerOptions)
                  // addMarker(markerOptions, hourlyWeatherContainer, localDetailsID)
                  // detailsID++

                  // Display daily weather if 2 - 7 days away
               } else if (daysFromNow <= 7) {
                  addDailyWeather(markerOptions, weatherData.daily[daysFromNow])
                  addLayover()
                  markerOptionsList.push(markerOptions)
                  // addMarker(markerOptions)
               } else {
                  addLayover()
                  // addMarker(markerOptions)
               }
               // Recursive looping
               if (legsIndex < legs.length - 1) {
                  legsIndex++
                  displayLegMarkers(legs)
               } else if (tripsIndex < trips.length - 1) {
                  tripsIndex++
                  directionsLoop()
               } else addMarkers(markerOptionsList)

               // Add layovertime to time, add to markerOptions
               function addLayover() {
                  if (legsIndex === legs.length - 1 && layoverTime > 0) {
                     if ([15, 30, 45].includes(layoverTime)) {
                        timeOfTravel.setMinutes(timeOfTravel.getMinutes() + layoverTime)
                     } else {
                        timeOfTravel.setHours(timeOfTravel.getHours() + layoverTime)
                     }
                     markerOptions.content += `<br /><hr>Leaving at ${timeOfTravel.toLocaleString(
                        'default',
                        {
                           hour: 'numeric',
                           minute: '2-digit'
                        }
                     )}`
                  }
               }
            }

            async function getWeatherData(lat, lng) {
               const apikey = 'b3126cf53923f5663a6c7fe3eb1826c9'
               const jsonResult = await fetch(
                  `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=${apikey}&units=imperial`
               )
               return await jsonResult.json()
            }

            function addHourlyWeather(markerOptions, w, detailsID) {
               const icon = w.weather[0].icon
               let description = w.weather[0].description
               description = `${description[0].toUpperCase()}${description.substring(1)}`

               markerOptions.content += `<br /><img src="./img/${icon}.png" alt="weather icon">
            <br />${Math.round(w.temp)}°
            <br />${description}
            <br />Wind: ${Math.round(w.wind_speed)} mph
            <br />${w.humidity}% humidity
            <br /><button class='weather-details' id='details-btn-${detailsID}'>More Details</button>`
            }

            function addDailyWeather(markerOptions, w) {
               const icon = w.weather[0].icon
               let description = w.weather[0].description
               description = `${description[0].toUpperCase()}${description.substring(1)}`

               markerOptions.content += `<br /><img src="./img/${icon}.png" alt="weather icon">
               <br />${Math.round(w.temp.max)}° max temp
               <br />${Math.round(w.temp.min)}° min temp
               <br />${description}
               <br />Wind: ${Math.round(w.wind_speed)} mph 
               <br />${w.humidity}% humidity`
            }
         } else {
            if (status === 'NOT_FOUND') {
               errorOutput.textContent =
                  'Google could not find your locations. Please make changes and try again.'
            } else if (status === 'INVALID_REQUEST') {
               errorOutput.textContent =
                  'Departure time is in the past. Please pick a time in the future and try again.'
            } else if (status === 'ZERO_RESULTS') {
               errorOutput.textContent = 'Google found zero results for your directions by car.'
            }
            console.log('Google directions status error >>> ', status)
         }

         // Create More Details weather window
         function moreHourlyWeatherDetails(weatherData, address, hoursFromNow) {
            const hourlyWeatherContainer = document.createElement('div')
            hourlyWeatherContainer.classList.add('hourly-weather')
            const middleDiv = document.createElement('div')
            middleDiv.classList.add('hourly-weather-middle')
            hourlyWeatherContainer.appendChild(middleDiv)
            const addressDiv = document.createElement('div')
            addressDiv.textContent = address
            middleDiv.appendChild(addressDiv)
            const insideDiv = document.createElement('div')
            insideDiv.classList.add('hourly-weather-inside')
            middleDiv.appendChild(insideDiv)

            for (let i = hoursFromNow - 3; i <= hoursFromNow + 3; i++) {
               if (weatherData.hourly[i]) {
                  const w = weatherData.hourly[i]
                  let description = w.weather[0].description
                  description = `${description[0].toUpperCase()}${description.substring(1)}`

                  const weatherTime = new Date()
                  weatherTime.setHours(nowToTheHour.getHours() + i)
                  insideDiv.innerHTML += `<div>
                        ${weatherTime.toLocaleTimeString('default', {
                           hour: 'numeric'
                        })}<br />
                        <img src="./img/${w.weather[0].icon}.png" alt="weather icon"><br />
                        ${Math.round(w.temp)}°<br />
                        ${description}<br />
                        Wind: ${Math.round(w.wind_speed)} mph<br /> 
                        ${w.humidity}% humidity
                        </div>`
               }
            }
            hourlyWeatherContainer.index = 1
            return hourlyWeatherContainer
         }
      })
      function addMarkers(options) {
         options.forEach((option, i) => {
            if (option.coords.lat != null) {
               const marker = new google.maps.Marker({
                  position: option.coords,
                  map,
                  icon: './img/motorcycle.png'
               })
               const infoWindow = new google.maps.InfoWindow({
                  content: `<div class="weather-info-window">${option.content}</div>`
               })
               marker.addListener('click', () => {
                  infoWindow.open(map, marker)
                  markers.push(marker)
               })
               const infoWindowListener = google.maps.event.addListener(
                  infoWindow,
                  'domready',
                  () => {
                     google.maps.event.removeListener(infoWindowListener)
                     option.detailsBtnID.forEach((id, index) => {
                        const detailsBtn = document.querySelector(`#details-btn-${id}`)
                        detailsBtn.addEventListener('click', () => {
                           map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear()
                           google.maps.event.addDomListener(map, 'click', () => {
                              map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear()
                           })
                           map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
                              option.weatherDetailsDivs[index]
                           )
                        })
                     })
                  }
               )
            }
         })
      }
   }
   function clearCurrentOutputs() {
      markers.forEach(marker => marker.setMap(null))
      markers.length = 0
      markerOptionsList.length = 0
      renderers.forEach(renderer => renderer.setMap(null))
      renderers.length = 0
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear()
      directionsDiv.textContent = ''
      errorOutput.textContent = ''
   }
}
