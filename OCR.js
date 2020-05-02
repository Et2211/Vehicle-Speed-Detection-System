let Tesseract = require('tesseract.js')
let x11 = require('@dashevo/x11-hash-js');

let readChars = async function(img) {
  return new Promise(function(resolve, reject) {
      Tesseract.recognize(img, "eng",
          //Uncomment to see logger details
          //{ logger: m => console.log(m) } 
      ).then(
          ({
              data: {
                  text
              }
          }) => {
              text = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
              //text = x11.digest(text) //Hash algorithm for the plate
              console.log(text)
              resolve(text);
          }
      );
  });
};

module.exports = {
  readChars : readChars
}

