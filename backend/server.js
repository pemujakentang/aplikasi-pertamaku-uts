import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

const app = express();
const csrfProtection = csrf({ cookie: true });

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost',
  'http://localhost:5173',
  'http://localhost/boni/',
  'http://localhost:80',
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS')); // Deny
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(csrfProtection);

const connection = new sqlite3.Database('./db/aplikasi.db');

app.get('/api/user/:id', (req, res) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  const params = [req.params.id];

  connection.all(query, params, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(results);
  });
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/api/user/:id/change-email', csrfProtection, (req, res) => {
  const newEmail = req.body.email;
  const query = 'UPDATE users SET email = ? WHERE id = ?';
  const params = [newEmail, req.params.id];

  connection.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) res.status(404).send('User not found');
    else res.status(200).send('Email updated successfully');
  });
});

app.get('/api/file', (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const fileName = path.basename(req.query.name);
  const filePath = path.join(__dirname, 'files', fileName);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
