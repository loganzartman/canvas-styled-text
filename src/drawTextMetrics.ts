export const drawTextMetrics = (
  ctx: CanvasRenderingContext2D,
  m: TextMetrics,
  x: number,
  y: number,
) => {
  ctx.save();
  const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  ctx.fillStyle = 'gray';
  ctx.fillRect(x - m.actualBoundingBoxLeft, y - 1, m.width, 3);
  ctx.fillStyle = 'red';
  ctx.fillRect(
    x - m.actualBoundingBoxLeft,
    y - m.actualBoundingBoxAscent,
    m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    1,
  );
  ctx.fillStyle = 'orange';
  ctx.fillRect(
    x - m.actualBoundingBoxLeft,
    y + m.actualBoundingBoxDescent,
    m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    1,
  );
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
  ctx.restore();
};
