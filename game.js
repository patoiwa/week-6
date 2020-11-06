var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    canvas = null,
    ctx = null,
    lastPress = null,
    pause = true,
    x = 50,
    y = 50,
    dir = 0;
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
function paint(ctx) {
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw square
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x, y, 10, 10);
    // Debug last key pressed
    ctx.fillStyle = '#fff';
    //ctx.fillText('Last Press: ' + lastPress, 0, 20);
    // Draw pause
    if (pause) {
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', 150, 75);
        ctx.textAlign = 'left';
    }
}
function act() {
    if (!pause) {
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
            y -= 10;
        }
        if (dir == 1) {
            x += 10;
        }
        if (dir == 2) {
            y += 10;
        }
        if (dir == 3) {
            x -= 10;
        }
        // Out Screen
        if (x > canvas.width) {
            x = 0;
        }
        if (y > canvas.height) {
            y = 0;
        }
        if (x < 0) {
            x = canvas.width;
        }
        if (y < 0) {
            y = canvas.height;
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
    // Start game
    run();
    repaint();
}
window.addEventListener('load', init, false);