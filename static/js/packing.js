/*
packing.js - Efficient/Experimental Packing Algorithms
------------------------------------------------------
What is the most efficient width a container can pack it's elements under the
constraints that...
  - Elements are atomic
  - Elements retain their order
  - Container height is immutable
?

Algorithms under these conditions have the strong possibility of being greedy.
Reasoned since the first obvious, though aproximal solution, is to do a binary
search between the non-atomic optimal width and the given container width with
a non-decimal delta threshold (1px).

Notes:
- Some elements can surpass the given container width and will therefore
surpass the shortest possible width. This case only appears when the a screen
is too small to display a Element atomically. This can considered undefined
behavior, but making the algorithm more robust may be worthwhile.
- The number of rows under the given width, i.e. a function of height, is
present in all current solutions and may be integral all solution, but hasn't
been proven to be required.
 */

//epsilon equals
function equalEnough(a,b) {
  return Math.abs(a-b) < Number.EPSILON;
}

//epsilon greater-than
function greaterEnough(a,b) {
  return (a-b) > Number.EPSILON;
}

//epsilon lesser-than
function lesserEnough(a,b) {
  return (a-b) < -Number.EPSILON;
}

/**
 * extract the actual property number of a DOM element
 *
 * Note: used mostly to extract px values, super weak, needs a fix later
 *
 * @param  {DOM Element} element  DOM element
 * @param  {String}      property property of the DOM element
 * @return {Number}               DOM element property numerical value
 */
function extractPropertyNumber(element, property) {
  return parseFloat(
    window
    .getComputedStyle(element, null)
    .getPropertyValue(property)
    .match(/\d+/)
  );
}

/**
 * the minimum number of rows a collection of ordered widths can fit in given a
 * container width
 *
 * O(widths.length)
 *
 * @param  {Number[]} widths          widths of adjacent container widths
 * @param  {Number}   containerWidth  width of the container
 * @return {Number}                   the minimum number of rows
 */
function minRows(widths, containerWidth) {
  let rowWidth = 0;

  return widths.reduce((rows, width) => {
    rowWidth += width;
    if(rowWidth > containerWidth) {
      rows++;
      rowWidth = width;
    }
    return rows;
  }, 1);
}

/**
 * Binary search between the optimistic non-atomic width and the given
 * container width under a delta threshold of 1px.
 *
 * O(widths.length * log(containerWidth - optimisticWidth))
 * - optimisticWidth = sum(widths) / minRows(widths, containerWidth)
 *
 * Note:
 * This may be the fastest algorithm to find the the optimal packing width;
 * however, this is still aproximal. Though for anything practical this may be
 * the best choice.
 *
 * @param  {Number[]} widths              widths of adjacent container widths
 * @param  {Number}   containerWidth      width of the container
 * @param  {Number}   [deltaThreshold=1]  threshold when to stop seaching, in px
 * @return {Number}                       the minimum number of rows
 */

/**
 * [aproximalBinarySearch description]
 * @param  {[type]} widths             [description]
 * @param  {[type]} containerWidth     [description]
 * @param  {Number} [deltaThreshold=1] [description]
 * @return {[type]}                    [description]
 */
function aproximalBinarySearch(widths, containerWidth, deltaThreshold=1) {
  widths = widths.slice();
  let numRows = minRows(widths, containerWidth);
  let total = widths.reduce((total,width) => total+width);

  let optimisticWidth = total/numRows;

  let lastValid = containerWidth;
  let validityCheck = (position) => {
    let positionNumRows = minRows(widths, position) == numRows;
    if(positionNumRows) lastValid = position;
    return positionNumRows;
  }

  //binary search
  let left = optimisticWidth;
  let right = containerWidth;
  while(greaterEnough(right-left, deltaThreshold)) {
    let position = left+((right-left)/2);
    if(validityCheck(position)) right = position;
    else left = position;
  }

  return lastValid;
}

/**
 * Pack the given container backwards excluding the property that all elements
 * are atomic. This starts packing with the most optimistic container width and
 * grows it while incrementally accomodating the atomic element property.
 *
 * O(widths.length)
 *
 * Note:
 * There's nothing that packing this backwards solved compared to packing it
 * forward, they most likely will come out to be different, but still similar
 * and innaccurate results. Dividng the rows recursively after designating
 * a small subset of elements to the next bottom row has the problem of
 * producing an oversaturated top row since
 * the algorithm ends with the largest row almost always overflowing.
 *
 * @param  {Number[]} widths          widths of adjacent container elements
 * @param  {Number}   containerWidth  width of the container
 * @return {Number}                   new width of the container
 */
function optimisticBackwardsPack(widths, containerWidth) {
  widths = widths.slice(); //shallow copy for coolness
  let numRows = minRows(widths, containerWidth); //find height constraint

  let total = widths.reduce( (total, width) => total + width, 0);
  let rowLen = 0;

  //get best container width of all rows except the top row
  let bestWidth = widths.reverse().reduce((bestWidth, width) => {
    rowLen += width;
    //cut into own row if current row passes optimistic width
    if(greaterEnough(rowLen, total/numRows)) {
      let before = rowLen-width;
      if(greaterEnough(before, bestWidth))
        bestWidth = before;
      total -= before;
      numRows--;
      rowLen = width;
    }
    return bestWidth;
  }, total/numRows);
  //do last check on top row
  bestWidth = (rowLen > bestWidth) ? rowLen : bestWidth;

  return bestWidth;
}

/**
 * Find the smallest sum of adjacent pairs and concatenate them. Repeat until
 * there are a number of remaining elements, concatenated or otherwise, are
 * equal to the number of rows under the number of elements and given container
 * width.
 *
 * O(widths.length^2)
 *
 * Note:
 * There are problems with taking the greediest sum. Taking what is initially
 * the smallest sum can cause adjacent elements to be starved out of good
 * minimum candidates that can lead to overall shorter container widths between
 * the eventual concatenated "rows". It creates a sort of mountaining effect
 * from which the head and tail of each row can't be shifted into eventual
 * smaller "rows". Even if they were, the entire order would have to be
 * reordred non-trivally, meaning the initial ordering by the algorithm would
 * be entirely useless.
 *
 * @param  {Number[]} widths          widths of adjacent container elements
 * @param  {Number}   containerWidth  width of the container
 * @return {Number}                   new width of the container
 */
function minSumConcat(widths, containerWidth) {
  widths = widths.slice(); //shallow copy for coolness
  let numRows = minRows(widths, containerWidth); //find height constraint

  while(widths.length > numRows) { //widths.length-numRows => O(widths.length)
    //find smallest pair of widths
    let smallestPair = {
      pair: [],
      length: widths.reduce((total,width) => total+width)
    }
    for( let i=1 ; i < widths.length ; i++ ) { //O(widths.length)
      let length = widths[i-1]+widths[i];
      if(length < smallestPair.length) {
        smallestPair.pair = [i-1,i];
        smallestPair.length = length;
      }
    }
    //concat smallest pair of widths
    widths.splice(smallestPair.pair[0], 2, smallestPair.length);
  }

  // return the largest row
  return widths.reduce((maxWidth, width) => {
    return (width > maxWidth) ? width : maxWidth;
  }, 0);
}

/**
 * Divide elements into the maximum number of rows as if they were non-atomic.
 * Elements that exist in the same row that share no other rows are
 * concatenated. The remaining elements, concatenated or otherwise, are then
 * processed with minSumConcat.
 *
 * O(widths.length^2)
 *
 * Note:
 * The presuposition that the optimistic cut would put elements into their
 * natural rows is inaccurate. It mitigates some of the mountaining
 * minSumConcat was facing by sectioning off more candidates from each row, but
 * still has to be non-trivially reordred.
 *
 * @param  {Number[]} widths          widths of adjacent container elements
 * @param  {Number}   containerWidth  width of the container
 * @return {Number}                   new width of the container
 */
function optimisticMinSumConcat(widths, containerWidth) {
  widths = widths.slice(); //shallow copy for coolness
  let numRows = minRows(widths, containerWidth); //find height constraint

  let totalWidth = widths.reduce( //O(widths.length)
    (total,width) => total+width
  );

  let rowWidth = 0;
  let currWidth = 0;
  let cutStep = totalWidth/numRows;

  //concat all elements that share the same row and don't cross into other rows
  let packedWidths = widths.reduce((packedWidths, width) => { //O(widths.length)
    rowWidth += width;
    currWidth += width;
    /*
    if row is filled, move current concat row into packedWidths as well as
    element if it's between two rows
     */
    if(equalEnough(currWidth,cutStep)) { //no overflow row fill
      packedWidths.push(rowWidth);
      rowWidth = 0;
      cutStep = (totalWidth*(Math.floor((currWidth*numRows)/totalWidth)+1))/numRows;
    } else if(greaterEnough(currWidth,cutStep)) { //overflow row fill
      if(rowWidth != 0) { //overflow element shares more than two rows
        packedWidths.push(rowWidth-width);
      }
      packedWidths.push(width);
      rowWidth = 0;
      cutStep = (totalWidth*(Math.floor((currWidth*numRows)/totalWidth)+1))/numRows;
    }

    return packedWidths;
  }, []);

  return minSumConcat(packedWidths, containerWidth); //O(width.length^2)
}

/**
 * Divide elements into the maximum number of rows as if they were non-atomic.
 * Elements that exist in the same row that share no other rows are
 * concatenated. Elements that exist between multiple rows are inserted from
 * largest to smallest to it's smallest neighbor. If the neighbors are equal
 * size, then they are inserted as soon as another one neighbor becomes larger
 * than another. Effectively trying to even out the optimistic rows.
 *
 * O(widths.length^2)
 *
 * Note:
 * This is variant on the last iteration approaches the problem differently,
 * but the optimistic cut characteristic is now the primary problem. It still
 * can still have the tail or head of an optimistic row needing to be moved,
 * causing intial ordering of the algorithm to be useless.
 *
 * @param  {Number[]} widths          widths of adjacent container elements
 * @param  {Number}   containerWidth  width of the container
 * @return {Number}                   new width of the container
 */
function optimisticDependencyEvenFill(widths, containerWidth) {
  widths = widths.slice(); //shallow copy for coolness
  let numRows = minRows(widths, containerWidth); //find height constraint

  let totalWidth = widths.reduce((total,width) => total+width);

  containerWidth = totalWidth/numRows;

  let packedWidths = widths.reduce((pack, width) => {
    let widths = pack.widths;
    let splits = pack.splits;
    let rowWidth = widths[widths.length-1] + width;
    let prevSplit = pack.prevSplit;

    if(greaterEnough(prevSplit+rowWidth,containerWidth)) {
      widths.push(width);
      if(!equalEnough(prevSplit+rowWidth-width, containerWidth)) {
        splits.push(widths.length-1);
        widths.push(0);
      }
      pack.prevSplit = (prevSplit+rowWidth)%containerWidth;
    } else {
      widths[widths.length-1] = rowWidth;
    }

    return pack;
  }, {
    widths: [0],
    splits: [],
    prevSplit: 0
  });

  //fill
  let orderedSplits = packedWidths.splits.sort((a, b) => {
    return packedWidths.widths[a] - packedWidths.widths[b];
  }); //O(nlogn)

  //setup badSplits
  let badSplits = [];
  for(let i=0; i<packedWidths.widths.length; i++) {
    badSplits.push(false);
  }

  //fill according to dependency
  while(orderedSplits.length > 0) {
    let widthIndex = orderedSplits.shift();
    let left = packedWidths.widths[widthIndex-1];
    let right = packedWidths.widths[widthIndex+1];
    if(equalEnough(left,right)) {
      badSplits[widthIndex] = true;
    } else if(lesserEnough(left,right)) {
      packedWidths.widths[widthIndex-1] += packedWidths.widths[widthIndex];
      if(badSplits[widthIndex-2]) {
        orderedSplits.unshift(widthIndex-2);
        badSplits[widthIndex-2] = false;
      }
    } else {
      packedWidths.widths[widthIndex+1] += packedWidths.widths[widthIndex];
      if(badSplits[widthIndex+2]) {
        orderedSplits.unshift(widthIndex+2);
        badSplits[widthIndex+2] = false;
      }
    }
  };

  packedWidths.splits.reverse().forEach((index) => {
    packedWidths.widths.splice(index,1);
  });

  return packedWidths.widths.reduce((maxWidth, width) => {
    return (width > maxWidth) ? width : maxWidth;
  }, 0);
}

/**
 * Flood - Shift elements between adjacent rows until no previous row is larger
 *          than a given row in the set, where the elements must remain in
 *          left-to-right order.
 *
 * Even Variant - Shift elements between adjacent rows until no previous row,
 *                excluding it's tail-end element, is larger than a given row
 *                in the set, where elements must remain in left-to-right order.
 *
 * From a human perspective the flood algorithm is basically taking a "wall"
 * and remaking into an incline that ascends from left to right.
 *
 * The variant aims to "even" the flood by changing how this incline is viewed.
 * Instead of making a row taller relative to the previous row, it's made
 * taller relative to the previous row excluding it's tail-end or "highest"
 * element. That way each adjacent pair is evened out from left-to-right.
 *
 * O(widths.length^2)
 *
 * Note: In the context of finding the most efficient packing width, this
 * suffers from only ever observing adjacent rows. There can be massive drift
 * between non-adjacent rows, where pushing down elements that create a larger
 * row between an adjacent pair can create a smaller maximum row between all
 * rows in the set.
 *
 * @param  {Array}    widths          widths of adjacent container elements
 * @param  {Number}   containerWidth  width of the container
 * @return {Number}                   new width of the container
 */
function evenFlood(widths, containerWidth) {
  widths = widths.slice(); //shallow copy for coolness
  let numRows = minRows(widths, containerWidth); //find height constraint

  //construct potential rows
  let rows = [];
  for(let i=0; i<numRows; i++) {
    rows.push({
      widths: [],
      length: 0
    });
  }
  rows[0].widths = widths;
  rows[0].length = widths.reduce((total,item) => total+item); //O(widths.length)

  let rowIndex = 0;
  while(rowIndex >= 0) { //complexity: O(n^2)
    let row = rows[rowIndex];
    let lastElement = row.widths[row.widths.length-1];
    let nextRow = rows[rowIndex+1];

    //why do if statement breaks have to look so ugly
    if( !nextRow ||
        !lastElement ||
        lesserEnough(row.length-lastElement, nextRow.length)
      ) {
      rowIndex--;
    } else {
      let move = row.widths.pop();
      row.length -= move;
      nextRow.widths.unshift(move);
      nextRow.length += move;
      rowIndex += ((rowIndex+1 == rows.length-1) ? 0 : 1);
    }
  }

  return rows.reduce(function(max, row) {
    return (max < row.length) ? row.length : max;
  }, 0);
}

/**
 * evenFlood(), but with an awareness of non-adjacent row "eveness".
 * This algorithm attempts to create a stable row config, then break the config
 * to favor deconstructing the longest row, and repeat the process until there
 * are no more breaks that can yield a shorter container width.
 *
 * O(n^2)
 *
 * @param  {array[float]} widths          widths of adjacent container elements
 * @param  {float}        containerWidth  width of the container
 * @return {float}                        new width of the container
 */
function chipperEvenFlood(widths, containerWidth) {
  widths = widths.slice(); //shallow copy for coolness
  let numRows = minRows(widths, containerWidth);

  let rows = [];
  for(let i=0; i<numRows; i++) {
    rows.push({
      widths: [],
      length: 0
    });
  }
  rows[0].widths = widths;
  rows[0].length = widths.reduce(function(total,item) {
    return total+item;
  }, 0);

  let rowIndex = 0;
  while(rowIndex >= 0) { //O(widths.length^2)
    //evenFlood()
    while(rowIndex >= 0) { //O(widths.length^2)
      let row = rows[rowIndex];
      let lastElement = row.widths[row.widths.length-1];
      let nextRow = rows[rowIndex+1];

      //why do if statement breaks have to look so ugly
      if( !nextRow ||
          !lastElement ||
          lesserEnough(row.length-lastElement, nextRow.length)
        ) {
        rowIndex--;
      } else {
        let move = row.widths.pop();
        row.length -= move;
        nextRow.widths.unshift(move);
        nextRow.length += move;
        rowIndex += ((rowIndex+1 == rows.length-1) ? 0 : 1);
      }
    }

    /*
    A combination between last element of the previous row and a row is taken
    to potentially break stability, if there exists a smaller container width.
    The smallest combination is taken to allows us to explore all possible
    breaks without creaking unbreakable future peaks.
    Note: Exploring all breaks may be inefficient, explore further.
     */
    let longestIndex = rows.reduce((max, row, index) => { //O(widths.length)
      return (rows[max].length < row.length) ? index : max;
    }, 0);
    //the least pair must be shorter than the longest row
    let least = {
      pair: null,
      length: rows[longestIndex].length
    };
    //find least pair under the longest row
    for(let i=longestIndex+1; i<rows.length; i++) { //O(widths.length)
      let length = rows[i-1].widths[rows[i-1].widths.length-1]+rows[i].length;
      if(length < least.length) {
        least.pair = [i-1,i];
        least.length = length;
      }
    }
    if(least.pair) {
      let row = rows[least.pair[0]];
      let nextRow = rows[least.pair[1]];
      let move = row.widths.pop();
      row.length -= move;
      nextRow.widths.unshift(move);
      nextRow.length += move;
      rowIndex = least.pair[(least.pair[1] == rows.length-1) ? 0 : 1];
    }
  }

  //return largest row in configuration
  return rows.reduce(function(max, row) {
    return (max < row.length) ? row.length : max;
  }, 0);
}

/**
 * Extract and normalize the container and it's elements from the document,
 * then pack the container using a packing method and set contianers width to
 * the packing width.
 * @param  {Object}   container         DOM Object of the container
 * @param  {Function} widthPackerMethod packing method
 */
function pack(container, widthPackerMethod) {
  container.style.width = "";

  let children = container.getElementsByTagName("span");

  let childrenWidths = [...children].map(element => {
    let childWidth = element.getBoundingClientRect().width;
    let childMargin = extractPropertyNumber(element, 'margin-left') +
                      extractPropertyNumber(element, 'margin-right');
    return childWidth + childMargin;
  });

  let containerPadding =  extractPropertyNumber(container, 'padding-left') +
                          extractPropertyNumber(container, 'padding-right');

  let packWidth = widthPackerMethod(
    childrenWidths,
    container.getBoundingClientRect().width-containerPadding
  );

  container.style.width = (packWidth + containerPadding)+"px";
}

/**
 * execute the default packing function on all containers with the "packing"
 * class tag
 * @param  {Object} event the resize event
 */
function repackAll(event) {
  let containers = document.getElementsByClassName("packing");

  [...containers].forEach((container) => {
    pack(container, chipperEvenFlood); //default: chipperEvenFlood
  });
}

//this only works when the script is at the bottom of the file
//valid hack, use it if you dont want jumpy layout on load
repackAll();


//repackscreen is resized
if(!packingResizeTimer) {
  var packingResizeTimer;
}
window.addEventListener("resize", function(e) {
  clearTimeout(packingResizeTimer);
  packingResizeTimer = setTimeout(repackAll, 100); //default: 100
});
