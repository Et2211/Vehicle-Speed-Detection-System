let PythonShell = require('python-shell');
let chokidar = require('chokidar');
let OCR = require('./OCR.js')
unmatchedPlates = {
  camera1: [],
  camera2: []
}
plates = {}
dir = process.cwd();


/* console.log("What distance apart are the cameras in metres?")
let distance = console.readline() //doesn't work with node!
console.log(distance) */

let options = {
    args: [dir],
    pythonOptions: ['-u'],
    mode: 'text',
  };

  PythonShell.PythonShell.run('finalPrototype.py', options, function (err) {
    if (err) throw err; 
    
  }).on('message', function (message) { 
      try{
        result = JSON.parse(message)
        plate = OCR.readChars(result.source)
        camera = result.camera
        console.log(plate + " from camera " + camera)
      }
      catch(e){ 
        console.log(message)
      }

  });

/* chokidar.watch('./results').on('add', async (path, details) => {
  console.log(path);
  //plate = (await OCR.readChars(path))
  //console.log("stuff happened")
  //storePlate(plate, cam)
}); */

function storePlate(plate, camera){
  if (PlateExists()){
    break;
  }
  
  else{
    unmatchedPlates.camera.append(plate)

  }
}

function PlateExists(plate){
  if (unmatchedPlates.camera1.includes(plate)) return true
  return false
}

