const express = require('express');
const app = express();
app.get('/test', (req, res) => {
  res.json({status: 'Backend is running!', port: 50017});
});
app.listen(50017, () => {
  console.log('Test server running on port 50017');
});
