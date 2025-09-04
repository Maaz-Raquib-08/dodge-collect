import { useEffect, useRef } from "react";
import p5 from "p5";

export default function PanelStars() {
  const ref = useRef<HTMLDivElement | null>(null);
  const instRef = useRef<p5 | null>(null);

  useEffect(() => {
    const sketch = (p: p5) => {
      let stars: { x: number; y: number; r: number; phase: number; speed: number }[] = [];
      let cluster: { x: number; y: number; r: number; phase: number; speed: number }[] = [];

      const make = () => {
        stars = [];
        cluster = [];
        const w = p.width;
        const h = p.height;
        const count = Math.max(60, Math.floor((w * h) / 9000));
        for (let i = 0; i < count; i++) {
          // Spread across panel but denser around center strip
          const rx = (p.random() - 0.5) * 1.0; // -0.5..0.5 of width
          const ry = (p.random() - 0.1) * 0.6; // narrow band vertically
          const x = w / 2 + rx * w;
          const y = h * 0.45 + ry * h * 0.5; // around text area
          stars.push({
            x,
            y,
            r: p.random(0.8, 2.2),
            phase: p.random(p.TWO_PI),
            speed: p.random(0.8, 1.6),
          });
        }
        // Two sparkle clusters left/right of NEW GAME
        const cx = w / 2;
        const cy = h * 0.48;
        const clusterCenters = [
          { x: cx - w * 0.18, y: cy },
          { x: cx + w * 0.18, y: cy },
        ];
        for (const c of clusterCenters) {
          for (let i = 0; i < 50; i++) {
            const ang = p.random(p.TWO_PI);
            const rad = p.random(0, Math.min(w, h) * 0.06);
            cluster.push({
              x: c.x + Math.cos(ang) * rad,
              y: c.y + Math.sin(ang) * rad * 0.5,
              r: p.random(0.6, 1.6),
              phase: p.random(p.TWO_PI),
              speed: p.random(1.5, 3.2),
            });
          }
        }
      };

      p.setup = () => {
        const c = p.createCanvas(ref.current!.clientWidth, ref.current!.clientHeight);
        c.parent(ref.current!);
        p.clear();
        make();
      };

      p.windowResized = () => {
        if (!ref.current) return;
        p.resizeCanvas(ref.current.clientWidth, ref.current.clientHeight);
        make();
      };

      p.draw = () => {
        p.clear();
        const t = p.millis() / 1000;
        p.noStroke();
        // background stars
        for (const s of stars) {
          s.x += Math.sin(t * 0.2 + s.phase) * 0.05;
          s.y += Math.cos(t * 0.25 + s.phase) * 0.03;
          const tw = (Math.sin(t * 3 * s.speed + s.phase) + 1) / 2;
          const alpha = 110 + tw * 120;
          p.fill(255, 255, 255, alpha * 0.2);
          p.circle(s.x, s.y, s.r * 3);
          p.fill(255, 255, 255, alpha);
          p.circle(s.x, s.y, s.r);
        }
        // dense sparkle clusters
        for (const s of cluster) {
          const tw = (Math.sin(t * 6 * s.speed + s.phase) + 1) / 2;
          const alpha = 130 + tw * 125;
          p.fill(255, 255, 255, alpha * 0.25);
          p.circle(s.x, s.y, s.r * 2.5);
          p.fill(255, 255, 255, alpha);
          p.circle(s.x, s.y, s.r);
        }
      };
    };

    const inst = new p5(sketch);
    instRef.current = inst;
    return () => inst.remove();
  }, []);

  return <div ref={ref} className="pointer-events-none absolute inset-0" />;
}
