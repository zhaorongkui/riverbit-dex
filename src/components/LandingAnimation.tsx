import { useEffect, useRef, useState } from "react";

const SpaceTunnel = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const PARTICLE_NUM = 300;
  const PARTICLE_BASE_RADIUS = 0.5;
  const FL = 500; // 焦距
  const DEFAULT_SPEED = 0.5;
  const BOOST_SPEED = 6;
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasWidth: number, canvasHeight: number;
    let speed = BOOST_SPEED;
    let targetSpeed = DEFAULT_SPEED;
    setTimeout(() => {
      document.addEventListener("mousemove", onMouseMove);
    }, 1.5 * 1000);
    // 粒子的类型
    type Particle = {
      x: number;
      y: number;
      z: number;
      pastZ: number;
    };

    let particles: Particle[] = [];

    const resize = () => {
      canvasWidth = canvas.width = window.innerWidth;
      canvasHeight = canvas.height = window.innerHeight;
      setCenterX(canvasWidth * 0.5);
      setCenterY(canvasHeight * 0.5);
    };

    window.addEventListener("resize", resize);
    resize();

    // 随机生成粒子
    const randomizeParticle = (p: Particle) => {
      p.x = Math.random() * canvasWidth;
      p.y = Math.random() * canvasHeight;
      p.z = Math.random() * 1500 + 500; // 随机深度
      return p;
    };

    for (let i = 0; i < PARTICLE_NUM; i++) {
      particles[i] = randomizeParticle({ x: 0, y: 0, z: 0, pastZ: 0 });
      particles[i].z -= 500 * Math.random();
    }

    let mouseX = centerX,
      mouseY = centerY;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    const mouseSmoothness = 0.1; // 鼠标平滑系数

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      speed = DEFAULT_SPEED;
    };

    const loop = () => {
      // 平滑地更新鼠标位置
      mouseX += (targetMouseX - mouseX) * mouseSmoothness;
      mouseY += (targetMouseY - mouseY) * mouseSmoothness;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight); // 清除背景
      ctx.fillStyle = "#000"; // 背景颜色，保持黑色
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      speed += (targetSpeed - speed) * 0.01;

      const halfPi = Math.PI * 0.5;
      const atan2 = Math.atan2;
      const cos = Math.cos;
      const sin = Math.sin;

      ctx.beginPath();
      for (let i = 0; i < PARTICLE_NUM; i++) {
        let p = particles[i];
        p.pastZ = p.z;
        p.z -= speed;

        if (p.z <= 0) {
          randomizeParticle(p);
          continue;
        }

        const cx = centerX - (mouseX - centerX) * 1.25;
        const cy = centerY - (mouseY - centerY) * 1.25;

        const rx = p.x - cx;
        const ry = p.y - cy;

        const f = FL / p.z;
        const x = cx + rx * f;
        const y = cy + ry * f;
        const r = PARTICLE_BASE_RADIUS * f;

        const pf = FL / p.pastZ;
        const px = cx + rx * pf;
        const py = cy + ry * pf;
        const pr = PARTICLE_BASE_RADIUS * pf;

        const a = atan2(py - y, px - x);
        const a1 = a + halfPi;
        const a2 = a - halfPi;

        ctx.moveTo(px + pr * cos(a1), py + pr * sin(a1));
        ctx.arc(px, py, pr, a1, a2, true);
        ctx.lineTo(x + r * cos(a2), y + r * sin(a2));
        ctx.arc(x, y, r, a2, a1, true);
        ctx.closePath();
      }
      ctx.fillStyle = "rgba(255,255,255,0.8)"; // 粒子颜色
      ctx.fill();

      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  });

  return (
    <div className="max-h-screen overflow-hidden z-[-100]">
      <canvas className=" fixed top-0 overflow-hidden" ref={canvasRef}></canvas>
    </div>
  );
};
export default SpaceTunnel;
