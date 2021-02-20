
const WIDTH = 400 ;
const HEIGHT = 400 ;


class Car {
  constructor(x, y){
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0)
    this.acc = createVector(0, 0)
    this.angle = 0;
    this.w = 10;
    this.h = 20;
  }

  vec2json(v){
    return [v.x, v.y];
  }
  json2vec(j){
    return createVector(j[0], j[1]);
  }

  json(){
    return JSON.stringify({
      pos: this.vec2json(this.pos),
      vel: this.vec2json(this.vel),
      acc: this.vec2json(this.acc),
      angle: this.angle,
    });
  }

  unjson(data){
    const obj = JSON.parse(data);
    this.pos = this.json2vec(obj['pos'])
    this.vel = this.json2vec(obj['vel'])
    this.acc = this.json2vec(obj['acc'])
    this.angle = obj['angle']
  }

  input(dx, dy){
    const MAX_ACCEL = 0.05;
    const TURN_ANGLE = 0.05;
    const imp = createVector(0, dy).mult(MAX_ACCEL);
    if(dx != 0){ // turning
      this.angle += dx * TURN_ANGLE;
    }
    imp.rotate(this.angle);
    this.acc.add(imp);
    this.acc.limit(1);
  }

  move(){
    this.vel.add(this.acc);
    this.acc.mult(0.25);
    this.vel.limit(5)
    this.pos.add(this.vel);
  }

  draw(){
    push()
    translate(this.pos.x, this.pos.y);
    rotate(this.angle)
    fill(190, 160, 100);
    rect(-this.w/2, -this.h/2, this.w, this.h)
    pop()
  }
}

let kart;
let friend;


function handle_input(){
  let dx = 0;
  let dy = 0;
  if(keyIsDown(LEFT_ARROW)){
    dx = -1;
  }
  if(keyIsDown(RIGHT_ARROW)){
    dx = 1;
  }
  if(keyIsDown(UP_ARROW)){
    dy = -1;
  }
  if(keyIsDown(DOWN_ARROW)){
    dy = 1;
  }
  kart.input(dx, dy);
}

//////////////////////

let p = null;
let peerIdSpan = null;
function peerstuff(){
  peerIdSpan = document.getElementById('myid');
  myinput = document.getElementById('myinput');
  p = new P();
  const button = document.getElementById("joinbtn");
  button.onclick = () => {
    p.connect_to(myinput.value)
  }
}

function setup(){
  createCanvas(WIDTH, HEIGHT);
  kart = new Car(100, 100);
  friend = new Car(100, 200);

  peerstuff()

}

function draw(){
  background(150);
  handle_input();

  kart.move();
  kart.draw();

  friend.move();
  friend.draw();
}
