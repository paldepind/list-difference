// a is old list, b is the new
exports.diff = function(opts) {
  var actions = [],
      aIdx = {},
      bIdx = {},
      a = opts.old,
      b = opts.cur,
      key = opts.extractKey,
      i, j;
  // Create a mapping from keys to their position in the old list
  for (i = 0; i < a.length; i++) {
    aIdx[key(a[i])] = i;
  }
  // Create a mapping from keys to their position in the new list
  for (i = 0; i < b.length; i++) {
    bIdx[key(b[i])] = i;
  }
  for (i = j = 0; i !== a.length || j !== b.length;) {
    var aElm = a[i], bElm = b[j];
    if (aElm === null) {
      // This is a element that has been moved to earlier in the list
      i++;
    } else if (b.length <= j) {
      // No more elements in new, this is a delete
      opts.remove(i);
      i++;
    } else if (a.length <= i) {
      // No more elements in old, this is an addition
      opts.add(bElm, i);
      j++;
    } else if (key(aElm) === key(bElm)) {
      // No difference, we move on
      i++; j++;
    } else {
      // Look for the current element at this location in the new list
      // This gives us the idx of where this element should be
      var curElmInNew = bIdx[key(aElm)];
      // Look for the the wanted elment at this location in the old list
      // This gives us the idx of where the wanted element is now
      var wantedElmInOld = aIdx[key(bElm)];
      if (curElmInNew === undefined) {
        // Current element is not in new list, it has been removed
        opts.remove(i);
        i++;
      } else if (wantedElmInOld === undefined) {
        // New element is not in old list, it has been added
        opts.add(bElm, i);
        j++;
      } else {
        // Element is in both lists, it has been moved
        opts.move(wantedElmInOld, i);
        a[wantedElmInOld] = null;
        j++;
      }
    }
  }
  return actions;
};
