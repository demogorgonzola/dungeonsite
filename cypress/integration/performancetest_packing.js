describe('My First Test', function() {
  it('Does not do much!', function() {
    cy.visit('localhost:1313/dnds/teem');
    let time = 35; //sec
    let widthDefault = 1000;
    let heightDefault = 660;
    let widthMin = 500;
    let widthMax = 1000;
    let width = widthDefault;
    let direction = -1;
    let increment = 100;
    for(let d=0; d<time; d++) {
      width += (increment*direction);
      if( (direction == -1 && width <= widthMin) ||
          (direction == 1 && width >= widthMax) ) {
        direction *= -1;
      }
      cy.viewport(width, heightDefault);
      cy.wait(1000) //1sec;
    }
  })
})
