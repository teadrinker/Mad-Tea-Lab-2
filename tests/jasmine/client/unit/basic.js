describe("underscore mixins", function() {
  it("tests functions in _.mixin().js", function() {
    expect(_.capitalize("neko-chan")).toBe("Neko-chan");
    expect(_.capitalize("Jesus")).toBe("Jesus");
    expect(_.cartesianProduct([1,2],['a','b'])).toEqual(
        [[1,'a'],[1,'b'],[2,'a'],[2,'b']]);
    expect(_.cartesianStringProduct([1,2],['a','b'])).toEqual(
        ['1a','1b','2a','2b']);
    expect(_.cartesianProduct([],[])).toEqual([]);
    expect(_(0).recursiveCompose(function(n){console.log(n); return n*n},[])(2),
        4);
    expect(_(1).recursiveCompose(function(n){console.log(n); return n*n},[])(2),
         8);
    expect(_(2).recursiveCompose(function(n){console.log(n); return n*n},[])(2),
        16);
    expect(_(3).recursiveCompose(function(n,x){console.log(n,x); return n*x},[2])(3),
        48);
    expect(_.nNamePool(1,['meow','cat','nyan','desu'])).toEqual(
        ['meowmeow','meowcat','meownyan','meowdesu','catmeow','catcat','catnyan','catdesu','nyanmeow','nyancat','nyannyan','nyandesu','desumeow','desucat','desunyan','desudesu']);

  });
});