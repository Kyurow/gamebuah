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
leftBtn.addEventListener("touchstart", () => isTouchingLeft = true);
leftBtn.addEventListener("touchend", () => isTouchingLeft = false);
rightBtn.addEventListener("touchstart", () => isTouchingRight = true);
rightBtn.addEventListener("touchend", () => isTouchingRight = false);
var isTouchingLeft = false;
var isTouchingRight = false;

// Ambil elemen canvas dan konteks 2D
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// ==========================================================
// MODUL ALGORITMA JATUH BUAH (LANGKAH 2)
// (ANDA HANYA PERLU MENGEDIT BAGIAN "levels" DI BAWAH INI)
// ==========================================================
const fruitAlgorithm = {
    // --- EDIT PENGATURAN DI SINI ---
    levels: [
        { afterSecond: 45, fruits: 108, minSpeed: 4, maxSpeed: 6, interval: 700 },
        { afterSecond: 30, fruits: 105, minSpeed: 3, maxSpeed: 5, interval: 800 },
        { afterSecond: 20, fruits: 103, minSpeed: 2, maxSpeed: 4, interval: 1000 },
        { afterSecond: 2, fruits: 100, minSpeed: 1, maxSpeed: 3, interval: 1000 },
        { afterSecond: 0,  fruits: 100, minSpeed: 1, maxSpeed: 2, interval: 1200 } 
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
                // Panggil spawnFruit dengan kecepatan dari level
                spawnFruit(settings.minSpeed, settings.maxSpeed);
            }
            this.lastSpawnTime = Date.now();
        }
    }
};
// ==========================================================
// AKHIR DARI MODUL
// ==========================================================


// Load gambar
var bgImage = new Image();
bgImage.src = "assets/images/BACKGROUND2.png"; 
var playerImage = new Image();
playerImage.src = "assets/images/karakterfinal.png"; 

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
var maxMisses = 3;   // <-- PERBAIKAN PENTING (diubah dari 0 ke 3)
var gameOver = false;

// Objek pemain
var player = {
    x: 80, y: 0, width: 30, height: 30, speed: 5 
};

var fruits = [];
var spawnStartTime = Date.now(); // Biarkan ini

// HAPUS VARIABEL LAMA (LANGKAH 3)
// var lastSpawnTime = Date.now(); // (Sudah dihapus)
// var spawnInterval = 1000; // (Sudah dihapus)
// var spawnMax = 1; // (Sudah dihapus)

// Bunyi
var catchSound = new Audio("assets/sounds/catch.wav");
var gameOverSound = new Audio("assets/sounds/endsound.mp3");

// PERBAIKI bgImage.onload (PENTING)
bgImage.onload = function() {
    canvas.width = bgImage.width;
    canvas.height = bgImage.height;
    player.y = canvas.height - player.height - 10;
    
    // Tampilkan teks selamat datang
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height); // Gambar BG dulu
    ctx.font = "bold 10px Arial";
    ctx.fillStyle = "black"; // Ubah warna jika perlu
    ctx.textAlign = "center";
    ctx.fillText("Kelompok 4", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText("Selamat bermain hehe :) ", canvas.width / 2, canvas.height / 2 + 10); // sedikit penyesuaian posisi
    
    // HAPUS 'if (misses >= maxMisses)' yang error dari sini
};

// Input keyboard
var keys = {};
window.addEventListener("keydown", function(e) { keys[e.key] = true; });
window.addEventListener("keyup", function(e) { keys[e.key] = false; });

// FUNGSI BARU ANDA (LANGKAH 1 - SUDAH BENAR)
function spawnFruit(minSpeed, maxSpeed) {
    var idx = Math.floor(Math.random() * fruitImages.length);
    var img = fruitImages[idx];
    var scale = 0.5;
    var speed = minSpeed + Math.random() * (maxSpeed - minSpeed); 
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

// PERBARUI gameLoop (LANGKAH 5)
function gameLoop() {
    if (gameOver) return;

    // Hitung waktu bermain (dalam detik)
    var elapsed = (Date.now() - spawnStartTime) / 1000;
    
    // Panggil modul algoritma untuk mengurus spawn buah
    fruitAlgorithm.update(elapsed);
    
    // HAPUS SEMUA LOGIKA SPAWN LAMA DARI SINI

    // Bersihkan canvas dan gambar ulang background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    // Kontrol mobile
    canvas.addEventListener("touchstart", function(e) {
        const touchX = e.touches[0].clientX;
        if (touchX < canvas.width / 2) { isTouchingLeft = true; } else { isTouchingRight = true; }
    });
    canvas.addEventListener("touchend", function() {
        isTouchingLeft = false; isTouchingRight = false;
    });

    // Gambar karakter
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // Update posisi dan gambar setiap buah
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
            catchSound.play();
            fruits.splice(i, 1);
            i--;
            continue;
        }

        // Jika buah gagal ditangkap
        if (f.y > canvas.height) {
            misses++;
            fruits.splice(i, 1);
            i--;
            
            // Cek jika gagal mencapai maxMisses (yang sekarang 3)
            if (misses >= maxMisses) {
                gameOver = true;
                gameOverSound.play();
                
                ctx.font = "bold 10px Joystix";
                ctx.fillStyle = "red";
                ctx.textAlign = "center"; // Pastikan teks game over di tengah
                
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
    ctx.textAlign = "left"; // Kembalikan align ke kiri untuk skor
    ctx.fillText("Score: " + score, 23, 12);

    // Lanjutkan loop game
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
  m }
}








