let MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017'
const dbName = 'Plates'
let db

//Connect to the database
function connectToDB() {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, (err, client) => {
        if (err) return console.log(err)

        // Storing a reference to the database so you can use it later
        db = client.db(dbName)
        console.log(`Connected MongoDB: ${url}`)
        console.log(`Database: ${dbName}`)
    })
}

//Add a plate to the database
function addtoDB(platetoStore) {

    const collection = db.collection('plates');
    collection.insertOne({
        plate: platetoStore.plate,
        time1: platetoStore.time1,
        time2: platetoStore.time2,
        timeDifference: platetoStore.timeDifference,
        speed: platetoStore.speed
    }, function(err, result) {
        if (err) console.log(err)
        console.log("Inserted plate into the collection");
    });
}
module.exports = {
    addtoDB: addtoDB,
    connectToDB: connectToDB
}