const fs = require("fs");


  // Write to file
  async function writeFile(fileName, data) {
    try {
      await fs.promises.writeFile(fileName, data);
      console.log('File written successfully!');
    } catch (err) {
      console.error('Error writing file:', err);
    }
  }
module.exports = {
 
    writeFile
  
}