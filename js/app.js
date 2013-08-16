(function($){

  /************************
            Variables
  ************************/
  
  var scrollSpeed = 1000;
  var backboneRoot = '/todolist/';


  /************************
            Models
  ************************/
  

  var Task = Backbone.Model.extend({
    defaults: {
      title: '',
      notes: 'Empty Notes',
      notesHeight: '0',
      notesWidth: '0'
   }
  });


  var Tasks = Backbone.Collection.extend({
    model: Task,
    url: 'tasks'
  });


  var List = Backbone.Model.extend({
    defaults: {
      url: 'tasklists',
      title: ''
    }
  });


  var Lists = Backbone.Collection.extend({
    model: List,
    url: 'tasklists'
  });



  /************************
            Views
  ************************/




  var StatusBarView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render', 'saved');
      this.render();
    },

    render: function() {
      $(this.el).append('<div id="statusBar"></div>');
    },

    saved: function() {
      var statusBar = $('#statusBar');
      statusBar.removeClass();
      statusBar.addClass('saved alert-box success');
      statusBar.html('<h6>Saved</h6>');
      statusBar.css('top', $(document).scrollTop() + 5 + 'px');
      statusBar.stop().fadeTo(0, 0.8).show();
      statusBar.delay(1000).fadeOut(1000);
    }
  });





  var HeaderView = Backbone.View.extend({ 
    el: '#header',
    events: {
      'click a#addTask' : 'addTask',
      'click h2#title' : 'index'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'addTask');
    },

    render: function() {
      var viewHtml = '<div class="row collapse">';
      viewHtml += '<div class="small-10 columns"><input id="taskTitle" type="text" placeholder="Add your task here!"></div>';
      viewHtml += '<div class="small-2 columns"><a id="addTask" href="javascript:void(0);" class="button prefix success">Add Task</a></div>';
      viewHtml += '</div>';
      $(this.el).append(viewHtml);
    },

    addTask: function() {
      taskListView.addTask();
    },

    index: function() {
      $('#taskList').hide();
      if (gapi && gapi.loggedIn) { $(this.el).find('#taskLists').html('Loading Google Task Lists...'); }
      listsView.render();
      /*$('#taskList li').removeData().unbind().remove();
      $('#taskList').empty(); */
      routes.navigate('');
    }
  });








  var TaskView = Backbone.View.extend({
    tagName: 'li',

    events: {
      'click a.editTitle' : 'editTitle',
      'blur input.editTitle' : 'updateTitle',
      'keypress input.editTitle' : 'enterTitle',
      'keyup textarea#editNotes' : 'enterNotes',

      'click a.editNotes' : 'editNotes',
      'blur textarea#editNotes' : 'updateNotes',
      'change input[type="checkbox"]' : 'toggleTask',

      'click a.removeTask' : 'removeTask',
      'remove' : 'removeTask'
    },

  	initialize: function() {
  		_.bindAll(this, 'render', 'addTask', 'editTitle', 'updateTitle', 'editNotes', 'updateNotes', 'toggleTask', 'removeTask');
  	},

  	render: function() {
  		var id = this.model.get('id');
      var title = this.model.get('title');
  		var notes = this.model.get('notes');
      if (notes.length > 55) { notes = notes.substring(0, 56) + '...'; }
      //var taskHtml = '<span class="taskId">'+id+'</span> <input type="checkbox" id="checkbox'+id+'"> ';
      var taskHtml = '<a href="javascript:void(0);" class="reOrder"></a><input class="completed" type="checkbox"';
      var checked = this.model.get('status') === 'completed' ? 'checked="checked"' : '';
      taskHtml += checked + '> ';
      taskHtml += '<a href="javascript:void(0);" class="editTitle">'+title+'</a> ';
      taskHtml += '<div class="right"><a href="javascript:void(0);" class="editNotes">'+notes+'</a> ';
      //taskHtml += '<a href="javascript:void(0);" class="tiny button editNotes">Notes</a> ';
      taskHtml += '<a href="javascript:void(0);" class="alert tiny button removeTask">Delete</a></div>';

		  $(this.el).html(taskHtml);
      $(this.el).attr('cid', this.model.cid);

      return this;
  	},

    addTask: function() {
      this.counter++;
      var task = new Task();
      //var notes = task.get('notes');
      /* task.set({
        id: this.counter
      }); */
      tasksCol.add(task);
      taskListView.appendTask(task);
      this.model = task;
      this.model.save({}, { success: function() {
          this.editTitle();
          statusBarView.saved();
        }
      });
    },

    /*
    ** append new task method
    ** @param task task model from task collection
    */ 

    editTitle: function() {
      var title = $(this.el).find('input.editTitle').val() || this.model.get('title');
      if (title == 'Empty Task') { title = ''; }
      $(this.el).find('a.reOrder, a.editTitle, span.taskId, input[type="checkbox"], div.right').hide();
      $(this.el).find('div.right').before('<input class="editTitle" type="text" value="" />');
      $(this.el).find('input.editTitle').focus();
      $(this.el).find('input.editTitle').val(title); // update value and set cursor at string end

      $('html, body').animate({
         scrollTop: $(this.el).offset().top
      }, scrollSpeed);

    },

    enterTitle: function(e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        this.updateTitle(); 
      }
    },

    updateTitle: function() {
      var self = this;
      var title = $(this.el).find('input.editTitle').val();
      if (!title.length) { title = 'Empty Task'; }
      this.model.set({ title : title });
      this.model.url = 'tasks';
      this.model.save({}, { success: function() {
          $(self.el).find('input.editTitle').remove();
          $(self.el).find('a.editTitle').html(title);
          $(self.el).find('a.reOrder, a.editTitle, span.taskId, input[type="checkbox"], div.right').show();
          statusBarView.saved();
        }
      });
    },

    editNotes: function() {
      //$(this.el).find('a.editTitle, span.taskId, input[type="checkbox"], div.right').hide();
      var notes = this.model.get('notes');
      if (notes == 'Empty Notes') { notes = ''; }
      $(this.el).append('<textarea id="editNotes"></textarea>');
      $(this.el).find('textarea#editNotes').focus();
      $(this.el).find('textarea#editNotes').val(notes);
    },

    enterNotes: function(e) {
      if (e.which == 27) {
        e.preventDefault();
        this.updateNotes(); 
      }
    },

    updateNotes: function() { 
      var self = this;
      var notes = $(this.el).find('textarea#editNotes').val();
      if (!notes.length) { notes = 'Empty Notes'; }

      if (this.model.get('notes') != notes) {
        this.model.set({
          notes: notes
        });
        this.model.url = 'tasks';
        this.model.save({}, { success: function() {
            statusBarView.saved();
          }
        });

      }

      $(self.el).find('a.editNotes').html(notes);
      $(self.el).find('#editNotes').remove();
    },

    toggleTask: function(e) {
      this.model.url = 'tasks';
      this.model.set('status', $(e.target).is(':checked') ? 'completed' : 'needsAction');
      if (this.model.get('status') === 'needsAction') {
        this.model.set('completed', null);
        $(e.target).removeAttr('checked');
      }

      this.model.save();
    },

    removeTask: function() {
      if (confirm('Are you sure you want to delete ' + this.model.get('title') + '?')) {
        this.model.url = 'tasks';
        this.model.destroy();
        $('#taskView').empty();
        $(this.el).removeData().unbind().remove();
      }
    }

  });





var TaskListView = Backbone.View.extend({
  el: '#taskList',

  events: {
    'click input#newTask' : 'newTask',
  },

  initialize: function() {
    _.bindAll(this, 'newTask', 'appendTask');
  },

  newTask: function() {
    self = this;
    var task = new Task();
    //var notes = task.get('notes');
    /* task.set({
      id: this.counter
    }); */
    task.url = 'tasks';
    task.tasklist = this.id;
    tasksCol.add(task);
    task.save({ tasklist : this.id });
    var taskView = new TaskView({
      model: task,
      tasklist: task.tasklist
    });
    $(self.el).find('ul').append(taskView.render().el);
    taskView.editTitle();
  },

  appendTask: function(task) {
    var taskView = new TaskView({
      model: task,
      tasklist: task.tasklist
    });
    $(this.el).find('ul').append(taskView.render().el);
  },

  moveTask: function(cid, previousCid) {
    var model = tasksCol.get(cid);
    var previousModel = (typeof previousCid === 'undefined') ? false : tasksCol.get(previousCid);
    var index = tasksCol.indexOf(model) + 1;
    var id = model.get('id');
    var previousId = (!previousModel) ? false : previousModel.get('id');

    tasksCol.remove(model, {silent: true});
    tasksCol.add(model, {at: index, silent: true});

    if (previousId) { var options = { task: id, previous: previousId }; }
    else { var options = { task: id }; }
    options.tasklist = taskListView.id;
    var request = gapi.client.tasks.tasks.move(options);

    Backbone.gapiRequest(request, 'update', this, options);
  }

});







  var ListsView = Backbone.View.extend({
    el: '#taskLists',

    events: {
      'click a.editTitle' : 'editTitle',
      'click a.openList' : 'clickList',
      'click input#newList' : 'newList',
      'click a.removeList' : 'removeList',
      'blur input.editTitle' : 'updateTitle',
      'keypress input.editTitle' : 'enterTitle'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'newList', 'editTitle', 'enterTitle', 'updateTitle', 'removeList');
    },

    loadLists: function(render) {
      var self = this;
      listsCol.fetch({ data: { userId: '@me' }, success: function(res) {
          Backbone.history.start({ pushState: false, root: backboneRoot });
        }
      });
    },

    render: function() {
      var self = this;
      var viewHtml = '<form class="custom">';
      viewHtml += '<input id="newList" type="button" value="New List" class="button expand" />';
      viewHtml += '<ul>';

      _.each(listsCol.models, function(model) {
        //viewHtml += '<li id="'+model.get("id")+'"><a class="editTitle" href="javascript:void(0);">'+model.get("title")+'</a></li>';
        viewHtml += '<li cid="'+model.cid+'"><a class="openList" href="javascript:void(0);">'+model.get("title")+'</a>';
        viewHtml += '<div class="right"><a href="javascript:void(0);" class="tiny button editTitle">Rename</a> ';
        viewHtml += '<a href="javascript:void(0);" class="alert tiny button removeList">Delete</a></div></li>';
      });

      viewHtml += '</ul></form>'; 
      $(self.el).html(viewHtml);
      $('#taskLists').show();
    },

    openList: function(cid) {
      // if (tasksCol.length) { 
      //   var $taskList = $('#taskLists ul li');
      //   $taskList.unbind();
      //   $taskList.remove(); 
      // }

      var list = listsCol.get(cid);
      var id = list.get('id');

      tasksCol.fetch({ reset: true, data: { tasklist : id }, success: function() {
          $('#taskLists').hide();
          $('#taskList').show();
          _.each(tasksCol.models, function(task) {
            task.set('tasklist', id);
            taskListView.id = id;
            taskListView.appendTask(task);
          });

          routes.navigate('list/' + cid);

          $('#taskList ul').sortable({
            containment: "#taskList",
            placeholder: "placeHolder",
            handle: ".reOrder",
            stop: function(event, ui) {
              try {
                var cid = ui.item[0].attributes.cid.value;
                var previousCid = ui.item[0].previousSibling.attributes.cid.value;
              } catch(e) {}
              taskListView.moveTask(cid, previousCid);
            }
          });
          $('#taskList ul').disableSelection();
        }
      }); 
    },

    clickList: function(e) {
      var cid = $(e.target).parent().attr('cid');
      this.openList(cid);
    },

    newList: function() {
      self = this;
      var list = new List();
      this.model = list;
      list.url = 'tasklists';
      list.save({}, { success: function(model) {
        listsCol.add(model);
        self.addList(model);
        $('li#' + model.get('id') + ' a.editTitle').trigger('click');
      },
      error: function(model){
        console.log(model);
      }});
    },

    addList: function(model) {
      var viewHtml = '<li id="'+model.get("id")+'"><a class="openList" href="javascript:void(0);">'+model.get("title")+'</a>';
      viewHtml += '<div class="right"><a href="javascript:void(0);" class="tiny button editTitle">Rename</a> ';
      viewHtml += '<a href="javascript:void(0);" class="alert tiny button removeList">Delete</a></div></li>';
      $(this.el).find('ul').append(viewHtml);
    },

    editTitle: function(e) {
      var $element = $(e.target).closest('li');
      var cid = $element.attr('cid');
      this.model = listsCol.get(cid);
      var title = this.model.get('title');
      $element.find('.right, a.openList').hide();
      $element.find('a.openList').after('<input class="editTitle" type="text" value="">');
      $element.find('input.editTitle').focus();
      $element.find('input.editTitle').val(title); // update value and set cursor at string end
      $('html, body').animate({
         scrollTop: $element.offset().top
      }, scrollSpeed);
    },

    enterTitle: function(e) { 
      if (e.keyCode == 13) {
        e.preventDefault();
        this.updateTitle(e);
      }
    },

    updateTitle: function(e) {
      var self = this;
      var $element = $(e.target).closest('li');
      var cid = $element.attr('cid');
      this.model = listsCol.get(cid);
      var title = $(e.target).val();
      if (!title.length) { title = 'Empty List'; }

      this.model.url = 'tasklists';
      this.model.save({ title : title }, { success: function() {
          $element.find('input.editTitle').removeData().unbind().remove();
          $element.find('a.openList').html(title);
          $element.find('.right, a.openList').show();
          statusBarView.saved();
        }
      });

    },

    removeList: function(e) {
      var $element = $(e.target).closest('li');
      var cid = $element.attr('cid');
      this.model = listsCol.get(cid);
      this.model.url = 'tasklists';

      if (confirm('Are you sure you want to remove ' + this.model.get('title') + '?')) {
        this.model.destroy();
        $element.removeData().unbind().remove();
      }
    }

  });





  var AuthView = Backbone.View.extend({
    el: '#header',
    events: {
      'click a#authCheck' : 'authCheck',
      'click a#logout' : 'logout'
    },

    initialize: function() {
      _.bindAll(this, 'render');
      this.render();
    },

    render: function() {
      var viewHtml = '<div id="signInGoogle" class="row collapse" style="display:none;">';
      viewHtml += '<p><a id="authCheck" href="javascript:void(0);" class="small button">Sign in with Google</a></p>';
      viewHtml += '</div>';
      viewHtml += '<div id="signedInGoogle" class="row collapse" style="display:none;">';
      viewHtml += '<p>Signed in! <a id="logout" href="javascript:void(0);">Logout</a></p>';
      viewHtml += '</div>';
      $(this.el).prepend(viewHtml);
    },

    authCheck: function() {
      apiManager.checkAuth();
    },

    logout: function() {
      $(this.el).append('<iframe src="https://accounts.google.com/logout" style="display: none;"></iframe>');
    }
  });





  /************************
            Router
  ************************/
  



  var Router = Backbone.Router.extend({
    routes: {
      '': 'home',
      'list/:cid' : 'openList'
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
  


  $(document).foundation();

  var updateTimeStamp = 0;

  var tasksCol = new Tasks();
  var listsCol = new Lists();

  var authView = new AuthView();
  var headerView = new HeaderView();

  var listsView = new ListsView();
  var taskListView = new TaskListView();

  var routes = new Router();

  var statusBarView = new StatusBarView({ el : '#container' });

  var apiManager = new ApiManager();

  apiManager.on('ready', function() {
    listsView.loadLists();
  });

})($);

