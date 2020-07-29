// Cloudant DB reference
const cloudant = require('./cloudant.js');
const grocerystore = require('./grocerystore.js');

let queuedb_name = "queue_db";
let queue_db = '';

// Initialize the DB when this module is loaded
(function getDbConnection() {
  console.log('Initializing Cloudant connection...', 'getDbConnection()');
  cloudant.dbCloudantConnect(queuedb_name).then((database) => {
    console.log('Cloudant connection initialized.', 'getDbConnection()');
    queue_db = database;
  }).catch((err) => {
    console.log('Error while initializing DB: ' + err.message, 'getDbConnection()');
    throw err;
  });
})();

// Creating doctor
const creatingQueueData = (req) => {
  return new Promise((resolve, reject) => {
  const createOptions = {
        storeName : req.body.storeName,
        phoneNumber : req.body.storePhonenumber,
        tokenLength:1
    }
  let consumerDetails = {
        customerName : req.body.customerName,
        customerPhoneNumber : req.body.customerPhoneNumber,
        tokenLength :1
    }
    let selector = {}
    let options = {}
    if (req.body.storePhonenumber) {
      selector['phoneNumber'] = req.body.storePhonenumber;
    }
    req.body.phoneNumber = req.body.storePhonenumber
    options['selector'] = selector
    cloudant
    .find(queue_db, JSON.stringify(options))
    .then(({ data }) => {
      console.log('*******data', JSON.parse(data).length)
      if(JSON.parse(data).length === 0){
        console.log('*******inside if')
        createOptions.consumerList = []
        createOptions.consumerList.push(consumerDetails)
        cloudant
        .create(queue_db, createOptions)
        .then(data => {
          let updateGroceryDB = grocerystore.currentQueuenumber(req)
          updateGroceryDB.then(currentQueuenumber => {
            resolve({tokenLength : 1, currentQueuenumber})
          })
        }).catch(err => reject(err));
      } else {
        let docItems = JSON.parse(data)[0]
        console.log('********docitems',docItems)
        let item = {
          _id: docItems['_id'],
          _rev: docItems['_rev'], 
          storeName : docItems['storeName'],
          phoneNumber : docItems['phoneNumber'],
          consumerList : docItems['consumerList'],
          tokenLength : docItems['tokenLength'],
          operation : 'UPDATE'
        }
        let tokenLength =item.tokenLength
        consumerDetails.tokenLength = tokenLength+1
        item.consumerList.push(consumerDetails)
        item.tokenLength = tokenLength+1
        cloudant
        .updateOrCreateDocument(queue_db, item)
        .then(({data}) => {
        let updateGroceryDB = grocerystore.currentQueuenumber(req)
        updateGroceryDB.then(currentQueuenumber => {
          console.log("grocery data", currentQueuenumber, tokenLength)
          resolve({'tokenLength' : tokenLength+1, currentQueuenumber})
        })
      }).catch(err => reject(err));
        
     }
    }).catch(err => reject(err));
  })
}

const updateConsumerList = (consumerList, queueNumber) => {
    let updatedList = consumerList.filter((item) => item.tokenLength > queueNumber)
    return updatedList
}

const getCustomerList = (req) => {
  return new Promise((resolve, reject) => {
  
    let selector = {}
    let options = {}
    if (req.query.storePhonenumber) {
      selector['phoneNumber'] = req.query.storePhonenumber;
    }
    req.body.phoneNumber = req.query.storePhonenumber
    options['selector'] = selector
    cloudant
    .find(queue_db, JSON.stringify(options))
    .then(({ data }) => {
      console.log('*******data', JSON.parse(data).length)
      if(JSON.parse(data).length === 0){
        console.log('*******inside if')
        createOptions.consumerList = []
        resolve(createOptions.consumerList)
     } else{
        let docItems = JSON.parse(data)[0]
        let consumerList = docItems['consumerList']
        console.log("get request details for Current queue",req.body)
        let updateGroceryDB = grocerystore.currentQueuenumber(req)
        updateGroceryDB.then(currentQueuenumber => {
          resolve(updateConsumerList(consumerList, currentQueuenumber))
        })
     }
    }).catch(err => reject(err));
})
}

module.exports = {
    creatingQueueData,
    getCustomerList
}