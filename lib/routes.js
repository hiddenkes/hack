'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    story = require('./controllers/story');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/awesomeThings', api.awesomeThings);

  app.get('/api/story/:interest', story.list);


  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};
