
const request = require('request')
const https = require('https');

const hereApiKey = process.env.HERE_API_KEY

const geocoderURL = 'https://geocode.search.hereapi.com/v1/geocode'
const reverseGeocodeURL = 'https://revgeocode.search.hereapi.com/v1/revgeocode'
const discoverURL = 'https://discover.search.hereapi.com/v1/discover'

const searchRadius = 20000; // in meters
let currentCoordinates = {
  lat: 35.7846633,
  lng: -78.6820946
};

const updateURL = (stringURL) => {
    return stringURL + "?apikey=" + hereApiKey
}

countCall =1
const RADIUS_TO_SEARCH = 250000
//at/in radius, limit, q
//using in for radius (in mtr)  of 250 km
const discoverSearch = (lat, lng, searchType)  => {
    console.log('call to discover')
    return new Promise((resolve, reject) => {
        let url = updateURL(discoverURL) + '&in=circle:' + lat  + ',' + lng + ';r=' + RADIUS_TO_SEARCH + '&q=' + encodeURIComponent(searchType)
        const request = https.request(url, (response) => {
            let data = ''
            response.on('data', (chunk) => {
                data = data + chunk.toString()
            })
    
            response.on('end', () => {
                const body = JSON.parse(data)
                console.log("end discover", JSON.stringify(body.items))
                resolve(body.items)
            })
        }) 
        request.on('error', (error) => {
            console.log("An error in discover ", error)
            //countCall +=1
            resolve([])
        })
        request.end()
    })
}

//will search based on lat long and return address details.
const revGeocodeSearch = (lat, lng) => {  
    return new Promise((resolve, reject) => {
        let url = updateURL(reverseGeocodeURL) + '&limit=1&at=' + lat + ',' + lng 
        const request = https.request(url, (response) => {
            let data = ''
            response.on('data', (chunk) => {
                data = data + chunk.toString()
            })
    
            response.on('end', () => {
                const body = JSON.parse(data)
                console.log("end rev geocode", JSON.stringify(body.items[0].address.city))
                resolve(body.items[0].address.city)
            })
        }) 
    
        request.on('error', (error) => {
            console.log("An error ", countCall, url, error)
            countCall +=1
            reject(error)
        })
    
        request.end()
    })
}

//will search based on lat long and return address details.
const geocodeSearch = (addr) => {  
    return new Promise((resolve, reject) => {
        let url = updateURL(geocoderURL) + '&q=' + addr
        const request = https.request(url, (response) => {
            let data = ''
            response.on('data', (chunk) => {
                data = data + chunk.toString()
            })
    
            response.on('end', () => {
                const body = JSON.parse(data)
                body.items[0].position.city = body.items[0].address.city
                console.log("end geocode", JSON.stringify(body.items[0].position))
                resolve(body.items[0].position)
            })
        }) 
    
        request.on('error', (error) => {
            console.log("An error ", countCall, url, error)
            countCall +=1
            reject(error)
        })
    
        request.end()
    })
}

module.exports = {
    geocodeSearch,
    revGeocodeSearch,
    discoverSearch
}
