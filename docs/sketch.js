
const WIDTH = 800 ;
const HEIGHT = 800 ;

const ROAD_SCALE = 5;
const MINIMAP_SCALE = 0.05;

function vadd(a,b){
  return p5.Vector.add(a, b);
}
function vmult(a,b){
  return p5.Vector.mult(a, b);
}
function vsub(a,b){
  return p5.Vector.sub(a, b);
}

let kart;
let friend;


const defaultRoad = [[100,200],[150,150],[250,250],[300,200],[350,150],[365.5,179.5],[431,159],[496.5,138.5],[490.5,286],[550,413],[609.5,540],[291,450],[263,533],[119.5,593],[327,261],[127,367],[39.5,280],[50,250]]

class Road {
  constructor(){
    this.control_points = []
    for(let i=0; i < defaultRoad.length; i++){
      this.control_points.push(createVector(defaultRoad[i][0], defaultRoad[i][1]))
    }
    this.draw_points = []
    this.polygons = this.gen_road();
    this.shouldReDraw = true;
    this.drawn_verticies = [];
    console.log(this.polygons[0].length)
  }

  idx(i){
    return (i + this.control_points.length) % this.control_points.length;
  }

  get(i){
    const j = i * 3;
    const p = this.control_points;
    return [p[this.idx(j)], p[this.idx(j+1)], p[this.idx(j+2)], p[this.idx(j + 3)]]
  }

  getClosestPoint(loc){
    let closest_d = WIDTH;
    let closest_p = -1;
    for(let i= 0; i<this.draw_points.length; i++){
      const p = this.draw_points[i];
      const d = p5.Vector.dist(loc, p);
      if(d < closest_d){
        closest_p = i;
      }
    }
    return [closest_p, closest_d]
  }

  drawWithinRadius(){
    this.drawn_verticies = [];
    const zeropt = kart.pos;
    const RADIUS = 400;
    const verts = this.polygons[0];
    for(let i =0; i<verts.length-1; i+=8){
      const a = verts[i]
      const b = verts[i+1]
      const d1 = p5.Vector.dist(zeropt, a);
      const d2 = p5.Vector.dist(zeropt, b);
      if(d1 > RADIUS && d2 > RADIUS){
        // dont draw
      }else{
        this.drawn_verticies.push(a)
        this.drawn_verticies.push(b)
      }
    }
  }
  

  gen_bezier(){
    const output = [];
    const resolution = 1;
    const spacing = 2;
    let prev = this.control_points[0];
    output.push(prev);
    let dst = 0;
    for(let i=0; i < this.control_points.length; i++){
      const [p1, p2, p3, p4] = this.get(i);
      // just the unconnected points
      const open_length = (
        p5.Vector.dist(p1, p2) + 
        p5.Vector.dist(p2, p3) + 
        p5.Vector.dist(p3, p4) 
      );
      // if connected?
      const curve_length = p5.Vector.dist(p1, p4) + open_length;
      const divisions = curve_length * resolution * 0.2;
      let t = 0;
      while(t <= 1){
        t += 1.0 / divisions;
        const pt = mybezier.bcube(p1, p2, p3, p4, t);
        dst += p5.Vector.dist(prev, pt);
        while(dst >= spacing){
          const overshoot = dst - spacing;
          const _pspn = vsub(prev, pt).normalize().mult(overshoot);
          const newpt = vadd(pt, _pspn);
          output.push(newpt)
          dst = overshoot
          prev = newpt;
        }
        prev = pt;
      }
    }
    this.draw_points = output;
    return output;
  }

  gen_road(){
    const roadWidth = 25;
    const pts = this.gen_bezier();
    const verts = Array(pts.length * 2).fill(undefined);
    // the 2 is to bridge the gap from the last point to the first
    const tri = Array(2 * 3 * (pts.length-1) + 2).fill(undefined);
    let vindex = 0;
    let tindex = 0;
    for(let i=0; i<pts.length; i++){
      let forward = createVector(0, 0);
      if( i < pts.length - 1){
        forward.add(vsub(pts[i+1], pts[i]));
      }
      if(i > 0){
        forward.add(vsub(pts[i], pts[i-1]));
      }
      forward.normalize()
      const left = createVector(-forward.y, forward.x).mult(roadWidth * 0.5)
      verts[vindex] = vadd(pts[i], left)
      verts[vindex + 1] = vsub(pts[i], left)

      if(i < pts.length - 1){
        tri[tindex] = vindex;
        tri[tindex + 1] = vindex + 2;
        tri[tindex + 2] = vindex + 1;

        tri[tindex + 3] = vindex + 1;
        tri[tindex + 4] = vindex + 2;
        tri[tindex + 5] = vindex + 3;
      }
      tindex += 6;
      vindex += 2;
    }
    return [ verts, tri ]
  }

  update(){}

  draw(minimap = false, spacing=32){
    push();
    scale(ROAD_SCALE)
    if(!minimap){
      translate(-kart.pos.x, -kart.pos.y)
    } else {
      stroke(0)
      strokeWeight(50)
      const verts = this.polygons[0];
      beginShape(LINES)
      for(let i =0; i<verts.length-1; i+=16){
        const a = verts[i]
        const b = verts[i+1]
        vertex(a.x, a.y)
        vertex(b.x, b.y);
      }
      endShape()
    }
    translate(-15, -15)
    stroke(100)
    strokeWeight(50)
    const verts = this.polygons[0];
    beginShape(LINES)
    for(let i =0; i<verts.length-1; i+=spacing){
      const a = verts[i]
      const b = verts[i+1]
      vertex(a.x, a.y);
      vertex(b.x, b.y);
    }
    endShape()
    pop();
  }
}

class Car {
  constructor(x, y){
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0)
    this.acc = createVector(0, 0)
    this.angle = 0;
    this.w = 20;
    this.h = 40;
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
    if(dy != 0){
      this.has_inputted = true;
    }
    const MAX_ACCEL = 0.02;
    const TURN_ANGLE = 0.05;
    const BRAKE_MULT = 0.95
    const imp = createVector(0, 0)
    if(dy < 0){
      imp.add(createVector(0, dy)).mult(MAX_ACCEL);
    } else if(dy > 0){
      this.acc.mult(BRAKE_MULT)
      this.vel.mult(BRAKE_MULT)
    }
    if(dx != 0){ // turning
      this.angle += dx * TURN_ANGLE;
    }
    imp.rotate(this.angle);
    this.acc.add(imp);
    this.acc.limit(0.2);
  }

  move(){
    this.vel.add(this.acc);
    this.acc.mult(0.25);
    this.vel.limit(1)
    this.pos.add(this.vel);
    if(!this.has_inputted){
      // apply drag
      this.vel.mult(0.99);
    }
    this.has_inputted = false;
  }

  draw(){
    push()
    translate(this.pos.x, this.pos.y);
    rotate(this.angle)
    fill(255, 0, 100);
    rect(-this.w/2, -this.h/2, this.w, this.h)
    pop()
  }
}


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

let leftInterval = null;
let rightInterval = null;

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

  const rightbtn = document.getElementById('right');
  rightbtn.onclick = () => {
    kart.input(1, 0);
  }

  const leftbtn = document.getElementById('left');
  leftbtn.onclick = () => {
    kart.input(-1, 0);
  }
}

function setup(){
  createCanvas(WIDTH, HEIGHT);
  kart = new Car(100, 100);
  friend = new Car(100, 200);
  road = new Road();

  peerstuff()

}

function draw(){
  /*
  (19,109,21)
#117c13	(17,124,19)
#138510	(19,133,16)
#268b07	(38,139,7)
#41980a	(65,152,10)
   */
  background(38,133,7)
  handle_input();
  road.draw();

  kart.move();
  kart.draw();

  if(friend){
    push()
    translate(-kart.pos.x, -kart.pos.y)
    friend.move();
    friend.draw(true);
    pop();
  }

  push()
  scale(MINIMAP_SCALE)
  road.draw(true, 8);
  pop()
  // kart.draw(true);
}
