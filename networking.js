const socket = io("https://84461452-e99f-471d-85af-cf8da788e100-00-2v1cea0xylvt5.worf.replit.dev/"); // https://buildtosurvive-server.onrender.com

const url = new URLSearchParams(window.location.search);
var gameId = url.get('gameid');
if(gameId != undefined){
  console.log("Requesting to join..."); // price_descending
  socket.emit("join",gameId)
}


var server = {
  data: {
    online:false,
    hosting:false,
    time: Date.now(),
    id: null
  },
  beginHost(){
    if(server.data.id === null){
      console.log("👋🏼 Requesting to host...");
      socket.emit("host",server);
      server.data.hosting = true;
    } else {
      console.log("🙌🏼 Already in a server!\n"+window.location.href+"?gameid="+server.data.id);
    }
  },
  joinHost(serverData){
    if(server.data.hosting === false){
      server.data.id = serverData.id;
    } else {
      server.data.id = socket.id;
    }
    console.log("Joined "+server.data.id);
  }
};

socket.on("joinData",server.joinHost);

socket.on("reqServerData", (requester) => {
  console.log("Someone wants your data lol");
  serverData = {
    id: socket.id,
    seed: world.seed
  };
  socket.emit("sendServerData",requester,serverData);
});


try {

  connected = false;
  // i changed the url so it doesnt use ur data | oh no 0.000069 cents

  socket.on('connected',(data)=>{
    masterServerData = data;

    // run init code when they connect to server
    
    server.data.online = true;
    server.data.time = -(server.data.time - Date.now());
  });

  var players = [];
  var blayers = [];
  var displayedPlayers = [];

  socket.on('playerData', (data)=>{
    players = data;
    //console.log(players);
    for(let i in players){
      //console.log(i);
      if(players[i].pos == undefined) continue;
      players[i].vel = [0, 0, 0];
      if(displayedPlayers[i] != undefined){
        players[i].bos = blayers[i].pos;
        players[i].vel[0] = (players[i].pos[0] - players[i].bos[0])/masterServerData.tickDelay;
        players[i].vel[1] = (players[i].pos[1] - players[i].bos[1])/masterServerData.tickDelay;
        players[i].vel[2] = (players[i].pos[2] - players[i].bos[2])/masterServerData.tickDelay;
        displayedPlayers[i].rotation.y = players[i].r;
      } else {
        addPlayer(i);
      }
    }
    try{
      var data = {
        pos: [round(player.x,2),round(player.y,2),round(player.z,2)],
        r: Math.round(player.r),
      };
      socket.emit('myPlayerData',data);
    } catch(err){
      console.log(err);
    }
    blayers = players;
  });

  socket.on('removePlayer', removePlayer);
  
  function removePlayer(pid){
    console.log("Removed Player");
    scene.remove(displayedPlayers[pid]);
    delete displayedPlayers[pid];
  }

  function addPlayer(i){
    console.log("added");
    // If the player object doesn't exist yet, create it and add it to the scene
    let geometry = new THREE.BoxGeometry(.6, 1.8, .6);
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    displayedPlayers[i] = new THREE.Mesh(geometry, material);
    try{
      displayedPlayers[i].position.set(players[i].pos[0], 0, players[i].pos[2]);
    }catch(err){}
    scene.add(displayedPlayers[i]);
  }

  
} catch(err){
  console.log(err);
}