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

function resetGame() {
    score = 0;
    misses = 0;
    gameOver = false;
    fruits = [];
    spawnStartTime = Date.now();
    lastSpawnTime = Date.now();
    spawnMax = 1; // Kembali ke 1
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

// Load gambar latar belakang (background), karakter, dan buah-buahan
var bgImage = new Image();
bgImage.src = "assets/images/BACKGROUND.png"; 

var playerImage = new Image();
playerImage.src = "assets/images/karakterfinal.png"; 

// Buah-buahan: jeruk, pisang, anggur
var fruitImages = [];

// Jeruk
var orangeImage = new Image();
orangeImage.src = "assets/images/jeruk.png"; 
fruitImages.push(orangeImage);

// Pisang
var bananaImage = new Image();
bananaImage.src = "assets/images/pisang.png"; 
fruitImages.push(bananaImage);

// Anggur
var grapesImage = new Image();
grapesImage.src = "assets/images/anggur.png"; 
fruitImages.push(grapesImage);

// **Status game**: skor, jumlah gagal (misses), dan flag game over
var score = 0;
var misses = 0;
var maxMisses = 3;   // <-- PERBAIKAN: Diubah dari 0 ke 3 (untuk 3 nyawa)
var gameOver = false;

// **Objek pemain (karakter)** dengan properti awal
var player = {
    x: 80,          
    y: 0,            
    width: 30,       
    height: 30,      
    speed: 5        
};

// Daftar buah-buah yang sedang jatuh
var fruits = [];

// **Pengaturan spawn buah** (waktu mulai dan interval)
var spawnStartTime = Date.now();
var lastSpawnTime = Date.now();
var spawnInterval = 1000; // Waktu antar spawn buah dalam milidetik (1 detik)
var spawnMax = 1;         // Jumlah maksimal buah bersamaan (akan naik)

// **Bunyi**: suara tangkap buah dan suara game over
var catchSound = new Audio("assets/sounds/catch.wav");  
var gameOverSound = new Audio("assets/sounds/endsound.mp3");  

// Setelah gambar latar load, atur ukuran canvas dan pos karakter
bgImage.onload = function() {
    // Sesuaikan canvas dengan ukuran background
    canvas.width = bgImage.width;
    canvas.height = bgImage.height;
    // Posisi karakter di atas background (sedikit jarak dari bawah)
    player.y = canvas.height - player.height - 10;
    
    // <-- PERBAIKAN: Blok 'if (misses >= maxMisses)' yang salah sudah dihapus dari sini.
};

// **Input keyboard** untuk gerakan karakter
var keys = {};
window.addEventListener("keydown", function(e) {
    keys[e.key] = true;
});
window.addEventListener("keyup", function(e) {
    keys[e.key] = false;
});

// Fungsi membuat buah baru di posisi X acak atas canvas
function spawnFruit() {
    var idx = Math.floor(Math.random() * fruitImages.length); // Pilih jenis buah secara acak
    var img = fruitImages[idx];
    var scale = 0.5;
    var fruit = {
        x: Math.random() * (canvas.width -img.width * scale), 
        y: -img.width * scale,  
        width: img.width * scale, 
        height: img.width * scale, 
        speed: 1 + Math.random() * 2, // Kecepatan jatuh (acak antara 1-3)
        img: img
    };
    fruits.push(fruit);
}

// Fungsi utama: update dan gambar semua elemen
function gameLoop() {
    if (gameOver) return; // Jika game over, hentikan loop

    // Hitung waktu bermain (dalam detik) untuk menambah kesulitan
    var elapsed = (Date.now() - spawnStartTime) / 1000;
    // Setelah 10 detik, izinkan 2 buah muncul sekaligus
    if (elapsed > 10) spawnMax = 2;
    // Setelah 20 detik, izinkan 3 buah muncul sekaligus
    if (elapsed > 20) spawnMax = 3;

    // Spawn buah baru bila interval tercapai dan jumlah buah kurang dari spawnMax
    if (Date.now() - lastSpawnTime > spawnInterval && fruits.length < spawnMax) {
        spawnFruit();
        lastSpawnTime = Date.now();
    }

    // Bersihkan canvas dan gambar ulang background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Gerakkan karakter berdasarkan input
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
        if (touchX < canvas.width / 2) {
          isTouchingLeft = true;
        } else {
          isTouchingRight = true;
        }
    });
  
    canvas.addEventListener("touchend", function() {
        isTouchingLeft = false;
        isTouchingRight = false;
    });
  
    // Gambar karakter di posisi baru
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // Update posisi dan gambar setiap buah
    for (var i = 0; i < fruits.length; i++) {
        var f = fruits[i];
        f.y += f.speed; // Gerakkan buah turun
        ctx.drawImage(f.img, f.x, f.y, f.width, f.height);

        // Deteksi tumbukan: jika buah mengenai area karakter
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

        // Jika buah sudah jatuh di bawah layar (gagal ditangkap)
        if (f.y > canvas.height) {
            misses++;
            fruits.splice(i, 1);
            i--;
            
            // Cek jika gagal sudah mencapai batas (3)
            if (misses >= maxMisses) {
                gameOver = true;
                gameOverSound.play(); 
                
                ctx.font = "bold 10px Joystix";
                ctx.fillStyle = "red";
                ctx.textAlign = "center"; // Ditambahkan agar teks di tengah
                
                ctx.fillText("Terimakasih sudah main!", canvas.width/2 , canvas.height/2 - 10);
                ctx.fillText("Score Anda: " + score, canvas.width/2 , canvas.height/2 + 5);

                restartBtn.style.display = "block";
                return; // Hentikan gameLoop di sini
            }
        }
    }

    // Tampilkan skor
    ctx.font = "bold 9px Joystix";
    ctx.fillStyle = "black";
    ctx.textAlign = "left"; // Kembalikan text align
    ctx.fillText("Score: " + score, 23, 12); 

    // Lanjutkan loop game selama belum game over
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}
