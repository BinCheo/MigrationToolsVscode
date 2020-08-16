const MyModule = require('./myModule');
const myModule = new MyModule;
class MainFunction {


  repalcePattern(filePath, comment, dictionary) {

    const fileName = path.basename(filePath);
    const fileTempPath = filePath.replace(fileName, fileName.split('.')[0] + "temp.vb");

    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(fileTempPath, { encoding: "utf8" });
    const rl = readline.createInterface({
      input: readStream,
      output: writeStream,
      terminal: false,
      historySize: 0
    });

    var oldCode = [];
    var newCode = [];
    rl.on("line", function (line) {
      var tab = myModule.getTab(line);
      var flagComment = true;
      oldCode.push(line);
      if (line.trim().charAt(0) != "\'" && myModule.isInclude(line, dictionary)) {
        for (var key in dictionary) {
          if (line.includes(key)) {
            newCode.push(line.replace(new RegExp(key, 'g'), dictionary[key].toLowerCase()));
          }
        }

        flagComment = false;
      }
      if (flagComment) {
        if (newCode.length != oldCode.length && newCode.length > 0) {
          writeStream.write(tab + comment + "\r\n");
          for (var i = 0; i < oldCode.length - 1; i++) {
            writeStream.write(tab + '\'' + oldCode[i].trim() + "\r\n");
          }
          for (var i = 0; i < newCode.length; i++) {
            writeStream.write(newCode[i] + "\r\n");
          }
          writeStream.write(oldCode[oldCode.length - 1] + "\r\n");
        } else {
          writeStream.write(oldCode[0] + "\r\n");
        }
        oldCode = [];
        newCode = [];
      }

    });
  }

}

// exports = Cat; // It will not work with `new Cat();`
// exports.Cat = Cat; // It will require `new Cat.Cat();` to work (yuck!)
module.exports = MainFunction;