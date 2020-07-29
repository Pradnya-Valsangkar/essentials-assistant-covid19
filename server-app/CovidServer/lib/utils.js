const covidindia = require('./covidindia')
const here = require('./here')
const underscore = require('underscore')

const ignorefields = ['category', 'city', 'descriptionandorserviceprovided', 'recordid', 'state']

const filterResultOnCity = (results, city, category, cb) => {
    let filteredData = results.filter((item) =>item.city === city & (item.category === category | item.category.toLowerCase().includes(category.toLowerCase())))
    filteredData = underscore.map(filteredData, (item) => { item.position = undefined
                                           return underscore.omit(item, ignorefields)})
    if(filteredData.length > 0) {
        cb(undefined, filteredData)
    } else {
        cb("No Data Found in Covid-19 site", undefined)
    }
}

const decorateHereResult = (heredata , cb) => {
    let filteredData = underscore.map(heredata, (item) => {
        let phonedata = undefined
        let phoneNumber = undefined
        if(item.contacts) {
            let contact = item.contacts[0]
            if(contact.phone) {
                phonedata = contact.phone[0].value
                if(phonedata) phoneNumber = phonedata
            }
            if(contact.mobile) {
                phonedata = contact.mobile[0].value
                if(phonedata) {
                    if(phoneNumber) {
                        phoneNumber = phoneNumber + ',' + phonedata
                    } else {
                        phoneNumber = phonedata
                    }
                }
            }
        }
        let itemData = {
            contact: undefined,
            position : item.position,
            nameoftheorganisation: item.address.label,
            phoneNumber
        }
        return itemData
    })
    cb(filteredData)
}

const mergeBothData = (data1, data2, cb) => {
    let data = []
    if (data1 && data2) {
     data = data1.concat(data2)
    } else if(data1) {
        data = data1
    } else {
        data = data2
    }
    cb(data)
}

const emptyListFunc = () => {
    return new Promise((resolve, reject) => {
        resolve({data:JSON.stringify([])})
    }) 
} 

const getQueryData = (lat, lng, type) => {
    console.log(type)
    const grocerystore = require('./grocerystore')
    return new Promise((resolve, reject) => {
        const covidindiadataresult = covidindia.covidIndiaData()
        const hereapiresult = here.discoverSearch(lat, lng, type)
        covidindiadataresult.then((result) => {
            const geocodeRes = here.revGeocodeSearch(lat, lng)
            geocodeRes.then(city => {
                let groceryData = type.trim() === 'Groceries'? grocerystore.listGroceryStoreOnCity(city) : emptyListFunc()
                return filterResultOnCity(result, city, type, (errorCovid, coviddata) => {
                    //console.log('covid data', data)
                    return groceryData.then(({data}) => {
                        let groceries = JSON.parse(data)
                        console.log("groceries data", groceries)
                        return mergeBothData(groceries, coviddata, (data) => {
                            hereapiresult.then(hereResult => {
                                //console.log("got resu" , hereResult.length)
                                return decorateHereResult(hereResult, (heredata) => {
                                    //console.log("return from decorTE", heredata)
                                    return mergeBothData(data, heredata, (finalresult) => {
                                        //console.log("return from merge", finalresult)
                                        if (errorCovid) {
                                            console.log(errorCovid)
                                            resolve(finalresult)
                                        } else {
                                            resolve(finalresult)
                                        }
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    });
}

const updateDoctorOrUserDatabase = (roletype, data)=>{
    let item
    if(roletype === 'doctor'){
        underscore.each(data, function(docItems){ 
            item = {
                _id: docItems['_id'],
                _rev: docItems['_rev'], 
                deviceUniqueID : docItems['deviceUniqueID'],
                name: docItems['name'],
                phoneNumber : docItems['phoneNumber'],
                specialization : docItems['specialization'],
                password : docItems['password'],
                clinicStartTime : docItems['clinicStartTime'],
                consultationFees : docItems['consultationFees'],
                clinicEndTime : docItems['clinicEndTime'],
                scheduleToday: docItems['scheduleToday'],
                scheduleTomorrow : docItems['scheduleTomorrow'],
                scheduleDATomorrow: docItems['scheduleDATomorrow'],
                notify : docItems['notify'],
                city :  docItems['city'] || '',
                operation : 'UPDATE'
            }
        });
    } else {
        underscore.each(data, function(docItems){ 
            item = {
                _id: docItems['_id'],
                _rev: docItems['_rev'], 
                deviceUniqueID : docItems['deviceUniqueID'],
                name : docItems['name'],
                phoneNumber : docItems['phoneNumber'],
                password : docItems['password'],
                notify : docItems['notify'],
                operation : 'UPDATE'
            }
        })
    }
     return item
}

const getCompleteAddress = (req) => {
    console.log("get Complete Address", req.body)
    return new Promise((resolve, reject) => {
      if (!req.body.address){
        const geocodeRes = here.revGeocodeSearch(req.body.latitude, req.body.longitude)
        geocodeRes.then(city => {
          req.body.address = city
          req.body.city = city
          resolve(req)
        }).catch(err => reject(err));
      } else {
        const geocodeRes = here.geocodeSearch(req.body.address)
        geocodeRes.then(({lat, lng, city}) => {
          req.body.latitude = lat
          req.body.longitude = lng
          req.body.city = city
          resolve(req)
        }).catch(err => reject(err));
      }
    })
  }

module.exports = {
    getQueryData,
    updateDoctorOrUserDatabase,
    getCompleteAddress
}