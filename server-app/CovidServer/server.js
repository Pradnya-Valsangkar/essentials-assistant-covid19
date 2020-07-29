require('dotenv').config({silent: true})
const express = require('express');
const bodyParser = require('body-parser');
const utils = require('./lib/utils')
const covidindia = require('./lib/covidindia')
const executionTime = require('execution-time')()
const donorConsumerResources = require('./lib/donorconsumer.js');
const userResources = require('./lib/user.js');
const doctorResources = require('./lib/doctor.js');
const appointResources = require('./lib/appointment.js');
const groceryStore = require("./lib/grocerystore")
const assistant = require('./lib/assistant.js');
const cloudant = require('./lib/cloudant.js');
const queueData = require('./lib/queueData');
const grocerystore = require('./lib/grocerystore');


const port = process.env.PORT || 3000
covidindia.initCache()
groceryStore.initCache()

const app = express();
app.use(bodyParser.json());

const testConnections = () => {
  const status = {}
  return assistant.session()
    .then(sessionid => {
      status['assistant'] = 'ok';
      return status
    })
    .catch(err => {
      console.error(err);
      status['assistant'] = 'failed';
      return status
    })
    .then(status => {
      return cloudant.info();
    })
    .then(info => {
      status['cloudant'] = 'ok';
      return status
    })
    .catch(err => {
      console.error(err);
      status['cloudant'] = 'failed';
      return status
    });
};

const handleError = (res, err) => {
  console.log("handle error ", err)
  const status = err.code !== undefined && err.code > 0 ? err.code : 500;
  let returnData = res.status(status).json(err.message)
  return returnData;
};

app.get('/', (req, res) => {
  testConnections().then(status => res.json({ status: status }));
});

/**
 * Get a session ID
 *
 * Returns a session ID that can be used in subsequent message API calls.
 */
app.get('/api/session', (req, res) => {
  const asstType = req.query.asstType
  console.log("asssType", asstType)
  assistant
    .session()
    .then(sessionid => res.send(sessionid))
    .catch(err => handleError(res, err));
});

/**
 * Post process the response from Watson Assistant
 *
 * We want to see if this was a request for resources/supplies, and if so
 * look up in the Cloudant DB whether any of the requested resources are
 * available. If so, we insert a list of the resouces found into the response
 * that will sent back to the client.
 * 
 * We also modify the text response to match the above.
 */
function post_process_assistant(result) {
  let resource
  // First we look to see if a) Watson did identify an intent (as opposed to not
  // understanding it at all), and if it did, then b) see if it matched a supplies entity
  // with reasonable confidence. "supplies" is the term our trained Watson skill uses
  // to identify the target of a question about resources, i.e.:
  //
  // "Where can i find face-masks?"
  //
  // ....should return with an enitity == "supplies" and entitty.value = "face-masks"
  //
  // That's our trigger to do a lookup - using the entitty.value as the name of resource
  // to to a datbase lookup.
  if (result.intents.length > 0 ) {
    result.entities.forEach(item => {
      if ((item.entity == "supplies") &&  (item.confidence > 0.3)) {
        resource = item.value
      }
    })
  }
  if (!resource) {
    return Promise.resolve(result)
  } else {
    // OK, we have a resource...let's look this up in the DB and see if anyone has any.
    return cloudant
      .find('', resource, '')
      .then(data => {
        let processed_result = result
        if ((data.statusCode == 200) && (data.data != "[]")) {
          processed_result["resources"] = JSON.parse(data.data)
          processed_result["generic"][0]["text"] = 'There is' + '\xa0' + resource + " available"
        } else {
          processed_result["generic"][0]["text"] = "Sorry, no" + '\xa0' + resource + " available"           
        }
        return processed_result
      })
  }
}

/**
 * Post a messge to Watson Assistant
 *
 * The body must contain:
 * 
 * - Message text
 * - sessionID (previsoulsy obtained by called /api/session)
 */
app.post('/api/message', (req, res) => {
  const text = req.body.text || '';
  const sessionid = req.body.sessionid;
  console.log(req.body)
  assistant
    .message(text, sessionid)
    .then(result => {
      return post_process_assistant(result)
    })
    .then(new_result => {
      res.json(new_result)
    })
    .catch(err => handleError(res, err));
});

/**
 * Get a list of resources nearby provided location
 *
 * The query string may contain the following qualifiers:
 * 
 * - type
 * - position
 * - userID
 *
 * A list of resource objects will be returned (which can be an empty list)
 */
app.get('/covid/resources', (req, res) => {
  const searchType = req.query.type
  let searchPosition = req.query.position //(lat long)
  console.log(searchPosition)
  searchPosition = JSON.parse(searchPosition)
  executionTime.start()
  const xyz = utils.getQueryData(searchPosition.lat, searchPosition.lng, searchType )
  xyz.then((result) => {
    console.log("returned data", result)
    const stopTime = executionTime.stop()
    console.log("Execution time " , stopTime)
    res.send(result)})
});


/**
 * Get a list of resources (donor consumer)
 *
 * The query string may contain the following qualifiers:
 * 
 * - type
 * - name
 * - userID
 *
 * A list of resource objects will be returned (which can be an empty list)
 */
app.get('/api/resource', (req, res) => {
  donorConsumerResources.gettingResource(req).then(data =>{
      res.send(data.data)      
  }).catch(err => res.send(handleError(res, err)));
});

/**
 * Create a new resource (donor consumer)
 *
 * The body must contain:
 * 
 * - type
 * - name
 * - contact
 * - userID
 *
 * The body may also contain:
 * 
 * - description
 * - quantity (which will default to 1 if not included)
 * 
 * The ID and rev of the resource will be returned if successful
 */
let types = ["Food", "Other", "Help"]
app.post('/api/resource', (req, res) => {
  console.log('**********req', JSON.stringify(req.body))
  donorConsumerResources.creatingResource(req).then(data =>{
      res.send(data)      
  }).catch(err => res.send(handleError(res, err)));
});

/**
 * Update new resource (donor consumer)
 *
 * The body may contain any of the valid attributes, with their new values. Attributes
 * not included will be left unmodified.
 * 
 * The new rev of the resource will be returned if successful
 */
app.patch('/api/resource/:id', (req, res) => {
  console.log('********req', req.params)
  donorConsumerResources.updatingConsumerResource(req).then(data =>{
      res.send(data.data)      
  }).catch(err => res.send(handleError(res, err)));
});

/**
 * Delete a resource (donor consumer)
 */
app.delete('/api/resource/:id', (req, res) => {
  console.log('*********deletereq', req.params)
  donorConsumerResources.deletingConsumerResource(req).then(statusCode =>{
    res.send(statusCode)      
}).catch(err => res.send(handleError(res, err)));
});

/**
 * Get a list of grocery store from DB
 *
 * The query string may contain the following qualifiers:
 * 
 * - position {lat, lng}
 * 
 * A list of resource objects will be returned (which can be an empty list)
 */
app.get('/api/groceryList', (req, res) => {
  console.log('*********request query', req.query)
  groceryStore.getQueryResultOnCity(req).then(data =>{
      console.log("ewer",data.data)
      res.send(data)      
  }).catch(err => res.send(handleError(res, err)));
});

/**
 * Get a list of Customer for provided grocery store from DB
 *
 * The query string may contain the following qualifiers:
 * 
 * - storePhonenumber 
 * 
 * A list of customer objects will be returned (which can be an empty list)
 */
app.get('/api/customerList', (req, res) => {
  console.log('*********request query', req.query)
  queueData.getCustomerList(req).then(data =>{
      console.log("ewer",data)
      res.send(data)      
  }).catch(err => res.send(handleError(res, err)));
});

/**
 * Get the current queue number of the store
 *
 * The body must contain:
 * 
 * - phoneNumber
 * 
 * The current queue number of the store will be returned 
 * (Data is cached hence may get delay in updation) 
 */
app.post('/api/getCurrentQueueNumber', (req, res) => {
  groceryStore.currentQueuenumber(req).then(queuenumber =>{
    console.log('*********da currentQueuenumber',queuenumber, Date.now())
      res.send({queuenumber})      
  }).catch(err => res.send(handleError(res, err)));      
 })

/**
 *  Register a new token number on queue button click
 *
 * The body must contain:
 * 
 * - phoneNumber
 * - customerPhoneNumber
 * - customerName
 * - storePhonenumber
 * - storeName
 * 
 * The token number of the store will be returned 
 * (Data is cached hence may get delay in updation) 
 */
app.post('/api/queueButtonClicked', (req, res) => {
  userResources.getUserName(req).then(name => {
    req.body.customerName = name
    queueData.creatingQueueData(req).then(data =>{
      res.send(data)      
  }).catch(err => res.send(handleError(res, err)));      
 })
  })
  

 //update current token number on done status
app.post('/api/whenArrivedStatusClicked', (req, res) => {
  groceryStore.updateQueueNumberForUsers(req).then(data =>{
      res.send(data)      
  }).catch(err => res.send(handleError(res, err)));      
 })

//UI side slots, not in use of this api
app.get('/api/getSlots', (req, res) => {
  appointResources.getSlots(req).then(data =>{
      res.send(data)      
  }).catch(err => res.send(handleError(res, err)));
});

//get list of doctors based on city 
app.get('/api/doctorList', (req, res) => {
  console.log('*********requesty', req.query)
  console.log('*********requesty', req.params)
  doctorResources.listingDoctorOnCity(req).then(data =>{
      console.log("ewer",data.data)
      res.send(data)      
  }).catch(err => res.send(handleError(res, err)));
});

//Registration Users/Doctors/GrceryStore validation based on phone number
app.post('/api/registration', (req, res) => {
  const type = (req.query.type).toString().toLowerCase().trim()
  switch(type) {
    case 'doctor':
      doctorResources.validatingRegistration(req).then(data =>{   
        let docEntry = doctorResources.creatingDoctor(req)
        docEntry.then(data =>{
          userResources.validatingRegistration(req).then(data =>{
            let userEntry = userResources.creatingUser(req)
            userEntry.then(data => {
              res.send(data.data) 
            }).catch(err => res.send(err));  
          }).catch(err => {console.log("already registered as USer",req.body.phoneNumber)                
              res.send(data.data)}); 
        }).catch(err => res.send(err)); 
      }).catch(({message, code})=> res.status(code).send({message}));
      break;
    case 'service provider':
      groceryStore.validatingRegistration(req).then(data =>{
        let storeEntry = groceryStore.creatingShopkeeper(req)
        storeEntry.then(data =>{
          userResources.validatingRegistration(req).then(data =>{
            let userEntry = userResources.creatingUser(req)
            userEntry.then(data => {
              res.send(data.data) 
            }).catch(err => res.send(err));  
          }).catch(err => {console.log("already registered as USer",req.body.phoneNumber)
          res.send(data.data)}); 
        }).catch(err => res.send(err)); 
      }).catch(({message, code})=> res.status(code).send({message}));
      break;
    default:
      userResources.validatingRegistration(req).then(data =>{
        userResources.creatingUser(req).then(data =>{
          console.log("data from user registration", data)
          res.send(data.data)      
      }).catch(err => res.send(handleError(res, err)));     
    }).catch(({message, code})=> res.status(code).send({message}));
  }
});

/**
 *  user login
 *
 * The query string may contain the following qualifie  rs:
 * 
 * - type
 * - name
 * - userID
 *
 * A list of resource objects will be returned (which can be an empty list)
 */
app.post('/api/login', (req, res) => {
  const type = (req.query.type).toString().toLowerCase().trim()
  switch(type) {
    case 'doctor':
      doctorResources.loginVerification(req).then(data =>{ 
        console.log(":login details doctor res ", data)
        res.send(data);
      }).catch(({message, code})=> res.status(code).send({message}));
      break;
    case 'service provider':
      grocerystore.loginVerification(req).then(data =>{ 
        console.log(":login details Grocery Store Owner", data)
        res.send(data);
      }).catch(({message, code})=> res.status(code).send({message}));
      break;
    default:
      userResources.loginVerification(req).then(data =>{ 
        console.log(":login details User", data)
        res.send(data);
      }).catch(({message, code})=> res.status(code).send({message}));
  }
});

//on bookappointment click 
app.post('/api/modifyNotify', (req, res) => {
  console.log('**********req', JSON.stringify(req.body))
  userResources.handleUserNotify(req).then(data =>{
    console.log("Return data modifynotify", data)
    res.send(data)      
}).catch(err => res.send(handleError(res, err)));
});

//user notfy list return
app.get('/api/listUserNotify', (req, res) => {
  console.log('listUSerNotify**********req', req.query)
  userResources.listNotify(req).then(data =>{
    console.log("returning usernotify data", data[0].notify)
    res.send(data[0].notify)      
}).catch(err => res.send(handleError(res, err)));
});

//doctor notify list return 
app.get('/api/listDoctorNotify', (req, res) => {
  console.log('**********req', req.query)
  doctorResources.listNotify(req).then(data =>{
    console.log("returning doctornotify data", data[0].notify)
    res.send(data[0].notify)      
}).catch(err => res.send(handleError(res, err)));
});

//get list of appointments (scheduled/ previous)
app.get('/api/appointments/:id', (req, res) => {
  console.log('getListofAppointments**********requser', JSON.stringify(req.params))
  appointResources.listingAppointment(req).then(data =>{
     console.log("returning appointment list data", data.data)
      res.send(JSON.parse(data.data))      
  }).catch(err => res.send(handleError(res, err)));
});

/**
 * Doctor calls accept/reject buton click
 */
app.post('/api/acceptRejectNotify', (req, res) => {
  doctorResources.getDocterName(req).then(name => {
    console.log("doctorname" ,name)
    req.body.doctorName = name
    console.log("acceptRejectNotify*******req", req.body)
    console.log("request query type", req.query)
    if (req.query.requestType === 'Accept') {

      appointResources.creatingAppointment(req).then(data =>{
        doctorResources.handleDoctorNotify(req, undefined).then(data =>{
          req.query.type = 'user'
          userResources.handleUserNotify(req).then(data =>{
            res.send(data)      
          }).catch(err => res.send(handleError(res, err)));      
        }).catch(err => res.send(handleError(res, err)));
      }).catch(err => res.send(handleError(res, err)));
    } else {
      doctorResources.handleDoctorNotify(req, undefined).then(data =>{
        req.query.type = 'user'
        userResources.handleUserNotify(req).then(data =>{
          //res.send('Doctor has rejected your appointment')   
          if (req.body.isCan)   
          res.send(data)
        }).catch(err => res.send(handleError(res, err)));      
      }).catch(err => res.send(handleError(res, err)));
    }
  }).catch(err => res.send(handleError(res, err)));;
});

//not in use
app.post('/api/user', (req, res) => {
  console.log('**********requser', JSON.stringify(req.body))
  userResources.creatingUser(req).then(data =>{
      res.send(data.data)      
  }).catch(err => res.send(handleError(res, err)));
});

/**
 * Create a new resource
 *
 * The body must contain:
 * 
 * - name
 * - contact
 * - deviceUniqueID
 * - phoneNumber
 * - specialisation
 * - password
 * - locationCity
 * - notify
 * The body may also contain:
 * 
 * 
 * The ID and rev of the resource will be returned if successful
 */
//not in use
app.post('/api/doctor', (req, res) => {
  console.log('**********requser', JSON.stringify(req.body))
  doctorResources.creatingDoctor(req).then(data =>{
      res.send(data.data)      
  }).catch(err => res.send(handleError(res, err)));
});


const server = app.listen(port,  () => {
   const host = server.address().address;
   const port = server.address().port;
   console.log(`SolutionStarterKitCooperationServer listening at http://${host}:${port}`);
});
