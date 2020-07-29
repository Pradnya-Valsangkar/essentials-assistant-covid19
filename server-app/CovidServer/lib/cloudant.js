const Cloudant = require('@cloudant/cloudant');

const cloudant_id = process.env.CLOUDANT_ID || '<cloudant_id>'
const cloudant_apikey = process.env.CLOUDANT_IAM_APIKEY || '<cloudant_apikey>';

// UUID creation
const uuidv4 = require('uuid/v4');

var cloudant = new Cloudant({
    account: cloudant_id,
    plugins: {
        iamauth: {
            iamApiKey: cloudant_apikey
        }
    }
})

// Cloudant DB reference

/**
 * Connects to the Cloudant DB, creating it if does not already exist
 * @return {Promise} - when resolved, contains the db, ready to go
 */
const dbCloudantConnect = (db_name) => {
    return new Promise((resolve, reject) => {
        Cloudant({  // eslint-disable-line
            account: cloudant_id,
            plugins: {
                iamauth: {
                    iamApiKey: cloudant_apikey
                }
            }
        }, ((err, cloudant) => {
            if (err) {
                console.log('Connect failure: ' + err.message + ' for Cloudant ID: ' +
                    cloudant_id);
                reject(err);
            } else {
                cloudant.db.list().then((body) => {
                    if (!body.includes(db_name)) {
                        console.log('DB Does not exist..creating: ' + db_name);
                        cloudant.db.create(db_name).then(() => {
                            if (err) {
                                console.log('DB Create failure: ' + err.message + ' for Cloudant ID: ' +
                                    cloudant_id);
                                reject(err);
                            }
                        })
                    }
                    let db = cloudant.use(db_name);
                    console.log('Connect success! Connected to DB: ' + db_name);
                    resolve(db);
                }).catch((err) => { console.log(err); reject(err); });
            }
        }));
    });
}

/**
 * Find all resources that match the specified partial name.
 * 
 * @param {String} type
 * @param {String} partialName
 * @param {String} userID
 * 
 * @return {Promise} Promise - 
 *  resolve(): all resource objects that contain the partial
 *          name, type or userID provided, or an empty array if nothing
 *          could be located that matches. 
 *  reject(): the err object from the underlying data store
 */
function find(db, options) {
    return new Promise((resolve, reject) => {
        console.log('*******options',options )
        db.find(JSON.parse(options), (err, documents) => {
            if (err) {
                console.log('*****documentserr', err)
                reject(err);
            } else {
                console.log('*****documents', documents)
                resolve({ data: JSON.stringify(documents.docs), statusCode: 200 });
            }
        });
    });
}

/**
 * Delete a resource that matches a ID.
 * 
 * @param {String} id
 * 
 * @return {Promise} Promise - 
 *  resolve(): Status code as to whether to the object was deleted
 *  reject(): the err object from the underlying data store
 */
function deleteById(db, item) {
    return new Promise((resolve, reject) => {
        db.destroy(item._id, item._rev, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(204);
            }
        })
    });
}

/**
 * Create a resource with the specified attributes
 * 
 * @param {String} type - the type of the item
 * @param {String} name - the name of the item
 * @param {String} description - the description of the item
 * @param {String} quantity - the quantity available 
 * @param {String} location - the GPS location of the item
 * @param {String} contact - the contact info 
 * @param {String} userID - the ID of the user 
 * 
 * @return {Promise} - promise that will be resolved (or rejected)
 * when the call to the DB completes
 */
function create(db, createOptions) {
    return new Promise((resolve, reject) => {
        let itemId = uuidv4();
        let item = {
            _id: itemId,
            id: itemId,
            operation: 'CREATE',
            ...createOptions
        }
        updateOrCreateDocument(db, item).then(data => {
            resolve(data);
        }).catch(err => reject(err));
    });
}

function getAllDocs(db) {
    return new Promise((resolve, reject) => {
        db.list((err, document) => {
            if (err) {
                console.log('Error occurred: ' + err.message, 'getAllDocs()');
                reject(err);
            } else {
                console.log('********document', JSON.stringify(document))
                resolve(document)
            }
        });
    });
}
/**
 * Find all resources that match the specified partial name.
 * 
 * @param {String} type
 * @param {String} partialName
 * @param {String} userID
 * 
 * @return {Promise} Promise - 
 *  resolve(): all resource objects that contain the partial
 *          name, type or userID provided, or an empty array if nothing
 *          could be located that matches. 
 *  reject(): the err object from the underlying data store
 */
function getDocumentById(db, id) {
    return new Promise((resolve, reject) => {
        db.get(id, (err, document) => {
            if (err) {
                reject({ statusCode: err.statusCode });
            } else {
                resolve(document)
            }
        })
    });
}

/**
 * Update a resource with the requested new attribute values
 * 
 * @param {String} id - the ID of the item (required)
 * 
 * The following parameters can be null
 * 
 * @param {String} type - the type of the item
 * @param {String} name - the name of the item
 * @param {String} description - the description of the item
 * @param {String} quantity - the quantity available 
 * @param {String} location - the GPS location of the item
 * @param {String} contact - the contact info 
 * @param {String} userID - the ID of the user 
 * 
 * @return {Promise} - promise that will be resolved (or rejected)
 * when the call to the DB completes
 */
function updateOrCreateDocument(db, item) {
    return new Promise((resolve, reject) => {
        const operation = item.operation
        delete item.operation
        console.log('**************item', item)
        db.insert(item, (err, result) => {
            console.log('**************itemresult', result)
            if (err) {
                console.log('Error occurred: ' + err.message, 'create()');
                reject(err);
            } else {
                (operation !== 'CREATE') ? resolve({ data: { updatedRevId: result.rev }, statusCode: 200 }) :
                    resolve({ data: { createdId: result.id, createdRevId: result.rev }, statusCode: 201 })
            }
        });
    });
}

function info() {
    return cloudant.db.get('community_db')
        .then(res => {
            console.log(res);
            return res;
        });
};

module.exports = {
    deleteById: deleteById,
    create: create,
    find: find,
    info: info,
    updateOrCreateDocument: updateOrCreateDocument,
    getDocumentById: getDocumentById,
    dbCloudantConnect: dbCloudantConnect,
    getAllDocs: getAllDocs
};