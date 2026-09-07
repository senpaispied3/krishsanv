
const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`krishsanv backend live on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
  allow_discovery: true
});

app.use('/peerjs', peerServer);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'krishsanv', version: '1.0.0', message: 'Backend Live - No Pulse' });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
