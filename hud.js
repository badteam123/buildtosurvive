let hudsprites = {};

function defineImages() {
    hudsprites.heart = hudsprites.image.get(1, 1, 256, 256);
}

let hudElements = {
    healthbar: {
        x:50,
        y:50,
        size:{x:200,y:20}
    },
    resources: {
        x:30,
        y:100
    }
}

function hud(){
    
    clear();

    textSize(16);
    textAlign(CENTER,CENTER);

    if(player.health.current < 0) player.health.current = 0;
    player.health.shown = lerp(player.health.shown,player.health.current,.2);

    noStroke();

    //

    let hb = hudElements.healthbar;

    fill(50);
    rect(hb.x-5,hb.y+5,hb.size.x,hb.size.y);

    stroke(1);
    fill(0);
    rect(hb.x,hb.y,hb.size.x,hb.size.y);

    fill(255,0,0);
    if(round(player.health.shown,2) != round(player.health.current,2)) fill(155,0,0);
    rect(hb.x,hb.y,(player.health.shown/player.health.max)*hb.size.x,hb.size.y);

    if(player.health.current < player.health.max/3){
        text("❤️",hb.x+hb.size.x+19+Math.random()*2,hb.y+9+Math.random()*2)
    } else{
        text("❤️",hb.x+hb.size.x+20,hb.y+10)
    }

    //

    let r = player.resources;
    let rd = hudElements.resources;

    fill(255);
    noStroke();
    textAlign(LEFT,TOP)
    textSize(26);

    text(`🪵 ${r.wood}\n🪨 ${r.stone}\nConnected? ${server.data.online} - ${server.data.time}ms\nFPS: ${Math.round(smoothFps * 10) / 10}`,rd.x,rd.y);

    //

    fill(0);
    circle(window.innerWidth / 2, window.innerHeight / 2, 2 )

}