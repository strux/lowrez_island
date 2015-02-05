var mainState = {

  constants: {
    gameSize: 128,
    gameScale: 4,
    dayLength: 60 * 12,
    playerBlinkInterval: 7,
  },

  preload: function() {
    game.scale.maxWidth = this.constants.gameSize * this.constants.gameScale;
    game.scale.maxHeight = this.constants.gameSize * this.constants.gameScale;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();
    game.stage.smoothed = false;

    game.load.spritesheet('player', 'assets/player_sprites.png', 6, 10, 50)

    game.load.image('terrain', 'assets/terrain.png');
    game.load.tilemap('level1Map', 'assets/level_1.json', null, Phaser.Tilemap.TILED_JSON);
  },

  create: function() {
    game.stage.backgroundColor = '#3498db';
    game.world.setBounds(0, 0, 512, 512);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.map = game.add.tilemap('level1Map');
    this.map.addTilesetImage('terrain', 'terrain');
    this.base_layer = this.map.createLayer('base');
    this.base_layer.anchor.setTo(0, 0);
    this.transition_layer = this.map.createLayer('transitions');
    this.transition_layer.anchor.setTo(0, 0);

    this.map.setTileIndexCallback(65, this.walking, this, this.base_layer);
    this.map.setTileIndexCallback(33, this.wading, this, this.base_layer);
    this.map.setTileIndexCallback(1, this.swimming, this, this.base_layer);

    this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player')
    this.player.anchor.setTo(.5, .5);
    this.player.animations.add('walkLeftRight', [2,3,4,5,6,7,8,9]);
    this.player.animations.add('swimLeftRight', [30,31,32,33,34,35,36,37]);
    this.player.animations.add('blinkLeftRight', [0,1]);
    this.player.animations.add('walkDown', [11,12,13,14,15,16,17,18]);
    this.player.animations.add('swimUpDown', [40,41,42,43,44,45,46,47]);
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
    this.game.physics.arcade.collide(this.player, this.base_layer);
    this.movePlayer();
    this.moveSun();
  },

  render: function() {
    // game.debug.cameraInfo(game.camera, 4, 0);
    // game.debug.font = '10px Courier';
    // game.debug.spriteCoords(this.player, -30, 60);
  },

  walking: function() {
    this.player.locomotion = 'walking';
  },

  wading: function() {
    this.player.locomotion = 'wading';
  },

  swimming: function() {
    this.player.locomotion = 'swimming';
  },

  movePlayer: function() {
    var walkingSpeed = 65,
        walkingAnimationSpeed = 11,
        wadingSpeed = walkingSpeed * .8,
        swimmingSpeed = walkingSpeed * .4,
        swimmingAnimationSpeed = 4,
        speed = walkingSpeed;

    this.lightSprite.x = this.player.x;
    this.lightSprite.y = this.player.y;
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    if (this.player.locomotion == 'wading') {
      this.player.crop(new Phaser.Rectangle(0, 0, 6, 6));
      speed = wadingSpeed;
    } else {
      // reset
      this.player.crop();
    }

    if (cursors.up.isDown) {
      this.player.facing = 'up';
      if (this.player.locomotion == 'swimming') {
        this.player.angle = 0;
        this.player.body.velocity.y = -swimmingSpeed;
        this.player.animations.play('swimUpDown', swimmingAnimationSpeed, true);
      } else {
        this.player.angle = 0;
        this.player.body.velocity.y = -speed
        this.player.animations.play('walkUp', walkingAnimationSpeed, true);
      }
    }
    else if (cursors.down.isDown) {
      this.player.facing = 'down';
      if (this.player.locomotion == 'swimming') {
        this.player.angle = 180;
        this.player.body.velocity.y = swimmingSpeed;
        this.player.animations.play('swimUpDown', swimmingAnimationSpeed, true);
      } else {
        this.player.angle = 0;
        this.player.body.velocity.y = speed;
        this.player.animations.play('walkDown', walkingAnimationSpeed, true);
      }
    }
    else if (cursors.left.isDown) {
      this.player.facing = 'left';
      this.player.scale.x = -1;
      if (this.player.locomotion == 'swimming') {
        this.player.angle = -90;
        this.player.body.velocity.x = -swimmingSpeed;
        this.player.animations.play('swimLeftRight', swimmingAnimationSpeed, true);
      } else {
        this.player.angle = 0;
        this.player.body.velocity.x = -speed;
        this.player.animations.play('walkLeftRight', walkingAnimationSpeed, true);
      }
    }
    else if (cursors.right.isDown) {
      this.player.facing = 'right';
      this.player.scale.x = 1;
      if (this.player.locomotion == 'swimming') {
        this.player.angle = 90;
        this.player.body.velocity.x = swimmingSpeed;
        this.player.animations.play('swimLeftRight', swimmingAnimationSpeed, true);
      } else {
        this.player.angle = 0;
        this.player.body.velocity.x = speed;
        this.player.animations.play('walkLeftRight', walkingAnimationSpeed, true);
      }
    }
    if (!cursors.up.isDown && !cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
      var blink = false;
      if (this.game.time.elapsedSecondsSince(this.player.lastBlink) >= this.constants.playerBlinkInterval) {
        blink = true;
      }
      if (this.player.locomotion == 'swimming') {
        if (this.player.facing == 'up' || this.player.facing == 'down') {
          this.player.frame = 43;
        } else {
          this.player.frame = 33;
        }
      }
      else if (this.player.facing == 'up') { this.player.frame = 21; }
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
        rgbMin = 40,
        redshiftMin = 60,
        rgbMultiplier = (255 - rgbMin) / daySegmentLength,
        rgb_string = ''
        red = function(rgb) {
          return rgb > redshiftMin ? rgb + 40 : rgb;
        };

    // Jump to daytime
    time += daySegmentLength * 1;

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
