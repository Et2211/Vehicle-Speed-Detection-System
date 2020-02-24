let PythonShell = require("python-shell");
let chokidar = require("chokidar");
let OCR = require("./OCR.js");
let Tesseract = require("tesseract.js");
let MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017'
let unmatchedPlates = {
  camera1: {},
  camera2: {}
};
let dir = process.cwd();
let id = 0
const dbName = 'Plates'
let db
let distance = 100 //in metres
let options = {
  args: [dir],
  pythonOptions: ["-u"],
  mode: "text"
};

connectToDB()

PythonShell.PythonShell.run("finalPrototype.py", options, function (err) {
  if (err) throw err;
}).on("message", async function (message) {
  try {
    result = JSON.parse(message);
    camera = result.camera;
    time = result.time;
    await readChars(result.source).then(plate => {
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
      id++
    }
    else { //Could remove this else for release
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

let readChars = function (img) {
  return new Promise(function (resolve, reject) {
    Tesseract.recognize(img, "eng", 
    //Uncomment to see logger details
    //{ logger: m => console.log(m) } 
    ).then(
      ({ data: { text } }) => {
        text = text.replace(/[^a-zA-Z0-9]/g, "");
        //console.log(text);
        resolve(text);
      }
    );
  });
};

function getPlateCamera(plate) {
  if (unmatchedPlates.camera1.hasOwnProperty(plate)) return 1
  return 2
}

function connectToDB(){
  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log(err)

    // Storing a reference to the database so you can use it later
    db = client.db(dbName)
    console.log(`Connected MongoDB: ${url}`)
    console.log(`Database: ${dbName}`)
  }    
)}

function calcSpeed(time){
  return (distance/time) * 2236.94 //converts to mph
}

function addtoDB(platetoStore) {
  console.log("plate to add to DB:")
  console.log(platetoStore)
 
  let plate = platetoStore.plate
  let time1 = platetoStore.time1
  let time2 = platetoStore.time2
  let timeDifference = platetoStore.timeDifference
  let speed = platetoStore.speed
  
  //connectToDB()
  const collection = db.collection('plates');
  // Insert some documents
  collection.insertOne(
    {
      plate : plate,
      time1 : time1,
      time2 : time2,
      timeDifference : timeDifference,
      speed : speed
    }
  , function(err, result) {
      if (err) console.log(err)
      console.log("Inserted plate into the collection"); 
  });
}