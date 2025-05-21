const express = require('express');
const cors = require('cors');
const ticketRoutes = require('./routes/tickets');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


