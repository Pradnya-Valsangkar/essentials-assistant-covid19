// Cloudant DB reference
const cloudant = require('./cloudant.js');
const here = require('./here.js')
const notify = require('./notify.js')
const utils = require('./utils.js')
const _ = require('underscore');
const user = require('./user.js');

let doctordb_name = "doctor_db";
let doctor_db = '';

// Initialize the DB when this module is loaded
(function getDbConnection() {
  console.log('Initializing Cloudant connection...', 'getDbConnection()');
  cloudant.dbCloudantConnect(doctordb_name).then((database) => {
    console.log('Cloudant connection initialized.', 'getDbConnection()');
    doctor_db = database;
  }).catch((err) => {
    console.log('Error while initializing DB: ' + err.message, 'getDbConnection()');
    throw err;
  });
})();

// Creating doctor
const creatingDoctor = (req) => {
  return new Promise((resolve, reject) => {
  
    const createRequestOptions = {
      deviceUniqueID: req.body.deviceUniqueID,
      name: req.body.name || '',
      phoneNumber: req.body.phoneNumber,
      specialization: req.body.specialization || '',
      password: req.body.password,
      clinicStartTime: req.body.clinicStartTime,
      clinicEndTime: req.body.clinicEndTime ,
      consultationFees : req.body.consultationFees,
      scheduleToday: req.body.scheduleToday || [],
      scheduleTomorrow: req.body.scheduleTomorrow || [],
      scheduleDATomorrow: req.body.scheduleDATomorrow || [],
      city : req.body.city || '',
      notify: req.body.notify || []
    }
    cloudant
      .create(doctor_db, createRequestOptions)
      .then(data => {
        resolve(data)
      }).catch(err => reject(err));
  });
}

const listingDoctorOnCity = (req) => {
  return new Promise((resolve, reject) => {
    let options = {}
    let selector = {}
    let {lat, lng} = JSON.parse(req.query.position)
    const geocodeRes = here.revGeocodeSearch(lat, lng)
    geocodeRes.then(city => {
      selector['city'] = city
      options['selector'] = selector
    cloudant
      .find(doctor_db, JSON.stringify(options))
      .then(data => {
        resolve(data)
      }).catch(err => reject(err));
    });
  })
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
      .find(doctor_db, JSON.stringify(options))
      .then(({ data }) => {
        if (JSON.parse(data).length > 0) {
          let err = { message: 'Account already exist with the same number.Try to register with other numbers.', code: 409 }
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
      let err = { message: 'Wrong username or password entered.Please enter again', code: 400 }
      reject(err)
    }
    options['selector'] = selector
    cloudant
      .find(doctor_db, JSON.stringify(options))
      .then(({ data }) => {
        if (JSON.parse(data).length === 0) {
          let err = { message: 'Wrong username or password entered.Please enter again', code: 400 }
          reject(err)
        } else {
          let completeData = utils.getCompleteAddress(req)
          completeData.then((req) => {
            console.log("res")
            resolve(req.body)
          })
        }
      }).catch(err => reject(err));
  });
}

const handleDoctorNotify = (req, userData) => {
  return new Promise((resolve, reject) => {
    let selector = {}
    let options = {}
    if (req.body.doctorPhoneNumber) {
      selector['phoneNumber'] = req.body.doctorPhoneNumber;
    }
    options['selector'] = selector
    cloudant
    .find(doctor_db, JSON.stringify(options))
    .then(({ data }) => {
      let item
      item = utils.updateDoctorOrUserDatabase('doctor', JSON.parse(data))
      if(req.query.requestType !== 'Accept' && req.query.requestType !== 'Reject') {
        item = notify.addNotify(item, req.body, userData, "request")
      } else {
        item = notify.removeNotifyAndUpdateSchedules(item, req)
      }
      cloudant
            .updateOrCreateDocument(doctor_db, item)
            .then(data => {
              console.log("update or create result", data)
              resolve(data)
            }).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}

const getDocterName = (req) => {
  return new Promise((resolve, reject) => {
      let selector = {}
      let options = {}
      if (req.body.doctorPhoneNumber) {
        selector['phoneNumber'] = req.body.doctorPhoneNumber;
      }
      options['selector'] = selector
      cloudant
      .find(doctor_db, JSON.stringify(options))
      .then(( {data} )=> {
        console.log("doctor Data", data)
        data = JSON.parse(data)
        resolve(data[0].name)
  }).catch(err => reject(err));
  })
}

const listNotify = (req) => {
  return new Promise((resolve, reject) => {
    let selector = {}
    let options = {}
    if (req.query.phoneNumber) {
      selector['phoneNumber'] = req.query.phoneNumber;
    }
    options['selector'] = selector
    options['fields'] = ["notify"]
    cloudant
    .find(doctor_db, JSON.stringify(options))
    .then(({ data }) => {
      resolve (JSON.parse(data))
    }).catch(err => reject(err));
  });
}

module.exports = {
  creatingDoctor,
  listingDoctorOnCity,
  validatingRegistration,
  loginVerification,
  handleDoctorNotify,
  listNotify,
  getDocterName
}