let PythonShell = require('python-shell');
let chokidar = require('chokidar');
let OCR = require('./OCR.js')

dir = process.cwd();


let options = {
    args: [dir]
  };

PythonShell.PythonShell.run('finalPrototype.py', options, function (err) {
    if (err) throw err;    
  }).on('message', function (message) {       
      console.log(message)
  });

chokidar.watch('./results').on('add', async (path, details) => {
  //console.log(path);
  console.log(await OCR.readChars(path))
  
});