const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({extended: true}));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useUnifiedTopology: true,
        });
        app.listen(PORT, () =>
            console.log(`App has been started on port ${PORT}...`)
        );
    } catch (e) {
        console.log('Oops, server error', e.message);
        process.exit(1);
    }
};

start();