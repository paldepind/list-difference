// a is old list, b is the new
exports.diff = function(opts) {
  var actions = [],
      aIdx = {},
      bIdx = {},
      a = opts.old,
      b = opts.cur,
      i, j;
  // Create a mapping from keys to their position in the old list
  for (i = 0; i < a.length; i++) {
    aIdx[opts.extractKey(a[i])] = i;
  }
  // Create a mapping from keys to their position in the new list
  for (i = 0; i < b.length; i++) {
    bIdx[opts.extractKey(b[i])] = i;
  }
  for (i = j = 0; i !== a.lenght && j !== b.length;) {
    var aElm = a[i], bElm = b[j];
    if (aElm === bElm) {
      // No difference, we move on
      i++; j++;
    } else if (aElm === null) {
      // This is a element that has been moved to earlier in the list
      i++;
    } else {
      // Look for the current element at this location in the new list
      // This gives us the idx of where this element should be
      var curElmInNew = bIdx[aElm];
      // Look for the the wanted elment at this location in the old list
      // This gives us the idx of where the wanted element is now
      var wantedElmInOld = aIdx[bElm];
      if (curElmInNew === undefined &&
          wantedElmInOld === undefined) {
        // Old element is not in new list, and new element is
        // not in old list. This mean it has been replaced
        //actions.push({type: 'replace', target: aElm, replacement: bElm});
        opts.replace(aElm, i, bElm);
        i++; j++;
      } else if (curElmInNew === undefined) {
        // Current element is not in new list, it has been removed
        opts.remove(i);
        i++;
      } else if (wantedElmInOld === undefined) {
        // New element is not in old list, it has been added
        opts.add(bElm, i);
        j++;
      } else {
        // Element is in both lists, it has been moved
        var distanceToWanted = wantedElmInOld - i,
            distToCurTarget = curElmInNew - j;
        if (distanceToWanted < distToCurTarget) {
          opts.move(i, i + (curElmInNew - j) + 1);
          a.splice(i + (curElmInNew - j) + 1, 0, aElm);
          i++;
        } else {
          console.log('move', wantedElmInOld, i);
          opts.move(wantedElmInOld, i);
          a[wantedElmInOld] = null;
          j++;
        }
      }
    }
  }
  return actions;
};
