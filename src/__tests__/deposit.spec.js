const { readFile } = require("../helpers/utils");
const { depositCommand } = require("../modules/deposit");
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
    getUser.mockImplementation((name, callback) => {
        return callback(getMockUser(name))
    })
    readFile.mockImplementation((name, content, callback) => {
        return callback('saitama');
    });
}

describe('deposit', () => {
    beforeEach(() => {
        setup();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('deposit 100', async () => {
        depositCommand('deposit 100');

        readFile('login', 'deposit', (name) => {
            expect(name).toBe('saitama');

            getUser('saitama', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Your balance 100")
            })
        }); 
    });

    it('deposit 10 with debt 20 to alice', async () => {
        getUser.mockImplementation((name, callback) => {
            return callback(getMockUser(name, '20-to-alice'))
        });
        
        depositCommand('deposit 10');
        readFile('login', 'deposit', (name) => {
            expect(name).toBe('saitama');

            getUser('saitama', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Transferred 10 to alice");
                expect(console.log.mock.calls[1][0]).toEqual("Your balance 0")
                expect(console.log.mock.calls[2][0]).toEqual("Owed 10 to alice")
            })
        }); 
    });

    it('deposit 100 with debt 20 to alice', async () => {
        getUser.mockImplementation((name, callback) => {
            return callback(getMockUser(name, '20-to-alice'))
        });
        
        depositCommand('deposit 100');
        readFile('login', 'deposit', (name) => {
            expect(name).toBe('saitama');

            getUser('saitama', (data) => {
                expect(console.log.mock.calls[0][0]).toEqual("Transferred 20 to alice");
                expect(console.log.mock.calls[1][0]).toEqual("Your balance 80");
            })
        }); 
    });
}); 