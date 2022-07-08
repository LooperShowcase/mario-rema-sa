kaboom({
  fullscreen: true,
  clearColor: [0, 0.5, 1, 1],
  global: true,
  scale: 2,
});

loadRoot("./sprites/");
loadSprite("ground", "block.png");
loadSprite("peach", "princes.png");
loadSprite("mario", "mario.png");
loadSprite("coin", "coin.png");
loadSprite("surprise", "surprise.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("dino", "dino.png");
loadSprite("pipe", "pipe_up.png");
loadSprite("evil-mushroom", "evil_mushroom.png");
loadSound("jump", "jumpSound.mp3");
loadSound("gameSound", "gameSound.mp3");

let score = 0;

scene("game", () => {
  play("gameSound");
  layers(["bg", "obj", "ui"], "obj");

  const map = [
    "=                                                                                                                                            ",
    "=                                                                                                                   ",
    "=                                                                                                                  ",
    "=                             p                                                                                    ",
    "=                       =    ==                                                                                   ",
    "=                   d   =        =                                         ==   !v   ==   =  =                         ",
    "=                  v=   =        =    v!                              =                   =     =                     ",
    "=             =         =        =        =                 = ======  =                   =         =                 ",
    "=          v=           =        =           =          ==            =                   =             =      i      ",
    "+          e  a         +        =                                    +    ea             +                =        ",
    "==========================       =========================== ===================================      =============    ",
  ];
  const mapSymbol = {
    width: 20,
    height: 20,
    "=": [sprite("ground"), solid()],
    "+": [sprite("ground"), solid(), "evil_block"],
    $: [sprite("coin"), "coins"],
    v: [sprite("surprise"), solid(), "surprise-coin"],
    "!": [sprite("surprise"), solid(), "surprise-mush"],
    m: [sprite("mushroom"), solid(), "mushroom", body()],
    u: [sprite("unboxed"), solid()],
    d: [sprite("dino"), solid()],
    p: [sprite("peach"), solid()],
    a: [sprite("evil-mushroom"), solid(), "evilMushroom", body()],
    e: [sprite("evil-mushroom"), solid(), "evilMushroom", body()],
    i: [sprite("pipe"), solid(), "pipe_up"],
  };

  const gameLevel = addLevel(map, mapSymbol);

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    big(),
  ]);

  const scoreLabel = add([text("score " + score)]);
  const moveSpeed = 120;

  keyDown("right", () => {
    player.move(moveSpeed, 0);
  });
  keyDown("left", () => {
    player.move(-moveSpeed, 0);
  });

  keyDown("space", () => {
    if (player.grounded()) {
      play("gameSound");
      player.jump(400);
    }
  });

  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      destroy(obj);
      gameLevel.spawn("u", obj.gridPos);
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
    }

    if (obj.is("surprise-mush")) {
      destroy(obj);
      gameLevel.spawn("u", obj.gridPos);
      gameLevel.spawn("m", obj.gridPos.sub(0, 1));
    }
  });
  action("mushroom", (obj) => {
    obj.move(50, 0);
  });

  let moveEvilSpeed = 20;

  action("evilMushroom", (obj) => {
    obj.collides("evil_block", () => {
      moveEvilSpeed *= -1;
    });
  });

  action("evilMushroom", (obj) => {
    obj.move(moveEvilSpeed, 0);
  });

  player.collides("coins", (obj) => {
    destroy(obj);
    score += 10;
  });

  player.collides("mushroom", (obj) => {
    destroy(obj);
    player.biggify(10);
  });
  player.collides("pipe_up", (obj) => {
    keyDown("down", () => {
      go("win");
    });
  });

  const FALL_DOWN = 700;

  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= FALL_DOWN) {
      go("lose");
    }
    scoreLabel.pos = player.pos.sub(400, 200);

    scoreLabel.text = "score:" + score;
  });

  let isjumping = false;

  player.collides("evilMushroom", (obj) => {
    if (isjumping) {
      destroy(obj);
    } else {
      go("lose");
    }
  });

  player.action(() => {
    isjumping = !player.grounded();
  });
});

scene("lose", () => {
  score = 0;
  add([
    text("Game Over \n space to restart", 50),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  keyDown("space", () => {
    go("game");
  });
});

scene("win", () => {
  score = 0;
  add([
    text("You won  ", 50),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  keyDown("space", () => {
    go("game");
  });
});

start("game");
