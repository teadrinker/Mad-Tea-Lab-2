"use strict";

window.__MTL__ = (function(){

var letters = ["a","b","c","d", "h",  "l","m","n","o",  "q","r","s","t","u","v","w"],
    numbers = [0,1,2,3,4,5,6,7,8,9];
var allUsedObjectsNames = function(){
  return _.flatten(_.map(["functions","variables","points"],function(objs){
    return _.map(MTL[objs],function(obj){return obj.name});
  }));
};
var firstAvailableVARName = function(){
  var names = [], n = 0;
  while(names.length === 0)
       names = _.difference(_(n++).nNamePool(letters,letters),allUsedObjectsNames());
  return names[0];
};
var firstAvailableFNName = function(){
  var names = [], n = 1;
  while(names.length === 0)
       names = _.difference(_(n++).nNamePool(numbers,["f"]),allUsedObjectsNames());
  return names[0];
};
var variableCustomization = function(VAR){
  (function(
    resetMaxMin, //pre-made
    showsIntegerifForced,
    makeAnimateDesu
  ){
    _.each(["left","right"], function(key){
      _.objSetterBeforeAndAfterHooks(VAR, key, _.mustBeNumber,resetMaxMin);
    });
    _.objSetterAfterHook(VAR,"isAnimating",makeAnimateDesu(_.objGetter(VAR,"val"))); //must be original getter
    _.objSetterBeforeHook(VAR, "val", _.mustBeNumber);
    _.objGetterSpecialCase(VAR, "val", showsIntegerifForced);
  })
  ((function makeResetMaxMin(){
    var max = VAR.right;
    var min = VAR.left
    var range = max - min;
    _.objGetter(VAR,"max",function(){return max});
    _.objGetter(VAR,"min",function(){return min});
    return function resetMaxMin(){
      if(VAR.right>VAR.left){
        max = VAR.right; min = VAR.left;
      }else{
        max = VAR.left; min = VAR.right;
      };
    }
  })(),
  (function showsIntegerifForced(originalGetter){
    if(VAR.isInteger){
      return Math.round(originalGetter());
    }else{
      return originalGetter();
    }
  }),
  (function makeAnimateDesu(originalGetter){
    var previousFrameMS;
    var increaseValue = function(){
      if(!VAR.isAnimating){
        previousFrameMS = undefined;
        return
      }else{
        var currentFrameMS = (new Date()).getTime();
        if(previousFrameMS){
          var movementPerFrame = (currentFrameMS - previousFrameMS) * ( (VAR.right-VAR.left)/ VAR.speed);
          var value = originalGetter();
          if(value > VAR.max || value < VAR.min){
            if(VAR.speed>0){
              VAR.val = VAR.left + ((VAR.val - VAR.left)%(VAR.right-VAR.left))
            }else{
              VAR.val = VAR.right - ((VAR.val - VAR.left)%(VAR.right-VAR.left))
            }
          }else{
            VAR.val = value + movementPerFrame;
          }
        }
        previousFrameMS = currentFrameMS;
        _.requestAnimationFrame(increaseValue);
      }
    }
    return function animateDesu(){
      if(VAR.isAnimating) _.requestAnimationFrame(increaseValue);
    }
  })
  )
};

var functionCustomization = function(){};

return {
  firstAvailableVARName: firstAvailableVARName,
  firstAvailableFNName: firstAvailableFNName,
  variableCustomization: variableCustomization,
  functionCustomization: functionCustomization
}

})();
