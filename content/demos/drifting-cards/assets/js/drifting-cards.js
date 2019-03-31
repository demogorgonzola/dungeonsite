var elem = document.currentScript.parentElement;
var two = new Two({ width: 300, height: 300 }).appendTo(elem);

//random point generator placeholder
function genRandomPointPairs(num, padding=0) {
  let pairs = [];
  for(let i=0 ; i < num ; i++) {
    let pair = [[],[]];
    pair[0][0] = padding+Math.floor(Math.random()*(two.width-(padding*2)));
    pair[0][1] = padding+Math.floor(Math.random()*(two.height-(padding*2)));
    pair[1][0] = padding+Math.floor(Math.random()*(two.width-(padding*2)));
    pair[1][1] = padding+Math.floor(Math.random()*(two.height-(padding*2)));
    pairs.push(pair);
  }
  return pairs;
}

function driftingCards(cards, points) {
  return genRandomPointPairs(20,20);
}

//graph setup
let cardSize = 20;
let pointSize = 4;

let travelRate = 0.01;
let returnRate = 0.07;

let [cards, points] = driftingCards().reduce((cardpoints, pointpair) => {
  let card = two.makeRectangle(pointpair[0][0], pointpair[0][1], cardSize, cardSize+5);
  let point = two.makeCircle(pointpair[1][0], pointpair[1][1], pointSize);
  card._toggledestx = [point.translation.x, card.translation.x];
  card._toggledesty = [point.translation.y, card.translation.y];
  card._toggled = false;
  card.destx = card._toggledestx[0];
  card.desty = card._toggledesty[0];
  card.toggle = function() {
    this._toggled = !this._toggled;
    this.destx = this._toggledestx[(this._toggled ? 1 : 0)];
    this.desty = this._toggledesty[(this._toggled ? 1 : 0)];
  }
  card.waiting = false;
  cardpoints[0].add(card); cardpoints[1].add(point);
  return cardpoints;
},[two.makeGroup(), two.makeGroup()]);

cards._togglerates = [ travelRate, returnRate ];
cards._toggleopacity = [ 1.0, 0.5 ];
cards._toggled = false;
cards.rate = cards._togglerates[0];
cards.opacity = cards._toggleopacity[0];
cards.toggle = function() {
  this._toggled = !this._toggled;
  this.rate = this._togglerates[(this._toggled ? 1 : 0)];
  this.opacity = this._toggleopacity[(this._toggled ? 1 : 0)];
}
cards.waiting = 0;

cards.fill = '#1DA1F2';
points.fill = '#FF8000';

//run loop
two.bind('update', (frameCount) => {
  if(cards.waiting == cards.children.length) {
    cards.toggle();
    for(let i=0; i<cards.children.length; i++) {
      let card = cards.children[i];
      card.toggle();
      card.waiting = false;
    }
    cards.waiting = 0;
  }
  for(let i=0; i<cards.children.length; i++) {
    let card = cards.children[i];
    if(!card.waiting) {
      let dx = card.destx-card.translation.x;
      let dy = card.desty-card.translation.y;

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        card.waiting = true;
        cards.waiting++;
      }

      card.translation.x += dx*cards.rate;
      card.translation.y += dy*cards.rate;
    }
  }
}).play();  // Finally, start the animation loop
