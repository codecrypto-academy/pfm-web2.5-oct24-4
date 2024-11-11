const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello Home!');
});

app.get('/nodos', (req, res) => {
    res.send('Hello Nodos!');
});

app.get('/faucet', (req, res) => {
    res.send('Hello Faucet!');
});

app.get('/nuevared', (req, res) => {
    res.send('Hello NuevaRed!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});