let PythonShell = require('python-shell');
let chokidar = require('chokidar');
let OCR = require('./OCR.js')
unmatchedPlates = {
  camera1 = [],
  camera2 = []
}
plates = {}
dir = process.cwd();


/* console.log("What distance apart are the cameras in metres?")
let distance = console.readline() //doesn't work with node!
console.log(distance) */

let options = {
    args: [dir]
  };

PythonShell.PythonShell.run('finalPrototype.py', options, function (err) {
    if (err) throw err;    
  }).on('message', function (message) {       
      console.log(message)
  });

chokidar.watch('./results').on('add', async (path, details) => {
  console.log(path);
  plate = (await OCR.readChars(path))

  //storePlate(plate, cam)
});

function storePlate(plate, camera){
  if (PlateExists()){
    break;
  }
  
  else{
    unmatchedPlates.plate

  }
  }

}

function PlateExists(plate){
  if (plate in unmatchedPlates) return true
  return false
}

