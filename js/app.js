//游戏数字信息
var GameConfig = {
    xWidth : 101,
    yWidth : 83,
    rows : 6,
    cols : 5,
    xMin : 0,
    yMin : 75,
    speedSlower : 20,
    speedSlow : 80,
    speedMid : 140,
    speedFast : 200,
    speedFaster : 260,
    sumStep : 0,
    scoreStep : 10,
    scoreJewel : 50,
    sumScore : 0
}
GameConfig.xMax = GameConfig.xMin + (GameConfig.cols-1) * GameConfig.xWidth;
GameConfig.yMax = GameConfig.yMin + (GameConfig.rows-2) * GameConfig.yWidth;

//工具函数
var Fn = {
    winMsgShow : function(msg){
        var winNode = document.getElementById('J_win');
        winNode.innerHTML = msg;
        winNode.style.display = 'block';
    },
    sumScoreShow : function(score){
        var scoreNode = document.getElementById('J_score');
        scoreNode.innerHTML = score;
    }
}


// 这是我们的玩家要躲避的敌人 
var Enemy = function(x,y,speed,repeat) {
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多

    // 敌人的图片，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';
    this.x = x || GameConfig.xMin;
    this.y = (y || GameConfig.yMin)-10;
    this.speed = speed || GameConfig.speedSlower;
    this.repeat = repeat || false;
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    // 
    if(this.repeat){
        this.x > GameConfig.xMax+GameConfig.yWidth ? this.x = -GameConfig.xWidth : this.x;
    }
    this.x += this.speed*dt;

    this.render();

    if(this.checkCollisions(player)){
        player.reset();
    }
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
Enemy.prototype.checkCollisions = function(player){
    var xColl ,yColl;
    xColl = Math.abs(this.x - player.x) < 50;
    yColl = Math.abs(this.y - player.y) < 50;
    if(xColl && yColl){
        return true;
    } 
    return false; 
}
// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function(x,y,sprite){
    this.sprite = sprite || 'images/char-boy.png'; 
    this.x = x;
    this.y = y;
    this.score = 0;
    this.getScore = true;//是否能继续得分，到达终点后不能再得分
    this.eatJewelNum = 0;//吃掉的宝石数量，重置时对应计分不清空

    this.initX = this.x;//重置时x坐标
    this.initY = this.y;//重置时y坐标
}
Player.prototype.update = function(){
    if(this.y < 0){
        Fn.winMsgShow('You Win!');
        this.getScore = false;
    }
    Fn.sumScoreShow(this.score);
    this.render();
}
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite),this.x,this.y);
}
Player.prototype.handleInput = function(direction){
    switch(direction){
        case 'left':
            if(this.x > GameConfig.xMin){
                this.x -= GameConfig.xWidth;
                this.getScore == true ? this.score += GameConfig.scoreStep : this.score;
            }
            break;
        case 'right':
            if(this.x < GameConfig.xMax){
                this.x += GameConfig.xWidth;
                this.getScore == true ? this.score += GameConfig.scoreStep : this.score;
            }
            break;
        case 'up':
            if(this.y >= GameConfig.yMin){
                this.y -= GameConfig.yWidth;
                this.getScore == true ? this.score += GameConfig.scoreStep : this.score;
            }
            break;
        case 'down':
            if(this.y < GameConfig.yMax){
                this.y += GameConfig.yWidth;  
                this.getScore == true ? this.score += GameConfig.scoreStep : this.score;           
            }
            break;
    }
    this.update();
}
//碰撞之后回到初始坐标
Player.prototype.reset = function(){
    this.x = this.initX;
    this.y = this.initY;
    this.score = this.eatJewelNum*GameConfig.scoreJewel;
    Fn.winMsgShow('');
    this.update();

}

//玩家可以吃掉的宝石对象
var Jewel = function(x,y){
    this.x = x;
    this.y = y;
    this.sprite = 'images/Gem Orange.png';
}
Jewel.prototype.update = function(){
    var dis = this.disappear(player);
    if(dis){
        Fn.winMsgShow('Excellent!');
        this.x = -GameConfig.xWidth*2;
        this.y = -GameConfig.yWidth*2;
    }
    this.render();
}
Jewel.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite),this.x,this.y);
}
Jewel.prototype.disappear = function(player){
    var xColl = Math.abs(this.x - player.x) < 10;
    var yColl = Math.abs(this.y - player.y) < 10;

    if(xColl && yColl){
        player.score += GameConfig.scoreJewel;
        player.eatJewelNum ++;
        return true;
    }
    return false;
}


// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
// 把玩家对象放进一个叫 player 的变量里面
var allEnemies = [
        new Enemy(),
        new Enemy(0,GameConfig.yMin + GameConfig.yWidth,GameConfig.speedMid),
        new Enemy(GameConfig.xWidth,GameConfig.yMin + GameConfig.yWidth,GameConfig.speedFast,true),
        new Enemy(GameConfig.xMin + GameConfig.xWidth*2,GameConfig.yMin + GameConfig.yWidth*2,GameConfig.speedSlow,true),
        new Enemy(GameConfig.xMin - GameConfig.xWidth*2,GameConfig.yMin + GameConfig.yWidth*2,GameConfig.speedFaster,false),
        new Enemy(0,0,GameConfig.speedFaster,true)

    ];
var allJewels = [
        new Jewel(GameConfig.xMin+GameConfig.xWidth,GameConfig.yMin+GameConfig.yWidth),
        new Jewel(GameConfig.xMin+GameConfig.xWidth*4,GameConfig.yMin)
    ];
var player = new Player(GameConfig.xMin+GameConfig.xWidth*2,GameConfig.yMin+GameConfig.yWidth*4,'images/char-cat-girl.png');

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Player.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
