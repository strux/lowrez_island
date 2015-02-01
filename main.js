var mainState = {

  constants: {
    gameSize: 128,
    gameScale: 4,
    playerSpeed: 70,
    playerAimationSpeed: 11,
  },

  preload: function() {
    game.scale.maxWidth = this.constants.gameSize * this.constants.gameScale;
    game.scale.maxHeight = this.constants.gameSize * this.constants.gameScale;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();
    game.stage.smoothed = false;

    game.load.spritesheet('player', 'assets/player_sprites.png', 16, 16, 27)
    game.load.spritesheet('playerShadow', 'assets/player_shadow_sprites.png', 16, 16, 5)

    game.load.image('terrain', 'assets/terrain.png');
    game.load.tilemap('level1Map', 'assets/level_1.json', null, Phaser.Tilemap.TILED_JSON);
  },

  create: function() {
    game.stage.backgroundColor = '#3498db';
    game.world.setBounds(0, 0, 512, 512);
    game.physics.startSystem(Phaser.Physics.P2JS);

    this.map = game.add.tilemap('level1Map');
    this.map.addTilesetImage('terrain', 'terrain');
    this.ocean = this.map.createLayer('Tile Layer 1');
    this.ocean.anchor.setTo(0, 0);
    this.shallows = this.map.createLayer('Tile Layer 2');
    this.shallows.anchor.setTo(0, 0);
    this.sand = this.map.createLayer('Tile Layer 3');
    this.sand.anchor.setTo(0, 0);

    this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player')
    this.player.animations.add('walkLeftRight', [1,2,3,4,5,6,7,8]);
    this.player.animations.add('walkDown', [10,11,12,13,14,15,16,17]);
    this.player.animations.add('walkUp', [20,21,22,23,24,25,26,27]);
    /*
    this.playerShadow = game.add.sprite(this.player.x,  this.player.y, 'playerShadow', 2)
    this.playerShadow.anchor.setTo(.5, .5);
    this.playerShadow.alpha = .2;
    */


    // Create the shadow texture
    this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);

    // Create an object that will use the bitmap as a texture
    this.lightSprite = this.game.add.image(0, 0, this.shadowTexture);

    // Set the blend mode to MULTIPLY. This will darken the colors of
    // everything below this sprite.
    this.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    this.lightSprite.anchor.setTo(.5, .5);

    game.physics.p2.enable(this.player);
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(this.player);
    // Stops camer jitter when following player
    game.camera.roundPx = false;
  },

  update: function() {
    // dusk approx
    //this.shadowTexture.context.fillStyle = 'rgb(200, 120, 120)';
    this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
    this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

    this.movePlayer();

    /*
    this.playerShadow.x = this.player.x;
    this.playerShadow.y = this.player.y;
    */

    this.lightSprite.x = this.player.x;
    this.lightSprite.y = this.player.y;
  },

  render: function() {
    // game.debug.cameraInfo(game.camera, 4, 0);
    // game.debug.font = '10px Courier';
    // game.debug.spriteCoords(this.player, -30, 60);
  },

  movePlayer: function() {
    this.player.body.setZeroVelocity();

    if (cursors.up.isDown) {
      this.player.facing = 'up';
      this.player.body.moveUp(this.constants.playerSpeed)
      this.player.animations.play('walkUp', this.constants.playerAimationSpeed, true);
    }
    else if (cursors.down.isDown) {
      this.player.facing = 'down';
      this.player.body.moveDown(this.constants.playerSpeed);
      this.player.animations.play('walkDown', this.constants.playerAimationSpeed, true);
    }
    else if (cursors.left.isDown) {
      this.player.facing = 'left';
      this.player.body.moveLeft(this.constants.playerSpeed);
      this.player.scale.x = -1;
      this.player.animations.play('walkLeftRight', this.constants.playerAimationSpeed, true);
    }
    else if (cursors.right.isDown) {
      this.player.facing = 'right';
      this.player.body.moveRight(this.constants.playerSpeed);
      this.player.scale.x = 1;
      this.player.animations.play('walkLeftRight', this.constants.playerAimationSpeed, true);
    }
    if (!cursors.up.isDown && !cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
      if (this.player.facing == 'up') { this.player.frame = 20; }
      else if (this.player.facing == 'down') { this.player.frame = 10; }
      else { this.player.frame = 0; }
    }
  }

};

var game = new Phaser.Game(mainState.constants.gameSize, mainState.constants.gameSize, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');
