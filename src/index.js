const prompt = require("prompt-sync")({ sigint: true });

const { depositCommand } = require("./modules/deposit");
const { loginCommand } = require('./modules/login');
const { transferCommand } = require("./modules/transfer");
const { logoutCommand } = require("./modules/logout");
const { withdrawCommand } = require("./modules/withdraw");

console.log('"Welcome to Hero Bank. \n')
const input = prompt();
loginCommand(input);
depositCommand(input);
transferCommand(input);
logoutCommand(input);
withdrawCommand(input);
