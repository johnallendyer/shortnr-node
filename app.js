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
rtg, client;

if (process.env.REDISTOGO_URL) {
    rtg = require('url').parse(process.env.REDISTOGO_URL);
    client = require('redis').createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(':')[1]);
} else {
    client = require('redis').createClient();
}

app.set('base_url', base_url);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/', function(req, res) {
    var url = req.body.url,
        id;

    if (validator.isURL(url)) {
        id = shortid.generate();
        client.set(id, url, function() {
            res.send(base_url + '/' + id);
        })
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
            res.send();
        }
    });
});

app.listen(port);
console.log('Express started on port 3000');
