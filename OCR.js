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