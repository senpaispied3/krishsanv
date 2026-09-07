
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

app.get('/api/health', (req,res)=>{
  res.json({status:'ok', name:'krishsanv', message:'Backend Live - No Pulse ✅', time: new Date().toISOString()});
});

app.get('/api/rooms', (req,res)=>{
  res.json({rooms: [], message:'Room list - coming soon'});
});

app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>{
  console.log(`krishsanv backend live on ${PORT}`);
});
