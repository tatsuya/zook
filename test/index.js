var urun = require('urun');

var filter = 'integration';

urun(__dirname, {
  include: new RegExp(filter + '\/.*\.js$'),
  verbose: true
});