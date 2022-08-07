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

const checkDebt = (user, targetName, targetData, debtOrCredit, amount) => {
    const details = debtOrCredit.split('-');
    const debtAmount = details ? +details[0] : 0;

    const currentBalance = user.balance - debtAmount;
    //write debt
    const diffAmountDebt = Math.abs(currentBalance - amount);
    const dataDebt = `${diffAmountDebt}-to-${targetName}`
    const dataCredit = `${diffAmountDebt}-from-${user.name}`

    //current user
    writeFile(user.name.toLowerCase(), [0, dataDebt].join('|'));
    //target user
    writeFile(targetName.toLowerCase(), [targetData.balance + currentBalance, dataCredit].join('|'));
    console.log('aa', targetName.toLowerCase(), targetData.balance + currentBalance)

    console.log(`Transferred ${Math.abs(currentBalance)} to ${targetName}`);
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
                console.log(user, 'user')
                // get user of target
                getUser(targetName.toLowerCase(), (targetData) => {
                    console.log(targetData, 'targetData')
                    // transfer money, if balance money insufficient write debt
                    const debtOrCredit = targetData.debt ? targetData.debt : targetData.credit || ''
                    if(user.balance === 0) {
                        console.log(`can't transfer to ${targetName} please deposit first`);
                        return;
                    }

                    // if balance less than amount transfer
                    // process and check if have debt or credit
                    if(user.balance < +amount) {
                        // if have credit
                        // process credit first
                        if(targetData.credit) {
                            checkCredit(user, targetName, targetData, debtOrCredit, amount);
                            return;
                        }

                        //if not process as debt
                        checkDebt(user, targetName, targetData, debtOrCredit, amount);
                        return;
                    }

                    // no debt or credit
                    if(!debtOrCredit) {
                        totalBalance = targetData.balance + amount;
        
                        writeFile(targetName.toLowerCase(), [totalBalance, debtOrCredit].join('|'));
                        writeFile(user.name.toLowerCase(), [user.balance - amount, debtOrCredit].join('|'));
        
                        console.log(`Transferred ${amount} to ${targetName}`);
                        console.log(`your balance is ${user.balance - amount}`);
                    }

                    // if balance more than amount
                    //check or credit
                    if(targetData.debt) {
                        checkDebt(user, targetName, targetData, debtOrCredit, amount);
                        return;
                    }
                    
                    
                    if(targetData.credit) {
                        checkCredit(user, targetName, targetData, debtOrCredit, amount);
                        return;
                    }

                });
            })
        });
    });
}

module.exports = {
    transferCommand
}