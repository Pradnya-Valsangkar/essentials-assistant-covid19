// Cloudant DB reference
const cloudant = require('./cloudant.js');
const doctorResource = require('./doctor.js')
const notify = require('./notify.js')
const utils = require('./utils.js')
let userdb_name = "user_db";
let user_db
// Initialize the DB when this module is loaded

(function getDbConnection() {
    console.log('Initializing Cloudant connection...', 'getDbConnection()');
    cloudant.dbCloudantConnect(userdb_name).then((database) => {
        console.log('Cloudant connection initialized.', 'getDbConnection()');
        user_db = database;
    }).catch((err) => {
        console.log('Error while initializing DB: ' + err.message, 'getDbConnection()');
        throw err;
    });
})();

// Creating user
const creatingUser = (req) => {
  return new Promise((resolve, reject) => { 
      const createRequestOptions = {
        deviceUniqueID : req.body.deviceUniqueID,
        name : req.body.name || '',
        phoneNumber :req.body.phoneNumber || '',
        password : req.body.password,
        notify: []
      }
        cloudant
        .create(user_db, createRequestOptions)
        .then(data => {
          resolve(data)
        }).catch(err => reject(err));
    });
}

// Creating user
const validatingRegistration = (req) => {
  return new Promise((resolve, reject) => {
    let options = {}
    let selector ={}
    if (req.body.phoneNumber) {
        selector['phoneNumber'] = req.body.phoneNumber;
    } 
    options['selector'] = selector
        cloudant
        .find(user_db, JSON.stringify(options))
        .then(({data}) => {
          if (JSON.parse(data).length > 0){
            let err = {message: 'Account already exist with the same number.Try to register with other number.', code : 409}
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
    .find(user_db, JSON.stringify(options))
    .then(({data}) => {
      if (JSON.parse(data).length === 0) {
        let err = { message: 'Wrong account or password entered.Please enter again', code: 400 }
        reject(err)
      } else {
        let completeData = utils.getCompleteAddress(req)
        completeData.then((req) => {
          resolve(req.body)
        })
      }
    }).catch(err => reject(err));
  });
}

const handleUserNotify = (req) => {
  return new Promise((resolve, reject) => {
      let selector = {}
      let options = {}
      if (req.body.userPhoneNumber) {
        selector['phoneNumber'] = req.body.userPhoneNumber;
      }
      options['selector'] = selector
      cloudant
      .find(user_db, JSON.stringify(options))
      .then(( userData )=> {
        console.log("userData", userData.data)
        doctorResource.handleDoctorNotify(req, userData.data).then(data =>{
          console.log("Doctor db updated with userdb", userData.data)
          let item = utils.updateDoctorOrUserDatabase('user', JSON.parse(userData.data))
          if(req.query.requestType !== 'Accept' && req.query.requestType !== 'Reject') {
            console.log("calling notify func user")
            item = notify.addNotify(item, req.body, undefined, "pending")
          } else {
            item = notify.removeNotifyAndUpdateSchedules(item, req)
          }
          console.log("item to get",item)
            cloudant
              .updateOrCreateDocument(user_db, item)
              .then(userData => {
                console.log("update or create user data", userData)
                resolve(true)
              }).catch(err => reject(err));
      }).catch(err => reject(err));
  }).catch(err => res.send(handleError(res, err)));
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
    .find(user_db, JSON.stringify(options))
    .then(({ data }) => {
      resolve (JSON.parse(data))
    }).catch(err => reject(err));
  });
}

const getUserName = (req) => {
  return new Promise((resolve, reject) => {
      let selector = {}
      let options = {}
      if (req.body.phoneNumber) {
        selector['phoneNumber'] = req.body.phoneNumber;
      }
      options['selector'] = selector
      cloudant
      .find(user_db, JSON.stringify(options))
      .then(( {data} )=> {
        console.log("User Data", data)
        data = JSON.parse(data)
        resolve(data[0].name)
  }).catch(err => reject(err));
  })
}

module.exports = {
    creatingUser,
    validatingRegistration,
    loginVerification,
    handleUserNotify,
    listNotify,
    getUserName
}