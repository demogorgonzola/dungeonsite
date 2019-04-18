//epsilon equality funcs
function equalEnough(a,b) {
  return Math.abs(a-b) < Number.EPSILON;
}

function greaterEnough(a,b) {
  return (a-b) > Number.EPSILON;
}

function lesserEnough(a,b) {
  return (a-b) < -Number.EPSILON;
}

//quick extract
function extractPropertyValue(element, property) {
  return parseFloat(window.getComputedStyle(element, null).getPropertyValue(property).match(/\d+/));
}

//Pack the given number of rows backwards
//O(n)
//Incorrect, suffers from local peaking
function backwardsWidthPacker(rows, widths) {
  let total = widths.reduce( (carry, width) => carry + width );
  let passWidth = total/rows;
  let rowLen = 0;

  return widths.reverse().reduce((bestWidth, width) => {
    rowLen += width;
    if(rowLen > passWidth) {
      let before = rowLen-width;
      if(before > bestWidth)
        bestWidth = rowLen;
      total -= before;
      rows--;
      passWidth = total/rows;
      rowLen = width;
    }
    return bestWidth;
  }, passWidth);
}

/**
 *  Widths are imagined to be individual rows. A pair of "rows" with the
 *  smallest sum is concatenated until the desired number of rows is
 *  reached, yieldling the smallest widths each row can be.
 *
 * O(widths.length^2)
 *
 * Note:
 * suffers from local peaking since these are adjacent sums (greedy), causing
 * there to be much larger summed peaks that don't shift smaller widths to
 * adjacent "rows" that have available space as the algorithm progresses.
 *
 * @param  {array[int]} widths  widths of adjacent container elements
 * @param  {int}        rows    rows in container
 * @return {int}                minimum container width
 */
function minSumWidthPacker(widths, rows) {
  widths = widths.slice(); //local copy of widths
  while(widths.length > rows) { //widths.length-rows => O(widths.length)
    //find smallest pair of widths
    let smallestPair = {
      pair: [],
      length: widths.reduce((total,width) => total+width)
    }
    for( let i=1 ; i < widths.length ; i++ ) { //widths.length => O(widths.length)
      let length = widths[i-1]+widths[i];
      if(length < smallestPair.length) {
        smallestPair.pair = [i-1,i];
        smallestPair.length = length;
      }
    }
    //concat smallest pair of widths
    widths.splice(smallestPair.pair[0], 2, smallestPair.length);
  }

  console.log(widths);
  // return the smallest possible container size (i.e. the biggest smallest row width )
  return widths.reduce((maxWidth, width) => { return (width > maxWidth) ? width : maxWidth; }, 0);
}


/**
 *  Widths are imagined to be logically already placed in rows if fall
 *  in one of the evenly cut rows. If a row lies on divider if could go
 *  either way. The smallest sums between the undecided widths and logical
 *  rows are decided, yeilding the smallest sums of each row.
 *
 * O(widths.length^2)
 *
 * Note:
 * This solved the problem of minSumWidthPacker. By making packaged widths
 * that are logically close and smaller than or equal to the minimum row
 * length, the sum of undecided widths and rows produce the global minimum
 * for each row given, reducing the container width to it's true minimum width.
 *
 * @param  {array[int]} widths  widths of adjacent container elements
 * @param  {int}        rows    rows in container
 * @return {int}                minimum container width
 */
function evenedMinSumWidthPacker(widths, rows) {
  let totalWidth = widths.reduce((total,width) => total+width);

  let rowWidth = 0;
  let currWidth = 0;
  let cutStep = totalWidth/rows;

  let packedWidths = widths.reduce((packedWidths, width) => {
    rowWidth += width;
    currWidth += width;

    if(equalEnough(currWidth,cutStep)) {
      packedWidths.push(rowWidth);
      rowWidth = 0;
      cutStep = (totalWidth*(Math.floor((currWidth*rows)/totalWidth)+1))/rows;
    } else if(greaterEnough(currWidth,cutStep)) {
      if(rowWidth != 0) {
        packedWidths.push(rowWidth-width);
      }
      packedWidths.push(width);
      rowWidth = 0;
      cutStep = (totalWidth*(Math.floor((currWidth*rows)/totalWidth)+1))/rows;
    }

    return packedWidths;
  }, []);

  console.log(totalWidth/rows);
  console.log(packedWidths);

  return minSumWidthPacker(packedWidths, rows); //O(width.length^2)
}

function pack(container, widthPackerMethod) {
  container.style.width = "";

  let children = container.getElementsByTagName("span");

  let childrenWidths = [...children].map(element => {
    let childWidth = element.getBoundingClientRect().width;
    let childMargin = extractPropertyValue(element, 'margin-left') +
                      extractPropertyValue(element, 'margin-right');
    return childWidth+childMargin;
  });

  let containerPadding =  extractPropertyValue(container, 'padding-left') +
                          extractPropertyValue(container, 'padding-right');


  let rows = childrenWidths.reduce((carry,width) => {
    carry.rowWidth += width;
    if(carry.rowWidth > carry.containerWidth) {
      carry.rows++;
      carry.rowWidth = width;
    }
    return carry;
  }, {
    rows: 1,
    rowWidth: 0,
    containerWidth: container.getBoundingClientRect().width-containerPadding,
  }).rows;

  console.log(childrenWidths);

  let packWidth = widthPackerMethod(childrenWidths, rows);

  container.style.width = (packWidth + containerPadding)+"px";
}

function repackAll(event) {
  let containers = document.getElementsByClassName("packing");

  [...containers].forEach((container) => {
    pack(container, evenedMinSumWidthPacker);
  });
}

//this only works when the script is at the bottom of the file
//valid hack, use it if you dont want jumpy layout on load
repackAll();

window.addEventListener("resize", repackAll);
