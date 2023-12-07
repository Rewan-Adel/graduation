const  app = require('./app');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);

});
require('dotenv').config()

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE).then(con => {
    console.log('DB connection successful!');
});


const port = process.env.PORT || 3000;

let server = app.listen(port, () => {    
    console.log(`Server running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = server;