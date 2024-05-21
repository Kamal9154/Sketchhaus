
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var { dirname } = require('path');
const io = require("socket.io")(http);
global.nodeEnv = require('dotenv').config({ debug: true });


app.use(bodyParser.urlencoded({ extended: false }));

app.get('/check-health',(req,res)=>{
    res.send('Site is healthy');
})

app.use(express.static(__dirname + '/../admin/dist'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/../admin/dist/index.html')));

app.use(express.static(path.join(__dirname, '/assets')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, *');
    res.setTimeout(1800000, () => {
        const err = new Error();
        err.name = 'ResponseTimeoutError';
        err.data = null;
        err.statusCode = 504;
        err.message = 'Response timedout';
        next(err);
    });
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST');
        res.setHeader('Access-Control-Allow-Credentials', true);
        return res.status(200).json({});
    }
    next();
});

app.use(bodyParser.urlencoded({ limit: '1025mb', extended: true }));
app.use(bodyParser.json({ limit: '1025mb', extended: true }));

app.set('view engine', 'ejs');

global.nodeSiteUrl = nodeEnv.parsed.SITE_URL + ':' + nodeEnv.parsed.SERVER_PORT;
global.nodeAdminUrl = nodeEnv.parsed.SITE_URL + ':' + nodeEnv.parsed.SERVER_PORT + '/admin';


var apiRouter = require('./routes/api');
app.use(flash());

app.use('/', apiRouter);

global.appDir = dirname(require.main.filename);

var server = http.listen(nodeEnv.parsed.SERVER_PORT, function () {
    console.log("Example app listening at " + nodeEnv.parsed.SITE_URL + ":%s", server.address().port);
});

const ApiController = require('./controllers/api/ApiController');

io.on('connection', function (socket) {
    console.log('Someone just connect!');

    socket.on('create_group', async function (obj) {
        await ApiController.respond(obj, socket);
    });   


});

module.exports = app;