const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'your_database_name'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

const JWT_SECRET = 'your_jwt_secret_key';

app.post('/api/register', async (req, res) => {
  const { first_name, last_name, mobile_number, password, created_by } = req.body;
  const hashed_password = await bcrypt.hash(password, 10);
  const query = `INSERT INTO registration (first_name, last_name, mobile_number, password, created_by) 
                 VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [first_name, last_name, mobile_number, hashed_password, created_by], (err, result) => {
    if (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ message: 'Error registering user' });
    } else {
      res.status(201).json({ message: 'Registration successful, please login.' });
    }
  });
});

app.post('/api/login', (req, res) => {
  const { mobile_number, password } = req.body;
  const query = `SELECT * FROM registration WHERE mobile_number = ?`;

  db.query(query, [mobile_number], async (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Error logging in' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, first_name: user.first_name, last_name: user.last_name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  });
});

const authenticate = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

app.get('/api/landing', authenticate, (req, res) => {
  const currentHour = new Date().getHours();
  let greeting = 'Good Morning';

  if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Good Afternoon';
  } else if (currentHour >= 18) {
    greeting = 'Good Evening';
  }

  res.status(200).json({
    message: `${greeting} Mr./Ms. ${req.user.first_name} ${req.user.last_name}`,
  });
});

app.post('/api/logout', (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
