const fs = require('fs');

const readFile = (name, content, callback, init = false) => {
    fs.readFile(`${name}.txt`, 'utf8', (err, data) => {
        if (err) {   
            if(init)         
                writeFile(name, `${content}`);
        }

        if(callback)
            callback(data);
      });
}

const writeFile = (name, content) => {
    fs.writeFile(`${name}.txt`, content, err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
        return 'successfully';
      });
};

module.exports = {
    readFile,
    writeFile
};