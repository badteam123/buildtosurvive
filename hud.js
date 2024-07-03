let hudsprites = {};

var clr;

const buildMenu = {
    open: false,
    tab: 0,
    selection: 0,
    selectionName: "core",
    dampen: 1,
    lerp: 0,
    items: [
        { name: "core", cost: { gold: 100, wood: 100, stone: 100 }, tex: { x: 16 + (48 * 3), y: 16 + (48 * 0) } },
        { name: "wall", cost: { gold: 0, wood: 5, stone: 0 }, tex: { x: 16 + (48 * 4), y: 16 + (48 * 0) } }
    ]
};

function defineImages() {
    hudsprites.heart = hudsprites.image.get(1, 1, 256, 256);
}

let hudElements = {
    healthbar: {
        x: 50,
        y: 50,
        size: { x: 200, y: 20 }
    },
    resources: {
        x: 30,
        y: 100
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

    if (player.health.current < player.health.max / 3) {
        text("❤️", hb.x + hb.size.x + 19 + Math.random() * 2, hb.y + 9 + Math.random() * 2)
    } else {
        text("❤️", hb.x + hb.size.x + 20, hb.y + 10)
    }

    //

    let r = player.resources;
    let rd = hudElements.resources;

    fill(255);
    noStroke();
    textAlign(LEFT, TOP)
    textSize(26);

    text(`Connected? ${server.data.online} - ${server.data.time}ms\nFPS: ${Math.round(smoothFps * 10) / 10}`, rd.x, rd.y);

    //

    fill(0);
    circle(window.innerWidth / 2, window.innerHeight / 2, 2);

    clr = color(50, 50, 50, 200);
    fill(clr);
    rect((window.innerWidth/2)-300, window.innerHeight-100, 600, 100);
    fill(210);
    rect((window.innerWidth/2)-290, window.innerHeight-90, 80, 80);
    rect((window.innerWidth/2)-200, window.innerHeight-90, 80, 80);
    fill(255);
    text(`🪵 ${r.wood}\n🪨 ${r.stone}\n🪙 ${r.gold}`, (window.innerWidth/2)+100, window.innerHeight-95, 600, 100)

    textAlign(LEFT, CENTER);
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

}