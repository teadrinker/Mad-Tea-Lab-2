var MTLTrackers = [];

_.mixin({
  helpers: function(helpers){
      _.each(helpers,function(fn, name){
        Template.registerHelper(name, fn);
      });
  },
  requestAnimationFrame: (function(){
      //return function(callback, element) { window.setTimeout(callback, 1000/60); };
      var fn = window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function(callback) {
                 window.setTimeout(callback, 1000/60);
               };
          return fn.bind(window)
    })(),
  allMTLTrackersDepend: function(){
      _.each(MTLTrackers,function(t){
          t.depend();
      })
  }),
  newTracker: function(){
      var t = new Tracker.Dependency;
      MTLTrackers.push(t);
      return t;
  });
});
