var events = require('events');
var net = require('net');

var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};

var guestNumber = 1;
channel.nicknames = {'system': 'system'};

channel.on('join', function(client, id) {
  this.clients[id] = client;
  this.nicknames[id] = "Guest" + guestNumber;
  guestNumber += 1;
  
  this.emit('broadcast', 'system', this.nicknames[id] + ' has joined.\n');

  // send messages to clients who are subscribed
  this.subscriptions[id] = function (senderId, message) {
    if (id != senderId) {
      this.clients[id].write(this.nicknames[senderId] + ': ' + message);
    }
  }
  
  // for every client that joins, add a listener for 'broadcast'
  this.on('broadcast', this.subscriptions[id]);
});

net.createServer(function(client) {
  var id = client.remoteAddress + ':' + client.remotePort;

  channel.emit('join', client, id);

  client.on('data', function(data) {
    data = data.toString();

    if (data.indexOf('/nick') == 0) {
      data = data.split(' ');
      var oldnick = channel.nicknames[id];
      channel.nicknames[id] = data[1].trim();
      channel.emit('broadcast', 'system', oldnick + ' is now known as ' + channel.nicknames[id] + '.\n');
    } else {
      channel.emit('broadcast', id, data);
    }
  });

  client.on('end', function() {
    delete channel.clients[id];
    channel.removeListener('broadcast', channel.subscriptions[id]);
    channel.emit('broadcast', 'system', channel.nicknames[id] + ' has left.\n');
  });
}).listen(8000, function () {
  console.log('Server listening on port 8000');
});
