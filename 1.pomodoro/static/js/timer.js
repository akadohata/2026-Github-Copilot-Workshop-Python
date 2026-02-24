// ポモドーロタイマー - メインタイマーロジック

class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25分
        this.breakTime = 5 * 60; // 5分
        this.timeLeft = this.workTime;
        this.totalTime = this.workTime;
        this.isRunning = false;
        this.isWorkSession = true;
        this.sessionCount = 0;
        this.timerInterval = null;
        
        // DOM要素
        this.timeDisplay = document.getElementById('timeDisplay');
        this.statusDisplay = document.getElementById('statusDisplay');
        this.modeDisplay = document.getElementById('modeDisplay');
        this.sessionCountDisplay = document.getElementById('sessionCount');
        this.progressCircle = document.getElementById('progressCircle');
        this.gradientStart = document.getElementById('gradientStart');
        this.gradientEnd = document.getElementById('gradientEnd');
        
        // ボタン
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // 円周の計算（半径90の円）
        this.radius = 90;
        this.circumference = 2 * Math.PI * this.radius;
        
        // 初期化
        this.init();
    }
    
    init() {
        // プログレスバーの初期設定
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircle.style.strokeDashoffset = '0';
        
        // イベントリスナーの設定
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 初期表示の更新
        this.updateDisplay();
        this.updateProgressBar();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.statusDisplay.textContent = this.isWorkSession ? '集中中...' : '休憩中...';
        
        // 背景エフェクトを有効化
        if (this.isWorkSession) {
            document.body.classList.add('focus-mode');
        }
        
        // タイマー開始
        this.timerInterval = setInterval(() => {
            this.tick();
        }, 1000);
        
        // 波紋エフェクトを生成
        this.createRipple();
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.statusDisplay.textContent = '一時停止中';
        
        clearInterval(this.timerInterval);
        document.body.classList.remove('focus-mode');
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.isWorkSession ? this.workTime : this.breakTime;
        this.totalTime = this.timeLeft;
        this.statusDisplay.textContent = '準備完了';
        this.updateDisplay();
        this.updateProgressBar();
        this.updateGradient(1); // フルタイムの色にリセット
    }
    
    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgressBar();
            this.updateGradient(this.timeLeft / this.totalTime);
            
            // 定期的に波紋エフェクトを生成（10秒ごと）
            if (this.timeLeft % 10 === 0) {
                this.createRipple();
            }
        } else {
            this.complete();
        }
    }
    
    complete() {
        this.pause();
        
        if (this.isWorkSession) {
            this.sessionCount++;
            this.sessionCountDisplay.textContent = this.sessionCount;
            this.statusDisplay.textContent = '集中時間完了！休憩しましょう。';
            
            // 休憩モードに切り替え
            this.isWorkSession = false;
            this.timeLeft = this.breakTime;
            this.totalTime = this.breakTime;
            this.modeDisplay.textContent = '休憩時間';
        } else {
            this.statusDisplay.textContent = '休憩完了！次のセッションを始めましょう。';
            
            // 作業モードに切り替え
            this.isWorkSession = true;
            this.timeLeft = this.workTime;
            this.totalTime = this.workTime;
            this.modeDisplay.textContent = '集中時間';
        }
        
        this.updateDisplay();
        this.updateProgressBar();
        this.updateGradient(1);
        
        // 通知音を鳴らす（オプション）
        this.playNotificationSound();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    updateProgressBar() {
        const progress = this.timeLeft / this.totalTime;
        const offset = this.circumference * (1 - progress);
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    updateGradient(progress) {
        // 時間経過に応じて色を変更（青 → 黄 → 赤）
        let startColor, endColor;
        
        if (progress > 0.5) {
            // 青から黄色へ（100% → 50%）
            const t = (progress - 0.5) * 2; // 0 to 1
            startColor = this.interpolateColor('#4a9eff', '#ffd700', 1 - t);
            endColor = this.interpolateColor('#357abd', '#ffb700', 1 - t);
        } else {
            // 黄色から赤へ（50% → 0%）
            const t = progress * 2; // 0 to 1
            startColor = this.interpolateColor('#ffd700', '#ff4444', 1 - t);
            endColor = this.interpolateColor('#ffb700', '#cc0000', 1 - t);
        }
        
        this.gradientStart.style.stopColor = startColor;
        this.gradientEnd.style.stopColor = endColor;
    }
    
    interpolateColor(color1, color2, factor) {
        // 16進数カラーコードを補間
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);
        
        const r1 = (c1 >> 16) & 0xff;
        const g1 = (c1 >> 8) & 0xff;
        const b1 = c1 & 0xff;
        
        const r2 = (c2 >> 16) & 0xff;
        const g2 = (c2 >> 8) & 0xff;
        const b2 = c2 & 0xff;
        
        const r = Math.round(r1 * factor + r2 * (1 - factor));
        const g = Math.round(g1 * factor + g2 * (1 - factor));
        const b = Math.round(b1 * factor + b2 * (1 - factor));
        
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    
    createRipple() {
        const rippleContainer = document.getElementById('rippleContainer');
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        // ランダムな位置に配置
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.marginLeft = '-150px';
        ripple.style.marginTop = '-150px';
        
        rippleContainer.appendChild(ripple);
        
        // アニメーション終了後に削除
        setTimeout(() => {
            ripple.remove();
        }, 2000);
    }
    
    playNotificationSound() {
        // Web Audio APIを使用して通知音を生成（オプション）
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio notification not available');
        }
    }
}

// ページ読み込み完了時にタイマーを初期化
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
