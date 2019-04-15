function packingWidth(rows, widths) {
  let total = widths.reduce( (carry, width) => carry + width );
  let adjustedWidth = (total%rows == 0) ? total : total+(rows-(total%rows));

  return widths.reverse().reduce((carry, width) => {
    carry.rowLen += width;
    if(carry.rowLen > carry.passWidth) {
      let before = carry.rowLen-width;
      if(before > carry.bestWidth)
        carry.bestWidth = carry.rowLen;
      carry.total -= before;
      // console.log(carry.bestWidth);
      // console.log(carry.passWidth)
      // console.log(carry.rowLen)
      // console.log(carry.rowLen+width)
      carry.rows--;
      carry.passWidth = ((carry.total%carry.rows == 0) ? carry.total : carry.total+(carry.rows-(carry.total%carry.rows)))/carry.rows;
      carry.rowLen = width;
      // console.log(carry.bestWidth);
    }
    return carry;
  }, {
    bestWidth: adjustedWidth/rows,
    total: widths.reduce( (carry, width) => carry + width ),
    rows: rows,
    passWidth: adjustedWidth/rows,
    rowLen: 0
  }).bestWidth;
}

//O(n^2)
function componentPacking(rows, widths) {
  widths = widths.slice();
  while(widths.length > rows) {
    let smallestPair = {
      pair: [],
      length: widths.reduce((total,width) => total+width)
    }
    for( let i=1 ; i < widths.length ; i++ ) {
      let length = widths[i-1]+widths[i];
      if(length < smallestPair.length) {
        smallestPair.pair = [i-1,i];
        smallestPair.length = length;
      }
    }
    widths.splice(smallestPair.pair[0], smallestPair.pair.length, smallestPair.length);
  }
  return widths.reduce((carry, width) => { return (width > carry) ? width : carry; }, 0);
}

function equalEnough(a,b,e) {
  return Math.abs(a-b) < e;
}

function greaterEnough(a,b,e) {
  return (a-b) > e;
}

function lesserEnough(a,b,e) {
  return (a-b) < -e;
}

//O(n^2) with componentPacking
function evenComponentPacking(rows, widths) {
  let epsilon = 0.00001;
  let totalWidth = widths.reduce((total,width) => total+width);

  let rowWidth = 0;
  let currWidth = 0;
  let cutStep = totalWidth/rows;

  return componentPacking(rows, widths.reduce((packedWidths, width) => {
    rowWidth += width;
    currWidth += width;

    if(equalEnough(currWidth,cutStep,epsilon)) {
      packedWidths.push(rowWidth);
      rowWidth = 0;
      cutStep = (totalWidth*(Math.floor((currWidth*rows)/totalWidth)+1))/rows;
    } else if(greaterEnough(currWidth,cutStep,epsilon)) {
      if(rowWidth != 0) {
        packedWidths.push(rowWidth-width);
      }
      packedWidths.push(width);
      rowWidth = 0;
      cutStep = (totalWidth*(Math.floor((currWidth*rows)/totalWidth)+1))/rows;
    }

    return packedWidths;
  }, []));
}

function packContainer() {
  let children = document.currentScript.parentElement.getElementsByTagName("span");
  let childrenWidths = [...children].map(element => element.offsetWidth);

  let lineHeight = children[children.length-1].offsetHeight;

  let rows = Math.floor(Math.abs((children[0].offsetTop-children[children.length-1].offsetTop))/lineHeight + 1);

  // let packWidth = packingWidth(rows,childrenWidths);
  // let packWidth = componentPacking(rows,childrenWidths);
  let packWidth = evenComponentPacking(rows,childrenWidths);
  packWidth += 20; //temp workaround

  return packWidth;
}
