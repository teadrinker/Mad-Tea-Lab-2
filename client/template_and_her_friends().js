"use strict";

var variablePanels = [];
var functionPanels = {};

_.helpers(MTL.helpers);


Template.main.events({
    "click .creater": function(e) {
      MTL["make"+e.target.dataset.create]();
    },
    "click .hideCode": function(){
      MTL.GUI.events.hideCode()
    },
    "click .showCode": function(){
      MTL.GUI.events.showCode()
    }
});

Template.main.rendered = function() {
  var self = this;
  MTL.GUI.initialize($);
  MTL.GUI.makeEditor(this.find("#code"));
  Tracker.autorun(function(){
    var VARs = MTL.helpers.variables();
    variablePanels.forEach(function(VAR){
      Blaze.remove(VAR);
    });
    VARs.forEach(function(VAR){
        console.log(self.find(".variablePanel"));
      Blaze.renderWithData(Template.variablePanel, VAR, self.find(".variablePanel"));
    });
  });
  // Blaze.render(Blaze.Each(function(){
  //   var VARs = MTL.helpers.variables();
  //   VARs.forEach(function(e,i){
  //     if(e === undefined) VARs[i] = {no:true}
  //   });
  //   console.log(VAR)
  //   return VARs;
  // },function(){
  //   var data = Template.currentData();
  //   if(data.no){
  //     return undefined;
  //   }else{
  //     return Blaze.With(Template.currentData(), function () { return Template.variablePanel; });
  //   }
  // }),self.find(".variablePanel"));
}

Template.variablePanel.events({
    "keyup [type=text]": _.timeOut(function(e){
        if(e.target.value)
          MTL.variables[this.id][e.target.dataset.key] = e.target.value;
      }),
    "click .checkbox": function(e){
      MTL.variables[this.id][e.target.dataset.key] = !MTL.variables[this.id][e.target.dataset.key] ;
    },
    "click .delete": function(e){
      MTL.killVariable(this.id);
    }
});

Template.variablePanel.rendered  = function(){
    var variableId = this.data.id;
    console.log(this);
    variablePanels.push(this.view);
    MTL.GUI.makeVariablePanel(variableId,{
        slider: this.find('.slider'),
        knob : this.find('.sliderKnob'),
        textfields: this.findAll('[type=text]'),
        checkboxes: this.findAll('.checkboxes')
    });
}
