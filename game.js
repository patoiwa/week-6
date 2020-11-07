/* jslint bitwise:true, es5: true*/
(function (window, undefined){
    //'use strict';
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
        //player = null,
        body = [];
        food = null;
        wall = [];
        gameover = true;

        iBody = new Image();
        iFood = new Image();
        aEat = new Audio();
        aDie = new Audio();

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
        this.x = (x === undefined) ? 0 : x;
        this.y = (y === undefined) ? 0 : y;
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height;
        
        Rectangle.prototype.intersects = function (rect) {
            if (rect === undefined) {
                window.console.warn('Missing parameters on function intersects');
            } else {
                return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
            }
        };
        Rectangle.prototype.fill = function (ctx) {
            if (ctx === undefined) {
                window.console.warn('Missing parameters on function fill');
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        };
        Rectangle.prototype.drawImage = function (ctx, img){
            if (img === undefined){
                window.console.warn('Missing parameters on function intersects');
            } else {
                if (img.width){
                    ctx.drawImage(img, this.x, this.y);
                } else{
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }
    }
    function random(max) {
        return ~~(Math.random() * max);
    }

    function reset() {
        score = 0;
        dir = 1;
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameover = false;

        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
    }

    function paint(ctx) {
        var i = 0;
        
        // Clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw player
        ctx.fillStyle = '#0f0';
        for (i = 0; i <= body.length-1;  i++) {
            body[i].fill(ctx);
            //ctx.drawImage(iBody, body[i].x, body[i].y);
        }


        // Draw walls
        ctx.fillStyle = '#999';
        for (i = 0; i <= (wall.length-1); i++) {
            wall[i].fill(ctx);
        }

        // Draw food
        ctx.fillStyle = '#f00';
        food.fill(ctx);
        ctx.strokeStyle = '#f00';
        ctx.drawImage(iFood, food.x, food.y);

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
        var i =0 ;

        if (!pause) {

            // GameOver Reset
            if (gameover) {
                reset();
            }

            // Change Direction
            if (lastPress === KEY_UP) {
                dir = 0;
            }
            if (lastPress === KEY_RIGHT) {
                dir = 1;
            }
            if (lastPress === KEY_DOWN) {
                dir = 2;
            }
            if (lastPress === KEY_LEFT) {
                dir = 3;
            }

            // Move Rect
            if (dir === 0) {
                body[0].y -= 10;
            }
            if (dir === 1) {
                body[0].x += 10;
            }
            if (dir === 2) {
                body[0].y += 10;
            }
            if (dir === 3) {
                body[0].x -= 10;
            }

            // Move Body
            for (i = body.length - 1; i > 0; i--) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }

            // Out Screen
            if (body[0].x > canvas.width) {
                body[0].x = 0;
            }
            if (body[0].y > canvas.height) {
                body[0].y = 0;
            }
            if (body[0].x < 0) {
                body[0].x = canvas.width;
            }
            if (body[0].y < 0) {
                body[0].y = canvas.height;
            }

            // Wall Intersects
            for (i = 0; i <= (wall.length - 1); i++) {
                if (food.intersects(wall[i])) {
                    food.x = random(canvas.width / 10 - 1) * 10;
                    food.y = random(canvas.height / 10 - 1) * 10;
                }
                if (body[0].intersects(wall[i])) {
                    pause = true;
                    gameover = true;
                    aDie.play();
                }
            }

            // Food Intersects
            if (body[0].intersects(food)) {
                body.push(new Rectangle(0, 0, 10, 10));
                aEat.play();
                score += 1;
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
            }

            // Body Intersects
            for (i = 2; i <= body.length - 1; i++ ) {
                if (body[0].intersects(body[i])) {
                    gameover = true;
                    pause = true;
                    aDie.play();
                }
            }
        
        }

        // Pause/Unpause
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = undefined;
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

        // Create body[0] and food
        body[0] = new Rectangle(40, 40, 10, 10);
        food = new Rectangle(80, 80, 10, 10);

        //Load Assets
        iBody.src = 'assets/body.htm';
        iFood.src = 'assets/manzana-10px.jpg';
        aEat.src = 'assets/eat-sound.ogg';
        aDie.src = 'assets/die-sound.ogg';

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
}(window));