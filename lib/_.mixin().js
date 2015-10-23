"use strict"; 

_.mixin({
  capitalize: function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  },
  cartesianProduct : function(){
    return _.reduce(arguments, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
  },
  cartesianStringProduct : function(){
    return _.reduce(arguments, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x+y;
            });
        }), true);
    }, [ [] ]);
  },
  // compose a function n times
  // normalize the fn such that it only takes 1 argument
  // would be nice if we have currying. 
  recursiveCompose: function(n,fn,args){
    var fn_ = function(arg0){
      var args_ = args.slice();
      args_.unshift(arg0);
      return  fn.apply(this,args_);
    };
    var composed = fn_; 
    _(n).times(function(){ 
      composed = _.compose(composed,fn_) 
    });
    return composed;
  },
  nNamePool: function(n, namePool){
    if(n>0){
      return _.recursiveCompose((n-1),_.cartesianStringProduct,[namePool])(namePool);
    }else{
      return namePool;
    }
  }
});