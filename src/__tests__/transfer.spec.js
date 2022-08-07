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
    jest.spyOn(global.console, 'log').mockImplementation();
    getUser.mockImplementation((name, callbackUser) => {
        getUser.mockImplementation((targetname, callbackTarget) => {
            return callbackUser(getMockUser(targetname, null, null, 10))
        })
        return callbackUser(getMockUser(name, null, null, 10))
    })
    
    readFile.mockImplementation((name, targetName = 'bob', callback) => {
        return callback(targetName);
    });
}


describe('transfer', () => {
    beforeEach(() => {
        setup();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('bob transfer alice 50 balance from 80', async () => {
        getUser.mockImplementation((name, callbackUser) => {
            getUser.mockImplementation((targetname, callbackTarget) => {
                return callbackTarget(getMockUser('alice', null, null, 100))
            })
            return callbackUser(getMockUser('bob', null, null, 80))
        })
        transferCommand('transfer alice 50');

        readFile('login', 'bob', (name) => {
            expect(name).toBe('bob');

            getUser('bob', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Transferred 50 to alice")
                expect(console.log.mock.calls[1][0]).toEqual("your balance is 30")
            })
        }); 
    });

    it('bob transfer alice 100 balance from 30', async () => {
        getUser.mockImplementation((name, callbackUser) => {
            getUser.mockImplementation((targetname, callbackTarget) => {
                return callbackTarget(getMockUser('alice', null, null, 150))
            })
            return callbackUser(getMockUser('bob', null, null, 30))
        })
        transferCommand('transfer alice 100');

        readFile('login', 'bob', (name) => {
            expect(name).toBe('bob');

            getUser('bob', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Transferred 30 to alice")
                expect(console.log.mock.calls[1][0]).toEqual("Your balance is 0")
                expect(console.log.mock.calls[2][0]).toEqual("Owed 70 to alice")
            })
        }); 
    });

    it('bob transfer alice 100 balance from 20', async () => {
        getUser.mockImplementation((name, callbackUser) => {
            getUser.mockImplementation((targetname, callbackTarget) => {
                return callbackTarget(getMockUser('alice', null, '50-from-bob', 180))
            })
            return callbackUser(getMockUser('bob', '50-to-alice', null, 20))
        })
        transferCommand('transfer alice 100');

        readFile('login', 'bob', (name) => {
            expect(name).toBe('bob');

            getUser('bob', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Transferred 20 to alice")
                expect(console.log.mock.calls[1][0]).toEqual("Your balance is 0")
                expect(console.log.mock.calls[2][0]).toEqual("Owed 130 to alice")
            })
        }); 
    });

    it('alice transfer bob 30 balance from 20 owed 40 from bob', async () => {
        getUser.mockImplementation((name, callbackUser) => {
            getUser.mockImplementation((targetname, callbackTarget) => {
                return callbackTarget(getMockUser('bob', '40-to-alice', null, 0))
            })
            return callbackUser(getMockUser('alice', null, '40-from-bob', 20))
        })
        transferCommand('transfer bob 30');

        readFile('login', 'alice', (name) => {  
            expect(name).toBe('alice');

            getUser('bob', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Your balance is 20")
                expect(console.log.mock.calls[1][0]).toEqual("Owed 10 to bob")
            })
        }); 
    });

    it('alice transfer bob 30, balance from 210 owed 40 from bob', async () => {
        getUser.mockImplementation((name, callbackUser) => {
            getUser.mockImplementation((targetname, callbackTarget) => {
                return callbackTarget(getMockUser('bob', '40-to-alice', null, 0))
            })
            return callbackUser(getMockUser('alice', null, '40-from-bob', 210))
        })
        transferCommand('transfer bob 30');

        readFile('login', 'alice', (name) => {  
            expect(name).toBe('alice');

            getUser('bob', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Your balance is 210")
                expect(console.log.mock.calls[1][0]).toEqual("Owed 10 to bob")
            })
        }); 
    });

    it('alice transfer bob 100,  balance from 210 owed 40 from bob', async () => {
        getUser.mockImplementation((name, callbackUser) => {
            getUser.mockImplementation((targetname, callbackTarget) => {
                return callbackTarget(getMockUser('bob', '40-to-alice', null, 10))
            })
            return callbackUser(getMockUser('alice', null, '40-from-bob', 210))
        })
        transferCommand('transfer bob 100');

        readFile('login', 'alice', (name) => {  
            expect(name).toBe('alice');

            getUser('bob', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Your balance is 150")
                expect(console.log.mock.calls[1][0]).toEqual("Owed 0 to bob")
            })
        }); 
    });
}); 