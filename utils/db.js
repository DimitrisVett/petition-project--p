var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition"); //alakse psw sto user postgres?
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

//create pswrd
exports.addSignature = function(first, last, signature) {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)
RETURNING id
        `,
        [first, last, signature]
    );
};

// will call this in post regitration route to  hash the pswrd
exports.hash = password => genSalt().then(salt => hash(password, salt));

//compare takes 2 arguments.  1 from client and the hashed psw from the databese/ compare(new, old  ) returns true
exports.compare = promisify(bcrypt.compare);

exports.getSignature = function(id) {
    return db.query(`SELECT signature FROM signatures WHERE id=$1`, [id]);
};

exports.getCountSign = function() {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

exports.getNames = function() {
    return db.query(`SELECT first, last FROM signatures  `);
};
// 'SELECT * FROM cities'
// exports.getCities = function getCities() {
//     return db.query("SELECT * FROM cities");
// };
//
// module.exports.addCity = function(city, population) {
//     return db.query("INSERT INTO cites(city,population VALUES ($1 ,$2)", [
//         city,
//         population
//     ]);
// };
