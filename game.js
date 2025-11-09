const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

function startGame() {
    startBtn.style.display = "none";
    restartBtn.style.display = "none";
    resetGame();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    restartBtn.style.display = "none";
    resetGame();
    requestAnimationFrame(gameLoop);
}

// PERBARUI resetGame
function resetGame() {
    score = 0;
    misses = 0;
    gameOver = false;
    fruits = [];
    spawnStartTime = Date.now();
    fruitAlgorithm.lastSpawnTime = Date.now(); // <-- Reset timer modul
    player.x = canvas.width / 2 - player.width / 2;
}

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// --- PERBAIKAN 1: TAMBAHKAN BLOK INI ---
// Untuk mematikan menu "Simpan Gambar" saat ditahan
function preventContextMenu(event) {
    event.preventDefault();
}
leftBtn.addEventListener("contextmenu", preventContextMenu);
rightBtn.addEventListener("contextmenu", preventContextMenu);
// --- AKHIR PERBAIKAN 1 ---

leftBtn.addEventListener("touchstart", () => isTouchingLeft = true, { passive: true });
leftBtn.addEventListener("touchend", () => isTouchingLeft = false);
rightBtn.addEventListener("touchstart", () => isTouchingRight = true, { passive: true });
rightBtn.addEventListener("touchend", () => isTouchingRight = false);
var isTouchingLeft = false;
var isTouchingRight = false;

// Ambil elemen canvas dan konteks 2D
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false; // Anti-blur

// ==========================================================
// MODUL ALGORITMA JATUH BUAH
// ==========================================================
const fruitAlgorithm = {
    // Pengaturan level Anda
    levels: [
        { afterSecond: 45, fruits: 7, minSpeed: 4, maxSpeed: 3, interval: 700 },
        { afterSecond: 30, fruits: 6, minSpeed: 3, maxSpeed: 2, interval: 800 },
        { afterSecond: 20, fruits: 5, minSpeed: 2, maxSpeed: 2, interval: 1000 },
        { afterSecond: 2, fruits: 3, minSpeed: 1, maxSpeed: 1, interval: 1000 },
        { afterSecond: 0,  fruits: 1, minSpeed: 1, maxSpeed: 0.5, interval: 1200 } 
    ],
    // --- AKHIR BAGIAN EDIT ---

    lastSpawnTime: 0,
    getSettings: function(elapsedSeconds) {
        for (const level of this.levels) {
            if (elapsedSeconds >= level.afterSecond) {
                return level; 
            }
        }
        return this.levels[this.levels.length - 1];
    },
    update: function(elapsedSeconds) {
        const settings = this.getSettings(elapsedSeconds);
        if (Date.now() - this.lastSpawnTime > settings.interval) {
            for (let i = 0; i < settings.fruits; i++) {
                spawnFruit(settings.minSpeed, settings.maxSpeed);
            }
            this.lastSpawnTime = Date.now();
        }
    }
};
// ==========================================================
// AKHIR DARI MODUL
// =================================GA==========================


// Load gambar
var bgImage = new Image();
bgImage.src = "assets/images/BACKGROUND3.png"; 
var playerImage = new Image();
playerImage.src = "assets/images/karakterfinal2.png"; 

// Buah-buahan
var fruitImages = [];
var orangeImage = new Image();
orangeImage.src = "assets/images/jeruk.png"; 
fruitImages.push(orangeImage);
var bananaImage = new Image();
bananaImage.src = "assets/images/pisang.png"; 
fruitImages.push(bananaImage);
var grapesImage = new Image();
grapesImage.src = "assets/images/anggur.png"; 
fruitImages.push(grapesImage);

// Status game
var score = 0;
var misses = 0;
var maxMisses = 3;   
var gameOver = false;

// Objek pemain
var player = {
    x: 80, y: 0, width: 30, height: 30, speed: 5 
};

var fruits = [];
var spawnStartTime = Date.now(); 

// Bunyi
var catchSound = new Audio("assets/sounds/catch.wav");
var gameOverSound = new Audio("assets/sounds/endsound.mp3");

// PERBAIKI bgImage.onload (PENTING)
bgImage.onload = function() {
    canvas.width = bgImage.width;
    canvas.height = bgImage.height;
    ctx.imageSmoothingEnabled = false; // Anti-blur saat load
    player.y = canvas.height - player.height - 10;
    
    // Tampilkan teks selamat datang
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height); 
    ctx.font = "bold 10px Arial";
    ctx.fillStyle = "black"; 
    ctx.textAlign = "center";
    ctx.fillText("Kelompok 4", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText("Selamat bermain hehe :) ", canvas.width / 2, canvas.height / 2 + 10); 
};

// Input keyboard
var keys = {};
window.addEventListener("keydown", function(e) { keys[e.key] = true; });
window.addEventListener("keyup", function(e) { keys[e.key] = false; });

// --- PERBAIKAN 2 & 3: Pindahkan listener ke LUAR gameLoop dan PERBAIKI LOGIKANYA ---
canvas.addEventListener("touchstart", function(e) {
    // Perbaikan 4: Mencegah layar skrol
    e.preventDefault(); 

    // Perbaikan 2: Logika sentuhan yang benar
    const canvasRect = canvas.getBoundingClientRect(); // Dapatkan posisi kanvas di layar
    const touchX = e.touches[0].clientX - canvasRect.left; // Hitung posisi X sentuhan DI DALAM kanvas
    
    if (touchX < canvas.width / 2) { 
        isTouchingLeft = true; 
    } else { 
        isTouchingRight = true; 
    }
}, { passive: false }); // {passive: false} diperlukan untuk preventDefault()

canvas.addEventListener("touchend", function(e) {
    e.preventDefault();
    isTouchingLeft = false; 
    isTouchingRight = false;
});
// --- AKHIR PERBAIKAN 2 & 3 ---

// FUNGSI BARU ANDA
function spawnFruit(minSpeed, maxSpeed) {
    var idx = Math.floor(Math.random() * fruitImages.length);
    var img = fruitImages[idx];
    var scale = 0.5;
    // Logika kecepatan Anda (minSpeed > maxSpeed di level tinggi) sudah benar
    var speed;
    if (minSpeed > maxSpeed) {
        speed = maxSpeed + Math.random() * (minSpeed - maxSpeed);
    } else {
        speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    }

    var fruit = {
        x: Math.random() * (canvas.width - img.width * scale),
        y: -img.width * scale,
        width: img.width * scale,
        height: img.width * scale,
        speed: speed,
        img: img
    };
    fruits.push(fruit);
}

// PERBARUI gameLoop
function gameLoop() {
    if (gameOver) return;

    var elapsed = (Date.now() - spawnStartTime) / 1000;
    fruitAlgorithm.update(elapsed);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false; // Anti-blur di setiap frame
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Gerakkan karakter
    if (keys["ArrowLeft"] || keys["a"] || keys["A"] || isTouchingLeft) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"] || isTouchingRight) {
        player.x += player.speed;
    }

    // Batasi agar karakter tidak keluar layar
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // --- PERBAIKAN 3: HAPUS event listener DARI SINI ---
    // (Sudah dipindahkan ke luar loop)

    // Gambar karakter
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

_   // Update posisi dan gambar setiap buah
    for (var i = 0; i < fruits.length; i++) {
        var f = fruits[i];
        f.y += f.speed; 
        ctx.drawImage(f.img, f.x, f.y, f.width, f.height);

        // Deteksi tumbukan
        if (
            f.y + f.height >= player.y &&
            f.x + f.width >= player.x &&
            f.x <= player.x + player.width
        ) {
            score++;
            // Gunakan try-catch untuk mencegah error jika audio gagal
            try { catchSound.play(); } catch(e) {} 
            fruits.splice(i, 1);
            i--;
            continue;
        }

        // Jika buah gagal ditangkap
        if (f.y > canvas.height) {
            misses++;
            fruits.splice(i, 1);
            i--;
            
            if (misses >= maxMisses) {
className: "m-0",
                gameOver = true;
                try { gameOverSound.play(); } catch(e) {}
                
                ctx.font = "bold 10px Joystix";
                ctx.fillStyle = "red";
                ctx.textAlign = "center"; 
                
                ctx.fillText("Terimakasih sudah main!", canvas.width/2 , canvas.height/2 - 10);
                ctx.fillText("Score Anda: " + score, canvas.width/2 , canvas.height/2 + 5);

                restartBtn.style.display = "block";
                return;
            }
  }
    }

    // Tampilkan skor
    ctx.font = "bold 9px Joystix";
    ctx.fillStyle = "black";
    ctx.textAlign = "left"; 
    ctx.fillText("Score: " + score, 23, 12);

    // Lanjutkan loop game
    if (!gameOver) {
    m   requestAnimationFrame(gameLoop);
  }
}
