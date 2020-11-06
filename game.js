var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,

    canvas = null,
    ctx = null,
    lastPress = null,
    pause = true,
    dir = 0,
    score = 0,
    player = null,
    food = null;
    wall = new Array();
    gameover = true;

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 17);
    };
}());

document.addEventListener('keydown', function (evt) {
    lastPress = evt.which;
}, false);

function Rectangle(x, y, width, height) {
    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
    this.width = (width == null) ? 0 : width;
    this.height = (height == null) ? this.width : height;
    
    this.intersects = function (rect) {
        if (rect == null) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y);
        }
    };
    this.fill = function (ctx) {
        if (ctx == null) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}
function random(max) {
    return Math.floor(Math.random() * max);
}

function reset() {
    score = 0;
    dir = 1;
    player.x = 40;
    player.y = 40;
    food.x = random(canvas.width / 10 - 1) * 10;
    food.y = random(canvas.height / 10 - 1) * 10;
    gameover = false;
}

function paint(ctx) {
    var i = 0;
    
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = '#0f0';
    player.fill(ctx);

    // Draw walls
    ctx.fillStyle = '#999';
    for (i = 0; i <= (wall.length-1); i++) {
        wall[i].fill(ctx);
    }

    // Draw food
    ctx.fillStyle = '#f00';
    food.fill(ctx);

    // Debug last key pressed
    ctx.fillStyle = '#fff';
    //ctx.fillText('Last Press: '+lastPress,0,20);
    
    // Draw score
    ctx.fillText('Score: ' + score, 0, 10);
    
    // Draw pause
    if (pause) {
        ctx.textAlign = 'center';
        if (gameover) {
            ctx.fillText('GAME OVER', 150, 75);
        } else {
            ctx.fillText('PAUSE', 150, 75);
        }
        ctx.textAlign = 'left';
    }
}

function act() {
    var i ;

    if (!pause) {

        // GameOver Reset
        if (gameover) {
            reset();
        }

        // Change Direction
        if (lastPress == KEY_UP) {
            dir = 0;
        }
        if (lastPress == KEY_RIGHT) {
            dir = 1;
        }
        if (lastPress == KEY_DOWN) {
            dir = 2;
        }
        if (lastPress == KEY_LEFT) {
            dir = 3;
        }

        // Move Rect
        if (dir == 0) {
            player.y -= 10;
        }
        if (dir == 1) {
            player.x += 10;
        }
        if (dir == 2) {
            player.y += 10;
        }
        if (dir == 3) {
            player.x -= 10;
        }

        // Out Screen
        if (player.x > canvas.width) {
            player.x = 0;
        }
        if (player.y > canvas.height) {
            player.y = 0;
        }
        if (player.x < 0) {
            player.x = canvas.width;
        }
        if (player.y < 0) {
            player.y = canvas.height;
        }

        // Wall Intersects
        for (i = 0; i <= (wall.length - 1); i++) {
            if (food.intersects(wall[i])) {
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
            }
            if (player.intersects(wall[i])) {
                pause = true;
                gameover = true;
            }
        }

        // Food Intersects
        if (player.intersects(food)) {
            score += 1;
            food.x = random(canvas.width / 10 - 1) * 10;
            food.y = random(canvas.height / 10 - 1) * 10;
        }
    }

    // Pause/Unpause
    if (lastPress == KEY_ENTER) {
        pause = !pause;
        lastPress = null;
    }
}
function repaint() {
    window.requestAnimationFrame(repaint);
    paint(ctx);
}
function run() {
    setTimeout(run, 50);
    act();
}
function init() {

    // Get canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Create player and food
    player = new Rectangle(40, 40, 10, 10);
    food = new Rectangle(80, 80, 10, 10);

    // Create walls
    wall.push(new Rectangle(20, 20, 10, 10));
    wall.push(new Rectangle(20, 100, 10, 10));
    wall.push(new Rectangle(200, 20, 10, 10));
    wall.push(new Rectangle(200, 100, 10, 10));

    // Start game
    run();
    repaint();
}
window.addEventListener('load', init, false);