const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

// Criação das tabelas tickets e comentarios, se não existirem
db.serialize(() => {
  // Tabela tickets
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    problema TEXT,
    status TEXT DEFAULT 'aberto',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela comentarios
  db.run(`CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER,
    autor TEXT,
    mensagem TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
  )`);
});

module.exports = db;

