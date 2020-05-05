let PythonShell = require("python-shell");
let OCR = require("./OCR.js");
let db = require("./DBinterface.js");
let dir = process.cwd();
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

db.connectToDB()

PythonShell.PythonShell.run("finalPrototype.py", options, function(err) {
    if (err) throw err;
}).on("message", async function(message) {
    try {
        result = JSON.parse(message);
        camera = result.camera;
        time = result.time;
        await OCR.readChars(result.source).then(plate => {
            if (plate != "") {
                storePlate(plate, camera, time);
            }
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
            db.addtoDB(plateToMove)
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

function calcSpeed(time) {
    return (distance / time) * 2236.94 //converts to mph
}