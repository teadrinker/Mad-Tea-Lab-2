"use strict";

(function(_){ window.__MTL__ = _ })
((function(){
var namePool = ["a","b","c","d", "h",  "l","m","n","o",  "q","r","s","t","u","v","w"];
var allUsedObjectsNames = function(){
  return _.flatten(_.map(["functions","variables","points"],function(objs){
    return _.map(RealMTL.state[objs],function(obj){return obj.name});
  }));
};
var firstAvailableName = function(){
  var names = [], n = 0;
  while(names.length === 0)
       names = _.difference(_(n).nNamePool(namePool),allUsedObjectsNames());
  return names[0];
};
var variableCustomization = function(MTL,objId){
  (function(
    resetMaxMinAndRange,
    showsIntegerifForced,
    animateDesu
  ){
    _.each(["left","right"], function(key){
      _.objSetterBeforeAndAfterHooks(v, key, _.mustBeNumber,resetMaxMinAndRange);
    });
    _.objGetter(v,"range",function(){return range});
    _.objGetter(v,"max",function(){return max});
    _.objGetter(v,"min",function(){return min});
    _.objSetterBeforeAndAfterHooks(v, "val", _.mustBeNumber,showsIntegerifForced);
    _.objSetterAfterHook(v,"isAnimating",animateDesu);
  })
  ((function resetMaxMinAndRange(){
    var v = MTL["variables"][objId];
    var max = defaultValues.variable.right;
    var min = defaultValues.variable.left;
    var range = max - min;
    return function(){
      if(right>left){
        max = right; min = left;
      }else{
        max = left; min = right;
      }
      range = max - min;
    }
  }),
  (function showsIntegerifForced(){
    if(MTL[t][objId].isInteger){
      return Math.round(RealMTL.oAccessors[t][objId].val());
    }else{
      return RealMTL.oAccessors[t][objId].val();
    }
  }),
  ((function makeAnimateDesu(){
    var increaseValue = function(){
      if(!MTL[t][objId].isAnimating){
        return
      }else{
        var increasement = 0.008 * MTL[t][objId].speed * (MTL[t][objId].max-MTL[t][objId].min);
        if(RealMTL.oAccessors[t][objId].val() > MTL[t][objId].max){
          MTL[t][objId].val = MTL[t][objId].min
        }else{
          MTL[t][objId].val = RealMTL.oAccessors[t][objId].val() + increasement;
        }
        _.requestAnimationFrame(increaseValue);
      }
    }
  }
  return function animateDesu(v){
    if(v) _.requestAnimationFrame(increaseValue);
  }
)());
};

var functionCustomization = function(){};

return {
  defaultValues: {
    variable : {
      right : 1, //max by default
      left : 0,  //min by default
      speed: 1,
      isInteger: false,
      isAnimating: false
    }
  },
  firstAvailableName: firstAvailableName,
  variableCustomization: variableCustomization,
  functionCustomization: functionCustomization
}

})());
