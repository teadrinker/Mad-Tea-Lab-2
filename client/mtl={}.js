"use strict";

//preliminary
var defaultValues = {
  variable : {
    max : 1,
    min : 0,
    speed: 1,
    isInteger: false,
    isAnimating: false
  }
};

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

//MTL state initialization

window.MTL = {}; //You never get to meet the real MTL.
var RealMTL = {};
RealMTL.ObjsPrototypes = {
  variables: {
    singular: "Variable",
    obj: function(){
      this.name = firstAvailableName();
      this.id = null;
      this.val = null;
      this.max = defaultValues.variable.max;
      this.min = defaultValues.variable.min;
      this.speed = defaultValues.variable.speed;
      this.isInteger = defaultValues.variable.isInteger;
      this.isAnimating = defaultValues.variable.isAnimating;
    }
  },
  functions: {
    singular: "Function",
    obj: function(){
      this.name = firstAvailableName();
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
};
RealMTL.state = {
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

};
RealMTL.accessors = {};
RealMTL.mutators = {};
RealMTL.s = {}
RealMTL.trackers = {};
RealMTL.oTrackers = {};
RealMTL.oAccessors = {};
RealMTL.oMutators = {};
RealMTL.oIdCounters = {} //different id for different objects of a certain objType
RealMTL.oConstructors = {}; //based on RealMTL.ObjsPrototypes
RealMTL.oDestroyers = {};
var MTLTrackers = [];
var newTracker = function(){
    var t = new Tracker.Dependency;
    MTLTrackers.push(t);
    return t;
}
var allMTLTrackersDepend = function(){
    _.each(MTLTrackers,function(t){
        t.depend();
    })
}
//create tracker for each state variable:
_.each(RealMTL.state, function(value, key){
  if(! _.isObject(value)){
    console.log(value);
    //for ever state-value,
    //there exists a tracker, accessor & mutator
    RealMTL.trackers[key] = newTracker();
    RealMTL.accessors[key] = function(){
      RealMTL.trackers[key].depend();
      return RealMTL.state[key];
    }
    RealMTL.mutators[key] = function(value){
      RealMTL.state[key] = value;
      RealMTL.trackers[key].changed();
    }
    Object.defineProperty(MTL, key, { //virtual setter & getter for MTL
      get: function(){RealMTL.accessors[key]()},
      set: function(v){RealMTL.mutators[key](v)}
    });
  }else{
    //for every objType,
    //there exists an array of trackers, accessors, mutators, constructors, destroyers
    var t = key; //t denotes objType
    RealMTL.trackers[t] = newTracker();
    RealMTL.accessors[t] = function(){
      RealMTL.trackers[t].depend();
      return RealMTL.state[t]; //return all objects of a certain objType
    }
    RealMTL.oTrackers[t] = [];
    RealMTL.oAccessors[t] = [];
    RealMTL.oMutators[t] = [];
    RealMTL.oIdCounters[t] = 0;
    MTL[t] = []; // array for virtual MTL objects of type t
    RealMTL.oConstructors[t] = function(){
      RealMTL.trackers[t].changed();
      var newObj = _.new(RealMTL.ObjsPrototypes[t].obj, arguments);
      var objId = RealMTL.oIdCounters[t]++;
      newObj.id = objId;
      RealMTL.state[t].push(newObj);
      MTL[t].push({}); //pushed virtual MTL object
      RealMTL.oTrackers[t][objId] = {
        self: newTracker() //we start off with a tracker for the entire object
      };
      RealMTL.oAccessors[t][objId] = {
        self: function(){  //we start off with a self-accessor for the entire object
          RealMTL.oTrackers[t][objId].self.depend();
          return RealMTL.state[t][objId];
        }
      };
      Object.defineProperty(MTL[t][objId], "self", {
        get: function(){
          return RealMTL.oAccessors[t][objId].self()
        }
      });
      RealMTL.oMutators[t][objId] = {}
      //we now create individual trackers for every mutable key
      _.each(_.omit(newObj, ['id']), // id is not mutable
        function(whatever,key){
          RealMTL.oTrackers[t][objId][key] = newTracker();
          RealMTL.oAccessors[t][objId][key] = function(){
            RealMTL.oTrackers[t][objId][key].depend();
            return RealMTL.state[t][objId][key];
          }
          RealMTL.oMutators[t][objId][key] = function(newValue){
            RealMTL.state[t][objId][key] = newValue;
            RealMTL.oTrackers[t][objId][key].changed();
            RealMTL.oTrackers[t][objId].self.changed();
            //upon mutated, 2 trackers would be notified.
          }
          Object.defineProperty(MTL[t][objId], key, {
            get: function(){return RealMTL.oAccessors[t][objId][key]()},
            set: function(v){RealMTL.oMutators[t][objId][key](v)},
            configurable: true
          });
      });
      //reactively defined properties
      // and customization
      (function(){
        var range = defaultValues.variable.max - defaultValues.variable.min;
        _.each(["min","max"], function(key){
          Object.defineProperty(MTL[t][objId], key, {
            set: function(v){
              v = _.mustBeNumber(v);
              RealMTL.oMutators[t][objId][key](v);
              range = MTL[t][objId].max - MTL[t][objId].min;
            }});});
          Object.defineProperty(MTL[t][objId], "range",{
              get: function(){
                return range;
              }
          });
          Object.defineProperty(MTL[t][objId], "val", {
            set: function(v){
              v = _.mustBeNumber(v);
              // if(v>MTL[t][objId].max){
              //   MTL[t][objId].max = v
              // }else if(v<MTL[t][objId].min){
              //   MTL[t][objId].min = v
              // }
              RealMTL.oMutators[t][objId].val(v);
            },
            get: function(){
              if(MTL[t][objId].isInteger){
                return Math.round(RealMTL.oAccessors[t][objId].val());
              }else{
                return RealMTL.oAccessors[t][objId].val();
              }
            }
        });

      })();
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
    MTL["make"+RealMTL.ObjsPrototypes[t].singular] =  function(){
      RealMTL.oConstructors[t].apply(this,arguments)};
    MTL["kill"+RealMTL.ObjsPrototypes[t].singular] = function(id){
      RealMTL.oDestroyers[t](id)};
  }
});
MTL.helpers = RealMTL.accessors;
//extend helper:
MTL.helpers.stateDump = function(){
  allMTLTrackersDepend();
  return JSON.stringify(RealMTL.state, null, 2)
};

console.log("MTL initialized です!");
