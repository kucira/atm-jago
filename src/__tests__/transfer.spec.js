const { readFile } = require("../helpers/utils");
const { transferCommand } = require("../modules/transfer");
const { getUser } = require("../modules/login");

jest.mock("../helpers/utils");
jest.mock("../modules/login");

const getMockUser = (name, debt = null, credit = null, balance = 0) => ({
    name,
    debt,
    credit,
    balance
});

function setup() {
    // create a function into global context for Jest
    // jest.spyOn(global.console, 'log').mockImplementation();
    // jest.useFakeTimers();
    getUser.mockImplementation((name, callbackUser) => {
        getUser.mockImplementation((targetname, callbackTarget) => {
            return callbackUser(getMockUser(targetname, null, null, 10))
        })
        return callbackUser(getMockUser(name, null, null, 10))
    })
    
    readFile.mockImplementation((name, content, callback) => {
        return callback('saitama');
    });
}


describe('transfer', () => {
    beforeEach(() => {
        setup();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // it('transfer 20 to alice from saitama with current balance 100', async () => {
    //     getUser.mockImplementation((name, callback) => {

    //         return callback(getMockUser('saitama', null, null, 100))
    //     })
    //     transferCommand('transfer alice 20');

    //     readFile('login', 'transfer', (name) => {
    //         expect(name).toBe('saitama');

    //         getUser('saitama', (data) => {
    //             expect(console.log.mock.calls[0][0]).toEqual("Transferred 20 to alice")
    //             expect(console.log.mock.calls[0][0]).toEqual("Your balance 80")
    //         })
    //     }); 
    // });

    // it('transfer 20 to alice from saitama with current balance 10', async () => {
    //     transferCommand('transfer alice 20');

    //     readFile('login', 'transfer', (name) => {
    //         expect(name).toBe('saitama');

    //         getUser('saitama', (data) => {
    //             expect(console.log.mock.calls[0][0]).toEqual("Transferred 10 to alice")
    //             expect(console.log.mock.calls[0][0]).toEqual("Your balance 0")
    //             expect(console.log.mock.calls[0][0]).toEqual("Owed 10 to alice")
    //         })
    //     }); 
    // });

    it('transfer 20 to alice from saitama with owed 10 to alice with current balance 10', async () => {
        getUser.mockImplementation((name, callbackUser) => {
            getUser.mockImplementation((targetname, callbackTarget) => {
                return callbackTarget(getMockUser('alice', null, '10-from-saitama', 10))
            })
            return callbackUser(getMockUser('saitama', '10-to-alice', null, 20))
        })
        transferCommand('transfer alice 20');

        readFile('login', 'transfer', (name) => {
            expect(name).toBe('saitama');

            getUser('saitama', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Transferred 10 to alice")
                expect(console.log.mock.calls[1][0]).toEqual("your balance is 0")
                expect(console.log.mock.calls[2][0]).toEqual("Owed 10 to alice")
            })
        }); 
    });

    // it('transfer 20 to alice from saitama with owed 20 from alice with current balance 10', async () => {
    //     getUser.mockImplementation((name, callback) => {
    //         return callback(getMockUser('saitama', null, '10-from-alice', 10))
    //     })
    //     transferCommand('transfer alice 20');

    //     readFile('login', 'transfer', (name) => {
    //         expect(name).toBe('saitama');

    //         getUser('saitama', (data) => {
    //             expect(console.log.mock.calls[0][0]).toEqual("Transferred 10 to alice")
    //             expect(console.log.mock.calls[1][0]).toEqual("Your balance 0")
    //             expect(console.log.mock.calls[2][0]).toEqual("Owed 10 to alice")
    //         })
    //     }); 
    // });

    // it('transfer 40 to alice from saitama with owed 20 from alice with current balance 30', async () => {
    //     getUser.mockImplementation((name, callback) => {
    //         return callback(getMockUser('saitama', null, '20-from-alice', 30))
    //     })
    //     transferCommand('transfer alice 40');
        
    //     jest.runAllTimers();
    //     readFile('login', 'transfer', (name) => {
    //         expect(name).toBe('saitama');

    //         getUser('saitama', (data) => {
    //             expect(console.log.mock.calls[0][0]).toEqual("Transferred 30 to alice")
    //             expect(console.log.mock.calls[1][0]).toEqual("Your balance 0")
    //             expect(console.log.mock.calls[2][0]).toEqual("Owed 10 to alice")
    //         })
    //     }); 
    // });
}); 