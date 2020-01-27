let Tesseract = require('tesseract.js')
let PythonShell = require('python-shell');

let img = 'imgs/test5.jpg'
let path = process.cwd()
path = path.replace(/\\/g, "/");
path = path + "/"


function findCars(img, path){
  let options = {
    args: [path, img]
  };
  
  PythonShell.PythonShell.run('DetectCars.py', options, function (err) {
    if (err) throw err; 
    
  }).on('message', function (message) {
    
    if (message != 'error') {
      result = JSON.parse(message)
      detection(result)
      //readImg(result.source, path)
    }   
  });
  
}

function detection(sourceJson){

  numOfCars = sourceJson.numOfCars
  for (let i = 0; i < numOfCars; i++) {
    
    image = sourceJson.img + i + ".jpg"
    readImg(sourceJson.source, image, i)
    readChars(image)
  }
}

function readImg(img, path, numOfCar){  
  let options = {
    args: [img, path, numOfCar]
  };

  PythonShell.PythonShell.run('readCams.py', options, function (err) {
    if (err) throw err;    
  }).on('message', function (message) {       
      console.log(message)
  });
 
}

function readChars(img){
  Tesseract.recognize(
   img,
    'eng',
   { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    text = text.replace(/[^a-zA-Z0-9]/g, '')
    console.log(text);

  })
}
findCars(img, path)