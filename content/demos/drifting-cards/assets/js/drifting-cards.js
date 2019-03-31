var width = 300;
var height = 300;

var pointGridDimensions = [4,4];
var spacing = 25;


var elem = document.currentScript.parentElement;
var two = new Two({ width: width, height: height }).appendTo(elem);

function genPointGrid(dimensions, spacing) {
  let grid = [];
  for(let xstep=0; xstep<dimensions[0]; xstep++) {
    for(let ystep=0; ystep<dimensions[1]; ystep++) {
      grid.push([xstep*spacing, ystep*spacing]);
    }
  }
  return grid;
}

function genRandomPoints(num, bounds) {
  let points = [];
  for(let i=0 ; i < num ; i++) {
    points.push([
      Math.floor(Math.random()*bounds[0]),
      Math.floor(Math.random()*bounds[1])
    ]);
  }
  return points;
}

function translate(points, dx, dy) {
  points.forEach(function(point) {
    point[0] += dx; point[1] += dy;
  });
  return points;
}


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

//card.length <= points.length
function driftingCards(cards, points) {
  //placeholder - randompairing
  return cards.map(function(card, index) {
    let point = points[index];
    return [card, point];
  });
}

function toggle(...properties) {
  properties.forEach((property) => {
    let current = this[property];
    let toggles = this[property+"toggles"];
    current = toggles[ (current == toggles[0]) ? 1 : 0 ];
    this[property] = current;
  });
}

//graph setup
let cardSize = 25;
let pointSize = 4;

let travelRate = 0.05;
let returnRate = 0.07;

let dx = (width-((pointGridDimensions[0]-1)*spacing))/2;
let dy = (height-((pointGridDimensions[1]-1)*spacing))/2;
let pointsK = translate(genPointGrid(pointGridDimensions,spacing),dx,dy); //center grid
//start here: start plugging the components above together to make random card to point grid animation
let cardsK = translate(genRandomPoints(pointGridDimensions[0]*pointGridDimensions[1], [width-15,height-15]), 15, 15);

let {cards, points} = driftingCards(cardsK,pointsK).reduce((graph, pointpair) => {
  let card = two.makeRectangle(pointpair[0][0], pointpair[0][1], cardSize, cardSize+5);
  let point = two.makeCircle(pointpair[1][0], pointpair[1][1], pointSize);
  card._desttoggles = [
    { x: point.translation.x, y: point.translation.y },
    { x: card.translation.x, y: card.translation.y }
  ];
  card._dest = card._desttoggles[0];
  card.toggle = toggle.bind(card, "_dest");
  card.waiting = false;
  graph.cards.add(card);
  graph.points.add(point);
  return graph;
}, { cards: two.makeGroup(), points: two.makeGroup() });

cards._ratetoggles = [ travelRate, returnRate ];
cards.opacitytoggles = [ 1.0, 0.5 ];
cards._rate = cards._ratetoggles[0];
cards.opacity = cards.opacitytoggles[0];
cards.toggle = toggle.bind(cards, "_rate", "opacity");
cards.waiting = 0;

cards.fill = '#1DA1F2';
cards.stroke = '#1D81F2';
points.fill = '#FF8000';
points.stroke = '#FF6000';

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
      let dx = card._dest.x-card.translation.x;
      let dy = card._dest.y-card.translation.y;

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        card.waiting = true;
        cards.waiting++;
      }

      card.translation.x += dx*cards._rate;
      card.translation.y += dy*cards._rate;
    }
  }
}).play();  // Finally, start the animation loop
