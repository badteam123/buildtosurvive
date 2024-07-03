let hudsprites = {};

var clr;
var a = 0;

var buildMenu = {
    open: false,
    tab: 0,
    selection: 0,
    selectionName: "core",
    dampen: 1,
    lerp: 0,
    items: [
        { name: "core", cost: { wood: 100, stone: 100, gold: 100 }, tex: { x: 16 + (48 * 3), y: 16 + (48 * 0) } }
    ]
};

const unlocks = [
    [
        { name: "wall", cost: { wood: 5, stone: 0, gold: 0 }, tex: { x: 16 + (48 * 4), y: 16 + (48 * 0) } },
    ],
    [

    ]
] // theres a reason for this that i need to talk to you about just add every build here for now pls


function defineImages() {
    hudsprites.heart = hudsprites.image.get(1, 1, 256, 256);
}

let hudElements = {
    healthbar: {
        x: 500,
        y: 50,
        size: { x: 500, y: 10 }
    }
}


function hud() {

    clear();

    textSize(16);
    textAlign(CENTER, CENTER);

    if (player.health.current < 0) player.health.current = 0;
    player.health.shown = lerp(player.health.shown, player.health.current, .2);

    noStroke();

    //

    let hb = hudElements.healthbar;

    fill(50);
    rect(hb.x - 5, hb.y + 5, hb.size.x, hb.size.y);

    stroke(1);
    fill(0);
    rect(hb.x, hb.y, hb.size.x, hb.size.y);

    fill(255, 0, 0);
    if (round(player.health.shown, 2) != round(player.health.current, 2)) fill(155, 0, 0);
    rect(hb.x, hb.y, (player.health.shown / player.health.max) * hb.size.x, hb.size.y);

    //

    let r = player.resources;

    fill(255);
    noStroke();
    textAlign(LEFT, CENTER)
    textSize(26);

    text(`Connected? ${server.data.online} - ${server.data.time}ms\nFPS: ${Math.round(smoothFps * 10) / 10}`, 100, 100);

    //

    hb = hudElements.healthbar;
    hb.x = window.innerWidth/2 - hb.size.x/2;
    hb.y = window.innerHeight-120;

    textSize(26);
    clr = color(50, 50, 50, 200);
    fill(clr);
    rect((window.innerWidth/2)-300, window.innerHeight-100, 600, 100);
    fill(210);
    rect((window.innerWidth/2)-290, window.innerHeight-90, 80, 80);
    rect((window.innerWidth/2)-200, window.innerHeight-90, 80, 80);
    fill(255);
    //cant easily add resources... not like we're gonna have a lot but we should consider making it easier by doing text with a for(in) statement
    text(`${r.wood.i} ${r.wood.a}\n${r.stone.i} ${r.stone.a}\n${r.gold.i} ${r.gold.a}`, (window.innerWidth/2)+100, window.innerHeight-95, 600, 100)

    textSize(16);

    if (buildMenu.open) {
        buildMenu.dampen = lerp(buildMenu.dampen, 0, 0.01 * deltaTime);
    } else {
        buildMenu.dampen = lerp(buildMenu.dampen, 1, 0.01 * deltaTime);
    }

    if (buildMenu.dampen < 0.98) {
        translate(-(buildMenu.dampen) * 320, 0);
        noStroke();
        clr = color(50, 50, 50, 200);
        fill(clr);
        rect(0, 0, 300, window.innerHeight);
        translate(0, ((height / 2) - 300));

        clr = color(50, 50, 50, 200);
        let i = 0;
        for (let item in buildMenu.items) {
            translate(0, -buildMenu.lerp * 50);
            fill(clr);
            if (buildMenu.selection == i) {
                fill(80, 150, 80);
            }
            rect(5, 5 + i * 50, 290, 40);
            fill(255);
            text(buildMenu.items[item].name, 15, 25 + i * 50);
            image(blockTexp5, 250, 10 + i * 50, 30, 30, buildMenu.items[item].tex.x, buildMenu.items[item].tex.y, 16, 16, CONTAIN, CENTER, CENTER);
            translate(0, buildMenu.lerp * 50);
            i++;
        }
        translate(buildMenu.dampen * 320, -((height / 2) - 300));
    }

    if(player.placedCore === false){
        let offset = Math.sin(a) * 100;
        let length = 230 - Math.abs(Math.sin(a) * 150);

        fill(clr);
        rect(window.innerWidth / 2-165,75,330,50);

        fill(255,255,255)
        textAlign(CENTER,CENTER);
        textSize(23);

        if(!buildMenu.open){
            text(`Press Q to begin building`, window.innerWidth/2, 100);
        } else {
            text(`Right click to place your core`, window.innerWidth/2, 100); 
        }
        stroke((255-Math.cos(a))*255,0,Math.sin(a)*255); // Set the line color
        strokeWeight(2);
        line(window.innerWidth / 2 - length / 2 + offset, 115, window.innerWidth / 2 + length / 2 + offset, 115);
    }

    // i cried making this
    a += .005 * deltaTime / 5;

    noStroke();
    textAlign(LEFT, TOP)

    //Crosshair
    fill(0);
    circle(window.innerWidth / 2, window.innerHeight / 2, 2);

    if(buildMenu.open){
    //Cost of placement
        let y = 0;
        for(c in buildMenu.items[buildMenu.selection].cost){
            let currentItemCost = buildMenu.items[buildMenu.selection].cost[c];
            if(currentItemCost > 0){
                fill(255);
                textSize(20);
                text(player.resources[c].i+": "+currentItemCost,window.innerWidth / 2+10, window.innerHeight / 2 + y)
                y+=20;
            }
        }
    }

}