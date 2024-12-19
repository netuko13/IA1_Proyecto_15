// src/components/DigitalRain.jsx
import { useEffect, useRef } from "react";

const DigitalRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
  
    resizeCanvas(); // Inicializa el tamaño
    window.addEventListener("resize", resizeCanvas);

    const fontSize = 10;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#034694";//"#0F0";//"#f4427d";
      ctx.font = `${fontSize}px arial`;

      drops.forEach((y, i) => {
        const text = String.fromCharCode(0x30a0 + Math.random() * 96);
        const x = i * fontSize;
        ctx.fillText(text, x, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      });
    };

    const interval = setInterval(draw, 50);

    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="digital-rain-canvas" />;
};

export default DigitalRain;
