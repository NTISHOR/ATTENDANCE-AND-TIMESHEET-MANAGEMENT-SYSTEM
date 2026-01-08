const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // your MySQL user
  password: 'your_password', // your MySQL password
  database: 'attendance_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const lecturerRoutes = require('./routes/lecturer');
const supervisorRoutes = require('./routes/supervisor');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/supervisor', supervisorRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
