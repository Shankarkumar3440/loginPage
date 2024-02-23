const LocalStrategy = require('passport-local').Strategy;
const connDB = require('./database');

const bcrypt = require('bcrypt');

function initialize(passport) {
   const authenticateUser = (email, password, done) => {
    connDB.query(`SELECT * FROM users WHERE email = '${email}'`, [email], async (err, results) => {
        if (err || !results.rows.length) {
            throw err;
        }

        const user = results.rows[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                throw err;
            }

            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password is incorrect' });
            }
        });
    });
};


    passport.use(new LocalStrategy({ usernameField: 'email' ,
        passwordField: 'password'}, 
    authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        connDB.query(`SELECT * FROM users WHERE id = ${id}`, (err, results) => {
            if (err) {
                throw err;
            }
            return done(null, results[0]);
        });
    });
}


module.exports = initialize;