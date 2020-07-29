// Cloudant DB reference
const cloudant = require('./cloudant.js');
let donorConsumer_dbname = "community_db";
let donoConsumer_db

// Initialize the DB when this module is loaded
(function getDbConnection() {
  console.log('Initializing Cloudant connection...', 'getDbConnection()');
  cloudant.dbCloudantConnect(donorConsumer_dbname).then((database) => {
    console.log('Cloudant connection initialized.', 'getDbConnection()');
    donoConsumer_db = database;
  }).catch((err) => {
    console.log('Error while initializing DB: ' + err.message, 'getDbConnection()');
    throw err;
  });
})();

const creatingResource = (req) => {
  let types = ["Food", "Other", "Help"]
  return new Promise((resolve, reject) => {
    if (!req.body.type) {
      reject({ errors: "Type of item must be provided", code: 422 })
    }
    if (!types.includes(req.body.type)) {
      reject({ errors: "Type of item must be one of " + types.toString(), code: 422 });
    }
    if (!req.body.name) {
      reject({ errors: "Name of item must be provided", code: 422 });
    }
    if (!req.body.contact) {
      reject({ errors: "A method of conact must be provided", code: 422 });
    }
    const createRequestOptions = {
      type: req.body.type,
      name: req.body.name,
      description: req.body.description || '',
      userID: req.body.userID || '',
      quantity: req.body.quantity || 1,
      location: req.body.location || '',
      contact: req.body.contact
    }
    cloudant
      .create(donoConsumer_db, createRequestOptions)
      .then(data => {
        console.log('***********data45',data)
        resolve(data)
      }).catch(err => reject(err));
  });
}

const updatingConsumerResource = (req) => {
  return new Promise((resolve, reject) => {
    cloudant.getDocumentById(donoConsumer_db, req.params.id).then(document => {
      let item = {
        _id: document._id,
        _rev: document._rev, 
        operation : 'UPDATE'
      }
      if (req.body.type) { item["type"] = req.body.type } else { item["type"] = document.type };
      if (req.body.name) { item["name"] = req.body.name } else { item["name"] = document.name };
      if (req.body.description) { item["description"] = req.body.description } else { item["description"] = document.description };
      if (req.body.quantity) { item["quantity"] = req.body.quantity } else { item["quantity"] = document.quantity };
      if (req.body.location) { item["location"] = req.body.location } else { item["location"] = document.location };
      if (req.body.contact) { item["contact"] = req.body.contact } else { item["contact"] = document.contact };
      if (req.body.userID) { item["userID"] = req.body.userID } else { item["userID"] = document.userID };
      // Calling update database operations
      cloudant
        .updateOrCreateDocument(donoConsumer_db, item)
        .then(data => {
          console.log('**************69', data)
          resolve(data)
        }).catch(err => reject(err));
    }).catch(err => reject(err));
  })
}
const gettingResource = (req) => {
  return new Promise((resolve, reject) => {
    let options = {}
    let selector = {}
    if (req.query.type) {
        selector['type'] = req.query.type;
    }
    if (req.query.name) {
        let search = `(?i).*${req.query.name}.*`;
        selector['name'] = { '$regex': search };
  
    }
    if (req.query.userID) {
        selector['userID'] = req.query.userID;
    }
    options['selector'] = selector
      cloudant
        .find(donoConsumer_db, JSON.stringify(options))
        .then(data => {
          resolve(data)
        }).catch(err => reject(err));
    });
}
const deletingConsumerResource = (req) => {
  return new Promise((resolve, reject) => {
    cloudant.getDocumentById(donoConsumer_db, req.params.id).then(document => {
      let item = {
        _id: document._id,
        _rev: document._rev,          
      }
      console.log('*********document', document)
      // Calling delete database operations
      cloudant
      .deleteById(donoConsumer_db, item)
      .then(statusCode => resolve(statusCode))
      .catch(err => reject(err));
  }).catch(err => reject(err));
})
}

module.exports = {
  creatingResource: creatingResource,
  gettingResource: gettingResource,
  updatingConsumerResource: updatingConsumerResource,
  deletingConsumerResource: deletingConsumerResource
}