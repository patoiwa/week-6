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
        specialFood = null;
        wall = [];
        gameover = true;
        fullscreen = false;

        iBody = new Image();
        iFood = new Image();
        iSpecialFood = new Image();
        aEat = new Audio();
        aDie = new Audio();

        lastUpdate = 0,
        FPS = 0,
        frames = 0,
        acumDelta = 0;

        buffer = null,
        bufferCtx = null,
        bufferScale = 1,
        bufferOffsetX = 0,
        bufferOffsetY = 0,

        currentScene = 0,
        scenes = [],
        mainScene = null,
        gameScene = null,
        highscoresScene = null,

        highscores = [],
        posHighscore = 10,

        url = "https://jsonplaceholder.typicode.com/posts",

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 17);
        };
    }());

    document.addEventListener('keydown', function (evt) {
        if (evt.which >= 37 && evt.which <= 40) {
            evt.preventDefault();
        }
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

    function Scene() {
        this.id = scenes.length;
        scenes.push(this);
    }
    Scene.prototype = {
        constructor: Scene,
        load: function () {},
        paint: function (ctx) {},
        act: function () {}
    };
    function loadScene(scene) {
        currentScene = scene.id;
        scenes[currentScene].load();
    }

    function random(max) {
        return ~~(Math.random() * max);
    }

    function addHighscore(score) {
        posHighscore = 0;
        while (highscores[posHighscore] > score && posHighscore < highscores.length) {
            posHighscore += 1;
        }
        highscores.splice(posHighscore, 0, score);
        if (highscores.length > 10) {
            highscores.length = 10;
        }
        localStorage.highscores = highscores.join(',');
    }

    function repaint() {
        window.requestAnimationFrame(repaint);
        if (scenes.length){
            scenes[currentScene].paint(bufferCtx);

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(buffer, bufferOffsetX, bufferOffsetY, buffer.width * bufferScale, buffer.height * bufferScale)
        }
    }

    function resize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var w = window.innerWidth / buffer.width;
        var h = window.innerHeight / buffer.height;
        bufferScale = Math.min(h, w);

        bufferOffsetX = (canvas.width - (buffer.width * bufferScale)) / 2;
        bufferOffsetY = (canvas.height - (buffer.height * bufferScale)) / 2;
    }

    function reset() {
        score = 0;
        dir = 1;
        food.x = random(buffer.width / 10 - 1) * 10;
        food.y = random(buffer.height / 10 - 1) * 10;
        gameover = false;

        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
    }

    function run() {
        setTimeout(run, 40);
        var now = Date.now(),
        deltaTime = (now - lastUpdate) / 1000;
        if (deltaTime > 1) {
            deltaTime = 0;
        }
        lastUpdate = now;
        frames += 1;
        acumDelta += deltaTime;
        if (acumDelta > 1) {
            FPS = frames;
            frames = 0;
            acumDelta -= 1;
        }
        if (scenes.length){
            scenes[currentScene].act(deltaTime);
        } 
    }

    function init() {
        // Get canvas and context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 300;

        // Load buffer
        buffer = document.createElement('canvas');
        bufferCtx = buffer.getContext('2d');
        buffer.width = 300;
        buffer.height = 150;

        // Load saved highscores
        if (localStorage.highscores) {
            highscores = localStorage.highscores.split(',');
        }
        
        //Resize
        resize();

        // Create body[0] and food
        body[0] = new Rectangle(40, 40, 10, 10);
        food = new Rectangle(80, 80, 10, 10);
        specialFood = new Rectangle(120, 120, 10, 10);

        //Load Assets
        iBody.src = 'assets/body.htm';
        iFood.src = 'assets/manzana-10px.jpg';
        iSpecialFood.src = 'assets/banana-10px.jpg';
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

    // Main Scene
    mainScene = new Scene();

    mainScene.paint = function (ctx) {
        // Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, buffer.width, buffer.height);

        // Draw title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('SNAKE', 150, 60);
        ctx.fillText('Press Enter', 150, 90);
    };

    mainScene.act = function () {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(highscoresScene);
            lastPress = null;
        }
    };

    // Game Scene
    gameScene = new Scene();

    gameScene.load = function () {
        score = 0;
        dir = 1;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        food.x = random(buffer.width / 10 - 1) * 10;
        food.y = random(buffer.height / 10 - 1) * 10;
        gameover = false;
    };

    gameScene.paint = function (ctx) {
        var i = 0;
        
        // Clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, buffer.width, buffer.height);
        
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
        //ctx.fillStyle = '#f00';
        //food.fill(ctx);
        ctx.strokeStyle = '#f00';
        ctx.drawImage(iFood, food.x, food.y);

        //Draw special food
        ctx.strokeStyle = '#f00';
        ctx.drawImage(iSpecialFood, specialFood.x, specialFood.y);

        // Debug last key pressed
        //ctx.fillText('Last Press: '+lastPress,0,20);
        
        // Draw score
        ctx.fillStyle = '#fff';
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

        //Draw FPS
        ctx.fillText('FPS: ' + FPS, 50, 10);
    }

    gameScene.act = function(deltaTime) {   
        var i =0 ;

        if (!pause) {
            // GameOver Reset
            if (gameover) {
                loadScene(highscoresScene);
            }

            // Change Direction
            if (lastPress === KEY_UP && dir !== 2) {
                dir = 0;
            }
            if (lastPress === KEY_RIGHT && dir !== 3) {
                dir = 1;
            }
            if (lastPress === KEY_DOWN && dir !== 0) {
                dir = 2;
            }
            if (lastPress === KEY_LEFT && dir !== 1) {
                dir = 3;
            }

            // Move Rect
            if (dir === 0) {
                body[0].y -= 10; //120 * deltaTime;
            }
            if (dir === 1) {
                body[0].x += 10; //120 * deltaTime;
            }
            if (dir === 2) {
                body[0].y += 10; //120 * deltaTime;
            }
            if (dir === 3) {
                body[0].x -= 10; //120 * deltaTime;
            }

            // Move Body
            for (i = body.length - 1; i > 0; i--) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }

            // Out Screen
            if (body[0].x > buffer.width) {
                body[0].x = 0;
            }
            if (body[0].y > buffer.height) {
                body[0].y = 0;
            }
            if (body[0].x < 0) {
                body[0].x = buffer.width;
            }
            if (body[0].y < 0) {
                body[0].y = buffer.height;
            }

            // Wall Intersects
            for (i = 0; i <= (wall.length - 1); i++) {
                if (food.intersects(wall[i])) {
                    food.x = random(buffer.width / 10 - 1) * 10;
                    food.y = random(buffer.height / 10 - 1) * 10;
                }
                if (specialFood.intersects(wall[i])) {
                    specialFood.x = random(buffer.width / 10 - 1) * 10;
                    specialFood.y = random(buffer.height / 10 - 1) * 10;
                }
                if (body[0].intersects(wall[i])) {
                    pause = true;
                    gameover = true;
                    aDie.play();
                    addHighscore(score);
                }
            }

            // Food Intersects
            if (body[0].intersects(food)) {
                body.push(new Rectangle(0, 0, 10, 10));
                aEat.play();
                score += 1;
                food.x = random(buffer.width / 10 - 1) * 10;
                food.y = random(buffer.height / 10 - 1) * 10;
            }

            //Special Food Intersects
            if (body[0].intersects(specialFood)) {
                aEat.play();
                score += 10;
                specialFood.x = buffer.width + 100;
                specialFood.y = buffer.height + 100;
                setTimeout( function(){
                    specialFood.x = random(buffer.width / 10 - 1) * 10;
                    specialFood.y = random(buffer.height / 10 - 1) * 10;
                }, (random(10) * 1000));
                fetch(url)
                .then(() => console.log("Score sent succesfully"))
                .catch(() => console.log("Something went wrong"))
            }

            // Body Intersects
            for (i = 2; i <= body.length - 1; i++ ) {
                if (body[0].intersects(body[i])) {
                    gameover = true;
                    pause = true;
                    aDie.play();
                    addHighscore(score);
                }
            }
        
        }

        // Pause/Unpause
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = undefined;
        }
    }

    // Highscore Scene
    highscoresScene = new Scene();

    highscoresScene.paint = function (ctx) {
        var i = 0;
        // Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, buffer.width, buffer.height);
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', 150, 30);
        // Draw high scores
        ctx.textAlign = 'right';
        for (i = 0; i <= highscores.length - 1; i ++) {
            if (i === posHighscore) {
                ctx.fillText('***' + highscores[i], 180, 40 + i * 10);
            } else {
                ctx.fillText(highscores[i], 180, 40 + i * 10);
            }
        }
    };

    highscoresScene.act = function () {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(gameScene);
            lastPress = null;
        }
    };

    //Event Listeners
    window.addEventListener('load', init, false);
    window.addEventListener('resize', resize, false);
}(window));