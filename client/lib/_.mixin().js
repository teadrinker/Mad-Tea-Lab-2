_.mixin({
  helpers: function(helpers){
      _.each(helpers,function(fn, name){
        Template.registerHelper(name, fn);
      });
  }
});
