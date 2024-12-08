const pygame = require('pygame');
const random = require('random');
const math = require('math');
const fs = require('fs'); // For saving and loading game state
const os = require('os');
const sys = require('sys');
const { DateTime } = require('luxon'); // For working with dates and times
const time = require('time');
const net = require('net'); // Importing the socket module for network communication
const pickle = require('pickle'); // Importing a similar library for serializing data
const struct = require('struct'); // Importing a similar library for packing/unpacking binary data
const base64 = require('base-64'); // Importing the base64 library for encoding/decoding data
const regex = require('regex'); // Importing the regular expressions module for pattern matching
const platform = require('platform'); // Importing the platform module for detecting operating system information
const { exec } = require('child_process'); // Importing the subprocess module for executing shell commands
const open = require('open'); // Importing the web browser module for opening URLs in default browsers
const axios = require('axios'); // Importing the axios library for making HTTP requests
const url = require('url'); // Importing the URL parsing module from Node.js standard library
const crypto = require('crypto'); // Importing the hashing module for generating unique identifiers    
const { v4: uuidv4 } = require('uuid'); // Importing the UUID module for generating universally unique identifiers

// Initialize Pygame equivalent in JavaScript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');
const AudioContext = require('web-audio-api').AudioContext;

const WIDTH = 800;
const HEIGHT = 600;
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const YELLOW = '#FFFF00';

let window;
let canvas;
let ctx;
let menuBackgroundImage;
const audioContext = new AudioContext();
let backgroundMusic;

// Create the main window
app.on('ready', () => {
    window = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    canvas = createCanvas(WIDTH, HEIGHT);
    ctx = canvas.getContext('2d');

    loadResources();
});

// Load resources with error handling
function loadResources() {
    try {
        menuBackgroundImage = loadImage('zombie.webp');
        menuBackgroundImage = scaleImage(menuBackgroundImage, WIDTH, HEIGHT);
    } catch (e) {
        console.error(`Error loading menu background image: ${e}`);
        menuBackgroundImage = null;
    }

    try {
        backgroundMusic = new Audio('The Last Confrontation.mp3');
        backgroundMusic.volume = 0.5;
        backgroundMusic.play();
    } catch (e) {
        console.error(`Error loading background music: ${e}`);
    }

    cheatCodes = loadCheatCodes();
}

// Load cheat codes from a file
function loadCheatCodes() {
    try {
        const data = fs.readFileSync('cheat_codes.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error("Cheat codes file not found!");
        } else {
            console.error("Error decoding cheat codes file!");
        }
        return {};
    }
}

// Cheat code input function
function cheatCodeInput() {
    let inputText = "";
    let enteringCode = true;

    const render = () => {
        ctx.fillStyle = BLACK;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = WHITE;
        ctx.font = '48px Arial';
        ctx.fillText("Enter Cheat Code:", WIDTH / 2 - ctx.measureText("Enter Cheat Code:").width / 2, HEIGHT / 4);
        
        ctx.fillStyle = YELLOW;
        ctx.fillText(inputText, WIDTH / 2 - ctx.measureText(inputText).width / 2, HEIGHT / 2);
        
        window.webContents.send('render', canvas.toDataURL());
    };

    render();

    window.webContents.on('keydown', (event) => {
        if (event.key === 'Escape') {
            enteringCode = false;
        } else if (event.key === 'Backspace') {
            inputText = inputText.slice(0, -1);
        } else if (event.key === 'Enter') {
            applyCheatCode(inputText.toUpperCase());
            enteringCode = false;
        } else {
            inputText += event.key;
        }
        render();
    });
}
function applyCheatCode(code) {
    /* Applies the cheat code if valid. */
    if (cheatCodes.hasOwnProperty(code)) {
        let cheat = cheatCodes[code];
        if (cheat.type === "coins") {
            playerCoins = cheat.value;
        } else if (cheat.type === "health") {
            playerHealth = cheat.value;
        } else if (cheat.type === "partner") {
            friendlyBots.push({
                pos: [Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT)],
                speed: friendlyBotSpeed,
                armor: friendlyBotArmor
            });
        }
        displayAlert(cheat.message);
    } else {
        displayAlert("Invalid Cheat Code!");
    }
}

// Colors
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const RED = [255, 0, 0];
const GREEN = [0, 255, 0];
const YELLOW = [255, 255, 0];
const BROWN = [139, 69, 19];
const BLUE = [0, 0, 255];

// Clock
const clock = new Clock(); // Assuming a Clock class exists

// Player
const playerSize = 40;
let playerPos = [WIDTH / 2, HEIGHT / 2];
const playerSpeed = 5;
let playerHealth = 3;
const playerMaxHealth = 3;
const playerArmor = 1; // New armor variable
let playerCoins = 0;
const bulletDamage = 1;

// AI Bot
const botSize = 30;
let bots = [];
const botSpeed = 2;
const botBulletSpeed = 5;
let botBullets = [];

// Friendly Bots
let friendlyBots = [];
const friendlyBotSpeed = 3;
let friendlyBotBullets = [];
const friendlyBotArmor = 1; // Armor for friendly bots

// Bullets
let bullets = [];
const bulletSpeed = 10;

// Wave system
let wave = 1;
const botsPerWave = 5;

// Scoreboard
let showScoreboard = false;
function spawnWave(wave) {
    for (let i = 0; i < botsPerWave * wave; i++) {
        const botPos = [Math.floor(Math.random() * (WIDTH - botSize)), Math.floor(Math.random() * (HEIGHT - botSize))];
        bots.push({"pos": botPos, "speed": botSpeed, "health": 3});
    }
}

function drawHealthBar() {
    const healthRatio = playerHealth / playerMaxHealth;
    context.fillStyle = RED;
    context.fillRect(10, 10, 200, 20);
    context.fillStyle = GREEN;
    context.fillRect(10, 10, 200 * healthRatio, 20);
    
    const healthPercentage = Math.floor(healthRatio * 100);
    const font = "24px Arial";
    context.font = font;
    context.fillStyle = WHITE;
    context.fillText(`${healthPercentage}%`, 220, 25);
}

function drawBotHealthBar(bot) {
    const healthRatio = bot.health / 3;
    context.fillStyle = RED;
    context.fillRect(bot.pos[0], bot.pos[1] - 10, botSize, 5);
    context.fillStyle = GREEN;
    context.fillRect(bot.pos[0], bot.pos[1] - 10, botSize * healthRatio, 5);
}

function drawCoins() {
    const font = "36px Arial";
    context.font = font;
    context.fillStyle = YELLOW;
    context.fillText(`Coins: ${playerCoins}`, WIDTH - 150, 25);
}

function drawScenery() {
    context.fillStyle = BROWN;
    context.fillRect(100, 100, 50, 150);
    context.fillStyle = GREEN;
    context.beginPath();
    context.arc(125, 100, 50, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = BROWN;
    context.fillRect(600, 400, 50, 150);
    context.fillStyle = GREEN;
    context.beginPath();
    context.arc(625, 400, 50, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = BLUE;
    context.fillRect(300, 200, 100, 50);
    context.fillStyle = BROWN;
    context.fillRect(400, 300, 100, 20);
}

function displayAlert(message, duration = 2) {
    const font = "48px Arial";
    context.font = font;
    context.fillStyle = YELLOW;
    const text = context.measureText(message);
    context.fillText(message, WIDTH / 2 - text.width / 2, HEIGHT / 2);
    setTimeout(() => {
        context.clearRect(0, 0, WIDTH, HEIGHT);
    }, duration * 1000);
}

function shop() {
    let shopOpen = true;
    while (shopOpen) {
        context.fillStyle = BLACK;
        context.fillRect(0, 0, WIDTH, HEIGHT);
        const font = "48px Arial";
        context.font = font;
        const options = [
            "1. Increase Bullet Speed (10 coins)",
            "2. Increase Bullet Damage (10 coins)",
            "3. Restore Health (5 coins)",
            "4. Increase Max Health (15 coins)",
            "5. Add AI bot partner (20 coins)",
            "6. Increase Armor (15 coins)",
            "7. Increase Partner Armor (15 coins)",
            "8. Exit Shop"
        ];
        options.forEach((option, i) => {
            context.fillStyle = WHITE;
            context.fillText(option, 50, 100 + i * 50);
        });

        // Assuming we have a function to handle events
        handleEvents(event => {
            if (event.type === 'QUIT') {
                // Handle quit
            } else if (event.type === 'KEYDOWN') {
                switch (event.key) {
                    case '1':
                        if (playerCoins >= 10) {
                            bulletSpeed += 2;
                            playerCoins -= 10;
                            displayAlert("Bullet Speed Increased!");
                        }
                        break;
                    case '2':
                        if (playerCoins >= 10) {
                            bulletDamage += 1;
                            playerCoins -= 10;
                            displayAlert("Bullet Damage Increased!");
                        }
                        break;
                    case '3':
                        if (playerCoins >= 5 && playerHealth < playerMaxHealth) {
                            playerHealth += 1;
                            playerCoins -= 5;
                            displayAlert("Health Restored!");
                        }
                        break;
                    case '4':
                        if (playerCoins >= 15) {
                            playerMaxHealth += 1;
                            playerCoins -= 15;
                            displayAlert("Max Health Increased!");
                        }
                        break;
                    case '5':
                        if (playerCoins >= 20) {
                            friendlyBots.push({"pos": [Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT)], "speed": friendlyBotSpeed, "armor": friendlyBotArmor});
                            playerCoins -= 20;
                            displayAlert("AI Bot Partner Added!");
                        }
                        break;
                    case '6':
                        if (playerCoins >= 15) {
                            playerArmor += 1;
                            playerCoins -= 15;
                            displayAlert("Armor Increased!");
                        }
                        break;
                    case '7':
                        if (playerCoins >= 15) {
                            friendlyBotArmor += 1;
                            playerCoins -= 15;
                            displayAlert("Partner Armor Increased!");
                        }
                        break;
                    case '8':
                        shopOpen = false;
                        break;
                }
            }
        });
    }
}

function unlockSpecialUpgrades() {
    playerCoins += 1000;
    displayAlert("You unlocked the secret Easter Egg! Enjoy the upgrades!");
    // Assuming we have a sound manager
    playSound("easter_egg.mp3");
}

const cheatCodes = {
    "$": {"type": "coins", "value": 100, "message": "Coins set to 100!"},
    "GOD": {"type": "health", "value": 10, "message": "Health restored to full!"},
    "NOTALONE": {"type": "partner", "message": "Partner added to the team!"},
    "EASTEREGG": {"type": "audio", "file": "easter_egg.wav", "message": "Audio cheat activated!"},
    "CAPTAIN": {
        "type": "unlock_character", 
        "message": "Superhero character unlocked!", 
        "character": {
            "name": "Captain Price", 
            "speed": 10, 
            "health": 100, 
            "armor": 10,
            "abilities": ["Super Strength", "quick movements", "Invincibility"]
        }
    }
};

function cheatCodeInput() {
    const font = "48px Arial";
    let inputText = "";
    let enteringCode = true;

    while (enteringCode) {
        context.fillStyle = BLACK;
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.font = font;
        const prompt = "Enter Secret Code:";
        const text = context.measureText(prompt);
        context.fillStyle = WHITE;
        context.fillText(prompt, WIDTH / 2 - text.width / 2, HEIGHT / 4);

        handleEvents(event => {
            if (event.type === 'QUIT') {
                // Handle quit
            } else if (event.type === 'KEYDOWN') {
                if (event.key === 'ENTER') {
                    applyCheatCode(inputText.toUpperCase());
                    enteringCode = false;
                } else if (event.key === 'BACKSPACE') {
                    inputText = inputText.slice(0, -1);
                } else if (event.key === 'ESCAPE') {
                    enteringCode = false;
                } else {
                    inputText += event.key;
                }
            }
        });
    }
}

function applyCheatCode(code) {
    if (cheatCodes.hasOwnProperty(code)) {
        const cheat = cheatCodes[code];
        if (cheat.type === "coins") {
            playerCoins = cheat.value;
        } else if (cheat.type === "health") {
            playerHealth = cheat.value;
        } else if (cheat.type === "partner") {
            friendlyBots.push({
                pos: [Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT)],
                speed: friendlyBotSpeed,
                armor: friendlyBotArmor
            });
        } else if (cheat.type === "audio") {
            playCheatAudio(cheat.file);
        } else if (cheat.type === "unlock_character") {
            unlockSecretCharacter(cheat.character);
        }
        displayAlert(cheat.message);
    } else {
        displayAlert("Invalid Cheat Code!");
    }
}

function playCheatAudio(file) {
    try {
        const cheatSound = new Audio(file);
        cheatSound.play();
    } catch (e) {
        console.error(`Error loading sound file: ${e}`);
    }
}

function unlockSecretCharacter(character) {
    playerCharacter = character;
    displayAlert(`You're now playing as ${character.name}!`);
}

function pauseMenu() {
    let paused = true;
    let selectedOption = 0;
    const menuOptions = ["Resume", "Game Settings", "How to Play", "Save Game", "Cheat Codes", "Main Menu"];

    const fontSize = 48; // Assuming a fixed font size for simplicity
    const optionHeight = fontSize + 10;
    const totalMenuHeight = menuOptions.length * optionHeight;
    const startY = (HEIGHT - totalMenuHeight) / 2;

    while (paused) {
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);

        menuOptions.forEach((option, i) => {
            const color = i === selectedOption ? "yellow" : "white";
            context.fillStyle = color;
            context.font = `${fontSize}px Arial`;
            const textWidth = context.measureText(option).width;
            context.fillText(option, (WIDTH - textWidth) / 2, startY + i * optionHeight);
        });

        // Handle menu navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape") { // Quit the game
                window.close();
            } else if (event.key === "ArrowUp") {
                selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
            } else if (event.key === "ArrowDown") {
                selectedOption = (selectedOption + 1) % menuOptions.length;
            } else if (event.key === "Enter") {
                switch (selectedOption) {
                    case 0: // Resume
                        paused = false;
                        break;
                    case 1: // Game Settings
                        gameSettings();
                        break;
                    case 2: // How to Play
                        howToPlay();
                        break;
                    case 3: // Save Game
                        saveGame();
                        break;
                    case 4: // Cheat Codes
                        cheatCodeInput();
                        break;
                    case 5: // Main Menu
                        paused = false;
                        mainMenu();
                        return;
                }
            }
        });
    }
}

function gameSettings() {
    let settingActive = true;
    let selectedSetting = 0;
    const settingsOptions = ["Toggle Fullscreen", "Adjust Music Volume", "Change Music Track", "Back"];

    while (settingActive) {
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        settingsOptions.forEach((option, i) => {
            const color = i === selectedSetting ? "yellow" : "white";
            context.fillStyle = color;
            context.font = "48px Arial";
            const textWidth = context.measureText(option).width;
            context.fillText(option, (WIDTH - textWidth) / 2, HEIGHT / 2 + i * 60);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape") {
                window.close();
            } else if (event.key === "ArrowUp") {
                selectedSetting = (selectedSetting - 1 + settingsOptions.length) % settingsOptions.length;
            } else if (event.key === "ArrowDown") {
                selectedSetting = (selectedSetting + 1) % settingsOptions.length;
            } else if (event.key === "Enter") {
                switch (selectedSetting) {
                    case 0: // Toggle Fullscreen
                        toggleFullscreen();
                        break;
                    case 1: // Adjust Music Volume
                        adjustMusicVolume();
                        break;
                    case 2: // Change Music Track
                        changeMusicTrack();
                        break;
                    case 3: // Back
                        settingActive = false;
                        break;
                }
            }
        });
    }
}

function mainMenu() {
    const menuOptions = ["Start", "Load Game", "Exit"];
    let selectedOption = 0;

    // Play background music indefinitely
    music.play(-1);

    while (true) {
        // Draw the background image
        if (menuBackgroundImage) {
            context.drawImage(menuBackgroundImage, 0, 0);
        }

        const titleFont = "72px Arial";
        context.font = titleFont;
        const title = "Z Horde";
        const titleWidth = context.measureText(title).width;
        context.fillStyle = "white";
        context.fillText(title, WIDTH / 2 - titleWidth / 2, HEIGHT / 4);

        const optionFont = "48px Arial";
        context.font = optionFont;
        for (let i = 0; i < menuOptions.length; i++) {
            context.fillStyle = (i === selectedOption) ? "yellow" : "white";
            const text = menuOptions[i];
            const textWidth = context.measureText(text).width;
            context.fillText(text, WIDTH / 2 - textWidth / 2, HEIGHT / 2 + i * 60);
        }

        // Update display
        updateDisplay();

        // Handle events
        for (const event of getEvents()) {
            if (event.type === "QUIT") {
                quit();
                exit();
            } else if (event.type === "KEYDOWN") {
                if (event.key === "ArrowUp") {
                    selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
                } else if (event.key === "ArrowDown") {
                    selectedOption = (selectedOption + 1) % menuOptions.length;
                } else if (event.key === "Enter") {
                    if (selectedOption === 0) { // Start
                        music.stop(); // Stop menu music
                        return; // Exit to game
                    } else if (selectedOption === 1) { // Load Game
                        loadGame();
                        return; // Exit to game after loading
                    } else if (selectedOption === 2) { // Exit
                        quit();
                        exit();
                    }
                }
            }
        }
    }
}

// Music tracks
const musicTracks = [
    "track3.mp3",
    "track2.mp3",
    "track1.mp3", // Add more tracks as needed
    "Shadows of the Abyss.mp3",
];

// Initialize variables
let currentTrackIndex = 0;

function changeMusicTrack() {
    let trackSelectionActive = true;
    while (trackSelectionActive) {
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        const trackFont = "48px Arial";
        context.font = trackFont;

        const currentTrack = musicTracks[currentTrackIndex];
        const text = `Current Track: ${currentTrack}`;
        const textWidth = context.measureText(text).width;
        context.fillStyle = "white";
        context.fillText(text, WIDTH / 2 - textWidth / 2, HEIGHT / 2);

        const instructionText = "Use LEFT/RIGHT to Change, ENTER to Confirm";
        const instructionWidth = context.measureText(instructionText).width;
        context.fillText(instructionText, WIDTH / 2 - instructionWidth / 2, HEIGHT / 2 + 60);

        updateDisplay();

        for (const event of getEvents()) {
            if (event.type === "QUIT") {
                quit();
                exit();
            } else if (event.type === "KEYDOWN") {
                if (event.key === "ArrowLeft") {
                    currentTrackIndex = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
                    music.load(musicTracks[currentTrackIndex]);
                    music.play(-1);
                } else if (event.key === "ArrowRight") {
                    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
                    music.load(musicTracks[currentTrackIndex]);
                    music.play(-1);
                } else if (event.key === "Enter") {
                    trackSelectionActive = false;
                }
            }
        }
    }
}

function howToPlay() {
    let playingHints = true;
    const hints = [
        "How to Play:",
        "",
        "Move with W, A, S, D keys.",
        "Shoot by clicking the left mouse button.",
        "Press P to pause the game.",
        "Press C to open the shop.",
        "Defeat enemies to earn coins.",
        "Use coins to upgrade your health, armor, and damage.",
        "",
        "Good luck surviving the Z Horde!"
    ];

    while (playingHints) {
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        const hintFont = "36px Arial";
        context.font = hintFont;

        for (let i = 0; i < hints.length; i++) {
            const text = hints[i];
            context.fillStyle = "white";
            context.fillText(text, 50, 50 + i * 40);
        }

        const exitText = "Press ESC to return to the menu.";
        context.fillStyle = "yellow";
        context.fillText(exitText, 50, HEIGHT - 50);

        updateDisplay();

        for (const event of getEvents()) {
            if (event.type === "QUIT") {
                quit();
                exit();
            } else if (event.type === "KEYDOWN") {
                if (event.key === "Escape") { // Exit on ESC key
                    playingHints = false;
                }
            }
        }
    }
}

function toggleFullscreen() {
    // Toggle fullscreen logic
}

function adjustMusicVolume() {
    let volumeActive = true;
    let currentVolume = music.getVolume();
    while (volumeActive) {
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        const volumeFont = "48px Arial";
        context.font = volumeFont;
        const text = `Volume: ${Math.round(currentVolume * 100)}%`;
        const textWidth = context.measureText(text).width;
        context.fillStyle = "white";
        context.fillText(text, WIDTH / 2 - textWidth / 2, HEIGHT / 2);

        const instructionText = "Use UP/DOWN to Adjust, ENTER to Confirm";
        const instructionWidth = context.measureText(instructionText).width;
        context.fillText(instructionText, WIDTH / 2 - instructionWidth / 2, HEIGHT / 2 + 60);

        updateDisplay();

        for (const event of getEvents()) {
            if (event.type === "QUIT") {
                quit();
                exit();
            } else if (event.type === "KEYDOWN") {
                if (event.key === "ArrowUp" && currentVolume < 1.0) {
                    currentVolume += 0.1;
                    music.setVolume(currentVolume);
                } else if (event.key === "ArrowDown" && currentVolume > 0.0) {
                    currentVolume -= 0.1;
                    music.setVolume(currentVolume);
                } else if (event.key === "Enter") {
                    volumeActive = false;
                }
            }
        }
    }
}

function saveGame() {
    const gameState = {
        playerPos: playerPos,
        playerHealth: playerHealth,
        playerMaxHealth: playerMaxHealth,
        playerArmor: playerArmor,
        playerCoins: playerCoins,
        wave: wave
    };
    const fs = require('fs');
    fs.writeFileSync("savegame.json", JSON.stringify(gameState));
    displayAlert("Game Saved!");
}

function drawScoreboard() {
    const scoreboardFont = "48px Arial";
    context.font = scoreboardFont;
    const text = `Scoreboard - Coins: ${playerCoins}, Wave: ${wave}`;
    const textWidth = context.measureText(text).width;
    context.fillStyle = "white";
    context.fillText(text, WIDTH / 2 - textWidth / 2, HEIGHT / 2 - 50);
}

function loadGame() {
    const fs = require('fs');
    try {
        const gameState = JSON.parse(fs.readFileSync("savegame.json"));
        playerPos = gameState.playerPos;
        playerHealth = gameState.playerHealth;
        playerMaxHealth = gameState.playerMaxHealth;
        playerArmor = gameState.playerArmor;
        playerCoins = gameState.playerCoins;
        wave = gameState.wave;
        displayAlert("Game Loaded!");
    } catch (error) {
        displayAlert("No Save Found!");
    }
}
function drawExplosion(pos) {
    // Draw a simple explosion effect
    for (let i = 0; i < 10; i++) {
        const offsetX = Math.floor(Math.random() * 21) - 10;
        const offsetY = Math.floor(Math.random() * 21) - 10;
        ctx.beginPath();
        ctx.arc(pos[0] + offsetX, pos[1] + offsetY, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }
}

// Load the background image for the death screen
let deathBackgroundImage;
try {
    deathBackgroundImage = new Image();
    deathBackgroundImage.src = 'death_background.webp';
    deathBackgroundImage.onload = function() {
        // Scale the image if necessary
    };
} catch (e) {
    console.error(`Error loading death background image: ${e}`);
    deathBackgroundImage = null;
}

// Load the death screen audio
let deathAudio;
try {
    deathAudio = new Audio('Shadows of the Abyss.mp3');
} catch (e) {
    console.error(`Error loading death audio: ${e}`);
    deathAudio = null;
}

function deathScreen() {
    // Play the death audio
    if (deathAudio) {
        deathAudio.play();
    }

    // Draw the background image
    if (deathBackgroundImage) {
        ctx.drawImage(deathBackgroundImage, 0, 0);
    }
    
    const font72 = '72px Arial';
    ctx.font = font72;
    ctx.fillStyle = 'red';
    const text = "You're Dead";
    ctx.fillText(text, WIDTH / 2 - ctx.measureText(text).width / 2, HEIGHT / 3);

    const font48 = '48px Arial';
    ctx.font = font48;
    const continueText = "Press any key to continue";
    ctx.fillStyle = 'white';
    ctx.fillText(continueText, WIDTH / 2 - ctx.measureText(continueText).width / 2, HEIGHT / 2);

    // Wait for any key press to continue
    document.addEventListener('keydown', function onKeyDown() {
        waiting = false;
        document.removeEventListener('keydown', onKeyDown);
    });

    // Stop the death audio when exiting the death screen
    if (deathAudio) {
        deathAudio.pause();
    }

    resetGame();  // Reset the game state
}

function resetGame() {
    playerPos = [WIDTH / 2, HEIGHT / 2];
    playerHealth = 3;
    playerMaxHealth = 3;
    playerArmor = 1;
    playerCoins = 0;
    wave = 1;
    bots = [];
    bullets = [];
    friendlyBots = [];
    friendlyBotBullets = [];
    botBullets = [];
    spawnWave(wave);
}

// Load round start sound
let roundStartSound;
try {
    roundStartSound = new Audio('round_start.wav');
} catch (e) {
    console.error(`Error loading round start sound: ${e}`);
    roundStartSound = null;
}

function displayRoundStartMessage(wave) {
    const font72 = '72px Arial';
    const message = `Wave ${wave}: Game Started`;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.font = font72;
    ctx.fillStyle = 'yellow';
    ctx.fillText(message, WIDTH / 2 - ctx.measureText(message).width / 2, HEIGHT / 2 - 36);

    if (roundStartSound) {
        roundStartSound.play();
    }
    setTimeout(() => {}, 3000);  // Pause for 3 seconds before starting the round
}

function menuScreen() {
    const menuOptions = ["Start", "Load Game", "Exit"];
    let selectedOption = 0;

    while (true) {
        // Draw the background image
        if (menuBackgroundImage) {
            ctx.drawImage(menuBackgroundImage, 0, 0);
        }

        const font72 = '72px Arial';
        ctx.font = font72;
        ctx.fillStyle = 'white';
        const title = "Z horde";
        ctx.fillText(title, WIDTH / 2 - ctx.measureText(title).width / 2, HEIGHT / 4);

        const font48 = '48px Arial';
        ctx.font = font48;
        for (let i = 0; i < menuOptions.length; i++) {
            const color = (i === selectedOption) ? 'yellow' : 'white';
            ctx.fillStyle = color;
            ctx.fillText(menuOptions[i], WIDTH / 2 - ctx.measureText(menuOptions[i]).width / 2, HEIGHT / 2 + i * 60);
        }

        // Handle input
        document.addEventListener('keydown', function onKeyDown(event) {
            if (event.key === 'ArrowUp') {
                selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
            } else if (event.key === 'ArrowDown') {
                selectedOption = (selectedOption + 1) % menuOptions.length;
            } else if (event.key === 'Enter') {
                document.removeEventListener('keydown', onKeyDown);
                if (selectedOption === 0) {  // Start
                    displayRoundStartMessage(1);  // Show wave 1 start message and sound
                    return;
                } else if (selectedOption === 1) {  // Load Game
                    loadGame();
                    return;
                } else if (selectedOption === 2) {  // Exit
                    window.close();
                }
            }
        });
    }
}

// Main execution
menuScreen();  // Display the menu screen before starting the game
let running = true;
spawn_wave(wave);
const auto_save_interval = 15 * 1000; // Auto-save every 15 seconds
let last_auto_save = Date.now();

while (running) {
    screen.fill(BLACK);
    draw_scenery();  // Draw scenery elements
    
    for (const event of getEvents()) {
        if (event.type === 'QUIT') {
            running = false;
        } else if (event.type === 'MOUSEBUTTONDOWN' && event.button === 1) {
            const { mouseX, mouseY } = getMousePosition();
            const angle = Math.atan2(mouseY - player_pos[1], mouseX - player_pos[0]);
            bullets.push({ pos: [...player_pos], angle });
        } else if (event.type === 'KEYDOWN') {
            if (event.key === 'c') {
                shop();  // Open shop with 'C' key
            } else if (event.key === 'p') {
                pause_menu();  // Pause the game with 'P' key
            } else if (event.key === 'o') {
                show_scoreboard = !show_scoreboard;  // Toggle scoreboard with 'O' key
            }
        }
    }

    // Player movement
    const keys = getPressedKeys();
    if (keys['w'] && player_pos[1] > 0) {
        player_pos[1] -= player_speed;
    }
    if (keys['s'] && player_pos[1] < HEIGHT - player_size) {
        player_pos[1] += player_speed;
    }
    if (keys['a'] && player_pos[0] > 0) {
        player_pos[0] -= player_speed;
    }
    if (keys['d'] && player_pos[0] < WIDTH - player_size) {
        player_pos[0] += player_speed;
    }

    // Update bullets
    for (let bullet of bullets.slice()) {
        bullet.pos[0] += bullet_speed * Math.cos(bullet.angle);
        bullet.pos[1] += bullet_speed * Math.sin(bullet.angle);
        if (bullet.pos[0] < 0 || bullet.pos[0] > WIDTH || bullet.pos[1] < 0 || bullet.pos[1] > HEIGHT) {
            bullets.splice(bullets.indexOf(bullet), 1);
        }
    }

    // Draw player
    drawRect(screen, GREEN, [...player_pos, player_size, player_size]);

    // Update and draw bots
    for (let bot of bots.slice()) {
        const bot_dir = Math.atan2(player_pos[1] - bot.pos[1], player_pos[0] - bot.pos[0]);
        bot.pos[0] += bot.speed * Math.cos(bot_dir);
        bot.pos[1] += bot.speed * Math.sin(bot_dir);
        drawRect(screen, RED, [...bot.pos, bot_size, bot_size]);
        draw_bot_health_bar(bot);

        // Bots shooting back
        if (Math.random() < 0.01) {  // Random chance to shoot
            const angle = Math.atan2(player_pos[1] - bot.pos[1], player_pos[0] - bot.pos[0]);
            bot_bullets.push({ pos: [...bot.pos], angle });
        }

        // Check for collisions with bullets
        for (let bullet of bullets.slice()) {
            if (
                bot.pos[0] < bullet.pos[0] < bot.pos[0] + bot_size &&
                bot.pos[1] < bullet.pos[1] < bot.pos[1] + bot_size
            ) {
                draw_explosion(bullet.pos);  // Draw explosion effect
                bot.health -= bullet_damage;
                bullets.splice(bullets.indexOf(bullet), 1);
                if (bot.health <= 0) {
                    bots.splice(bots.indexOf(bot), 1);
                    player_coins += 1;  // Earn coins for defeating a bot
                }
                break;
            }
        }
    }

    // Update and draw friendly bots
    for (const friendly_bot of friendly_bots) {
        if (bots.length) {
            const nearest_bot = bots.reduce((nearest, b) => 
                Math.hypot(b.pos[0] - friendly_bot.pos[0], b.pos[1] - friendly_bot.pos[1]) < 
                Math.hypot(nearest.pos[0] - friendly_bot.pos[0], nearest.pos[1] - friendly_bot.pos[1]) ? b : nearest);

            const bot_dir = Math.atan2(nearest_bot.pos[1] - friendly_bot.pos[1], nearest_bot.pos[0] - friendly_bot.pos[0]);
            friendly_bot.pos[0] += friendly_bot.speed * Math.cos(bot_dir);
            friendly_bot.pos[1] += friendly_bot.speed * Math.sin(bot_dir);

            // Friendly bot shooting
            if (Math.random() < 0.02) {  // Random chance to shoot
                const angle = Math.atan2(nearest_bot.pos[1] - friendly_bot.pos[1], nearest_bot.pos[0] - friendly_bot.pos[0]);
                friendly_bot_bullets.push({ pos: [...friendly_bot.pos], angle });
            }
        }
        drawRect(screen, BLUE, [...friendly_bot.pos, bot_size, bot_size]);
    }

    // Update and draw friendly bot bullets
    for (let friendly_bullet of friendly_bot_bullets.slice()) {
        friendly_bullet.pos[0] += bullet_speed * Math.cos(friendly_bullet.angle);
        friendly_bullet.pos[1] += bullet_speed * Math.sin(friendly_bullet.angle);
        drawCircle(screen, GREEN, [Math.round(friendly_bullet.pos[0]), Math.round(friendly_bullet.pos[1])], 5);

        // Check for collisions with enemy bots
        for (let bot of bots.slice()) {
            if (
                bot.pos[0] < friendly_bullet.pos[0] < bot.pos[0] + bot_size &&
                bot.pos[1] < friendly_bullet.pos[1] < bot.pos[1] + bot_size
            ) {
                bot.health -= bullet_damage;
                friendly_bot_bullets.splice(friendly_bot_bullets.indexOf(friendly_bullet), 1);
                if (bot.health <= 0) {
                    bots.splice(bots.indexOf(bot), 1);
                    player_coins += 1;  // Earn coins for defeating a bot
                }
                break;
            }
        }
    }

    // Update and draw bot bullets
    for (let bot_bullet of bot_bullets.slice()) {
        bot_bullet.pos[0] += bot_bullet_speed * Math.cos(bot_bullet.angle);
        bot_bullet.pos[1] += bot_bullet_speed * Math.sin(bot_bullet.angle);
        drawCircle(screen, RED, [Math.round(bot_bullet.pos[0]), Math.round(bot_bullet.pos[1])], 5);

        // Check for collision with player
        if (
            player_pos[0] < bot_bullet.pos[0] < player_pos[0] + player_size &&
            player_pos[1] < bot_bullet.pos[1] < player_pos[1] + player_size
        ) {
            const damage = Math.max(1, 1 - player_armor);  // Calculate damage considering armor
            player_health -= damage;
            bot_bullets.splice(bot_bullets.indexOf(bot_bullet), 1);
            if (player_health <= 0) {
                death_screen();  // Show death screen
                menu_screen();   // Return to the main menu
                running = false;
            }
        }
    }

    // Draw bullets
    for (const bullet of bullets) {
        drawCircle(screen, WHITE, [Math.round(bullet.pos[0]), Math.round(bullet.pos[1])], 5);
    }

    // Draw health bar and coins
    draw_health_bar();
    draw_coins();

    // Draw scoreboard if toggled
    if (show_scoreboard) {
        draw_scoreboard();
    }

    // Check if wave is cleared
    if (!bots.length) {
        player_coins *= wave; // Multiply coins by wave number
        player_coins += 10;   // Add wave bonus points
        shop();               // Open shop at the end of the wave
        wave += 1;           // Increase wave number and spawn new wave
        spawn_wave(wave);
    }

    // Auto-save logic
    const current_time = Date.now();
    if (current_time - last_auto_save > auto_save_interval) {
        save_game();
        last_auto_save = current_time;
    }

    display.flip();
    clock.tick(60);
}

let player_pos = [0, 0];
let player_speed = 5;
let player_size = 50;
let bullets = [];
let bots = [];
let friendly_bots = [];
let bot_bullets = [];
let friendly_bot_bullets = [];
let player_coins = 0;
let player_health = 100;
let player_armor = 0;
let bullet_damage = 10;
let bullet_speed = 10;
let bot_bullet_speed = 8;
let bot_size = 50;
let wave = 1;
let show_scoreboard = false;
let HEIGHT = 600;
let WIDTH = 800;

function gameLoop() {
    // Player movement
    let keys = getPressedKeys(); // Replace with appropriate function to get pressed keys
    if (keys['w'] && player_pos[1] > 0) {
        player_pos[1] -= player_speed;
    }
    if (keys['s'] && player_pos[1] < HEIGHT - player_size) {
        player_pos[1] += player_speed;
    }
    if (keys['a'] && player_pos[0] > 0) {
        player_pos[0] -= player_speed;
    }
    if (keys['d'] && player_pos[0] < WIDTH - player_size) {
        player_pos[0] += player_speed;
    }

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.pos[0] += bullet_speed * Math.cos(bullet.angle);
        bullet.pos[1] += bullet_speed * Math.sin(bullet.angle);
        return bullet.pos[0] >= 0 && bullet.pos[0] <= WIDTH && bullet.pos[1] >= 0 && bullet.pos[1] <= HEIGHT;
    });

    // Draw player
    drawRect(screen, 'green', player_pos[0], player_pos[1], player_size, player_size); // Replace drawRect with appropriate drawing function

    // Update and draw bots
    bots.forEach(bot => {
        let bot_dir = Math.atan2(player_pos[1] - bot.pos[1], player_pos[0] - bot.pos[0]);
        bot.pos[0] += bot.speed * Math.cos(bot_dir);
        bot.pos[1] += bot.speed * Math.sin(bot_dir);
        drawRect(screen, 'red', bot.pos[0], bot.pos[1], bot_size, bot_size);
        drawBotHealthBar(bot); // Replace with appropriate function

        // Bots shooting back
        if (Math.random() < 0.01) { // Random chance to shoot
            let angle = Math.atan2(player_pos[1] - bot.pos[1], player_pos[0] - bot.pos[0]);
            bot_bullets.push({ pos: [...bot.pos], angle: angle });
        }

        // Check for collisions with bullets
        bullets.forEach(bullet => {
            if (bot.pos[0] < bullet.pos[0] && bullet.pos[0] < bot.pos[0] + bot_size &&
                bot.pos[1] < bullet.pos[1] && bullet.pos[1] < bot.pos[1] + bot_size) {
                drawExplosion(bullet.pos); // Replace with appropriate function
                bot.health -= bullet_damage;
                bullets.splice(bullets.indexOf(bullet), 1);
                if (bot.health <= 0) {
                    bots.splice(bots.indexOf(bot), 1);
                    player_coins += 1; // Earn coins for defeating a bot
                }
            }
        });
    });

    // Update and draw friendly bots
    friendly_bots.forEach(friendly_bot => {
        if (bots.length > 0) {
            let nearest_bot = bots.reduce((nearest, bot) => {
                let nearestDistance = Math.hypot(nearest.pos[0] - friendly_bot.pos[0], nearest.pos[1] - friendly_bot.pos[1]);
                let currentDistance = Math.hypot(bot.pos[0] - friendly_bot.pos[0], bot.pos[1] - friendly_bot.pos[1]);
                return currentDistance < nearestDistance ? bot : nearest;
            });
            let bot_dir = Math.atan2(nearest_bot.pos[1] - friendly_bot.pos[1], nearest_bot.pos[0] - friendly_bot.pos[0]);
            friendly_bot.pos[0] += friendly_bot.speed * Math.cos(bot_dir);
            friendly_bot.pos[1] += friendly_bot.speed * Math.sin(bot_dir);

            if (Math.random() < 0.02) { // Random chance to shoot
                let angle = Math.atan2(nearest_bot.pos[1] - friendly_bot.pos[1], nearest_bot.pos[0] - friendly_bot.pos[0]);
                friendly_bot_bullets.push({ pos: [...friendly_bot.pos], angle: angle });
            }
        }
        drawRect(screen, 'blue', friendly_bot.pos[0], friendly_bot.pos[1], bot_size, bot_size);
    });

    // Update and draw friendly bot bullets
    friendly_bot_bullets = friendly_bot_bullets.filter(friendly_bullet => {
        friendly_bullet.pos[0] += bullet_speed * Math.cos(friendly_bullet.angle);
        friendly_bullet.pos[1] += bullet_speed * Math.sin(friendly_bullet.angle);
        drawCircle(screen, 'green', Math.round(friendly_bullet.pos[0]), Math.round(friendly_bullet.pos[1]), 5); // Replace with appropriate function
        return true; // Keep all bullets for now to check collisions
    });

    friendly_bot_bullets.forEach(friendly_bullet => {
        bots.forEach(bot => {
            if (bot.pos[0] < friendly_bullet.pos[0] && friendly_bullet.pos[0] < bot.pos[0] + bot_size &&
                bot.pos[1] < friendly_bullet.pos[1] && friendly_bullet.pos[1] < bot.pos[1] + bot_size) {
                bot.health -= bullet_damage;
                friendly_bot_bullets.splice(friendly_bot_bullets.indexOf(friendly_bullet), 1);
                if (bot.health <= 0) {
                    bots.splice(bots.indexOf(bot), 1);
                    player_coins += 1; // Earn coins for defeating a bot
                }
            }
        });
    });

    // Update and draw bot bullets
    bot_bullets = bot_bullets.filter(bot_bullet => {
        bot_bullet.pos[0] += bot_bullet_speed * Math.cos(bot_bullet.angle);
        bot_bullet.pos[1] += bot_bullet_speed * Math.sin(bot_bullet.angle);
        drawCircle(screen, 'red', Math.round(bot_bullet.pos[0]), Math.round(bot_bullet.pos[1]), 5); // Replace with appropriate function

        if (player_pos[0] < bot_bullet.pos[0] && bot_bullet.pos[0] < player_pos[0] + player_size &&
            player_pos[1] < bot_bullet.pos[1] && bot_bullet.pos[1] < player_pos[1] + player_size) {
            let damage = Math.max(1, 1 - player_armor); // Calculate damage considering armor
            player_health -= damage;
            bot_bullets.splice(bot_bullets.indexOf(bot_bullet), 1);
            if (player_health <= 0) {
                deathScreen(); // Show death screen
                menuScreen(); // Return to the main menu
                return false; // Stop the game
            }
        }
        return true; // Keep the bullet
    });

    // Draw bullets
    bullets.forEach(bullet => {
        drawCircle(screen, 'white', Math.round(bullet.pos[0]), Math.round(bullet.pos[1]), 5); // Replace with appropriate function
    });

    // Draw health bar and coins
    drawHealthBar(); // Replace with appropriate function
    drawCoins(); // Replace with appropriate function

    // Draw scoreboard if toggled
    if (show_scoreboard) {
        drawScoreboard(); // Replace with appropriate function
    }

    // Check if wave is cleared
    if (bots.length === 0) {
        player_coins *= wave;
        player_coins += 10;
        shop(); // Replace with appropriate function
        wave += 1;
        spawnWave(wave); // Replace with appropriate function

        // Auto-save after every 5 waves
        if (wave % 5 === 0) {
            saveGame(); // Replace with appropriate function
        }
    }

    // Update the screen
    updateScreen(); // Replace with appropriate function
    setTimeout(gameLoop, 1000 / 60); // 60 FPS
}

// Main execution
menuScreen(); // Display the menu screen before starting the game
gameLoop(); // Start the game loop

for (let friendly_bot of friendly_bots) {
    if (bots.length > 0) {
        let nearest_bot = bots.reduce((a, b) => {
            let distA = Math.hypot(b["pos"][0] - friendly_bot["pos"][0], b["pos"][1] - friendly_bot["pos"][1]);
            let distB = Math.hypot(a["pos"][0] - friendly_bot["pos"][0], a["pos"][1] - friendly_bot["pos"][1]);
            return distA < distB ? b : a;
        });
        let bot_dir = Math.atan2(nearest_bot["pos"][1] - friendly_bot["pos"][1], nearest_bot["pos"][0] - friendly_bot["pos"][0]);
        friendly_bot["pos"][0] += friendly_bot["speed"] * Math.cos(bot_dir);
        friendly_bot["pos"][1] += friendly_bot["speed"] * Math.sin(bot_dir);

        if (Math.random() < 0.02) {
            let angle = Math.atan2(nearest_bot["pos"][1] - friendly_bot["pos"][1], nearest_bot["pos"][0] - friendly_bot["pos"][0]);
            friendly_bot_bullets.push({"pos": [...friendly_bot["pos"]], "angle": angle});
        }
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(friendly_bot["pos"][0], friendly_bot["pos"][1], bot_size, bot_size);
}

for (let friendly_bullet of [...friendly_bot_bullets]) {
    friendly_bullet["pos"][0] += bullet_speed * Math.cos(friendly_bullet["angle"]);
    friendly_bullet["pos"][1] += bullet_speed * Math.sin(friendly_bullet["angle"]);
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(friendly_bullet["pos"][0], friendly_bullet["pos"][1], 5, 0, Math.PI * 2);
    ctx.fill();

    for (let bot of [...bots]) {
        if (bot["pos"][0] < friendly_bullet["pos"][0] && friendly_bullet["pos"][0] < bot["pos"][0] + bot_size &&
            bot["pos"][1] < friendly_bullet["pos"][1] && friendly_bullet["pos"][1] < bot["pos"][1] + bot_size) {
            bot["health"] -= bullet_damage;
            friendly_bot_bullets.splice(friendly_bot_bullets.indexOf(friendly_bullet), 1);
            if (bot["health"] <= 0) {
                bots.splice(bots.indexOf(bot), 1);
                player_coins += 1;
            }
            break;
        }
    }
}

for (let bot_bullet of [...bot_bullets]) {
    bot_bullet["pos"][0] += bot_bullet_speed * Math.cos(bot_bullet["angle"]);
    bot_bullet["pos"][1] += bot_bullet_speed * Math.sin(bot_bullet["angle"]);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(bot_bullet["pos"][0], bot_bullet["pos"][1], 5, 0, Math.PI * 2);
    ctx.fill();

    if (player_pos[0] < bot_bullet["pos"][0] && bot_bullet["pos"][0] < player_pos[0] + player_size &&
        player_pos[1] < bot_bullet["pos"][1] && bot_bullet["pos"][1] < player_pos[1] + player_size) {
        let damage = Math.max(1, 1 - player_armor);
        player_health -= damage;
        bot_bullets.splice(bot_bullets.indexOf(bot_bullet), 1);
        if (player_health <= 0) {
            death_screen();
            menu_screen();
            running = false;
        }
    }
}

for (let bullet of bullets) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(bullet["pos"][0], bullet["pos"][1], 5, 0, Math.PI * 2);
    ctx.fill();
}

draw_health_bar();
draw_coins();

if (show_scoreboard) {
    draw_scoreboard();
}

if (bots.length === 0) {
    player_coins *= wave;
    player_coins += 10;
    shop();
    wave += 1;
    spawn_wave(wave);
}

ctx.drawImage(screen, 0, 0);
clock.tick(60);

// Quit the game
clearInterval(gameLoop);
