const express = require('express');
const router = express.Router();
const cors = require('cors');


const { promisify } = require('util');
const db = require('../db');

// Promisificando métodos do sqlite3
const dbGet = promisify(db.get).bind(db);


const { criarTicket, listarTickets } = require('../models/ticketModel');

router.use(cors());
router.use(express.json());

// Criar ticket
router.post('/', (req, res) => {
  criarTicket(req.body, (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ sucesso: true, ticketId: result.id });
  });
});

// Listar tickets
router.get('/', (req, res) => {
  listarTickets((err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.get('/relatorio', async (req, res) => {
  try {
    const totalResult = await dbGet("SELECT COUNT(*) as total FROM tickets");
    const abertosResult = await dbGet("SELECT COUNT(*) as abertos FROM tickets WHERE status = 'aberto'");
    const resolvidosResult = await dbGet("SELECT COUNT(*) as resolvidos FROM tickets WHERE status = 'resolvido'");

    res.json({
      total: totalResult.total,
      abertos: abertosResult.abertos,
      resolvidos: resolvidosResult.resolvidos,
    });
  } catch (error) {
    console.error('Erro no /relatorio:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
});


// Atualizar status do ticket
router.put('/:id/status', async (req, res) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  if (!['aberto', 'resolvido', 'em andamento'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido' });
  }

  try {
    await db.run("UPDATE tickets SET status = ? WHERE id = ?", [status, ticketId]);
    res.json({ sucesso: true, ticketId, status });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

// Buscar comentários de um ticket
router.get('/:id/comentarios', (req, res) => {
  const ticketId = req.params.id;
  const sql = `SELECT * FROM comentarios WHERE ticket_id = ? ORDER BY criado_em ASC`;
  db.all(sql, [ticketId], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// Adicionar comentário
router.post('/:id/comentarios', (req, res) => {
  const ticketId = req.params.id;
  const { autor, mensagem } = req.body;

  if (!autor || !mensagem) return res.status(400).json({ erro: "Campos autor e mensagem são obrigatórios" });

  const sql = `INSERT INTO comentarios (ticket_id, autor, mensagem, criado_em) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
  db.run(sql, [ticketId, autor, mensagem], function (err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ sucesso: true, comentarioId: this.lastID });
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM tickets WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ erro: "Ticket não encontrado" });
    res.json(row);
  });
});



module.exports = router;
