import { useEffect, useRef } from "react";
import p5 from "p5";

export default function StartBackground() {
  const ref = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    const sketch = (p: p5) => {
      let stars: { x: number; y: number; s: number; sp: number; phase: number; tw: number }[] = [];
      let clouds: { x: number; y: number; r: number; c: p5.Color; sp: number }[] = [];
      let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
      let shootTimer = 0;

      const createStars = () => {
        stars = [];
        const count = Math.floor((p.width * p.height) / 14000);
        for (let i = 0; i < count; i++) {
          stars.push({
            x: p.random(0, p.width),
            y: p.random(0, p.height),
            s: p.random(0.8, 2.2),
            sp: p.random(15, 50),
            phase: p.random(0, Math.PI * 2),
            tw: p.random(1.2, 2.2),
          });
        }
      };

      const createClouds = () => {
        clouds = [];
        for (let i = 0; i < 10; i++) {
          const mix = p.random(0.4, 0.9);
          const col = p.lerpColor(p.color(255, 255, 255, 90), p.color(80, 150, 255, 90), mix);
          clouds.push({
            x: p.random(0, p.width),
            y: p.random(0, p.height * 0.6),
            r: p.random(120, 260),
            c: col,
            sp: p.random(6, 14),
          });
        }
      };

      p.setup = () => {
        const c = p.createCanvas(p.windowWidth, p.windowHeight);
        c.parent(ref.current!);
        createStars();
        createClouds();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        createStars();
        createClouds();
      };

      const spawnShooting = () => {
        shooting = {
          x: p.random(p.width * 0.6, p.width),
          y: p.random(0, p.height * 0.4),
          vx: -500,
          vy: 120,
          life: 800,
        };
      };

      p.draw = () => {
        // Transparent canvas so gradient shows
        p.clear();

        // stars with twinkle
        p.noStroke();
        const t = p.millis() / 1000;
        for (const st of stars) {
          st.x -= (st.sp * p.deltaTime) / 1000;
          if (st.x < -2) st.x = p.width + 2;
          const tw = (Math.sin(t * st.tw + st.phase) + 1) / 2; // 0..1
          const alpha = 140 + tw * 115;
          const size = st.s + tw * 0.8;
          p.fill(255, 255, 255, alpha);
          p.circle(st.x, st.y, size);
          // slight glow
          p.fill(255, 255, 255, alpha * 0.25);
          p.circle(st.x, st.y, size * 2.2);
        }

        // random shooting star
        shootTimer -= p.deltaTime;
        if (!shooting && shootTimer <= 0) {
          if (p.random() < 0.02) {
            spawnShooting();
            shootTimer = p.random(3000, 7000);
          }
        }
        if (shooting) {
          p.stroke(255, 255, 255, 220);
          p.strokeWeight(2);
          p.line(shooting.x, shooting.y, shooting.x + 40, shooting.y - 10);
          p.noStroke();
          p.fill(255);
          p.circle(shooting.x, shooting.y, 2.5);
          shooting.x += (shooting.vx * p.deltaTime) / 1000;
          shooting.y += (shooting.vy * p.deltaTime) / 1000;
          shooting.life -= p.deltaTime;
          if (shooting.life <= 0 || shooting.x < -50 || shooting.y > p.height + 50) shooting = null;
        }

        // clouds (soft white/blue mixture)
        for (const cl of clouds) {
          cl.x -= (cl.sp * p.deltaTime) / 1000;
          if (cl.x < -cl.r) cl.x = p.width + cl.r;
          p.noStroke();
          p.fill(cl.c);
          p.ellipse(cl.x, cl.y, cl.r * 1.6, cl.r);
          p.ellipse(cl.x + cl.r * 0.6, cl.y + cl.r * 0.05, cl.r * 1.2, cl.r * 0.8);
          p.ellipse(cl.x - cl.r * 0.5, cl.y + cl.r * 0.1, cl.r, cl.r * 0.7);
        }
      };
    };

    const inst = new p5(sketch);
    instanceRef.current = inst;
    return () => inst.remove();
  }, []);

  return <div ref={ref} className="pointer-events-none fixed inset-0 -z-10" />;
}
