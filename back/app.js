
    const express = require('express');
    const app = express();
    const cors = require('cors');
    app.use(cors());

    app.get('/', async (req, res) => {
        console.log('Hello world');
        res.send('Hello world');
    });

    app.listen(5555, () => {
        console.log('Listening on port 5555');
    });
    