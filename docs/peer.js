
const peername = document.getElementById('peername');

class P {
  constructor() {
    this.peer = new Peer();
    this.myid = null;
    this.peer_id = null;
    this.conn = null;
    this.peer.on("open", this.open);
    this.peer.on("connection", this.connection);
  }

  open(id) {
    console.log("recieved our id", id);
    p.myid = id;
    myid.innerHTML = id;
  }

  send_car(c){
    c.send({
      'move': kart.json(),
    })
    window.setTimeout(() => this.send_car(c), 25)
  }

  connect_to(peer) {
    console.log("Connecting to: ", peer);
    const c = this.peer.connect(peer);
    c.on("open", () => {
      c.on("data", data => {
        console.log("re data", data);
      });
      this.send_car(c);
    });
  }

  connection(conn) {
    console.log("got connection from", conn.peer);
    if (p.peer_id != null) {
      return;
    }
    peername.innerHTML = conn.peer;
    p.peer_id = conn.peer;
    p.connect_to(conn.peer);
    conn.on("open", () => {
      conn.on("data", data => {
        // console.log("recieved", data);
        const event = Object.keys(data);
        proccess_conn_event(event[0], data[event])
      });
      conn.on("error", err => {
        console.log("error", err);
      });
      conn.send("hi from" + p.myid);
    });
  }
}

function proccess_conn_event(evt, data) {
  // console.log("got new event", evt, data)
  switch (evt) {
    case "map":
    case "move":
      friend.unjson(data);
      friend.move();
      break;
  }
}
