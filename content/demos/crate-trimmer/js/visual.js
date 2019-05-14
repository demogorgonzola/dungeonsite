
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
