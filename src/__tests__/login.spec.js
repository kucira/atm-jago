const { readFile } = require("../helpers/utils");
const { loginCommand } = require("../modules/login");

jest.mock("../helpers/utils");

function setup() {
    // create a function into global context for Jest
    jest.spyOn(global.console, 'log').mockImplementation();
    jest.useFakeTimers();
    readFile.mockImplementation((name, content, callback) => {
        return callback('saitama');
    });
}

describe('login saitama', () => {
    beforeEach(() => {
        setup();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('Login with name', async () => {
        loginCommand('login saitama');

        // Fast-forward until all timers have been executed
        jest.runAllTimers();
        readFile('login', undefined, (name) => {
            expect(name).toBe('saitama');
            expect(console.log.mock.calls[0][0]).toEqual("Hello, saitama!")
            expect(console.log.mock.calls[1][0]).toEqual("Your Balance is 0!")
        }); 
    });
});