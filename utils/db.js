var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSigners = function getSigners() {
    return db.query(
        "SELECT first, last, city, age, url FROM signatures JOIN users ON signatures.user_id = users.id LEFT join user_profiles ON users.id =user_profiles.user_id; "
    );
};

module.exports.addSigners = function addSigners(signature, userId) {
    return db.query(
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id",
        [signature, userId]
    );
};

module.exports.getCountSign = function countSig() {
    return db.query("SELECT COUNT(*) FROM signatures");
};

module.exports.getSignature = function getSignature(id) {
    return db.query(`SELECT * FROM signatures WHERE user_id=$1`, [id]);
};

module.exports.addUser = function addUser(
    firstname,
    lastname,
    email,
    password
) {
    firstname = firstname[0].toUpperCase() + firstname.slice(1).toLowerCase();

    lastname = lastname[0].toUpperCase() + lastname.slice(1).toLowerCase();

    return db.query(
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
        [firstname, lastname, email, password]
    );
};

module.exports.getUser = function getUser(email) {
    return db.query("SELECT password, id FROM users WHERE  email=$1", [email]);
};

module.exports.addProfile = function addProfile(age, city, url, userId) {
    if (city != "" && city != null) {
        city = city[0].toUpperCase() + city.slice(1).toLowerCase();
    }
    return db.query(
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id",
        [age || null, city, url, userId]
    );
};

module.exports.getCity = function getCity(city) {
    return db.query(
        "SELECT first, last, city, age, url  FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(city) = LOWER($1)",
        [city]
    );
};

module.exports.getAllInfo = function getAllInfo(id) {
    return db.query(
        "SELECT first, last, email, city, age, url  FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id=$1",
        [id]
    );
};

module.exports.updateUserProfile = function updateUserProfile(
    userId,
    age,
    city,
    homepage
) {
    if (city != "" && city != null) {
        city = city[0].toUpperCase() + city.slice(1).toLowerCase();
    }

    return db.query(
        "INSERT INTO user_profiles( user_id, age, city, url) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $2, city = $3, url = $4",
        [userId, age || null, city || "", homepage]
    );
};

module.exports.updateInfoWithPass = function updateInfoWithPass(
    firstname,
    lastname,
    password,
    email,
    id
) {
    firstname = firstname[0].toUpperCase() + firstname.slice(1).toLowerCase();

    lastname = lastname[0].toUpperCase() + lastname.slice(1).toLowerCase();
    return db.query(
        "UPDATE users SET first=$1 , last=$2 ,password=$3 ,email=$4 WHERE users.id=$5",
        [firstname, lastname, password, email, id]
    );
};
module.exports.updateInfoNoPass = function updateInfoNoPass(
    firstname,
    lastname,
    email,
    id
) {
    firstname = firstname[0].toUpperCase() + firstname.slice(1).toLowerCase();

    lastname = lastname[0].toUpperCase() + lastname.slice(1).toLowerCase();
    return db.query(
        "UPDATE users SET first=$1 , last=$2 ,email=$3 WHERE users.id=$4",
        [firstname, lastname, email, id]
    );
};

exports.deleteSign = function deleteSign(id) {
    return db.query("DELETE FROM signatures WHERE user_id=$1 ", [id]);
};
