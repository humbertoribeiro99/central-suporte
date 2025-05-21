const db = require('../db');

function criarTicket({ nome, email, problema }, callback) {
  db.run(
    `INSERT INTO tickets (nome, email, problema) VALUES (?, ?, ?)`,
    [nome, email, problema],
    function (err) {
      callback(err, { id: this.lastID });
    }
  );
}

function listarTickets(callback) {
  db.all(`SELECT * FROM tickets ORDER BY criado_em DESC`, [], callback);
}

module.exports = {
  criarTicket,
  listarTickets,
};
