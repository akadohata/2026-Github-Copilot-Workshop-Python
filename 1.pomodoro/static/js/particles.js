// パーティクルアニメーション - 背景エフェクト

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // キャンバスサイズをウィンドウサイズに合わせる
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // パーティクルを生成
        this.createParticles();
        
        // アニメーション開始
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パーティクルを更新・描画
        this.particles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });
        
        // パーティクル間の接続線を描画
        this.connectParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    connectParticles() {
        const maxDistance = 150;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    this.ctx.strokeStyle = `rgba(74, 158, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        
        // パーティクルの色をランダムに設定（青系統）
        const colors = [
            { r: 74, g: 158, b: 255 },
            { r: 53, g: 122, b: 189 },
            { r: 100, g: 180, b: 255 }
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        // 位置を更新
        this.x += this.vx;
        this.y += this.vy;
        
        // 画面外に出たら反対側から再出現
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y < 0) this.y = this.canvas.height;
        if (this.y > this.canvas.height) this.y = 0;
        
        // パルスエフェクト（ゆっくりとサイズが変化）
        this.opacity += (Math.random() - 0.5) * 0.02;
        this.opacity = Math.max(0.1, Math.min(0.7, this.opacity));
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();
        
        // グロー効果
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ページ読み込み完了時にパーティクルシステムを初期化
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
