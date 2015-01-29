var mainState = {

  constants: {
    player_speed: 50,
    player_animation_speed: 6,
  },

  preload: function() {
    game.scale.maxWidth = 512;
    game.scale.maxHeight = 512;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();
    game.stage.smoothed = false;

    game.load.image('ground', 'assets/sand512x512.jpg');
    game.load.spritesheet('player', 'assets/player_sprites.png', 16, 16, 28)
    game.load.spritesheet('player_shadow', 'assets/player_shadow_sprites.png', 16, 16, 5)
  },

  create: function() {
    game.stage.backgroundColor = '#3498db';
    game.world.setBounds(0, 0, 512, 512);
    game.physics.startSystem(Phaser.Physics.P2JS);
    this.ground = game.add.sprite(0, 0, 'ground')
    this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player')
    this.player.animations.add('walk_left_right', [4,5,6,7,8,1,2,3]);
    this.player.animations.add('walk_down', [11,12,13,14,15,16,17,18]);
    this.player.animations.add('walk_up', [21,22,23,24,25,26,27,28]);
    this.player_shadow = game.add.sprite(this.player.x,  this.player.y, 'player_shadow', 2)
    this.player_shadow.anchor.setTo(.5, .5);
    this.player_shadow.alpha = .2;

    game.physics.p2.enable(this.player);
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(this.player);
    // Stops camer jitter when following player
    game.camera.roundPx = false;
  },

  update: function() {
    this.player.body.setZeroVelocity();

    if (cursors.up.isDown) {
      this.player.body.moveUp(this.constants.player_speed)
      this.player.animations.play('walk_up', this.constants.player_animation_speed, true);
    }
    else if (cursors.down.isDown) {
      this.player.body.moveDown(this.constants.player_speed);
      this.player.animations.play('walk_down', this.constants.player_animation_speed, true);
    }
    if (cursors.left.isDown) {
      this.player.body.moveLeft(this.constants.player_speed);
      this.player.scale.x = -1;
      this.player.animations.play('walk_left_right', this.constants.player_animation_speed, true);
    }
    else if (cursors.right.isDown) {
      this.player.body.moveRight(this.constants.player_speed);
      this.player.scale.x = 1;
      this.player.animations.play('walk_left_right', this.constants.player_animation_speed, true);
    }
    if (!cursors.up.isDown && !cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
      this.player.frame = 0;
    }
    this.player_shadow.x = this.player.x;
    this.player_shadow.y = this.player.y;
  },

  render: function() {
    // game.debug.cameraInfo(game.camera, 4, 0);
    // game.debug.spriteCoords(this.player, 16, 128);
  }

};

var game = new Phaser.Game(128, 128, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');
