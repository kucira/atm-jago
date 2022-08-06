const { readFile, writeFile } = require("../helpers/utils");
const { getUser } = require("./login")

const transferCommand = (input) => {
    const args = input.toLowerCase().split(' ');
    if(!args.includes('transfer'))
        return;
    if(args[1] === '')
        return;

    transfer(args[1].toLowerCase(), +args[2]);
}

const checkDebt = (user, targetName, data, amount) => {
    const sendBalance = user.balance;

    //write debt
    const diffAmountDebt = Math.abs(user.balance - amount);
    const dataDebt = `${diffAmountDebt}-to-${targetName}`
    const dataCredit = `${diffAmountDebt}-from-${user.name}`

    //current user
    writeFile(user.name.toLowerCase(), [0, dataDebt].join('|'));
    //target user
    writeFile(targetName.toLowerCase(), [data.balance + sendBalance, dataCredit].join('|'));

    console.log(`Transferred ${sendBalance} to ${targetName}`);
    console.log(`Your balance ${0}`);
    console.log(`Owed ${diffAmountDebt} to ${targetName}`);
}

const checkCredit = (user, targetName, data, debtOrCredit, amount) => {
// if user have credit
    const details = debtOrCredit.split('-');
    const creditAmount = +details[0];

    let diffAmountCredit = amount - creditAmount;
    const dataDebt = diffAmountCredit > 0 ? '' : `${Math.abs(diffAmountCredit)}-to-${user.name.toLowerCase()}`
    const dataCredit = diffAmountCredit > 0 ? '' : `${Math.abs(diffAmountCredit)}-from-${targetName.toLowerCase()}`

    writeFile(user.name.toLowerCase(), [user.balance - (diffAmountCredit < 0 ? 0 : diffAmountCredit), dataCredit].join('|'));
    writeFile(targetName.toLowerCase(), [Math.abs(data.balance + (diffAmountCredit < 0 ? amount : diffAmountCredit)), dataDebt].join('|'));

    console.log(`Transferred ${(diffAmountCredit < 0 ? amount : diffAmountCredit)} to ${targetName}`);
    console.log(`your balance is ${user.balance - (diffAmountCredit < 0 ? 0 : diffAmountCredit)}`);
    console.log(`Owed ${diffAmountCredit > 0 ? 0 : Math.abs(diffAmountCredit)} to ${targetName}`);
}

const transfer = (targetName, amount) => {
    readFile('login', 'transfer', (name) => {
        if(!name) {
            console.log('please login first');
            return;
        }

        if(targetName.toLowerCase() === name.toLowerCase()) {
            console.log(`can't transfer to yourself`);
            return;
        }

        readFile(targetName.toLowerCase(), 'check', (targetUser) => {
            if(!targetUser) {
                console.log('target user is not registered to our system');
                return;
            }

            let totalBalance = 0;
            getUser(name.toLowerCase(), (user) => {
                // get user of target
                getUser(targetName.toLowerCase(), (data) => {
                    // transfer money, if balance money insufficient write debt
                    const debtOrCredit = data.debt ? data.debt : data.credit || ''
                    if(user.balance < +amount) {
                        checkDebt(user, targetName, data, amount);
                        return;
                    }
                    
                    if(debtOrCredit) {
                        checkCredit(user, targetName, data, debtOrCredit, amount);
                        return;
                    }
                    
                    totalBalance = data.balance + amount;
    
                    writeFile(targetName.toLowerCase(), [totalBalance, debtOrCredit].join('|'));
                    writeFile(user.name.toLowerCase(), [user.balance - amount, debtOrCredit].join('|'));
    
                    console.log(`Transferred ${amount} to ${targetName}`);
                    console.log(`your balance is ${user.balance - amount}`);
                });
            })
        });
    });
}

module.exports = {
    transferCommand
}