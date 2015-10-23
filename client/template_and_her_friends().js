"use strict"; 
var scaling = function(){
   
};

Template.main.events({
    'click .creater': function(e) { 
      MTL["make"+$(e.currentTarget).data().create]();
    }
});

Template.main.rendered = function() {
    
    var editor = CodeMirror.fromTextArea(this.find("#code"), {
        lineNumbers: true,
        mode: "javascript",
        theme: "blackboard",
    });
    var keydownTimer = false;
    editor.on("keydown",function(){
            clearTimeout(keydownTimer);
            keydownTimer = setTimeout(function(){
                MTL.code = editor.getValue();
            }, 300);    
        });
}

Template.main.helpers(MTL.helpers);