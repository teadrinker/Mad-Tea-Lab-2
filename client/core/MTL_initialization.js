"use strict";

var __MTL__ = window.__MTL__;

window.MTL = (function(
  ObjsPrototypes,
  MTLState,
){
var virtualMTL = {};
var RealMTL = {
  ObjsPrototypes : MTLObjsPrototypes,
  state : MTLState,
  accessors : {},
  mutators : {},
  trackers : {},
  oTrackers : {},
  oAccessors : {},
  oMutators : {},
  oIdCounters : {}, //different id for different objects of a certain objType
  oConstructors : {}, //based on ObjsPrototypes
  oDestroyers : {}
};
_.each(RealMTL.state, function(value, key){
  if(! _.isObject(value)){
    //console.log(value);
    RealMTL.trackers[key] = _.newTracker();
    RealMTL.accessors[key] = function(){
      RealMTL.trackers[key].depend();
      return RealMTL.state[key];
    }
    RealMTL.mutators[key] = function(value){
      RealMTL.state[key] = value;
      RealMTL.trackers[key].changed();
    }
    _.objGetter(virtualMTL,key,RealMTL.accessors[key]);
    _.objSetter(virtualMTL,key,RealMTL.mutators[key]);
  }else{
    var t = key; //t denotes objType
    RealMTL.oIdCounters[t] = 0;
    RealMTL.trackers[t] = _.newTracker();
    RealMTL.accessors[t] = function(){
      RealMTL.trackers[t].depend();
      return RealMTL.state[t]; //return an array
    }
    RealMTL.oTrackers[t] = [];
    RealMTL.oAccessors[t] = [];
    RealMTL.oMutators[t] = [];
    virtualMTL[t] = [];
    RealMTL.oConstructors[t] = function(){
      RealMTL.trackers[t].changed();
      var newObj = _.new(RealMTL.ObjsPrototypes[t].obj, arguments);
      var objId = RealMTL.oIdCounters[t]++;
      newObj.id = objId;
      RealMTL.state[t].push(newObj);
      virtualMTL[t].push({});
      RealMTL.oTrackers[t][objId] = {
        self: _.newTracker() //a tracker for the entire object
      };
      RealMTL.oAccessors[t][objId] = {
        self: function(){  //a self-accessor for the entire object
          RealMTL.oTrackers[t][objId].self.depend();
          return RealMTL.state[t][objId];
        }
      };
      _.objGetter(virtualMTL[t][objId], "self", RealMTL.oAccessors[t][objId].self);
      RealMTL.oMutators[t][objId] = {};
      _.each(_.omit(newObj, ['id']),
      //individual trackers for every mutable key (except for id)
        function(whatever,key){
          RealMTL.oTrackers[t][objId][key] = _.newTracker();
          RealMTL.oAccessors[t][objId][key] = function(){
            RealMTL.oTrackers[t][objId][key].depend();
            return RealMTL.state[t][objId][key];
          }
          RealMTL.oMutators[t][objId][key] = function(newValue){
            RealMTL.state[t][objId][key] = newValue;
            RealMTL.oTrackers[t][objId][key].changed();
            RealMTL.oTrackers[t][objId].self.changed();
          }
          _.objGetter(virtualMTL[t][objId],key,RealMTL.oAccessors[t][objId][key]);
          _.objSetter(virtualMTL[t][objId],RealMTL.oMutators[t][objId][key]);
          _.objIsConfigurable(virtualMTL[t][objId]);
          if(t==="variables") __MTL__.variableCustomization();
      });
    };

    RealMTL.oDestroyers[t] = function(id){
      RealMTL.trackers[t].changed();
      // Objects tracker would be notified when one of the objects is created or killed, which is to say, RealMTL.trackers[t] would be called (reactively).
      // However, an object would not know when it is been killed :(
      _.map([
          RealMTL.oTrackers[t],
          RealMTL.oAccessors[t],
          RealMTL.oMutators[t],
          RealMTL.oState[t]
      ], function(a){delete a[objId]});
    };
    //virtual object constructor, destroyer for MTL:
    virtualMTL["make"+RealMTL.ObjsPrototypes[t].singular] =  function(){
      RealMTL.oConstructors[t].apply(this,arguments)};
    virtualMTL["kill"+RealMTL.ObjsPrototypes[t].singular] = function(id){
      RealMTL.oDestroyers[t](id)};
  }
});
virtualMTL.helpers = RealMTL.accessors;
//extend helper:
virtualMTL.helpers.stateDump = function(){
  _.allMTLTrackersDepend();
  return JSON.stringify(RealMTL.state, null, 2)
};

console.log("MTL initialized です!");
return virtualMTL;

})(
  (function MTLObjsPrototypes(){
    return {
      variables: {
        singular: "Variable",
        obj: function(){
          this.name = __MTL__.firstAvailableName();
          this.id = null;
          this.val = null;
          this.right = __MTL__.defaultValues.variable.right;
          this.left = __MTL__.defaultValues.variable.left;
          this.speed = __MTL__.defaultValues.variable.speed;
          this.isInteger = __MTL__.defaultValues.variable.isInteger;
          this.isAnimating = __MTL__.defaultValues.variable.isAnimating;
        }
      },
      functions: {
        singular: "Function",
        obj: function(){
          this.name = __MTL__.firstAvailableName();
          this.id = null;
          this.expression = null;
          this.moveX = 0;
          this.moveY = 0;
          this.scaleX = 1;
          this.scaleY = 1;
          this.graphStyle = "default";
          this.isDisplayed = false;
        }
      },
      points: {
        singular: "Point",
        obj: function(x,y){
          this.id = null;
          this.x = x;
          this.y = y;
        }
      }
    }
  })(),
  (function MTLState(){
    return {
      variables : [],
      functions : [],
      points : [],
      //sounds: [],
      code: "",
      codeGraphPercentage: 50,
      codeLogPercentage: 21,
      isCodeHidden: false,
      isCodeAutoRunning: true,
      positionX: 0,
      positionY: 0,
      scaleX: 0,
      scaleY: 0,
      qualityOverride: 0,
      infinityPositive: 0,
      infinityNegative: 0,
      infinityWarp: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
    }
  })()
})
