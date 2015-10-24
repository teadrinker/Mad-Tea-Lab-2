"use strict";

window.sliderWidth = 140;
window.knobWidth = 20;

window.MTL.GUI = {};


var makeReactiveValue = function(dom,objectType,objectId,key,transformation){
  Tracker.autorun(function(){
    var x = MTL[objectType][objectId][key];
    dom.value = transformation(x);
  });
}
var makeReactiveStyle = function(dom,style,objectType,objectId,key,transformation){
  Tracker.autorun(function(){
    var x = MTL[objectType][objectId][key];
    dom.style[style] = transformation(x);
  });
}
var makeReactiveChecked = function(dom,objectType,objectId,key){
  Tracker.autorun(function(){
    var x = MTL[objectType][objectId][key];
    dom.checked = x;
  });
}

//variable panel

var valToKnobPosition = function(val,slider,variableId){
  if(val <= MTL.variables[variableId].min){
      return slider.lowerBound;
    }
  if(val >= MTL.variables[variableId].max){
      return slider.upperBound;
  }
  var knobPosition = (val/MTL.variables[variableId].range) * slider.range;
  return knobPosition;
}
var normalizeVal = function(val,variableId){
  if(val){
    if(val < MTL.variables[variableId].min){
      return MTL.variables[variableId].min
    }else if(val > MTL.variables[variableId].max){
      return  MTL.variables[variableId].max
    }
    return val;
  }else{
    return  MTL.variables[variableId].min;
  }
}

var slider = function(dom,variableId){
  var self = this;
  var mouseStartingPosition,
      knobPosition,
      variableStartingValue;
  window.mdiBindInput(dom,{onInput: function(id,data,state){
    if(state==="start"){
      mouseStartingPosition = data.x;
      variableStartingValue = normalizeVal(MTL.variables[variableId].val,variableId);
      knobPosition = valToKnobPosition(variableStartingValue,self,variableId);
    }else{
      //console.log(data.x,mouseStartingPosition,knobPosition);
      var moved = data.x - mouseStartingPosition;
      var futurePosition = moved + knobPosition;
      if(futurePosition <= self.lowerBound){
        MTL.variables[variableId].val = MTL.variables[variableId].min;
      }else if(futurePosition >= self.upperBound){
        MTL.variables[variableId].val = MTL.variables[variableId].max;
      }else{
        var valueIncreased = (moved/self.range) * MTL.variables[variableId].range;
        MTL.variables[variableId].val = variableStartingValue + valueIncreased;
      }
    }
  }});
}
slider.prototype.upperBound = window.sliderWidth-window.knobWidth;
slider.prototype.lowerBound = 0;
slider.prototype.range = slider.prototype.upperBound - slider.prototype.lowerBound;
//this should be designed reactively using defineProperty set & get (in the same way as how variables range is designed). But this implementation suffices for now.

var makeSlider = function(){
  var instance = _.new(slider,arguments);
  return instance;
}

var makeVariablePanel = function(variableId,domsObject){
  var slider =  makeSlider(domsObject["slider"] ,variableId);
  makeReactiveStyle(domsObject["knob"],"left","variables",variableId,"val",function(x){
    return valToKnobPosition(x,slider,variableId) + "px"
  });
  _.each(domsObject["textfields"], function(dom){
    makeReactiveValue(dom,"variables",variableId,dom.dataset.key,function(x){ return x;})
  });
  _.each(domsObject["checkboxes"], function(dom){
    makeReactiveChecked(dom,"variables",variableId,dom.dataset.key);
  });
}

var makeEditor = function(dom){
  var editor = CodeMirror.fromTextArea(dom, {
      lineNumbers: true,
      mode: "javascript",
      theme: "blackboard",
  });;
  editor.on("keydown",_.timeOut(function(){
      MTL.code = editor.getValue();
  }));
  return editor;
}

window.MTL.GUI.makeVariablePanel = function(){
  makeVariablePanel.apply(this,arguments);
}

window.MTL.GUI.makeEditor = function(){
  makeEditor.apply(this,arguments);
}
