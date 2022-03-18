require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const models = require('./models/models');
const cors = require('cors');

const PORT = process.env.PORT || 7000;
const app = express();
app.use(cors());
app.use(express.json());

// app.get('/', (req, res) => {
//     res.status(200).json({
//         message: 'все хорошо'
//     })
// })

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log('server start on ' + PORT + ' port');
        });
    } catch(e) {
        console.log('error', e);
    }
}

start();
