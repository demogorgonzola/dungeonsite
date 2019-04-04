var width = 300;
var height = 300;

var pointGridDimensions = [10,10];
var spacing = 25;

var cardSize = 30;
var pointSize = 4;

var travelRate = 0.05;
var returnRate = 0.07;


function genPointGrid(dimensions , spacing) {
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
      Math.random()*bounds[0],
      Math.random()*bounds[1]
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

function dist(p1, p2) {
  let dx = p1[0]-p2[0];
  let dy = p1[1]-p2[1];
  return Math.sqrt((dx*dx) + (dy*dy));
}

//drift algorithms

//O(n^2),
function shortestPath(cards, points) {
  points = points.slice(); //shallow copy
  return cards.map(function(card) {
    let fd = this.dist(card,points[0]);
    let {point, index, dist} = points.reduce(function(shortest, point, index) {
      let dist = this.dist(card,point);
      if(dist < shortest.dist) {
        shortest.point = point;
        shortest.index = index;
        shortest.dist = dist;
      }
      return shortest;
    }, { point: points[0], index: 0, dist: fd});
    points.splice(index,1);
    return [card, point];
  });
}

//O(nlogn)
function gridSort(points, dimensions) {
  let xsort = points.slice().sort(function(a,b) { return a[0] - b[0]; });

  let grid = [];
  while(xsort.length > 0) {
    let ysort = xsort.splice(0,dimensions[1]).sort(function(a,b) { return a[1] - b[1]; });
    ysort.forEach(function(point) { grid.push(point); });
  }
  return grid;
}

function gridMorphMatch(cards, points, dimensions) {
  cards = gridSort(cards, dimensions);
  points = gridSort(points, dimensions);
  return cards.map(function(card, index) {
    let point = points[index];
    return [card, point];
  });
}


let dx = Math.floor((width-((pointGridDimensions[0]-1)*spacing))/2);
let dy = Math.floor((height-((pointGridDimensions[1]-1)*spacing))/2);
let points = translate(genPointGrid(pointGridDimensions,spacing),dx,dy); //center grid
let cards = translate(genRandomPoints(pointGridDimensions[0]*pointGridDimensions[1], [width-cardSize,height-cardSize]), cardSize/2, cardSize/2);

let usedAlgo = gridMorphMatch(cards, points, pointGridDimensions);


function toggle(...properties) {
  properties.forEach((property) => {
    let current = this[property];
    let toggles = this[property+"toggles"];
    current = toggles[ (current == toggles[0]) ? 1 : 0 ];
    this[property] = current;
  });
}

//graph setup
var elem = document.currentScript.parentElement;
var two = new Two({ width: width, height: height }).appendTo(elem);

let graph = usedAlgo.reduce((graph, pointpair) => {
  let card = two.makeRectangle(pointpair[0][0], pointpair[0][1], cardSize-5, cardSize);
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

graph.cards._ratetoggles = [ travelRate, returnRate ];
graph.cards.opacitytoggles = [ 1.0, 0.5 ];
graph.cards._rate = graph.cards._ratetoggles[0];
graph.cards.opacity = graph.cards.opacitytoggles[0];
graph.cards.toggle = toggle.bind(graph.cards, "_rate", "opacity");
graph.cards.waiting = 0;

graph.cards.fill = '#1DA1F2';
graph.cards.stroke = '#1D81F2';
graph.points.fill = '#FF8000';
graph.points.stroke = '#FF6000';

//run loop
two.bind('update', (frameCount) => {
  if(graph.cards.waiting == graph.cards.children.length) {
    graph.cards.toggle();
    for(let i=0; i<graph.cards.children.length; i++) {
      let card = graph.cards.children[i];
      card.toggle();
      card.waiting = false;
    }
    graph.cards.waiting = 0;
  }
  for(let i=0; i<graph.cards.children.length; i++) {
    let card = graph.cards.children[i];
    if(!card.waiting) {
      let dx = card._dest.x-card.translation.x;
      let dy = card._dest.y-card.translation.y;

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        card.waiting = true;
        graph.cards.waiting++;
      }

      card.translation.x += dx*graph.cards._rate;
      card.translation.y += dy*graph.cards._rate;
    }
  }
}).play();  // Finally, start the animation loop
