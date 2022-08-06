const { readFile, writeFile } = require("../helpers/utils");
const { getUser } = require("./login")

const depositCommand = (input) => {
    const args = input.toLowerCase().split(' ');
    if(!args.includes('deposit'))
        return;
    if(args.length > 2)
        return;
    if(args[1] === '')
        return;

    deposit(args[1])
}

const deposit = (amount) => {
    readFile('login', 'deposit', (name) => {
        if(!name) {
            console.log('please login first');
            return;
        }
            
        getUser(name.toLowerCase(), (data) => {
            let totalBalance = data.balance
            totalBalance += +amount;
            
            if(data?.debt) {
                const debt = checkDebt(name, data?.debt, totalBalance);

                writeFile(name.toLowerCase(), [debt.totalBalance, debt.debt].join('|'));
                console.log(`Transferred ${debt.transferred} to ${debt.targetName}`);
                console.log(`Your balance ${debt.totalBalance}`);
                if(debt.totalBalance <= 0) {
                    console.log(`Owed ${debt.owed} to ${debt.targetName}`);
                }               
                return;
            }
            writeFile(name.toLowerCase(), [totalBalance, ''].join('|'));
            console.log(`Your balance ${totalBalance}`);
            
        })
    });
}

const checkDebt = (name, debt, balanceDeposit) => {
    const details = debt.split('-');
    const debtAmount = +details[0];
    const key = details[1];
    const targetName = details[2];

    // key to means debt
    // when deposit substract balance from debt
    // update debt current user & update credit target user
    if(key === 'to') {
        let diffAmountDebt = balanceDeposit - debtAmount;
        const dataDebt = diffAmountDebt < 0 ? `${Math.abs(diffAmountDebt)}-${key}-${targetName}` : '';

        // check credit for target user
        checkCredit(name, targetName, debtAmount, balanceDeposit);
        
        return {
            transferred: diffAmountDebt < 0 ? balanceDeposit : debtAmount,
            totalBalance: diffAmountDebt < 0 ? 0 : Math.abs(diffAmountDebt),
            owed: Math.abs(diffAmountDebt),
            debt:dataDebt,
            targetName,
        }    
    }
}

const checkCredit = (currentUser, targetName, debtAmount, balanceDeposit) => {
    // update credit balance in target user data
    getUser(targetName.toLowerCase(), (targetData) => {
        let diffAmountDebt = balanceDeposit - debtAmount;
        const totalBalance = targetData.balance + (diffAmountDebt > 0 ? debtAmount : balanceDeposit)
        let credit = '';
        
        // minus means still current user still have debt
        if(diffAmountDebt < 0) 
            credit = `${Math.abs(diffAmountDebt)}-from-${currentUser}`;

        writeFile(targetName.toLowerCase(), [totalBalance, credit].join('|'));
    })
}

module.exports = {
    depositCommand
}