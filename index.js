let PythonShell = require("python-shell");
let OCR = require("./OCR.js");
let MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017'
let dir = process.cwd();
const dbName = 'Plates'
let db
let distance = 100 //in metres
let unmatchedPlates = {
  camera1: {},
  camera2: {}
};
let options = {
    args: [dir],
    pythonOptions: ["-u"],
    mode: "text"
};

connectToDB()

PythonShell.PythonShell.run("finalPrototype.py", options, function(err) {
    if (err) throw err;
}).on("message", async function(message) {
    try {
        result = JSON.parse(message);
        camera = result.camera;
        time = result.time;
        await OCR.readChars(result.source).then(plate => {
            storePlate(plate, camera, time);
        });
        //plate = result.source
    } catch (e) {
        //console.log(e);
        console.log("Python message: " + message);
    }
});

function storePlate(plate, camera, time) {
    if (PlateExists(plate)) {


        let cam = getPlateCamera(plate) //gets camera where 1st capture of plate is stored in 
        //console.log(cam)

        if (!(cam == camera)) {
            let plateToMove = unmatchedPlates["camera" + cam][plate]
            plateToMove.time2 = time;
            plateToMove.timeDifference = Date.parse(plateToMove.time2) - Date.parse(plateToMove.time1)
            plateToMove.speed = calcSpeed(plateToMove.timeDifference)
            addtoDB(plateToMove)
            delete unmatchedPlates["camera" + cam][plate]
            
        } else { //remove this else for release
            console.log("Plate already exists in camera" + camera)
        }

    } else {
        console.log("no Plate");

        if (camera == 1) {
            unmatchedPlates.camera1[plate] = {
                plate: plate,
                camera: camera,
                time1: time
            };
            console.log(unmatchedPlates);
        } else {
            unmatchedPlates.camera2[plate] = {
                plate: plate,
                camera: camera,
                time1: time
            };
            console.log(unmatchedPlates);
        }
    }
}

function PlateExists(plate) {
    if (
        unmatchedPlates.camera1.hasOwnProperty(plate) ||
        unmatchedPlates.camera2.hasOwnProperty(plate)
    ) {
        return true;
    }
    return false;
}

function getPlateCamera(plate) {
    if (unmatchedPlates.camera1.hasOwnProperty(plate)) return 1
    return 2
}

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

function calcSpeed(time) {
    return (distance / time) * 2236.94 //converts to mph
}

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