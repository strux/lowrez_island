var mainState = {

  constants: {
    gameSize: 128,
    gameScale: 3,
    dayLength: 60 * 12,
    playerSpeed: 70,
    playerBlinkInterval: 7,
    playerAimationSpeed: 11,
  },

  preload: function() {
    game.scale.maxWidth = this.constants.gameSize * this.constants.gameScale;
    game.scale.maxHeight = this.constants.gameSize * this.constants.gameScale;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();
    game.stage.smoothed = false;

    game.load.spritesheet('player', 'assets/player_sprites.png', 6, 10, 30)

    game.load.image('terrain', 'assets/terrain.png');
    game.load.tilemap('level1Map', 'assets/level_1.json', null, Phaser.Tilemap.TILED_JSON);
  },

  create: function() {
    game.stage.backgroundColor = '#3498db';
    game.world.setBounds(0, 0, 512, 512);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.map = game.add.tilemap('level1Map');
    this.map.addTilesetImage('terrain', 'terrain');
    this.ocean = this.map.createLayer('Tile Layer 1');
    this.ocean.anchor.setTo(0, 0);
    this.shallows = this.map.createLayer('Tile Layer 2');
    this.shallows.anchor.setTo(0, 0);
    this.sand = this.map.createLayer('Tile Layer 3');
    this.sand.anchor.setTo(0, 0);
    this.grass = this.map.createLayer('Tile Layer 4');
    this.grass.anchor.setTo(0, 0);
    this.plants = this.map.createLayer('Tile Layer 5');
    this.plants.anchor.setTo(0, 0);

    // this.map.setCollision(33, true, this.shallows);
    this.map.setTileIndexCallback(33, function(){ console.log('test') }, this, this.shallows);
    this.shallows.debug = true;


    this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player')
    this.player.anchor.setTo(.5, .5);
    this.player.animations.add('walkLeftRight', [2,3,4,5,6,7,8,9]);
    this.player.animations.add('blinkLeftRight', [0,1]);
    this.player.animations.add('walkDown', [11,12,13,14,15,16,17,18]);
    this.player.animations.add('blinkDown', [10,11]);
    this.player.animations.add('walkUp', [21,22,23,24,25,26,27,28]);

    this.player.lastBlink = 0;

    // Create the shadow texture
    this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);

    // Create an object that will use the bitmap as a texture
    this.lightSprite = this.game.add.image(0, 0, this.shadowTexture);

    // Set the blend mode to MULTIPLY. This will darken the colors of
    // everything below this sprite.
    this.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    this.lightSprite.anchor.setTo(.5, .5);

    game.physics.arcade.enable(this.player);
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(this.player);
    // Stops camer jitter when following player
    game.camera.roundPx = false;
  },

  update: function() {
    this.game.physics.arcade.collide(this.player, this.shallows);
    this.movePlayer();
    this.moveSun();
  },

  render: function() {
    // game.debug.cameraInfo(game.camera, 4, 0);
    // game.debug.font = '10px Courier';
    // game.debug.spriteCoords(this.player, -30, 60);
  },

  wade: function() {
    console.log("i'm wadin!!!");
  },

  movePlayer: function() {
    this.lightSprite.x = this.player.x;
    this.lightSprite.y = this.player.y;
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    if (this.player.frame == 10) this.player.frame = 11;

    if (cursors.up.isDown) {
      this.player.facing = 'up';
      this.player.body.velocity.y = -this.constants.playerSpeed
      this.player.animations.play('walkUp', this.constants.playerAimationSpeed, true);
    }
    else if (cursors.down.isDown) {
      this.player.facing = 'down';
      this.player.body.velocity.y = this.constants.playerSpeed;
      this.player.animations.play('walkDown', this.constants.playerAimationSpeed, true);
    }
    else if (cursors.left.isDown) {
      this.player.facing = 'left';
      this.player.body.velocity.x = -this.constants.playerSpeed;
      this.player.scale.x = -1;
      this.player.animations.play('walkLeftRight', this.constants.playerAimationSpeed, true);
    }
    else if (cursors.right.isDown) {
      this.player.facing = 'right';
      this.player.body.velocity.x = this.constants.playerSpeed;
      this.player.scale.x = 1;
      this.player.animations.play('walkLeftRight', this.constants.playerAimationSpeed, true);
    }
    if (!cursors.up.isDown && !cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
      var blink = false;
      if (this.game.time.elapsedSecondsSince(this.player.lastBlink) >= this.constants.playerBlinkInterval) {
        blink = true;
      }
      if (this.player.facing == 'up') { this.player.frame = 21; }
      else if (this.player.facing == 'down') {
        if(blink) {
          this.player.blinkAnimation = this.player.animations.play('blinkDown', 9, false);
          this.player.lastBlink = game.time.time
        }
        else if (!this.player.blinkAnimation.isPlaying) {
          this.player.frame = 11;
        }
      }
      else {
        if(blink) {
          this.player.blinkAnimation = this.player.animations.play('blinkLeftRight', 9, false);
          this.player.lastBlink = game.time.time;
        }
        else if (!this.player.blinkAnimation.isPlaying) {
          this.player.frame = 1;
        }
      }
    }
  },

  moveSun: function() {
    var time = Math.floor(this.game.time.totalElapsedSeconds() % this.constants.dayLength),
        daySegmentLength = this.constants.dayLength / 6,
        dawnTime = 0,
        dayTime = daySegmentLength * 1,
        afternoonTime = daySegmentLength * 2,
        duskTime = daySegmentLength * 3,
        nightTime = daySegmentLength * 4,
        midnight = daySegmentLength * 5,
        rgb = 255,
        rgbMin = 30,
        redshiftMin = 50,
        rgbMultiplier = (255 - rgbMin) / daySegmentLength,
        rgb_string = ''
        red = function(rgb) {
          return rgb > redshiftMin ? rgb + 40 : rgb;
        };

    // Jump to daytime
    time += daySegmentLength;

    if (time >= dawnTime && time <= dayTime) {
      rgb = rgbMin + Math.ceil((time - dawnTime) * rgbMultiplier);
    }
    else if (time > duskTime && time <= nightTime) {
      rgb = 255 - Math.ceil((time - duskTime) * rgbMultiplier);
    }
    else if (time > nightTime) {
      rgb = rgbMin;
    }
    rgb_string = 'rgb(' + red(rgb) + ', ' + rgb + ', ' + rgb + ')';
    this.shadowTexture.context.fillStyle = rgb_string;
    this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);
    this.shadowTexture.dirty = true;
  }
};

var game = new Phaser.Game(mainState.constants.gameSize, mainState.constants.gameSize, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');
