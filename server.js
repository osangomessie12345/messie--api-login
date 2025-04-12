const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

// Lire les utilisateurs depuis le fichier
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Écrire les utilisateurs dans le fichier
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Inscription
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Utilisateur déjà inscrit' });
  }

  users.push({ username, password });
  writeUsers(users);

  res.json({ success: true, message: 'Inscription réussie' });
});

// Connexion
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  res.json({ success: true, message: 'Connexion réussie' });
});

// Exporter l'app pour Vercel (pas de app.listen)
module.exports = app;
