const { readFile, writeFile } = require("../helpers/utils");
const { getUser } = require("./login")

const withdrawCommand = (input) => {
    const args = input.toLowerCase().split(' ');
    if(!args.includes('withdraw'))
        return;
    if(args[1] === '')
        return;

    withdraw(args[1])
}

const withdraw = (amount) => {
    readFile('login', 'withdraw', (name) => {
        if(!name) {
            console.log('please login first');
            return;
        }
            
        getUser(name.toLowerCase(), (data) => {
            if(data.balance <= 0) {
                console.log(`Your balance not enough to withdraw`);
                return;
            }
            let totalBalance = data.balance
            totalBalance -= +amount;

            writeFile(name.toLowerCase(), [totalBalance, ''].join('|'));
            console.log(`Withdraw ${amount}`);
            console.log(`Your balance ${totalBalance}`);
            
        })
    });
}

module.exports = {
    withdrawCommand
}