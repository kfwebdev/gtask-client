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