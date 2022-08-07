const { readFile } = require("../helpers/utils");
const { logoutCommand } = require("../modules/logout");

jest.mock("../helpers/utils");

function setup() {
  // create a function into global context for Jest
  global.console = {
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn()
  }
  readFile.mockImplementation((name, content, callback) => {
      return callback('');
  });
}

describe('logout', () => {
  beforeAll(() => {
    setup();
  })

  afterEach(() => {
    jest.clearAllMocks();
});
  it('logout with name', async () => {
    logoutCommand('logout');

    readFile('login', undefined, (name) => {
        expect(name).toBe('');
    }); 
  });
});