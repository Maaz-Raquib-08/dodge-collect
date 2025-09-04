import { useEffect, useRef } from "react";
import p5 from "p5";
import { cn } from "@/lib/utils";

export interface GameState {
  score: number;
  level: number;
  progress: number; // 0-100
  missed: number; // 0-3
  gameOver: boolean;
}

interface GameCanvasProps {
  onUpdate?: (state: GameState) => void;
  className?: string;
}

export default function GameCanvas({ onUpdate, className }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    let intervals: number[] = [];

    const sketch = (p: p5) => {
      let player: { x: number; y: number; w: number; h: number; vx: number; vy: number };
      let debris: Array<{ x: number; y: number; w: number; h: number }> = [];
      let resources: Array<{ x: number; y: number; w: number; h?: number }> = [];
      let stars: Array<{ x: number; y: number; s: number; layer: number }> = [];
      let score = 0;
      let level = 1;
      let progress = 0;
      let missedResources = 0;
      let gameOver = false;
      let heading = 0;

      const emit = () => {
        onUpdate?.({ score, level, progress, missed: missedResources, gameOver });
      };

      const reset = () => {
        debris = [];
        resources = [];
        score = 0;
        level = 1;
        progress = 0;
        missedResources = 0;
        gameOver = false;
        player.x = 100;
        player.y = p.height / 2 - 20;
        player.vx = 0;
        player.vy = 0;
        emit();
      };

      const collides = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h?: number }) => {
        const bh = b.h ?? b.w; // circle diameter used as height
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + bh && a.y + a.h > b.y;
      };

      const spawnDebris = () => {
        if (!gameOver) {
          const size = p.random(24, 36);
          debris.push({ x: p.width, y: p.random(0, p.height - size), w: size, h: size });
        }
      };

      const spawnResource = () => {
        if (!gameOver) {
          resources.push({ x: p.width, y: p.random(10, p.height - 10), w: 18 });
        }
      };

      const updateProgress = (value: number) => {
        progress = Math.max(0, Math.min(100, value));
        emit();
      };

      p.setup = () => {
        const c = p.createCanvas(800, 400);
        c.addClass("rounded-2xl border border-white/20 shadow-[0_20px_60px_-20px_rgba(115,90,255,0.45)]");
        c.parent(containerRef.current!);

        player = { x: 100, y: p.height / 2 - 20, w: 40, h: 40, vx: 0, vy: 0 };

        // starfield
        for (let i = 0; i < 120; i++) {
          stars.push({ x: p.random(0, p.width), y: p.random(0, p.height), s: p.random(1, 2.2), layer: Math.random() < 0.5 ? 1 : 2 });
        }

        intervals.push(window.setInterval(spawnDebris, 1400));
        intervals.push(window.setInterval(spawnResource, 1800));
        emit();
      };

      p.draw = () => {
        const dt = p.deltaTime / 1000; // seconds
        p.background(7, 7, 22);

        // starfield parallax
        p.noStroke();
        for (const st of stars) {
          const sp = st.layer === 1 ? 40 : 70; // px/s
          st.x -= sp * dt;
          if (st.x < -2) st.x = p.width + 2;
          p.fill(255, 255, 255, st.layer === 1 ? 120 : 200);
          p.circle(st.x, st.y, st.s);
        }

        if (!gameOver) {
          // Player physics (smooth)
          const accel = 900; // px/s^2
          const maxSpeed = 380; // px/s
          const friction = 6; // damping
          if (p.keyIsDown(p.LEFT_ARROW)) player.vx -= accel * dt;
          if (p.keyIsDown(p.RIGHT_ARROW)) player.vx += accel * dt;
          if (p.keyIsDown(p.UP_ARROW)) player.vy -= accel * dt;
          if (p.keyIsDown(p.DOWN_ARROW)) player.vy += accel * dt;

          // apply friction
          player.vx -= player.vx * friction * dt;
          player.vy -= player.vy * friction * dt;
          // clamp speed
          player.vx = p.constrain(player.vx, -maxSpeed, maxSpeed);
          player.vy = p.constrain(player.vy, -maxSpeed, maxSpeed);

          player.x += player.vx * dt;
          player.y += player.vy * dt;
          player.x = p.constrain(player.x, 0, p.width - player.w);
          player.y = p.constrain(player.y, 0, p.height - player.h);

          // Facing direction from velocity
          const speed = Math.hypot(player.vx, player.vy);
          if (speed > 10) heading = Math.atan2(player.vy, player.vx);

          // Pac-Man body with opening/closing mouth and eye
          const cx = player.x + player.w / 2;
          const cy = player.y + player.h / 2;
          const mouthDeg = 30 + Math.sin(p.frameCount * 0.18) * 15; // 15°–45°
          const mouthRad = (mouthDeg * Math.PI) / 180;

          p.push();
          p.translate(cx, cy);
          p.rotate(heading);
          p.noStroke();
          p.fill(255, 230, 80);
          p.arc(0, 0, player.w, player.h, mouthRad, 2 * Math.PI - mouthRad, p.PIE);
          // Eye
          p.fill(10, 10, 35);
          p.circle(player.w * 0.12, -player.h * 0.18, Math.max(3, player.w * 0.08));
          p.pop();

          // Debris
          for (let i = debris.length - 1; i >= 0; i--) {
            const d = debris[i];
            const speed = (160 + level * 50) * dt;
            d.x -= speed;
            p.fill(255, 80, 80);
            p.rect(d.x, d.y, d.w, d.h, 6);
            if (collides(player, d)) {
              gameOver = true;
              emit();
            }
            if (d.x < -d.w) debris.splice(i, 1);
          }

          // Resources (glow)
          for (let i = resources.length - 1; i >= 0; i--) {
            const r = resources[i];
            r.x -= 170 * dt;
            p.fill(0, 255, 140, 90);
            p.noStroke();
            p.circle(r.x, r.y, r.w + 10);
            p.fill(0, 255, 120);
            p.circle(r.x, r.y, r.w);
            if (collides(player, r)) {
              score += 10;
              updateProgress(progress + 10);
              resources.splice(i, 1);
              if (progress >= 100) {
                level += 1;
                updateProgress(0);
              }
            } else if (r.x < -r.w) {
              missedResources += 1;
              resources.splice(i, 1);
              if (missedResources >= 3) gameOver = true;
              emit();
            }
          }
        } else {
          // game over text only (no dark overlay)
          p.fill(255);
          p.textSize(28);
          p.textAlign(p.CENTER);
          p.text("Game Over! Press R to Restart", p.width / 2, p.height / 2);
        }
      };

      p.keyPressed = () => {
        if (gameOver && (p.key === "r" || p.key === "R")) {
          reset();
        }
      };
    };

    const instance = new p5(sketch);
    sketchRef.current = instance;

    return () => {
      sketchRef.current?.remove();
      intervals.forEach(clearInterval);
    };
  }, [onUpdate]);

  return <div ref={containerRef} className={cn("mx-auto w-full max-w-3xl", className)} />;
}
