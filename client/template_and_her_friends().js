"use strict";

_.helpers(MTL.helpers);

Template.main.events({
    "click .creater": function(e) {
      MTL["make"+e.target.dataset.create]();
    }
});

Template.main.rendered = function() {
  MTL.GUI.makeEditor(this.find("#code"));
}

Template.variablePanel.events({
    "keyup [type=text]": _.timeOut(function(e){
        if(e.target.value)
          MTL.variables[this.id][e.target.dataset.key] = e.target.value;
      }),
    "click .checkbox": function(e){
      MTL.variables[this.id][e.target.dataset.key] = !MTL.variables[this.id][e.target.dataset.key] ;
    },
});

Template.variablePanel.rendered  = function(){
    var variableId = this.data.id;
    MTL.GUI.makeVariablePanel(variableId,{
        slider: this.find('.slider'),
        knob : this.find('.sliderKnob'),
        textfields: this.findAll('[type=text]'),
        checkboxes: this.findAll('.checkboxes')
    });
}
