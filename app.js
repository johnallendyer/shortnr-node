/* jslint node: true */
'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    redis = require('redis'),
    validator = require('validator'),
    shortid = require('shortid');

var app, port, base_url, client, rtg, client;

app = express();
port = process.env.PORT || 3000;
base_url = process.env.BASE_URL || 'http://localhost:' + port;
client = redis.createClient();

// Set up redis connection
/* istanbul ignore if */
if (process.env.REDISTOGO_URL) {
    require('redis-url').connect(process.env.REDISTOGO_URL);
} else {
    client = require('redis').createClient();
}

// Set up templating
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

// Set URL
app.set('base_url', base_url);

// Handle POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Routes
app.get('/', function(req, res) {
    res.render('index');
});

app.post('/', function(req, res) {
    var url = req.body.url,
        ui = req.body.ui,
        id;

    if (validator.isURL(url, { require_protocol: true })) {
        id = shortid.generate();
        client.set(id, url, function() {
            if (ui) {
                res.render('output', { id: id, base_url: base_url });
            } else {
                res.json({
                    success: true,
                    url: base_url + '/' + id
                });
            }
        });
    } else {
        if (ui) {
            res.status(404);
            res.render('error');
        } else {
            res.json({
                success: false,
                message: 'Invalid URL'
            });
        }
    }
});

app.get('/:id', function(req, res) {
    var id = req.params.id.trim();

    client.get(id, function(err, reply) {
        if (!err && reply) {
            res.status(301);
            res.set('Location', reply);
            res.send();
        } else {
            res.status(404);
            res.render('error');
        }
    });
});

// Serve static files
app.use(express.static(__dirname + '/static'));

app.listen(port);
console.log('Express started on port ' + port);
