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

const calculateCredit = (credit, user, targetUser, totalBalance, amount) => {
     /** credit */

    const details = credit.split('-');
    const creditAmount = details ? +details[0] : 0;

    // get total credit substract from transfer amount
    const totalCredits = amount - creditAmount;

    // if minus means still have credit
    const isStillCredit = totalCredits < 0;
    const keyAction = isStillCredit ? 'from' : 'to';
    const dataCredit = `${Math.abs(totalCredits)}-${keyAction}-${targetUser.name}`
    const dataDebt = `${Math.abs(totalCredits)}-${keyAction === 'to' ? 'from' : 'to'}-${user.name}`

    let isCreditClear = false;
    // if no credit, means credit > 0 means if 0 credit clear, 
    // if larger than 0 it means possibility to become debt
    // ex : existing balance 100, current credit 40, transfer 100 -> 100 - 40 = 60 -> means 40 already paid, and 20 become debt
    if(!isStillCredit) {
        // check if existing balance larger than total credits
         // ex : current credit 40, transfer 100 -> 100 - 40 = 60 -> means 40 already paid, and 20 become debt
         // 100 - 20 = 80; means debt able to paid
        if(user.balance > totalCredits) {
            isCreditClear = true;
        }
    }
    
    const newBalance = isCreditClear ? user.balance - totalCredits : user.balance
    const targetNewBalance = isCreditClear ? targetUser.balance + Math.abs(totalCredits) : targetUser.balance + 0

    writeFile(user.name.toLowerCase(), [newBalance, isCreditClear ? '' : dataCredit].join('|'));
    writeFile(targetUser.name.toLowerCase(), [targetNewBalance, isCreditClear ? '' : dataDebt].join('|'))

    console.log(`Your balance is ${newBalance}`);
    console.log(`Owed ${isCreditClear ? 0 : Math.abs(totalCredits)} ${keyAction} ${targetUser.name}`)
}

const calculateDebt = (currentBalance, totalBalance, debt, user, targetUser) => {
    let debtAmount = 0;

    //get default total debt based on current balance
    let totalDebt = Math.abs(currentBalance);
    // new total balance if debt add from existing balance
    totalBalance = targetUser.balance + user.balance

    if(debt) {
        const details = debt.split('-');
        debtAmount = details ? +details[0] : 0;
        // get total debt
        totalDebt = Math.abs(currentBalance) + debtAmount;
    }

    //write debt
    const dataDebt = `${totalDebt}-to-${targetUser.name}`
    const dataCredit = `${totalDebt}-from-${user.name}`

    writeFile(user.name.toLowerCase(), [currentBalance < 0 ? 0 : currentBalance, dataDebt].join('|'));
    writeFile(targetUser.name.toLowerCase(), [totalBalance, dataCredit].join('|'));

    console.log(`Transferred ${user.balance} to ${targetUser.name}`);
    console.log(`Your balance is ${0}`);
    console.log(`Owed ${totalDebt} to ${targetUser.name}`)


}

const sendMoney = (user, targetUser, amount) => {
    // get current balance if minus means debt
    const currentBalance = user.balance - amount;
    // add to target balance user
    // this is default value no debt
    let totalBalance = targetUser.balance + amount

    const debt = user.debt || null;
    const credit = user.credit || null;

    if(credit) {
        calculateCredit(credit, user, targetUser, totalBalance, amount)
        return;
    }

    if(currentBalance < 0) {
        calculateDebt(currentBalance, totalBalance, debt, user, targetUser)
        return;
    }

    // no condition fulfilled transfer directly
    writeFile(user.name.toLowerCase(), [currentBalance < 0 ? 0 : currentBalance, ''].join('|'));
    writeFile(targetUser.name.toLowerCase(), [totalBalance, ''].join('|'));
    console.log(`Transferred ${amount} to ${targetUser.name}`);
    console.log(`your balance is ${currentBalance < 0 ? 0 : currentBalance}`);
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

            getUser(name.toLowerCase(), (user) => {
                // get user of target
                getUser(targetName.toLowerCase(), (targetData) => {
                    // transfer money, if balance money insufficient write debt
                    if(user.balance === 0) {
                        console.log(`can't transfer to ${targetName} please deposit first`);
                        return;
                    }

                    sendMoney(user, targetData, amount);
                });
            })
        });
    });
}

module.exports = {
    transferCommand
}