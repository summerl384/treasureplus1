class Player {
    constructor(nickname = '', playerId = '') {
        this.nickname = nickname;
        this.playerId = playerId;
        this.successCount = 0;
        this.totalGames = 0;
    }

    // 设置玩家昵称和ID，并加载玩家数据
    setNickname(nickname, playerId) {
        this.nickname = nickname;
        this.playerId = playerId;
        this.loadFromLocalStorage();
    }

    // 增加游戏成功次数
    incrementSuccess() {
        this.successCount++;
        this.totalGames++;
        this.saveToLocalStorage();
    }

    // 增加总游戏次数
    incrementTotalGames() {
        this.totalGames++;
        this.saveToLocalStorage();
    }

    // 将玩家数据保存到 localStorage
    saveToLocalStorage() {
        console.log("Saving player data:", this);  // Debugging
        localStorage.setItem(this.playerId, JSON.stringify(this)); // 使用 playerId 作为存储键
    }

    // 从 localStorage 加载玩家数据
    loadFromLocalStorage() {
        const playerData = localStorage.getItem(this.playerId);
        if (playerData) {
            const data = JSON.parse(playerData);
            this.nickname = data.nickname || '';  // 确保昵称被正确赋值
            this.successCount = data.successCount || 0;
            this.totalGames = data.totalGames || 0;
        }
    }

    // 静态方法：加载指定玩家的数据
    static loadPlayer(playerId) {
        const player = new Player();
        player.playerId = playerId;
        player.loadFromLocalStorage();
        return player;
    }
}

class TreasureMap {
    constructor() {
        this.player = null;
        this.clues = {
            bed: "床边有一张名信片，是株洲某个景点的",
            desk: "书桌上有一个玩偶，似乎只有方特才有",
            wardrobe: "衣柜里某件衣服里有一张去株洲的车票",
            guitar: "吉他上有一个贴纸，小美去方特玩的时候好像见过"
        };
        this.uselessClues = {
            bed: "床上是小明最爱待的地方，上面有小明偷偷藏的 MP3，可惜对猜出小明干嘛去了没什么帮助",
            desk: "书桌上厚厚的一本画册，里面全是我们，画的好丑！可惜对猜出小明干嘛去了没什么帮助",
            wardrobe: "衣柜里有我的几件衣服，我常常来小明家住，可惜对猜出小明干嘛去了没什么帮助",
            guitar: "吉他上有一朵小花，是我画的，小明当时差点揍了我一顿，可惜对猜出小明干嘛去了没什么帮助"
        };
        this.clickCount = 0;
        this.usefulClueCount = 0;
        this.bedClueFound = false;
        this.deskClueFound = false;
        this.wardrobeClueFound = false;
        this.guitarClueFound = false;
    }

    async findClue(buttonId) {
        const output = document.getElementById('output');
        const searching = document.getElementById('searching');
        const imageDisplay = document.getElementById('image-display');
        if (!this.player) {
            alert('请先初始化玩家！');
            return;
        }
        if (this.usefulClueCount === 2) {
            document.getElementById('output').textContent = "游戏成功！";
            document.getElementById('success-popup').style.display = 'block';
            this.player.incrementSuccess(); // 成功时增加成功次数
            return;
        }

        if (this.clickCount >= 3) {
            if (this.usefulClueCount < 2) {
                document.getElementById('output').textContent = "游戏失败！";
                document.getElementById('fail-popup').style.display = 'block';
                this.player.incrementTotalGames(); // 失败时也增加总游戏次数
                return;
            }
        }

        // 显示右上角的提示
        let usefulClueText = `有用线索：${this.usefulClueCount}`;
        let remainingClicks = 3 - this.clickCount;
        searching.textContent = `你们正在翻找“${buttonId === 'bed' ? '床' : buttonId === 'desk' ? '书桌' : buttonId === 'wardrobe' ? '衣柜' : '吉他'}”。${usefulClueText}，剩余点击次数：${remainingClicks}`;
        searching.style.fontSize = '20px';
        searching.style.fontWeight = 'bold';

        let imagePath;
        switch (buttonId) {
            case 'bed':
                imagePath = 'bed.jpg';
                break;
            case 'desk':
                imagePath = 'shuzhuo.jpg';
                break;
            case 'wardrobe':
                imagePath = 'yigui.jpg';
                break;
            case 'guitar':
                imagePath = 'jita.jpg';
                break;
        }

        // 显示图片
        imageDisplay.src = imagePath;
        imageDisplay.style.display = 'block';
        imageDisplay.style.transform = 'scale(2)';
        this.centerImage(imageDisplay);

        await new Promise(resolve => setTimeout(resolve, 10));

        let randomNumber = Math.random();
        let result;
        if (randomNumber < 4 / 5) {
            // 找到线索
            result = this.clues[buttonId];
            if ((buttonId === 'bed' && this.bedClueFound) ||
                (buttonId === 'wardrobe' && this.wardrobeClueFound && buttonId !== 'bed' && !this.bedClueFound)) {
                result = this.uselessClues[buttonId];
            } else if ((buttonId === 'desk' && this.deskClueFound) ||
                (buttonId === 'guitar' && this.guitarClueFound && buttonId !== 'desk' && !this.deskClueFound)) {
                result = this.uselessClues[buttonId];
            } else {
                output.textContent = `你们选择翻找“${buttonId === 'bed' ? '床' : buttonId === 'desk' ? '书桌' : buttonId === 'wardrobe' ? '衣柜' : '吉他'}”，找到了线索！\n${result}`;
                this.usefulClueCount++;
                if (buttonId === 'bed') this.bedClueFound = true;
                if (buttonId === 'desk') this.deskClueFound = true;
                if (buttonId === 'wardrobe') this.wardrobeClueFound = true;
                if (buttonId === 'guitar') this.guitarClueFound = true;
            }
        } else if (randomNumber < 5 / 6 && randomNumber > 4 / 5) {
            // 找到没用的线索
            result = this.uselessClues[buttonId];
            output.textContent = `你们选择翻找“${buttonId === 'bed' ? '床' : buttonId === 'desk' ? '书桌' : buttonId === 'wardrobe' ? '衣柜' : '吉他'}”，找到了没用的线索。\n${result}`;
        } else {
            // 什么也没找到
            output.textContent = `你们选择翻找“${buttonId === 'bed' ? '床' : buttonId === 'desk' ? '书桌' : buttonId === 'wardrobe' ? '衣柜' : '吉他'}”，很遗憾，什么也没找到。`;
        }
        searching.textContent = '';
        imageDisplay.style.display = 'none';
        imageDisplay.style.transform = 'scale(1)';
        imageDisplay.style.marginTop = '0';
        imageDisplay.style.marginLeft = '0';
        this.clickCount++;

        usefulClueText = `有用线索：${this.usefulClueCount}`;
        remainingClicks = 3 - this.clickCount;
        searching.textContent = `${usefulClueText}，剩余点击次数：${remainingClicks}`;
        searching.style.fontSize = '20px';
        searching.style.fontWeight = 'bold';

        // 加大输出文本字体
        output.style.fontSize = '20px';
        output.style.fontWeight = 'bold';
    }

    centerImage(imageElement) {
        const imgWidth = imageElement.clientWidth;
        const imgHeight = imageElement.clientHeight;
        imageElement.style.top = '50%';
        imageElement.style.left = '50%';
        imageElement.style.transformOrigin = 'center center';
        imageElement.style.marginTop = `-${imgHeight / 2}px`;
        imageElement.style.marginLeft = `-${imgWidth / 2}px`;
    }

    restartGame() {
        this.clickCount = 0;
        this.usefulClueCount = 0;
        this.bedClueFound = false;
        this.deskClueFound = false;
        this.wardrobeClueFound = false;
        this.guitarClueFound = false;
        document.getElementById('output').textContent = '';
        document.getElementById('fail-popup').style.display = 'none';
        document.getElementById('success-popup').style.display = 'none';  // 隐藏成功弹窗

        // 重置右上角计数器
        document.getElementById('searching').textContent = '';

        // 显示重新开始按钮
        document.getElementById('restart-button').style.display = 'block';
        document.getElementById('restart-game-button').style.display = 'block';  // 确保“重新开始游戏”按钮也显示
    }
}

// 初始化 TreasureMap 实例并加载玩家信息
const treasureMap = new TreasureMap();

// 在页面加载完成后显示活动开始前的提示
window.onload = function () {
    const nicknameInput = document.getElementById('nickname');
    const playerIdInput = document.getElementById('player-id');
    const startButton = document.getElementById('start-game');
    const userInfoDiv = document.getElementById('user-info');
    const gameContainer = document.getElementById('buttons-container');
    const output = document.getElementById('output');
    const playerInfoDiv = document.getElementById('player-info');

    let player = null;

    // 检查 localStorage 中是否有玩家数据
    const playerId = localStorage.getItem('currentPlayerId');
    if (playerId) {
        // 如果存在玩家数据，则加载玩家
        player = Player.loadPlayer(playerId);  // 加载玩家数据

        // 确保玩家数据加载完成后再显示玩家信息
        output.textContent = `${player.nickname}，你们来到了小明家，小明提议让你们猜猜他假期干嘛去了（提示：点击按钮即可搜索线索）`;
        playerInfoDiv.textContent = `玩家：${player.nickname}, 成功次数：${player.successCount}, 总游戏次数：${player.totalGames}`;

        // 显示游戏界面
        userInfoDiv.style.display = 'none';
        gameContainer.style.display = 'block';

        // 初始化 treasureMap 的 player
        treasureMap.player = player;

    } else {
        // 如果没有玩家数据，显示输入框
        userInfoDiv.style.display = 'block';
        gameContainer.style.display = 'none';
    }

    // 处理开始游戏按钮点击事件
    startButton.addEventListener('click', function () {
        const nickname = nicknameInput.value.trim();
        const playerId = playerIdInput.value.trim();

        if (nickname && playerId) {
            if (!player) {
                player = new Player();
            }
            player.setNickname(nickname, playerId);
            localStorage.setItem('currentPlayerId', playerId);  // 保存当前玩家 ID

            // 显示欢迎信息
            output.textContent = `${nickname}，你们来到了小明家，小明提议让你们猜猜他假期干嘛去了（提示：点击按钮即可搜索线索）`;
            playerInfoDiv.textContent = `玩家：${nickname}, 成功次数：${player.successCount}, 总游戏次数：${player.totalGames}`;
            userInfoDiv.style.display = 'none';
            gameContainer.style.display = 'block';

            // 保存玩家数据到 localStorage
            player.saveToLocalStorage();

            // 初始化游戏逻辑（比如重置游戏）
            treasureMap.restartGame();  // 重置游戏状态

            // 确保 treasureMap 的 player 被设置
            treasureMap.player = player;

        } else {
            alert("请输入昵称和玩家ID！");
        }
    });

    // 加载元素信息并显示
    fetch('elements.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== '');
            const elements = lines.map(line => {
                const [name, title, description] = line.split(',');
                return { name: name.trim(), title: title.trim(), description: description.trim() };
            });
            displayElements(elements);
        })
        .catch(error => {
            console.error('Error fetching the elements:', error);
            alert('加载元素信息失败，请稍后再试。');
        });
};

// 在开始游戏时存储玩家信息
document.getElementById("start-game").addEventListener("click", function() {
    const nickname = document.getElementById("nickname").value;
    const playerId = document.getElementById("player-id").value;

    // 存储玩家信息到localStorage
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("playerId", playerId);

    // 更新页面上的信息
    document.getElementById("player-info").textContent = `玩家：${nickname}（ID:${playerId}）`;

    // 显示游戏区域
    document.getElementById("buttons-container").style.display = 'block';
});

document.getElementById('logout-button').addEventListener('click', () => {
    // 清空 localStorage 中的玩家信息
    localStorage.removeItem('nickname');
    localStorage.removeItem('playerId');

    // 清空玩家数据
    treasureMap.player = null;

    // 显示用户输入界面并隐藏游戏界面
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('buttons-container').style.display = 'none';

    // 清除玩家信息显示
    document.getElementById('player-info').textContent = '';
    document.getElementById('output').textContent = '';
});

function displayElements(elements) {
    // 显示元素的函数（与之前提供的相同）
    const container = document.getElementById('elements-container');
    container.innerHTML = ''; // 清空容器
    elements.forEach(element => {
        const div = document.createElement('div');
        div.textContent = `${element.title} (${element.name}): ${element.description}`;
        container.appendChild(div);
    });
}

// 按钮事件监听
document.getElementById('bed').addEventListener('click', () => treasureMap.findClue('bed'));
document.getElementById('desk').addEventListener('click', () => treasureMap.findClue('desk'));
document.getElementById('wardrobe').addEventListener('click', () => treasureMap.findClue('wardrobe'));
document.getElementById('guitar').addEventListener('click', () => treasureMap.findClue('guitar'));

// 重新开始游戏按钮事件监听
document.getElementById('restart-button').addEventListener('click', () => treasureMap.restartGame());
document.getElementById('restart-game-button').addEventListener('click', () => {
    treasureMap.restartGame();
    document.getElementById('success-popup').style.display = 'none';  // 隐藏成功弹窗
});
