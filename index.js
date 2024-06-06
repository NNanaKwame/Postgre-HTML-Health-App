// Import required modules
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');  // Add bcrypt for password hashing

// Connect and Create an Express Application
const app = express();
const port = 8800; // By default, its 3000, you can customize

// Create a Postgres Connection
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'app',
    password: 'powerk#', // Change to your password
    port: 5432, // Default Port
});

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use('/public',express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to display the form
app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'form.html'));
});

// Route to display the sign-in form
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signin.html'));
});

// Route to display the home page
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Route to display the error page
app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'error.html'));
});

// Route to display the dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Route to display the landing page
app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'landing.html'));
});

// Route to display the profile page
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});


// const sendFile = (page) => (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', `${page}.html`));
// };

// app.get('/form', sendFile('form'));
// app.get('/signin', sendFile('signin'));
// app.get('/home', sendFile('home'));
// app.get('/error', sendFile('error'));
// app.get('/dashboard', sendFile('dashboard'));
// app.get('/landing', sendFile('landing'));
// app.get('/profile', sendFile('profile'));

// Route to handle user registration
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  try {
    await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
    res.redirect('/signin');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to handle sign-in
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      res.redirect('/home');
    } else {
      res.redirect('/error');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to display users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.render('index', { users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});