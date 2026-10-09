import { Agent } from './types';

/**
 * Helper to load an image from a URL or Data URL asynchronously
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draws rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Render Front of Business Card on a Canvas
 */
export async function renderCardFrontCanvas(agent: Agent): Promise<HTMLCanvasElement> {
  const width = 1050;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const radius = 28;

  // Clip rounded card
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.clip();

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#121824');
  bgGrad.addColorStop(0.5, '#0b101c');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle radial gold glow top-right
  const glow = ctx.createRadialGradient(width - 50, 50, 0, width - 50, 50, 300);
  glow.addColorStop(0, 'rgba(201, 168, 76, 0.25)');
  glow.addColorStop(1, 'rgba(201, 168, 76, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Bottom Gold Stripe
  const stripeGrad = ctx.createLinearGradient(0, height - 10, width, height);
  stripeGrad.addColorStop(0, '#c9a84c');
  stripeGrad.addColorStop(0.5, '#dfc77b');
  stripeGrad.addColorStop(1, '#96782c');
  ctx.fillStyle = stripeGrad;
  ctx.fillRect(0, height - 8, width, 8);

  // Border
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.45)';
  ctx.lineWidth = 3;
  roundRect(ctx, 1.5, 1.5, width - 3, height - 3, radius);
  ctx.stroke();

  // Draw Logo
  try {
    const logoImg = await loadImage('/logos/vidabricks-gold.png');
    const logoHeight = 48;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    ctx.drawImage(logoImg, 50, 45, logoWidth, logoHeight);

    // Brand text next to logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('VIDABRICKS', 50 + logoWidth + 14, 68);

    ctx.fillStyle = '#dfc77b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('LUXURY REAL ESTATE', 50 + logoWidth + 14, 86);
  } catch (e) {
    // Fallback brand text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('VIDABRICKS REAL ESTATE', 50, 75);
  }

  // Top Right RERA ORN Pill
  const ornText = 'RERA ORN: 28472';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  const ornWidth = ctx.measureText(ornText).width;
  const pillX = width - ornWidth - 75;
  const pillY = 52;
  const pillH = 30;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, pillX, pillY, ornWidth + 24, pillH, 15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, pillX, pillY, ornWidth + 24, pillH, 15);
  ctx.stroke();

  ctx.fillStyle = '#dfc77b';
  ctx.fillText(ornText, pillX + 12, pillY + 20);

  // Agent Details (Middle)
  const fullName = `${agent.firstName} ${agent.lastName}`;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
  ctx.fillText(fullName, 50, 260);

  ctx.fillStyle = '#dfc77b';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(agent.jobTitle || 'Property Consultant', 50, 305);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  const brnText = `RERA BRN: ${agent.reraNumber || 'N/A'} • Dubai, UAE`;
  ctx.fillText(brnText, 50, 342);

  // Footer Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, height - 70);
  ctx.lineTo(width - 50, height - 70);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px system-ui, -apple-system, sans-serif';
  ctx.fillText('Tameem House, Barsha Heights, Dubai', 50, height - 38);

  const nfcText = 'NFC ENABLED';
  ctx.fillStyle = '#dfc77b';
  ctx.font = 'bold 15px monospace';
  const nfcWidth = ctx.measureText(nfcText).width;
  ctx.fillText(nfcText, width - 50 - nfcWidth, height - 38);

  return canvas;
}

/**
 * Render Back of Business Card on a Canvas
 */
export async function renderCardBackCanvas(
  agent: Agent,
  qrDataUrl: string,
  qrType: 'vcard' | 'profile'
): Promise<HTMLCanvasElement> {
  const width = 1050;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const radius = 28;

  // Clip rounded card
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.clip();

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0c121e');
  bgGrad.addColorStop(0.5, '#070a12');
  bgGrad.addColorStop(1, '#04060b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Bottom Gold Stripe
  const stripeGrad = ctx.createLinearGradient(0, height - 10, width, height);
  stripeGrad.addColorStop(0, '#c9a84c');
  stripeGrad.addColorStop(0.5, '#dfc77b');
  stripeGrad.addColorStop(1, '#96782c');
  ctx.fillStyle = stripeGrad;
  ctx.fillRect(0, height - 8, width, 8);

  // Border
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.45)';
  ctx.lineWidth = 3;
  roundRect(ctx, 1.5, 1.5, width - 3, height - 3, radius);
  ctx.stroke();

  // Label requested by user:
  // "Save my contact on vcard qr and view my profile on profile qr"
  const qrActionLabel =
    qrType === 'vcard' ? 'Save my contact on vcard qr' : 'View my profile on profile qr';

  // Label Badge Top Left
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  const labelWidth = ctx.measureText(qrActionLabel.toUpperCase()).width;
  const pillH = 30;

  ctx.fillStyle = 'rgba(201, 168, 76, 0.15)';
  roundRect(ctx, 50, 50, labelWidth + 24, pillH, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 50, 50, labelWidth + 24, pillH, 8);
  ctx.stroke();

  ctx.fillStyle = '#dfc77b';
  ctx.fillText(qrActionLabel.toUpperCase(), 62, 70);

  // Header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Connect Directly with ${agent.firstName}`, 50, 135);

  // Contact list
  const startY = 195;
  const lineHeight = 42;

  // Phone
  ctx.fillStyle = '#dfc77b';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText('PHONE:', 50, startY);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = '18px system-ui, -apple-system, sans-serif';
  ctx.fillText(agent.phone, 135, startY);

  // Email
  ctx.fillStyle = '#dfc77b';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText('EMAIL:', 50, startY + lineHeight);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = '18px system-ui, -apple-system, sans-serif';
  ctx.fillText(agent.email, 135, startY + lineHeight);

  // Web
  ctx.fillStyle = '#dfc77b';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText('WEB:', 50, startY + lineHeight * 2);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = '18px system-ui, -apple-system, sans-serif';
  ctx.fillText('vidabricks.com', 135, startY + lineHeight * 2);

  // Footer notes on left
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillText('Dubai Luxury Real Estate Brokerage', 50, height - 42);

  // Right Side: QR Code Frame
  const qrBoxSize = 310;
  const qrBoxX = width - qrBoxSize - 50;
  const qrBoxY = (height - qrBoxSize) / 2 - 10;

  // White box with gold border
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.6)';
  ctx.lineWidth = 3;
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.stroke();

  // Draw QR Image
  if (qrDataUrl) {
    try {
      const qrImg = await loadImage(qrDataUrl);
      const qrPadding = 20;
      const qrDrawSize = qrBoxSize - qrPadding * 2 - 28; // leave space for bottom text
      ctx.drawImage(
        qrImg,
        qrBoxX + (qrBoxSize - qrDrawSize) / 2,
        qrBoxY + qrPadding,
        qrDrawSize,
        qrDrawSize
      );
    } catch (e) {
      console.warn('Could not draw QR code onto canvas:', e);
    }
  }

  // Label under the QR code
  const qrBottomText = qrType === 'vcard' ? 'Save my contact' : 'View my profile';
  ctx.fillStyle = '#0a0e1a';
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  const qrBottomWidth = ctx.measureText(qrBottomText.toUpperCase()).width;
  ctx.fillText(
    qrBottomText.toUpperCase(),
    qrBoxX + (qrBoxSize - qrBottomWidth) / 2,
    qrBoxY + qrBoxSize - 18
  );

  return canvas;
}

/**
 * Render Both Front and Back side-by-side onto a single high-resolution Canvas
 */
export async function renderCardSheetCanvas(
  agent: Agent,
  qrDataUrl: string,
  qrType: 'vcard' | 'profile'
): Promise<HTMLCanvasElement> {
  const frontCanvas = await renderCardFrontCanvas(agent);
  const backCanvas = await renderCardBackCanvas(agent, qrDataUrl, qrType);

  const padding = 50;
  const totalWidth = frontCanvas.width * 2 + padding * 3;
  const totalHeight = frontCanvas.height + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Dark studio backdrop
  ctx.fillStyle = '#070a12';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw Front
  ctx.drawImage(frontCanvas, padding, padding);

  // Draw Back
  ctx.drawImage(backCanvas, frontCanvas.width + padding * 2, padding);

  return canvas;
}

/**
 * Helper to download a canvas as PNG
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
