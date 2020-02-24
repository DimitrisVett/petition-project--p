const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

//call in post registration route
exports.hash = password => genSalt().then(salt => hash(password, salt));

//call in post login route
exports.compare = promisify(bcrypt.compare); //return boolean value
