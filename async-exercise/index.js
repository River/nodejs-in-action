var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
  getTitles(res);
}).listen(8000);

var throwError = function(err, res) {
  console.error(err);
  res.end("Server error");
};

var getTitles = function(res) {
  fs.readFile('./titles.json', function(err, data) {
    if (err) return throwError(err, res);
    getTemplate(JSON.parse(data.toString()), res);
  });
};

var getTemplate = function(titles, res) {
  fs.readFile('./template.html', function(err, data) {
    if (err) return throwError(err, res);
    formatHtml(titles, data.toString(), res);
  });
};

var formatHtml = function(titles, template, res) {
  var html = template.replace('%', titles.join('</li><li>'));
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
};

console.log('Server started on port 8000');
