const socket = io("https://buildtosurvive-server.onrender.com"); // https://buildtosurvive-server.onrender.com

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
  beginHost(id){
    if(server.data.id === null){
      if(server.data.hosting === false){ // retrieve data for hosting/tell server
        console.log("👋🏼 Requesting to host...");
        socket.emit("host",server);
        server.data.hosting = true;
      } else { // if theres actual data for hosting
        server.data.id = id;
        console.log("👍🏼 Server accepted, you're live!\n"+window.location.href+"?gameid="+server.data.id);
      }
    } else {
      console.log("🙌🏼 Already in a server!\n"+window.location.href+"?gameid="+server.data.id);
    }
  },
  joinHost(){
    server.data.id = gameId;
    console.log("Joined "+gameId);
  }
};

socket.on("hostData",server.beginHost);

socket.on("joinData",server.joinHost);


try {

  connected = false;
  // i changed the url so it doesnt use ur data | oh no 0.000069 cents

  socket.on('connected',(data)=>{
    serverData = data;

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
        players[i].vel[0] = (players[i].pos[0] - players[i].bos[0])/serverData.tickDelay;
        players[i].vel[1] = (players[i].pos[1] - players[i].bos[1])/serverData.tickDelay;
        players[i].vel[2] = (players[i].pos[2] - players[i].bos[2])/serverData.tickDelay;
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