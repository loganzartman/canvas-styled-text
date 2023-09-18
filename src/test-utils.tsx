import React, {useEffect, useRef} from 'react';

export const TestCanvas = ({
  w,
  h,
  draw,
}: {
  w: number;
  h: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const afRef = useRef<number | null>(null);

  useEffect(() => {
    const f = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas2d context!');

        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = 'black';
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.font = '64px sans-serif';
        ctx.strokeStyle = 'transparent';
        ctx.textBaseline = 'hanging';
        ctx.textAlign = 'left';
        drawRef.current(ctx);
        ctx.restore();
      }
      afRef.current = requestAnimationFrame(f);
    };
    afRef.current = requestAnimationFrame(f);
    return () => {
      if (afRef.current) cancelAnimationFrame(afRef.current);
    };
  }, []);

  return (
    <canvas
      data-testid="test-canvas"
      ref={canvasRef}
      width={Math.ceil(w * window.devicePixelRatio)}
      height={Math.ceil(h * window.devicePixelRatio)}
      style={{
        maxWidth: '100%',
        width: `${w}px`,
        height: 'auto',
        boxShadow: '0px 8px 24px rgba(0,0,0,0.2), 0px 2px 7px rgba(0,0,0,0.3)',
      }}
    ></canvas>
  );
};
