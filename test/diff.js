var assert = require('assert');
var diff = require('../index.js').diff;

var diff1 = function(a, b, opts) {
  var opts = opts || {};
  var actions = [];
  var extr = function(v) {
    return v;
  };
  var replace = function(elm, i, newElm) {
    actions.push({type: 'replace', target: a[i], replacement: newElm});
  };
  var move = function(from, to) {
    actions.push({type: 'move', elm: a[from], before: a[to]});
  };
  var add = function(elm, i) {
    actions.push({type: 'add', elm: elm, before: a[i]});
  };
  var remove = function(i) {
    actions.push({type: 'remove', elm: a[i], before: a[i+1]});
  };
  diff({
    old: a,
    cur: b,
    extractKey: opts.extr || extr,
    add: add, move: move, remove: remove, replace: replace,
  });
  return actions;
};

describe('diff', function() {
  it('handles unchanged lists', function() {
    var a = ['a', 'f', 'b', 'c', 'd', 'e', 'g'];
    var actions = diff1(a, a);
    assert.equal(actions.length, 0);
  });
  it('handles replacements', function() {
    var a = ['a', 'AH', 'b', 'c', 'd', 'e', 'g'];
    var b = ['a', 'UH', 'b', 'c', 'd', 'e', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 2);
    assert.deepEqual(
      actions, [
      {type: 'remove', elm: 'AH', before: 'b'},
      {type: 'add', elm: 'UH', before: 'b'},
    ]);
  });
  it('handles added elements', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'g'];
    var b = ['a', 'b', 'UH', 'c', 'd', 'e', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 1);
    assert.deepEqual(
      actions[0],
      {type: 'add', elm: 'UH', before: 'c'}
    );
  });
  it('can add elements to end', function() {
    var a = ['a'];
    var b = ['a', 'b', 'c'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 2);
    assert.deepEqual(
      actions, [
      {type: 'add', elm: 'b', before: undefined},
      {type: 'add', elm: 'c', before: undefined},
    ]);
  });
  it('handles added elements to empty list', function() {
    var a = [];
    var b = ['a', 'b', 'c'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 3);
    assert.deepEqual(
      actions, [
      {type: 'add', elm: 'a', before: undefined},
      {type: 'add', elm: 'b', before: undefined},
      {type: 'add', elm: 'c', before: undefined},
    ]);
  });
  it('handles removed elements', function() {
    var a = ['a', 'b', 'AH', 'c', 'd', 'e', 'g'];
    var b = ['a', 'b', 'c', 'd', 'e', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 1);
    assert.deepEqual(
      actions[0],
      {type: 'remove', elm: 'AH', before: 'c'}
    );
  });
  it('finds elements moved forward', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = ['a', 'f', 'b', 'c', 'd', 'e', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 1);
    assert.deepEqual(
      actions[0],
      {type: 'move', elm: 'f', before: 'b'}
    );
  });
  it('swaps elements', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = ['a', 'f', 'c', 'd', 'e', 'b', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 4);
    assert.deepEqual(
      actions, [
      {type: 'move', elm: 'f', before: 'b'},
      {type: 'move', elm: 'c', before: 'b'},
      {type: 'move', elm: 'd', before: 'b'},
      {type: 'move', elm: 'e', before: 'b'},
    ]);
  });
  it('finds elments moved backwards', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = ['a', 'c', 'd', 'e', 'f', 'b', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 4);
    assert.deepEqual(
      actions, [
      {type: 'move', elm: 'c', before: 'b'},
      {type: 'move', elm: 'd', before: 'b'},
      {type: 'move', elm: 'e', before: 'b'},
      {type: 'move', elm: 'f', before: 'b'},
    ]);
  });
  it('another test case', function() {
    var a = ['a', 'c', 'e', 'd', 'f', 'b', 'g'];
    var b = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 2);
    assert.deepEqual(
      actions, [
      {type: 'move', elm: 'b', before: 'c'},
      {type: 'move', elm: 'd', before: 'e'},
    ]);
  });
  it('handles reversed list', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = a.slice(0).reverse();
    var actions = diff1(a, b);
    assert.equal(actions.length, a.length - 1);
    assert.deepEqual(
      actions, [
      { type: 'move', elm: 'g', before: 'a' },
      { type: 'move', elm: 'f', before: 'a' },
      { type: 'move', elm: 'e', before: 'a' },
      { type: 'move', elm: 'd', before: 'a' },
      { type: 'move', elm: 'c', before: 'a' },
      { type: 'move', elm: 'b', before: 'a' }
    ]);
  });
  it('handles completely shuffled list', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = ['d', 'e', 'a', 'g', 'b', 'c', 'f'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 3);
    assert.deepEqual(
      actions, [
      {type: 'move', elm: 'd', before: 'a'},
      {type: 'move', elm: 'e', before: 'a'},
      {type: 'move', elm: 'g', before: 'b'},
    ]);
  });
  it('handles another completely shuffled list', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = ['f', 'g', 'd', 'e', 'a', 'b', 'c'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 4);
    assert.deepEqual(
      actions, [
      {type: 'move', elm: 'f', before: 'a'},
      {type: 'move', elm: 'g', before: 'a'},
      {type: 'move', elm: 'd', before: 'a'},
      {type: 'move', elm: 'e', before: 'a'},
    ]);
  });
  it('handles shuffled list with adds and removes', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = ['f', 'x', 'd', 'e', 'y', 'a', 'b', 'c'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 6);
    assert.deepEqual(
      actions, [
      {type: 'move', elm: 'f', before: 'a'},
      {type: 'add', elm: 'x', before: 'a'},
      {type: 'move', elm: 'd', before: 'a'},
      {type: 'move', elm: 'e', before: 'a'},
      {type: 'add', elm: 'y', before: 'a'},
      {type: 'remove', elm: 'g', before: undefined},
    ]);
  });
  it('handles multiple items moved back', function() {
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    var b = ['c', 'd', 'e', 'f', 'a', 'b', 'g'];
    var actions = diff1(a, b);
    assert.equal(actions.length, 4);
    assert.deepEqual(
      actions, [ // This is suboptimal :(
      { type: 'move', elm: 'c', before: 'a' },
      { type: 'move', elm: 'd', before: 'a' },
      { type: 'move', elm: 'e', before: 'a' },
      { type: 'move', elm: 'f', before: 'a' },
    ]);
  });
  it('uses key extractor', function() {
    var a = [{val: 'a'}, {val: 'b'}, {val: 'c'}];
    var b = [{val: 'c'}, {val: 'b'}, {val: 'a'}];
    var actions = diff1(a, b, {
      extr: function(v) { return v.val; },
    });
    assert.equal(actions.length, 2);
    assert.deepEqual(
      actions, [
      { type: 'move', elm: {val: 'c'}, before: {val: 'a'} },
      { type: 'move', elm: {val: 'b'}, before: {val: 'a'} },
    ]);
  });
});
