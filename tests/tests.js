
var tokens = {
  number: /^-?[0-9]+\.?[0-9]*/,
  term: /^[\+|-]/,
  fact: /^[\*|/]/,
  w: /^[ ]/,
  func_def: /^def/,
  name: /^[a-zA-Z]+/,
  dot: /^\./,
  openP: /^\(/,
  closeP: /^\)/,
  comma: /^\,/,
  openB: /^\[/,
  closeB: /^\]/,
  assign: /^\=/,
};

var grammar = {
  "TERM": {rules:["TERM w? term w? FACT", "FACT"]},
  "FACT": {rules:["FACT w? fact w? number", "number"]},
  "PATH": {rules:["PATH dot name", "name"]},
  "ASSIGN": {rules:["PATH w? assign w? EXPR"]},
  "FUNC_PARAMS": {rules:["FUNC_PARAMS comma w? name", "name?"]},
  "FUNC_DEF": {rules:["func_def w name openP FUNC_PARAMS closeP"]},
  "COMMA_SEPARATED_EXPR": {rules:["COMMA_SEPARATED_EXPR comma w EXPR", "EXPR"]},
  "FUNC_CALL": {rules:["PATH openP FUNC_PARAMS closeP"]},
  "EXPR": {rules:["name comma EXPR", "openP EXPR closeP", "PATH openB EXPR closeB", "PATH", "TERM"]},
  "START": {rules: ["FUNC_CALL","ASSIGN", "EXPR", "FUNC_DEF"]}
};

var gram = EPEG.compileGrammar(grammar, tokens);

function parse(input) {
  var stream = EPEG.tokenize(input, tokens);
  return EPEG.parse(stream, gram);
}

function assertComplete(input, log) {
  var r = parse(input);
  var t = EPEG.tokenize(input, tokens);

  var msg = "Incomplete parsing on: " + input + ", leftover " + t.slice(r.consumed).map(function(i){return i.value;});

  QUnit.test( input, function( assert ) {
    assert.ok( r.complete, input );
  });
}

function assertIncomplete(input, log) {
  var r = parse(input);
  QUnit.test( input, function( assert ) {
    assert.ok( !r.complete, input );
  });
}


// test left recursion
assertComplete("1");
assertComplete("1 + 1");
assertComplete("1 + 1 - 1");
assertComplete("1 + 1 * 1 - 1 / 1 + 1");
assertIncomplete("1 + ");
assertIncomplete("+ 1");

// test right recursion
assertComplete("a,b,c,1");

// middle recursion
assertComplete("(0)");

assertComplete("abc.der[0][0]");

assertIncomplete("[0][0]");

assertComplete("abc");

// assign
assertComplete("abc=1");
assertComplete("abc = 1");
assertComplete("abc = abc[0]");
assertComplete("abc.der = 1");
assertComplete("abc.der.sdf=(1)");

// func definition
assertComplete("def func()");
assertComplete("def func(a, b)");


// func call
assertComplete("a.b.func()");
assertComplete("func()");
assertComplete("func(a, b)");
assertComplete("func(a, b, d, e)");

assertComplete("func(a,b, c)");
assertIncomplete("func(a,b,  c)");

assertIncomplete("func(a,b,c),");
assertIncomplete("func(a,b,c)1");

assertIncomplete("1 func(a)");

var grammar = {
  "TEST2": {rules:["openP"]},
  "TEST": {rules:["name comma TEST", "name comma"]},
  "EXPR": {rules:["number dot* name", "w number w number?"]},
  "START": {rules: ["EXPR", "TEST", "number comma TEST? comma", "TEST2* closeP"]}
};

var gram = EPEG.compileGrammar(grammar, tokens);

assertComplete("6.....hello");
assertComplete("6hello");
assertIncomplete("6.....6");

assertComplete(" 6 6");
assertComplete(" 6 ");
assertIncomplete(" 6 6 6");

assertComplete("test,test,hello,");

assertComplete("6,test,,");
assertIncomplete("6,test,");
assertComplete("6,,");

assertComplete("()");
assertComplete("((()");
assertComplete(")");
assertIncomplete("))");

