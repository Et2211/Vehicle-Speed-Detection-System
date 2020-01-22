let Tesseract = require('tesseract.js')
let PythonShell = require('python-shell');

let path = 'imgs/test5.jpg'
let img = process.cwd()
img = img.replace(/\\/g, "/");
img = img + "/"
console.log(img)

function findCars(img, path){
  let options = {
    args: [img, path]
  };
  
  PythonShell.PythonShell.run('DetectCars.py', options, function (err) {
    if (err) throw err; 
    
  }).on('message', function (message) {
    
    if (message != 'error') {
      result = JSON.parse(message)
      readImg(result.source, path)
    }   
  });
  
}

function readImg(img, path){  
  let options = {
    args: [img, path]
  };

  PythonShell.PythonShell.run('readCams.py', options, function (err) {
    if (err) throw err;    
  }).on('message', function (message) {
    
    if (message != 'error') {
      result = JSON.parse(message)
      readChars(result.source, result.img)
      console.log(result.source + result.img)
    }

  });
 
}

function readChars(img, path){
  Tesseract.recognize(
   'imgs/cropped.png',
    'eng',
   { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    text = text.replace(/[^a-zA-Z0-9]/g, '')
    console.log(text);

  })
}
findCars(img, path)