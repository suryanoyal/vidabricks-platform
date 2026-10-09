import QRCode from 'qrcode';
import { Agent } from './types';
import { generateVCardString } from './vcard';

/**
 * Safely load an image without throwing unhandled exceptions or tainting the canvas
 */
function loadSafeImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    // NEVER set crossOrigin on data: or blob: URIs
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If CORS failed on remote URL, resolve null safely
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Generate a standalone QR canvas directly in memory
 */
async function generateStandaloneQRCanvas(text: string, size: number): Promise<HTMLCanvasElement> {
  const qrCanvas = document.createElement('canvas');
  qrCanvas.width = size;
  qrCanvas.height = size;
  await QRCode.toCanvas(qrCanvas, text, {
    width: size,
    margin: 2,
    color: { dark: '#111111', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });
  return qrCanvas;
}

/**
 * Get active QR text for agent based on qrType
 */
function getActiveQRText(agent: Agent, qrType: 'vcard' | 'profile'): string {
  if (qrType === 'vcard') {
    return generateVCardString(agent);
  }
  return typeof window !== 'undefined'
    ? `${window.location.origin}/agents/${agent.slug}`
    : `https://agents.vidabricks.com/agents/${agent.slug}`;
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
  const logoImg = await loadSafeImage('/logos/vidabricks-gold.png');
  if (logoImg && logoImg.width > 0 && logoImg.height > 0) {
    const logoHeight = 48;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    ctx.drawImage(logoImg, 50, 45, logoWidth, logoHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('VIDABRICKS', 50 + logoWidth + 14, 68);

    ctx.fillStyle = '#dfc77b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('LUXURY REAL ESTATE', 50 + logoWidth + 14, 86);
  } else {
    // Fallback brand vector text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('VIDABRICKS', 50, 68);

    ctx.fillStyle = '#dfc77b';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('LUXURY REAL ESTATE', 50, 90);
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
  ctx.fillText(agent.phone || '', 135, startY);

  // Email
  ctx.fillStyle = '#dfc77b';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText('EMAIL:', 50, startY + lineHeight);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = '18px system-ui, -apple-system, sans-serif';
  ctx.fillText(agent.email || '', 135, startY + lineHeight);

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

  // Draw QR Image (guaranteed fallback to generateStandaloneQRCanvas)
  let qrDrawn = false;
  if (qrDataUrl) {
    const qrImg = await loadSafeImage(qrDataUrl);
    if (qrImg) {
      const qrPadding = 20;
      const qrDrawSize = qrBoxSize - qrPadding * 2 - 28;
      ctx.drawImage(
        qrImg,
        qrBoxX + (qrBoxSize - qrDrawSize) / 2,
        qrBoxY + qrPadding,
        qrDrawSize,
        qrDrawSize
      );
      qrDrawn = true;
    }
  }

  if (!qrDrawn) {
    const activeText = getActiveQRText(agent, qrType);
    const qrCanvas = await generateStandaloneQRCanvas(activeText, 240);
    const qrPadding = 20;
    const qrDrawSize = qrBoxSize - qrPadding * 2 - 28;
    ctx.drawImage(
      qrCanvas,
      qrBoxX + (qrBoxSize - qrDrawSize) / 2,
      qrBoxY + qrPadding,
      qrDrawSize,
      qrDrawSize
    );
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
 * Render Property Brochure / Signboard Flyer on Canvas
 */
export async function renderFlyerCanvas(
  agent: Agent,
  qrDataUrl: string,
  qrType: 'vcard' | 'profile'
): Promise<HTMLCanvasElement> {
  const width = 1200;
  const height = 700;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const radius = 28;
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.clip();

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0f1624');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
  ctx.lineWidth = 3;
  roundRect(ctx, 1.5, 1.5, width - 3, height - 3, radius);
  ctx.stroke();

  // Header Logo & Branding
  const logoImg = await loadSafeImage('/logos/vidabricks-gold.png');
  if (logoImg && logoImg.width > 0 && logoImg.height > 0) {
    const logoHeight = 44;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    ctx.drawImage(logoImg, 50, 40, logoWidth, logoHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('VIDABRICKS REAL ESTATE', 50 + logoWidth + 14, 62);
    ctx.fillStyle = '#dfc77b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('DUBAI LUXURY BROKERAGE', 50 + logoWidth + 14, 80);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('VIDABRICKS REAL ESTATE', 50, 65);
  }

  // Header Right: RERA ORN
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('RERA ORN: 28472', width - 200, 60);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Barsha Heights, Dubai', width - 200, 80);

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 110);
  ctx.lineTo(width - 50, 110);
  ctx.stroke();

  // Left Content
  const pillText = 'OFFICIAL PROPERTY CONSULTANT';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  const pillW = ctx.measureText(pillText).width;
  ctx.fillStyle = 'rgba(201, 168, 76, 0.18)';
  roundRect(ctx, 50, 140, pillW + 24, 28, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
  roundRect(ctx, 50, 140, pillW + 24, 28, 14);
  ctx.stroke();
  ctx.fillStyle = '#dfc77b';
  ctx.fillText(pillText, 62, 159);

  // Agent Name
  const fullName = `${agent.firstName} ${agent.lastName}`;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
  ctx.fillText(fullName, 50, 225);

  ctx.fillStyle = '#dfc77b';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(agent.jobTitle || 'Property Consultant', 50, 265);

  // Bio quote
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'italic 16px system-ui, -apple-system, sans-serif';
  const bio = agent.bio ? `"${agent.bio.slice(0, 140)}..."` : 'Dubai Prime Real Estate Portfolio Advisor';
  ctx.fillText(bio, 50, 315);

  // Right Side: QR Container
  const qrBoxSize = 300;
  const qrBoxX = width - qrBoxSize - 70;
  const qrBoxY = 170;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.fill();
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 3;
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.stroke();

  let flyerQrDrawn = false;
  if (qrDataUrl) {
    const qrImg = await loadSafeImage(qrDataUrl);
    if (qrImg) {
      const drawSize = qrBoxSize - 55;
      ctx.drawImage(qrImg, qrBoxX + 27, qrBoxY + 15, drawSize, drawSize);
      flyerQrDrawn = true;
    }
  }

  if (!flyerQrDrawn) {
    const activeText = getActiveQRText(agent, qrType);
    const qrCanvas = await generateStandaloneQRCanvas(activeText, 240);
    const drawSize = qrBoxSize - 55;
    ctx.drawImage(qrCanvas, qrBoxX + 27, qrBoxY + 15, drawSize, drawSize);
  }

  // QR Labels (requested by user)
  const qrLabel = qrType === 'vcard' ? 'Save my contact on vcard qr' : 'View my profile on profile qr';
  const qrSubLabel = qrType === 'vcard' ? 'Save my contact' : 'View my profile';

  ctx.fillStyle = '#0a0e1a';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  const subW = ctx.measureText(qrSubLabel.toUpperCase()).width;
  ctx.fillText(qrSubLabel.toUpperCase(), qrBoxX + (qrBoxSize - subW) / 2, qrBoxY + qrBoxSize - 15);

  // Badge under QR container
  ctx.fillStyle = 'rgba(201, 168, 76, 0.2)';
  roundRect(ctx, qrBoxX, qrBoxY + qrBoxSize + 20, qrBoxSize, 36, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, qrBoxX, qrBoxY + qrBoxSize + 20, qrBoxSize, 36, 10);
  ctx.stroke();

  ctx.fillStyle = '#dfc77b';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  const labelW = ctx.measureText(qrLabel.toUpperCase()).width;
  ctx.fillText(qrLabel.toUpperCase(), qrBoxX + (qrBoxSize - labelW) / 2, qrBoxY + qrBoxSize + 43);

  // Footer contacts on bottom left
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Phone: ${agent.phone}   |   Email: ${agent.email}   |   vidabricks.com`, 50, height - 50);

  return canvas;
}

/**
 * Render Social / WhatsApp Story Format on Canvas (1080 x 1920)
 */
export async function renderStoryCanvas(
  agent: Agent,
  qrDataUrl: string,
  qrType: 'vcard' | 'profile'
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0d1322');
  bgGrad.addColorStop(0.5, '#080c16');
  bgGrad.addColorStop(1, '#030509');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Top gold trim bar
  const topGrad = ctx.createLinearGradient(0, 0, width, 0);
  topGrad.addColorStop(0, '#c9a84c');
  topGrad.addColorStop(0.5, '#dfc77b');
  topGrad.addColorStop(1, '#96782c');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 14);

  // Logo top center
  const logoImg = await loadSafeImage('/logos/vidabricks-gold.png');
  if (logoImg && logoImg.width > 0 && logoImg.height > 0) {
    const logoHeight = 90;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    ctx.drawImage(logoImg, (width - logoWidth) / 2, 140, logoWidth, logoHeight);
  }

  ctx.fillStyle = '#dfc77b';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  const brandSub = 'VIDABRICKS LUXURY REAL ESTATE';
  const brandSubW = ctx.measureText(brandSub).width;
  ctx.fillText(brandSub, (width - brandSubW) / 2, 270);

  // Agent photo or fallback monogram
  const photoRadius = 130;
  const photoCenterX = width / 2;
  const photoCenterY = 470;
  let photoDrawn = false;

  if (agent.photo && agent.photo.trim().length > 5) {
    const photoImg = await loadSafeImage(agent.photo);
    if (photoImg && photoImg.width > 0 && photoImg.height > 0) {
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate aspect-ratio cover to prevent image distortion
        const aspect = photoImg.width / photoImg.height;
        let drawW = photoRadius * 2;
        let drawH = photoRadius * 2;
        let offsetX = photoCenterX - photoRadius;
        let offsetY = photoCenterY - photoRadius;

        if (aspect > 1) {
          drawW = drawH * aspect;
          offsetX = photoCenterX - drawW / 2;
        } else {
          drawH = drawW / aspect;
          offsetY = photoCenterY - drawH / 2;
        }

        ctx.drawImage(photoImg, offsetX, offsetY, drawW, drawH);
        ctx.restore();
        photoDrawn = true;
      } catch (e) {
        console.warn('Could not draw agent photo:', e);
      }
    }
  }

  if (!photoDrawn) {
    // Elegant luxury gold monogram
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#dfc77b';
    ctx.font = 'bold 80px system-ui, -apple-system, sans-serif';
    const initials = `${agent.firstName?.[0] || ''}${agent.lastName?.[0] || ''}`;
    const initW = ctx.measureText(initials).width;
    ctx.fillText(initials, photoCenterX - initW / 2, photoCenterY + 28);
  }

  // Gold ring around photo
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Agent Name
  const fullName = `${agent.firstName} ${agent.lastName}`;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
  const nameW = ctx.measureText(fullName).width;
  ctx.fillText(fullName, (width - nameW) / 2, 680);

  // Job Title
  ctx.fillStyle = '#dfc77b';
  ctx.font = '600 28px system-ui, -apple-system, sans-serif';
  const titleW = ctx.measureText(agent.jobTitle || '').width;
  ctx.fillText(agent.jobTitle || '', (width - titleW) / 2, 730);

  // Label requested by user
  const qrLabel = qrType === 'vcard' ? 'Save my contact on vcard qr' : 'View my profile on profile qr';
  const qrSubLabel = qrType === 'vcard' ? 'Save my contact' : 'View my profile';

  // Label pill
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  const labelW = ctx.measureText(qrLabel.toUpperCase()).width;
  ctx.fillStyle = 'rgba(201, 168, 76, 0.2)';
  roundRect(ctx, (width - (labelW + 48)) / 2, 800, labelW + 48, 54, 27);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.6)';
  ctx.lineWidth = 2;
  roundRect(ctx, (width - (labelW + 48)) / 2, 800, labelW + 48, 54, 27);
  ctx.stroke();
  ctx.fillStyle = '#dfc77b';
  ctx.fillText(qrLabel.toUpperCase(), (width - labelW) / 2, 836);

  // QR Frame Center
  const qrSize = 520;
  const qrX = (width - qrSize) / 2;
  const qrY = 900;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 36);
  ctx.fill();
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 5;
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 36);
  ctx.stroke();

  let storyQrDrawn = false;
  if (qrDataUrl) {
    const qrImg = await loadSafeImage(qrDataUrl);
    if (qrImg) {
      const drawSize = qrSize - 80;
      ctx.drawImage(qrImg, qrX + 40, qrY + 25, drawSize, drawSize);
      storyQrDrawn = true;
    }
  }

  if (!storyQrDrawn) {
    const activeText = getActiveQRText(agent, qrType);
    const qrCanvas = await generateStandaloneQRCanvas(activeText, 440);
    const drawSize = qrSize - 80;
    ctx.drawImage(qrCanvas, qrX + 40, qrY + 25, drawSize, drawSize);
  }

  // Sublabel inside QR
  ctx.fillStyle = '#0a0e1a';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  const subW = ctx.measureText(qrSubLabel.toUpperCase()).width;
  ctx.fillText(qrSubLabel.toUpperCase(), (width - subW) / 2, qrY + qrSize - 25);

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px monospace';
  const urlText = `agents.vidabricks.com/agents/${agent.slug}`;
  const urlW = ctx.measureText(urlText).width;
  ctx.fillText(urlText, (width - urlW) / 2, 1750);

  return canvas;
}

/**
 * Helper to download a canvas as PNG using Blob & ObjectURL
 */
export async function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = blobUrl;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            resolve();
          }, 1000);
        } else {
          // Fallback to toDataURL
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        }
      }, 'image/png');
    } catch (e) {
      console.warn('canvas.toBlob failed, trying fallback toDataURL:', e);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err2) {
        console.error('All PNG download methods failed:', err2);
      }
      resolve();
    }
  });
}
