let connected = false;
var connectionTime = Date.now();

var serverData;

try {

  connected = false;
  const socket = io("https://buildtosurvive-server.onrender.com");

  socket.on('connected',(data)=>{
    serverData = data;

    // run init code when they connect to server
    reloadGame();
    
    connected = true;
    connectionTime = -(connectionTime -= Date.now());
  });

  var players = [];
  var blayers = [];
  var displayedPlayers = [];

  socket.on('playerData', (data)=>{
    players = data;
    console.log(players);
    for(let i = 0; i < players.length; i++){
      if(players[i].pos == undefined) continue;
      players[i].vel = [0, 0, 0];
      if(displayedPlayers[players[i].pid] != undefined){
        players[i].bos = blayers[i].pos;
        players[i].vel[0] = (players[i].pos[0] - players[i].bos[0])/serverData.tickDelay;
        players[i].vel[1] = (players[i].pos[1] - players[i].bos[1])/serverData.tickDelay;
        players[i].vel[2] = (players[i].pos[2] - players[i].bos[2])/serverData.tickDelay;
        displayedPlayers[players[i].pid].rotation.y = players[i].r;
      } else {
        addPlayer(i);
      }
    }
    try{
      var data = {
        pos: [round(player.x,2),round(player.y,2),round(player.z,2)],
        r: Math.round(player.r),
        pid: socket.id
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
    displayedPlayers[players[i].pid] = new THREE.Mesh(geometry, material);
    try{
      displayedPlayers[players[i].pid].position.set(players[i].pos[0], 0, players[i].pos[2]);
    }catch(err){}
    scene.add(displayedPlayers[players[i].pid]);
  }

  
} catch(err){
  console.log(err);
}