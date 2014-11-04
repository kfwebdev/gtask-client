requirejs.config({
  baseUrl: 'js/',
  paths: {
    jquery: [
      '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
      'vendor/jquery-1.9.1.min'
    ],
    underscore: 'vendor/underscore-min',
    backbone: 'vendor/backbone-min',
    marionette: 'vendor/backbone.marionette.min',
    handlebars: 'vendor/handlebars-v2.0.0',
    foundation: 'vendor/foundation.min',
    jqueryui: 'vendor/jquery-ui.min',
    touchpunch: 'vendor/jquery.ui.touch-punch.min',
    modernizr: 'vendor/custom.modernizr'
  },

  shim: {
      underscore: { exports: '_' },
      backbone: { 
        deps: ['jquery', 'underscore'],
        exports: 'Backbone'
      },
      marionette: { 
        deps: ['backbone'],
        exports: 'Marionette'
      },
      handlebars: {},
      foundation: { deps: ['jquery'] },
      jqueryui: { deps: ['jquery'] },
      touchpunch: { deps: ['jqueryui'] },
      models: { deps: ['backbone'] },
      views: { deps: ['models'] },
      gapi: { deps: ['views'] }
  }
});

define( function(require) {
    var $           = require('jquery'),
        _           = require('underscore'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        foundation  = require('foundation'),
        jqueryui    = require('jqueryui'),
        touchpunch  = require('touchpunch'),
        modernizr   = require('modernizr'),
        models      = require('models'),
        views       = require('views'),
        gapi        = require('gapi');





  // console log helper function
  var cl = console.dir.bind(console);


  /************************
            GTask App
  ************************/

  var gtask = { options: {} };
  
  /************************
            Variables
  ************************/
  
  gtask.options.scrollSpeed = 1000,
  gtask.options.backboneRoot = '/todolist/';
  gtask.options.updateTimeStamp = 0;



  /************************
            Router
  ************************/


  gtask.Router = Backbone.Router.extend({
    routes: {
      'list/:cid' : 'openList',
      '': 'home'
    },

    home: function() {
      gtask.listsView.render(); 
    },

    openList: function(cid) {
      if (gtask.listsCol && gtask.listsCol.length) {
        var list = gtask.listsCol.get(cid);
        if (list) {
          gtask.listsView.openList(cid); 
        } else {
          console.error('List not found:', cid);
        }
      }
    }

  });



  /************************
      Central Command
  ************************/
  


  $( document ).foundation();

  gtask.listsCol = new Lists();
  gtask.tasksCol = new Tasks();

  gtask.topBarView = new TopBarView();

  gtask.listsView = new ListsView(); 
  gtask.taskListView = new TaskListView(); 
 
  gtask.routes = new gtask.Router();

  gtask.statusBarView = new StatusBarView({ el : 'body' });

  gtask.apiManager = new ApiManager();

  gtask.topBarView.apiManager = gtask.apiManager;

  gtask.apiManager.on('loadingLists', function() { 
    $('body').find('#taskLists').html('<div class="loading">Loading Google Task Lists...</div>');
  });

  gtask.apiManager.on('ready', function() {
      this.trigger('loadingLists');
      gtask.listsCol.fetch({ data: { userId: '@me' }, success: function(res) {
          gtask.routes.apiManager = gtask.apiManager;        

          gtask.listsView.scrollSpeed = gtask.options.scrollSpeed;
          gtask.listsView.listsCol = gtask.listsCol;
          gtask.listsView.tasksCol = gtask.tasksCol;
          //gtask.listsView.searchIndex = gtask.searchIndex;
          gtask.listsView.taskListView = gtask.taskListView;
          gtask.listsView.routes = gtask.routes;
          gtask.listsView.statusBarView = gtask.statusBarView;

          gtask.taskListView.tasksCol = gtask.tasksCol;
          gtask.taskListView.statusBarView = gtask.statusBarView;

          gtask.topBarView.routes = gtask.routes;

          Backbone.history.start({ pushState: false, root: gtask.options.backboneRoot });
        }
      });
  });

});