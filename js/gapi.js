(function ($) { 
    $.getScript = function(src, func) {
        var script = document.createElement('script');
        script.async = "async";
        script.src = src;
        if (func) {
           script.onload = func;
        }
        document.getElementsByTagName("head")[0].appendChild( script );
    }
})($)

function ApiManager() {
  config = {};
  config.apiKey = 'AIzaSyAxaDSX5-dKXXuDsYlnMmTseQ7t-5JVtxY';
  config.scopes = 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile';
  config.clientId = '503492183497.apps.googleusercontent.com';

  this.gapi;

  this.loadGapi();
}

_.extend(ApiManager.prototype, Backbone.Events);

ApiManager.prototype.loadGapi = function() {
  var self = this;

  if (typeof gapi !== 'undefined') {
    return this.init();
  }

  $.getScript('https://apis.google.com/js/client.js?onload=define', function() {
    // Poll until gapi is ready
    function checkGAPI() {
      if (gapi && gapi.client) {
        self.init();
      } else {
        setTimeout(checkGAPI, 100);
      }
    }
    
    checkGAPI();
  }); 
}

ApiManager.prototype.init = function() {
  var self = this;

  gapi.client.load('tasks', 'v1', function() { /* Loaded */ });

  function handleClientLoad() {
    gapi.client.setApiKey(config.apiKey);
    window.setTimeout(checkAuth, 100);
  }

  function checkAuth() {
    gapi.auth.authorize({ client_id: config.clientId, scope: config.scopes, immediate: true }, handleAuthResult);
  }

  function handleAuthResult(authResult) {
      var authTimeout;

      if (authResult && !authResult.error) {
        // Schedule a check when the authentication token expires
        if (authResult.expires_in) {
          authTimeout = (authResult.expires_in - 5) * 1000;
          setTimeout(checkAuth, authTimeout);
        }

        $('#signInGoogle').hide();
        $('#signedInGoogle').show();
        self.trigger('ready');
        gapi.loggedIn = true;
      } else {
        if (authResult && authResult.error) {
          // TODO: Show error
          console.error('Unable to sign in:', authResult.error);
        }

        $('#signInGoogle').show();
      }
  }

  this.checkAuth = function() {
    gapi.auth.authorize({ client_id: config.clientId, scope: config.scopes, immediate: false }, handleAuthResult);
  };

  handleClientLoad();
}



Backbone.sync = function(method, model, options) {
  var requestContent = {};
  options || (options = {});

  switch (model.url) {
    case 'tasks':
      requestContent.task = model.get('id');
      requestContent.tasklist = model.get('tasklist');
    break;

    case 'tasklists':
      requestContent.tasklist = model.get('id');
    break;
  }

  switch (method) {
    case 'create':
      requestContent['resource'] = model.toJSON();
      var request = gapi.client.tasks[model.url].insert(requestContent);
      Backbone.gapiRequest(request, method, model, options);
    break;

    case 'update':
      requestContent['resource'] = model.toJSON(); 
      var request = gapi.client.tasks[model.url].update(requestContent);
      Backbone.gapiRequest(request, method, model, options);
    break;

    case 'delete':
      requestContent['resource'] = model.toJSON();
      request = gapi.client.tasks[model.url].delete(requestContent);
      Backbone.gapiRequest(request, method, model, options);
    break;

    case 'read':
      var request = gapi.client.tasks[model.url].list(options.data);
      Backbone.gapiRequest(request, method, model, options);
    break;

    default:
      console.error('Unknown method:', method);
    break;
  }
};

Backbone.gapiRequest = function(request, method, model, options) {
  var result;
  request.execute(function(res) {
    if (res.error) {
      if (options.error) options.error(res);
    } else if (options.success) {
      if (res.items) {
        result = res.items;
      } else {
        result = res;
      }
      options.success(result, true, request);
    }
  });
};