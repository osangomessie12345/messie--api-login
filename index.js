const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const filePath = path.resolve(__dirname, 'users.json');

function loadUsers() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

module.exports = async (req, res) => {
  const { url, method } = req;
  const users = loadUsers();

  if (method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const username = params.get('username');
      const password = params.get('password');

      if (url.endsWith('/register')) {
        if (users[username]) {
          res.statusCode = 400;
          res.end('Utilisateur déjà existant');
          return;
        }

        users[username] = { password: bcrypt.hashSync(password, 10) };
        saveUsers(users);
        res.end('Inscription réussie');
      }

      else if (url.endsWith('/login')) {
        const user = users[username];
        if (user && bcrypt.compareSync(password, user.password)) {
          res.end('Connexion réussie');
        } else {
          res.statusCode = 401;
          res.end('Identifiants incorrects');
        }
      }

      else {
        res.statusCode = 404;
        res.end('Route non trouvée');
      }
    });
  } else {
    res.statusCode = 405;
    res.end('Méthode non autorisée');
  }
};
