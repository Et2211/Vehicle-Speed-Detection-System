let Tesseract = require('tesseract.js')

//Hashing function
Object.defineProperty(String.prototype, 'hash', {
    value: function() {
      var hash = 0, i, chr;
      for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
  });

let readChars = async function(img) {
  return new Promise(function(resolve, reject) {
      Tesseract.recognize(img, "eng",
          //Uncomment to see OCR logger details
          //{ logger: m => console.log(m) } 
      ).then(
          ({
              data: {
                  text
              }
          }) => {
              text = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
              text = text.hash() //Hash the returned plate
              console.log(text)
              resolve(text);
          }
      );
  });
};

module.exports = {
  readChars : readChars
}

