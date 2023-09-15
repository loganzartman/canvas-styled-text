export const drawTextMetrics = (
  ctx: CanvasRenderingContext2D,
  m: TextMetrics,
  x: number,
  y: number,
) => {
  const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  ctx.fillStyle = 'black';
  ctx.fillRect(x, y, m.width, 1);
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y - m.actualBoundingBoxAscent, m.width, 1);
  ctx.fillStyle = 'orange';
  ctx.fillRect(x, y + m.actualBoundingBoxDescent, m.width, 1);
  ctx.fillStyle = 'blue';
  ctx.fillRect(
    x - m.actualBoundingBoxLeft,
    y - m.actualBoundingBoxAscent,
    1,
    height,
  );
  ctx.fillStyle = 'green';
  ctx.fillRect(
    x + m.actualBoundingBoxRight,
    y - m.actualBoundingBoxAscent,
    1,
    height,
  );
};
