const { readFile, writeFile } = require('../helpers/utils');

const logoutCommand = (input) => {
    const args = input.toLowerCase().split(' ');
    if(!args.includes('logout'))
        return;
    
    readFile('login', undefined, (data) => {
        console.log(`Goodbye ${data}`)
        writeFile('login', '');
    });
}

module.exports = {
    logoutCommand
}