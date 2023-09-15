export const createCanvas = (w: number, h: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(window.devicePixelRatio * w);
  canvas.height = Math.ceil(window.devicePixelRatio * h);
  canvas.style.maxWidth = '100%';
  canvas.style.width = `${w}px`;
  canvas.style.height = 'auto';
  canvas.style.boxShadow =
    '0px 8px 24px rgba(0,0,0,0.2), 0px 2px 7px rgba(0,0,0,0.3)';
  canvas.style.borderRadius = '16px';

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create context');

  ctx.save();
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx.font = '64px sans-serif';
  ctx.strokeStyle = 'transparent';
  ctx.textBaseline = 'hanging';
  ctx.textAlign = 'left';

  return {canvas, ctx};
};
