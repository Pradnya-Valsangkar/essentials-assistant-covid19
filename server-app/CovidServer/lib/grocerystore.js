// Cloudant DB reference
const cloudant = require('./cloudant.js');
const utils = require('./utils.js')
const here = require('./here');
const nodeCache= require('node-cache')

const CACHE_DURATION = 120
let myCache = null
let grocerydb_name = "grocerystore_db";
let grocery_db = '';
// Initialize the DB when this module is loaded

(function getDbConnection() {
  console.log('Initializing Cloudant connection...', 'getDbConnection()');
  cloudant.dbCloudantConnect(grocerydb_name).then((database) => {
    console.log('Cloudant connection initialized.', 'getDbConnection()');
    grocery_db = database;
  }).catch((err) => {
    console.log('Error while initializing DB: ' + err.message, 'getDbConnection()');
    throw err;
  });
})();


const initCache = () => {
  console.log("init cache")
  myCache = new nodeCache() 
}

/*
internal call
*/ 
const getQueueNumberForUsers = (req) =>{
  return new Promise((resolve, reject) => {
          let selector = {}
          let options = {}
          if (req.body.phoneNumber) {
            selector['phoneNumber'] = req.body.phoneNumber;
          }
          options['selector'] = selector
          cloudant
            .find(grocery_db, JSON.stringify(options))
            .then(({ data }) => {
              console.log('**************getQueueNumberForUsers', data)
              resolve(data)
            }).catch(err => reject(err));
    });
}

const getQueueCachedata = (req) => {
  if (!myCache) initCache();
  const resultData = myCache.get(req.body.phoneNumber)
  if (!resultData) {
      return getQueueNumberForUsers(req).then((results) => {
        console.log('*****results', JSON.parse(results)[0])
        let currentQueueNumber = JSON.parse(results)[0].currentQueueNumber
          myCache.set(req.body.phoneNumber, currentQueueNumber, CACHE_DURATION)
          return currentQueueNumber
      }).catch((error) => {
          console.log("Error insad", error)
          console.log("Error in fetching details from cached memory")
      })
  } else{
      console.log("Value")
      return resultData//cb(resultData)
  }
}

const currentQueuenumber = (req) => {
  return new Promise((resolve, reject) => {
      const resultData = getQueueCachedata(req)
      console.log("Current queue number ", resultData)
      resolve(resultData)
  });
}

const updateQueueNumberForUsers = (req) => {
  return new Promise((resolve, reject) => {
          let selector = {}
          let options = {}
          if (req.body.phoneNumber) {
            selector['phoneNumber'] = req.body.phoneNumber;
          }
          options['selector'] = selector
          cloudant
            .find(grocery_db, JSON.stringify(options))
            .then(({ data }) => {
              let docItems = JSON.parse(data)[0]
              let item = {
                    _id: docItems['_id'],
                    _rev: docItems['_rev'], 
                    deviceUniqueID : docItems['deviceUniqueID'],
                    name : docItems['name'],
                    nameOfStore : docItems['nameOfStore'],
                    phoneNumber : docItems['phoneNumber'],
                    password : docItems['password'],
                    address : docItems['address'],
                    city : docItems['city'],
                    latitude : docItems['latitude'],
                    longitude : docItems['longitude'],
                    isRegistered : docItems['isRegistered'],
                    currentQueueNumber : docItems['currentQueueNumber'],
                    operation : 'UPDATE'
                  }
                item.currentQueueNumber = item.currentQueueNumber + 1
                myCache.set(item.phoneNumber, item.currentQueueNumber, CACHE_DURATION)
                  cloudant
                    .updateOrCreateDocument(grocery_db, item)
                    .then(({data}) => {
                      console.log('**************69', data)
                      resolve(data)
                    }).catch(err => reject(err));
                   
            }).catch(err => reject(err));
    });
}


// Creating shop owner grocery store data
const creatingShopkeeper = (req) => {
  return new Promise((resolve, reject) => {
    utils.getCompleteAddress(req).then(req => {
      const createRequestOptions = {
        deviceUniqueID: req.body.deviceUniqueID||'',
        name: req.body.name || '',
        nameOfStore : req.body.nameOfStore,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        address: req.body.address || '',
        latitude : req.body.latitude || '',
        longitude : req.body.longitude || '',
        city : req.body.city || '',
        isRegistered : req.body.isRegistered || true,
        currentQueueNumber: 0
      }
    cloudant
        .create(grocery_db, createRequestOptions)
        .then(data => {
          resolve(data)
        }).catch(err => reject(err));
    }).catch(err => reject(err))
  });
}

// Creating user
const validatingRegistration = (req) => {
  return new Promise((resolve, reject) => {
    let options = {}
    let selector = {}
    if (req.body.phoneNumber) {
      selector['phoneNumber'] = req.body.phoneNumber;
    }
    options['selector'] = selector
    cloudant
      .find(grocery_db, JSON.stringify(options))
      .then(({ data }) => {
        if (JSON.parse(data).length > 0) {
          let err = { message: 'Account already exist with the same number.Try to register with other number.', code: 409 }
          reject(err)
        } else {
          resolve(data.data)
        }
      }).catch(err => reject(err));
  });
}
 
const loginVerification = (req) => {
  return new Promise((resolve, reject) => {
    let selector = {}
    let options = {}
    if (req.body.phoneNumber && req.body.password) {
      selector['phoneNumber'] = req.body.phoneNumber;
      selector['password'] = req.body.password;
    } else {
      let err = { message: 'Wrong account or password entered.Please enter again', code: 400 }
      reject(err)
    }
   
  options['selector'] = selector
       cloudant
        .find(grocery_db, JSON.stringify(options))
        .then(({data}) => {
          if (JSON.parse(data).length === 0) {
            let err = { message: 'Wrong account or password entered.Please enter again', code: 400 }
            reject(err)
          } else {
            console.log("here after else")
            let completeData = utils.getCompleteAddress(req)
            completeData.then((req) => {
              console.log("result here", req.body)
              resolve(req.body)
            }).catch(err => {
              console.log("error in imp", err)
            })
          }
      }).catch(err => {
        console.log("reject here ",err)
        reject(err)});
    });
}

const getQueryResultOnCity = (req) => {
  return new Promise((resolve, reject) => {
    let {lat, lng} = JSON.parse(req.query.position)
    const geocodeRes = here.revGeocodeSearch(lat, lng)
    geocodeRes.then(city => {
      resolve(listGroceryStoreOnCity(city))
    })
  });
}

const listGroceryStoreOnCity = (city) => {
  return new Promise((resolve, reject) => {
    let options = {}
    let selector = {}
    selector['city'] = city
    options['selector'] = selector
    cloudant
      .find(grocery_db, JSON.stringify(options))
      .then(data => {
        resolve(data)
      }).catch(err => reject(err));
  });
}

module.exports = {
  creatingShopkeeper,
  initCache,
  currentQueuenumber,
  listGroceryStoreOnCity,
  updateQueueNumberForUsers,
  getQueryResultOnCity,
  loginVerification,
  validatingRegistration
}