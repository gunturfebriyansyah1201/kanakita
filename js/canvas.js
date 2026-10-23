/**
 * Kanakita - Canvas & Stroke Order Video Module
 * Manages interactive handwriting canvas with accurate evaluation and Stroke Order Video Player.
 */

class WritingCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.strokeColor = '#1e1e24';
    this.lineWidth = 5;
    this.userStrokes = [];
    
    this.setupCanvas();
    this.bindEvents();
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || 200;
    this.canvas.height = rect.height || 200;
    this.clear();
  }

  drawGrid() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.save();
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([5, 5]);

    // Horizontal Center Line
    this.ctx.beginPath();
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // Vertical Center Line
    this.ctx.beginPath();
    this.ctx.moveTo(w / 2, 0);
    this.ctx.lineTo(w / 2, h);
    this.ctx.stroke();

    // Border
    this.ctx.setLineDash([]);
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, w, h);

    this.ctx.restore();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.userStrokes = [];
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();

    if (this.userStrokes.length > 0) {
      this.ctx.save();
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.lineWidth;

      this.userStrokes.forEach(stroke => {
        if (stroke.length < 2) return;
        this.ctx.beginPath();
        this.ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          this.ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        this.ctx.stroke();
      });
      this.ctx.restore();
    }
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };

    let currentStroke = [];

    const startDrawing = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      currentStroke = [pos];
      this.userStrokes.push(currentStroke);
      
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.lineWidth;
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      currentStroke.push(pos);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const stopDrawing = () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.ctx.closePath();
      }
    };

    // Mouse Events
    this.canvas.addEventListener('mousedown', startDrawing);
    this.canvas.addEventListener('mousemove', draw);
    this.canvas.addEventListener('mouseup', stopDrawing);
    this.canvas.addEventListener('mouseleave', stopDrawing);

    // Touch Events
    this.canvas.addEventListener('touchstart', startDrawing);
    this.canvas.addEventListener('touchmove', draw);
    this.canvas.addEventListener('touchend', stopDrawing);
  }

}

/**
 * Interactive Stroke Order Video Player
 */
class StrokeVideoPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.strokePaths = [];
    this.totalStrokes = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1.0;
    this.progress = 0; // 0% to 100%
    this.animationFrame = null;
    this.lastTime = null;
    
    // UI elements
    this.timelineEl = document.getElementById('stroke-video-timeline');
    this.stepBadgeEl = document.getElementById('stroke-step-badge');
    this.playPauseBtn = document.getElementById('stroke-play-pause-btn');
    this.speedSelectEl = document.getElementById('stroke-speed-select');
    this.prevBtn = document.getElementById('stroke-prev-btn');
    this.nextBtn = document.getElementById('stroke-next-btn');
    this.replayBtn = document.getElementById('stroke-replay-btn');
    
    this.bindEvents();
  }

  bindEvents() {
    if (this.playPauseBtn) {
      this.playPauseBtn.onclick = () => this.togglePlay();
    }
    if (this.replayBtn) {
      this.replayBtn.onclick = () => this.replay();
    }
    if (this.prevBtn) {
      this.prevBtn.onclick = () => this.stepPrev();
    }
    if (this.nextBtn) {
      this.nextBtn.onclick = () => this.stepNext();
    }
    if (this.speedSelectEl) {
      this.speedSelectEl.onchange = (e) => {
        this.playbackSpeed = parseFloat(e.target.value) || 1.0;
      };
    }
    if (this.timelineEl) {
      this.timelineEl.oninput = (e) => {
        this.pause();
        this.progress = parseFloat(e.target.value);
        this.renderFrame();
      };
    }
  }

  load(strokePaths) {
    this.pause();
    this.strokePaths = strokePaths || [];
    this.totalStrokes = this.strokePaths.length;
    this.progress = 0;
    this.renderFrame();
    this.play();
  }

  renderFrame() {
    if (!this.container) return;
    
    if (this.totalStrokes === 0) {
      this.container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:0.8rem;">Goresan tidak tersedia</div>';
      return;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "stroke-animation-svg");

    // Grid background
    const gridGroup = document.createElementNS(svgNS, "g");
    gridGroup.setAttribute("stroke", "#e2e8f0");
    gridGroup.setAttribute("stroke-width", "0.8");
    gridGroup.setAttribute("stroke-dasharray", "3 3");

    const hLine = document.createElementNS(svgNS, "line");
    hLine.setAttribute("x1", "0"); hLine.setAttribute("y1", "50");
    hLine.setAttribute("x2", "100"); hLine.setAttribute("y2", "50");

    const vLine = document.createElementNS(svgNS, "line");
    vLine.setAttribute("x1", "50"); vLine.setAttribute("y1", "0");
    vLine.setAttribute("x2", "50"); vLine.setAttribute("y2", "100");

    gridGroup.appendChild(hLine);
    gridGroup.appendChild(vLine);
    svg.appendChild(gridGroup);

    const totalDuration = this.totalStrokes;
    const currentProgressTime = (this.progress / 100) * totalDuration;

    let activePoint = null;

    this.strokePaths.forEach((pathD, idx) => {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", pathD);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-width", "7");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");

      // Stroke Badge Number
      const firstPoint = pathD.match(/M\s*([\d.]+)\s*([\d.]+)/i);
      if (firstPoint) {
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", Math.max(4, parseFloat(firstPoint[1]) - 6));
        text.setAttribute("y", Math.max(10, parseFloat(firstPoint[2]) - 6));
        text.setAttribute("fill", "#3742fa");
        text.setAttribute("font-size", "7.5");
        text.setAttribute("font-weight", "bold");
        text.textContent = (idx + 1).toString();
        svg.appendChild(text);
      }

      const strokeStartTime = idx;
      const strokeEndTime = idx + 1;

      if (currentProgressTime >= strokeEndTime) {
        path.setAttribute("stroke", "#ff4757");
        path.setAttribute("class", "stroke-path completed");
      } else if (currentProgressTime > strokeStartTime) {
        path.setAttribute("stroke", "#ff4757");
        path.setAttribute("class", "stroke-path active");
        
        const strokeFraction = (currentProgressTime - strokeStartTime);
        
        const tempPath = document.createElementNS(svgNS, "path");
        tempPath.setAttribute("d", pathD);
        const len = tempPath.getTotalLength ? tempPath.getTotalLength() : 100;
        
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len * (1 - strokeFraction);

        if (tempPath.getPointAtLength) {
          const pt = tempPath.getPointAtLength(len * strokeFraction);
          activePoint = { x: pt.x, y: pt.y };
        }
      } else {
        path.setAttribute("stroke", "#e2e8f0");
        path.setAttribute("stroke-width", "4");
        path.setAttribute("class", "stroke-path pending");
      }

      svg.appendChild(path);
    });

    // Glowing brush tracer head
    if (activePoint && this.isPlaying) {
      const brushDot = document.createElementNS(svgNS, "circle");
      brushDot.setAttribute("cx", activePoint.x);
      brushDot.setAttribute("cy", activePoint.y);
      brushDot.setAttribute("r", "4.5");
      brushDot.setAttribute("fill", "#ff4757");
      brushDot.setAttribute("stroke", "#ffffff");
      brushDot.setAttribute("stroke-width", "1.5");
      brushDot.style.filter = "drop-shadow(0 0 4px rgba(255, 71, 87, 0.8))";
      svg.appendChild(brushDot);
    }

    this.container.innerHTML = '';
    this.container.appendChild(svg);

    // Update UI step badge & timeline
    const activeStrokeIndex = Math.min(this.totalStrokes, Math.floor(currentProgressTime) + 1);
    if (this.stepBadgeEl) {
      this.stepBadgeEl.textContent = `Goresan ${activeStrokeIndex} / ${this.totalStrokes}`;
    }
    if (this.timelineEl && document.activeElement !== this.timelineEl) {
      this.timelineEl.value = Math.round(this.progress);
    }
  }

  play() {
    if (this.totalStrokes === 0) return;
    if (this.progress >= 100) this.progress = 0;
    this.isPlaying = true;
    this.lastTime = performance.now();
    if (this.playPauseBtn) this.playPauseBtn.textContent = '⏸';

    const animate = (now) => {
      if (!this.isPlaying) return;
      const delta = (now - this.lastTime) / 1000;
      this.lastTime = now;

      const durationPerStroke = 1.2 / this.playbackSpeed;
      const totalVideoDuration = this.totalStrokes * durationPerStroke;

      this.progress += (delta / totalVideoDuration) * 100;

      if (this.progress >= 100) {
        this.progress = 100;
        this.renderFrame();
        this.pause();
        return;
      }

      this.renderFrame();
      this.animationFrame = requestAnimationFrame(animate);
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(animate);
  }

  pause() {
    this.isPlaying = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.playPauseBtn) this.playPauseBtn.textContent = '▶';
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  replay() {
    this.progress = 0;
    this.play();
  }

  stepNext() {
    this.pause();
    const currentStepFloat = (this.progress / 100) * this.totalStrokes;
    const nextStep = Math.floor(currentStepFloat) + 1;
    this.progress = Math.min(100, (nextStep / this.totalStrokes) * 100);
    this.renderFrame();
  }

  stepPrev() {
    this.pause();
    const currentStepFloat = (this.progress / 100) * this.totalStrokes;
    const prevStep = Math.max(0, Math.floor(currentStepFloat) - 1);
    this.progress = (prevStep / this.totalStrokes) * 100;
    this.renderFrame();
  }
}

// Backward compatibility helper function
function renderStrokeAnimation(containerId, strokePaths) {
  if (!window._globalStrokePlayer) {
    window._globalStrokePlayer = new StrokeVideoPlayer(containerId);
  }
  window._globalStrokePlayer.load(strokePaths);
}
