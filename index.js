let PythonShell = require("python-shell");
let chokidar = require("chokidar");
let OCR = require("./OCR.js");
let Tesseract = require("tesseract.js");
let unmatchedPlates = {
  camera1: {},
  camera2: {}
};
let plates = {};
let dir = process.cwd();
let id = 0

/* console.log("What distance apart are the cameras in metres?")
let distance = console.readline() //doesn't work with node!
console.log(distance) */

let options = {
  args: [dir],
  pythonOptions: ["-u"],
  mode: "text"
};

PythonShell.PythonShell.run("finalPrototype.py", options, function (err) {
  if (err) throw err;
}).on("message", async function (message) {
  try {
    result = JSON.parse(message);
    camera = result.camera;
    time = result.time;
    await readChars(result.source).then(plate => {
      console.log(plate + " from camera " + camera + " at " + time);
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
      plates[id] = plateToMove
      console.log(unmatchedPlates[plate])
      delete unmatchedPlates["camera" + cam][plate] 
      
      console.log("unMatched plates are: ")
      console.log(unmatchedPlates)
      console.log("Matched plates are: ")
      console.log(plates)
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