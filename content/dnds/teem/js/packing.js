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

function packContainer() {
  let children = document.currentScript.parentElement.getElementsByTagName("span");
  let childrenWidths = [...children].map(element => element.offsetWidth);

  let rows = 3;
  let packWidth = packingWidth(rows,childrenWidths);

  console.log(childrenWidths);
  console.log(packWidth);
}
