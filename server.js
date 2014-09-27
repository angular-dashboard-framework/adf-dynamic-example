var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

var encoding = 'utf8';
var storeDir = __dirname + '/store/';

app.use(compression());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/v1/store', function(req, res){
  fs.readdir(storeDir, function(err, files){
    var boards = [];
    files.forEach(function(file){
      var json = JSON.parse(fs.readFileSync(storeDir + file, encoding));
      boards.push({
        id: file.replace('.json', ''),
        title: json.title
      });
    });
    // send response
    res.json({
      dashboards: boards
    });
  });
});

app.get('/v1/store/:id', function(req, res){
  fs.readFile(storeDir + req.params.id + '.json', encoding, function(err, data){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(data);
  });
});

app.post('/v1/store/:id', function(req, res){
  fs.writeFile(
    storeDir + req.params.id + '.json',
    JSON.stringify(req.body, undefined, 2),
    function(){
      res.status(204).end();
    }
  );
});

app.delete('/v1/store/:id', function(req, res){
  fs.unlink(storeDir + req.params.id + '.json', function(){
    res.status(204).end();
  });
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
