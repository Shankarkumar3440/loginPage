const express = require('express');

const app = express();
const conn = require('./storageData');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');

const initialize = require('./passportConfig');
initialize(passport);
const port = process.env.PORT || 3005;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/users/register', (req, res) => {
    res.render('register');
});
app.get('/users/login', (req, res) => {
    res.render('login');
});
app.get('/users/dashboard', (req, res) => {
    res.render('dashboard',{user:"Shankar"});
});

app.post('/users/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    console.log({
        name,
        email,
        password,
        password2
    });

let errors = [];
if ( !name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
    }

if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
    }
if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });    
}    
if (errors.length>0) {
    res.render('register', {errors})
      }
   else{
    // form validaton has passed
 try {
        // Ensure that the connection is established before using it
        await conn.sync({ force: false });

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        conn.query(`SELECT * FROM users WHERE email = '${email}'`, [email], async (err, results) => {
            if (err || !results.rows.length) {
                throw err;
            }
            if (results.rows.length > 0) {
                errors.push({ msg: 'Email already exists' });
                return res.render('register', { errors });
                
            }else{
                conn.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${hashedPassword}')`, [name, email, hashedPassword]),
                (err, results) => {
                    if (err) {
                        throw err;
                    }
                    console.log(results.rows);
                        req.flash('User created successfully:', results);
                }
            }
        })

        if (existingUser) {
            errors.push({ msg: 'Email already exists' });
            return res.render('register', { errors });
        }

        const user = await conn.create({
            name,
            email,
            password: hashedPassword
        });

        console.log('User created successfully:', user);

        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/users/login');
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            const errors = error.errors.map(err => ({
                message: err.message,
                type: err.type,
                path: err.path,
            }));
            console.error('Validation Errors:', errors);
            return res.render('register', { errors });
        }

        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
}});
app.post('/users/login', passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: false
}));

conn.sync({force:false}).then(result =>{
    app.listen(port, ()=>{
        console.log(`Server running on port ${port}`);
    })
}).catch(err=>{
    console.log(err);

}); 
   
   
