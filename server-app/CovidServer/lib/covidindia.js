const nodeCache= require('node-cache')
const request = require('request')
const here = require('./here')
const CACHE_DURATION = 600

let myCache = null

const initCache = () => {
        console.log("init cache")
        myCache = new nodeCache() 
}

const covid19details = function(){
    return new Promise((resolve, reject) => {
    const url = 'https://api.covid19india.org/resources/resources.json'
    request({url, json:true} , (error, {body}) => {
        if(error) {
            reject("Unable to connect to location services!")
        } else if(body.length === 0){
            reject("Unable to find location. Try another search!")
        } else {
            console.log("dsdf",body.resources.length)
            resolve(body.resources)
        }
    });
});
}

const getcachedata = (key) => {
    if (!myCache) initCache();
    const resultData = myCache.get(key)
    if (!resultData) {
        return covid19details().then((results) => {
            myCache.set(key, results, CACHE_DURATION)
            return results
        }).catch((error) => {
            console.log("Error insad", error)
            console.log("Error in fetching details from cached memory")
        })
    } else{
        console.log("Value")
        return resultData//cb(resultData)
    }
}

const covidIndiaData = () => {
    return new Promise((resolve, reject) => {
        const resultData = getcachedata('covid')
        console.log("covid res")
        resolve(resultData)
    });
}

module.exports = {
    covidIndiaData,
    initCache
}




