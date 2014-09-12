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



  /************************
            Variables
  ************************/
  
  var scrollSpeed = 1000;
  var backboneRoot = '/todolist/';



  /************************
            Router
  ************************/


  var Router = Backbone.Router.extend({
    routes: {
      'list/:cid' : 'openList',
      '': 'home'
    },

    home: function() {
      listsView.render(); 
    },

    openList: function(cid) {
      if (listsCol && listsCol.length) {
        var list = listsCol.get(cid);
        if (list) {
          listsView.openList(cid); 
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

  var updateTimeStamp = 0;

  var listsCol = new Lists();
  var tasksCol = new Tasks();

  var topBarView = new TopBarView();

  var listsView = new ListsView(); 
  var taskListView = new TaskListView(); 
 
  var routes = new Router();

  var statusBarView = new StatusBarView({ el : 'body' });

  var apiManager = new ApiManager();

  topBarView.apiManager = apiManager;

  apiManager.on('loadingLists', function() { 
    $('body').find('#taskLists').html('<div class="loading">Loading Google Task Lists...</div>');
  });

  apiManager.on('ready', function() {
      this.trigger('loadingLists');
      listsCol.fetch({ data: { userId: '@me' }, success: function(res) {
          routes.apiManager = apiManager;        

          listsView.scrollSpeed = scrollSpeed;
          listsView.listsCol = listsCol;
          listsView.tasksCol = tasksCol;
          //listsView.searchIndex = searchIndex;
          listsView.taskListView = taskListView;
          listsView.routes = routes;
          listsView.statusBarView = statusBarView;

          taskListView.tasksCol = tasksCol;
          taskListView.statusBarView = statusBarView;

          topBarView.routes = routes;

          Backbone.history.start({ pushState: false, root: backboneRoot });
        }
      });
  });

});

// console log helper function
var cl = console.dir.bind(console);