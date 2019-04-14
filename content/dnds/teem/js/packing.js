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
    console.log(widths);
    widths.splice(smallestPair.pair[0], smallestPair.pair.length, smallestPair.length);
  }
  console.log(widths);
  return widths.reduce((carry, width) => { return (width > carry) ? width : carry; }, 0);
}

function evenComponentPacking(rows, widths) {
  let epsilon = 0.0001;

  widths = widths.slice();

  let evenCut = widths.reduce((total,width) => total+width)/rows;

  let packWidths = [];
  let rowLen = 0;
  let effLen = 0;
  for(let i=0; i<widths.length; i++) {
    let width = widths[i];
    if(effLen+width - evenCut > epsilon) {
      if(rowLen != 0) {
        packWidths.push(rowLen);
      }
      if(effLen+width - evenCut > epsilon) {
        packWidths.push(width);
        rowLen = 0;
      } else {
        rowLen = width;
      }

      effLen = effLen+width-evenCut;
    } else {
      rowLen += width;
      effLen += width;
    }
  }
  if(rowLen != 0) {
    packWidths.push(rowLen);
  }

  return componentPacking(rows, packWidths);
}

function packContainer() {
  let children = document.currentScript.parentElement.getElementsByTagName("span");
  let childrenWidths = [...children].map(element => element.offsetWidth);

  let rows = 3;
  // let packWidth = packingWidth(rows,childrenWidths);
  // let packWidth = componentPacking(rows,childrenWidths);
  let packWidth = evenComponentPacking(rows,childrenWidths);

  console.log(childrenWidths);
  console.log(packWidth);

  //temp workaround
  packWidth += 10;

  return packWidth;
}
