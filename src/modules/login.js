const { readFile, writeFile } = require('../helpers/utils');

const loginCommand = (input) => {
    const args = input.toLowerCase().split(' ');
    if(!args.includes('login'))
        return;
    if(args[1] === '')
        return;
    
    const name = input.substring(5).toLowerCase().trim();
    if(name === '') {
        console.log('please provide your name')
        return;
    }
        

    auth(name);
    setTimeout(() => {
         getUser(name, (user) => {
            console.log(`Hello, ${name}!`);
            console.log(`Your Balance is ${Number.isNaN(user.balance) ? 0 : user.balance}!`);
            if(user.debt) {
                console.log(`owed ${user.debt.replace(/-/g, ' ')}`);
            }
            if(user.credit) {
                console.log(`owed ${user.credit.replace(/-/g, ' ')}`);
            }
        })
    }, 1000)
}

const auth = (name) => {
    const updateStatus = () => {
        writeFile('login', name);
    }
    readFile(name, '0|', updateStatus, true);
}

const getUser = (name, callback) => {
    let user = { name: '', balance: 0}
    const setUser = (data) => {
        const dataSplit = data.split('|');
        user = {
            name,
            debt: dataSplit.length > 1 ? dataSplit[1].split('-')[1]  === 'to' ? dataSplit[1] : null : null,
            credit: dataSplit.length > 1 ? dataSplit[1].split('-')[1]  === 'from' ? dataSplit[1] : null : null,
            balance: +dataSplit[0]
        }
        if(callback)
            callback(user)
    }

    readFile(name, undefined, setUser);
    return user;
}

module.exports = {
    loginCommand,
    getUser,
}