let PythonShell = require("python-shell");
let chokidar = require("chokidar");
let OCR = require("./OCR.js");
let Tesseract = require("tesseract.js");
unmatchedPlates = {
  camera1: {},
  camera2: {}
};
plates = {};
dir = process.cwd();

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
    console.log(e);
    console.log("this is a catch: " + message);
  }
});

function storePlate(plate, camera, time) {
  if (PlateExists()) {
    console.log("Plate");
    console.log(unmatchedPlates);
  } else {
    //unmatchedPlates.camera.append(plate)
    console.log("no Plate");

    if (camera == 1) {
      unmatchedPlates.camera1[plate] = {
        plate: plate,
        camera: camera,
        time: time
      };
      console.log(unmatchedPlates);
    } else {
      unmatchedPlates.camera2[plate] = {
        plate: plate,
        camera: camera,
        time: time
      };
      console.log(unmatchedPlates);
    }
  }
}

function PlateExists(plate) {
  if (
    unmatchedPlates.camera1.hasOwnProperty(plate) &&
    unmatchedPlates.camera2.hasOwnProperty(plate)
  )
    return true;
  return false;
}

let readChars = function (img) {
  return new Promise(function (resolve, reject) {
    Tesseract.recognize(img, "eng", { logger: m => console.log(m) }).then(
      ({ data: { text } }) => {
        text = text.replace(/[^a-zA-Z0-9]/g, "");
        console.log(text);
        resolve(text);
      }
    );
  });
};
