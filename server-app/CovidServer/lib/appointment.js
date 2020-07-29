// Cloudant DB reference
const cloudant = require('./cloudant.js');
const _ = require('underscore')
const notify = require('./notify.js')
let appointmentdb_name = "appointment_db";
let appointment_db

// Initialize the DB when this module is loaded
(function getDbConnection() {
    console.log('Initializing Cloudant connection...', 'getDbConnection()');
    cloudant.dbCloudantConnect(appointmentdb_name).then((database) => {
        console.log('Cloudant connection initialized.', 'getDbConnection()');
        appointment_db = database;
    }).catch((err) => {
        console.log('Error while initializing DB: ' + err.message, 'getDbConnection()');
        throw err;
    });
})();

// Creating user
const creatingAppointment = (req) => {
  return new Promise((resolve, reject) => { 
  req = notify.convertedDateTimeStamp(req)
  const createRequestOptions = {
    userName: req.body.userName,
    userPhoneNumber: req.body.userPhoneNumber,
    doctorPhoneNumber: req.body.doctorPhoneNumber,
    doctorName: req.body.doctorName,
    appointmentDateTime : req.body.numericDateTimetamp,
    dateTimeWhenBooked : new Date()
  }
  console.log("createRequest options appointment", createRequestOptions)
        cloudant
        .create(appointment_db, createRequestOptions)
        .then(data => {
          resolve(data)
        }).catch(err => reject(err));
    });
}

const listingAppointment = (req) => {
    return new Promise((resolve, reject) => {
    const type = req.query.type
    console.log('******type', req.query.type)
    console.log('******type', req.params)
    let currentDateTimestamp = new Date()
    currentDateTimestamp = currentDateTimestamp.getTime()
    let options ={}
    const appointmentDateTime = (req.query.getAppointment === 'Upcoming')? {"$gt": currentDateTimestamp} :  {"$lt": currentDateTimestamp}
    const getPhoneNumber = {"$eq": `${req.params.id}`}
    if (type === 'Doctor'){
      const doctorPhoneNumber = getPhoneNumber
      selector = {
        appointmentDateTime,
        doctorPhoneNumber
      } 
    } else {
      const userPhoneNumber = getPhoneNumber
      selector = {
        appointmentDateTime,
        userPhoneNumber
      } 
    }
 
    options['selector'] = selector
      cloudant
        .find(appointment_db, JSON.stringify(options))
        .then(data => {
          resolve(data)
        }).catch(err => reject(err));
    });
  }

const getSlots = (req) => {
    return new Promise((resolve, reject) => {
    let selector = {}
    let options = {}
    if (req.query.userPhoneNumber) {
      selector['userPhoneNumber'] = req.query.userPhoneNumber;
    }
    if (req.query.doctorPhoneNumber) {
      selector['doctorPhoneNumber'] = req.query.doctorPhoneNumber;
    }
    options['selector'] = selector
      cloudant
        .find(appointment_db, JSON.stringify(options))
        .then(data => {
          var item
          _.each(JSON.parse(data), function(docItems){ 
            item = {
              _id: docItems['_id'],
              _rev: docItems['_rev'], 
              doctorPhoneNumber : docItems['doctorPhoneNumber'],
              dateTimeWhenBooked :docItems[dateTimeWhenBooked],
              name: docItems['name'],
              userPhoneNumber : docItems['userPhoneNumber'],
              operation : 'UPDATE'
            }
            let availableSlots = docItems[availableSlots]
            let slotsBooked = docItems[slotsBooked]
            console.log('************appointment data80', JSON.parse(data))
            console.log('************appointment availableslots80', docItems[availableSlots])
            if(availableSlots.length && slotsBooked.length){
            _.each(slotsBooked, (item) => {
              availableSlots.remove(item)
            })
            console.log('************availableslots80', availableSlots)
            item["availableSlots"] = docItems['availableSlots']
            item["slotsBooked"] = docItems['slotsBooked']
            resolve(availableSlots)
          }
           });
          resolve(data)
        }).catch(err => reject(err));
    });
}

module.exports = {
    creatingAppointment,
    listingAppointment,
    getSlots
}