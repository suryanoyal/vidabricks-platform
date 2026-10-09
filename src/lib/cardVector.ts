import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Agent } from './types';
import { generateVCardString } from './vcard';

/**
 * Escapes characters for clean, valid XML in SVG
 */
function escapeXml(unsafe: string | number | undefined | null): string {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Load safe base64 Data URL for logo if in browser
 */
let cachedLogoDataUri: string | null = null;
async function getLogoDataUri(): Promise<string> {
  if (typeof window === 'undefined') return '/logos/vidabricks-gold.png';
  if (cachedLogoDataUri) return cachedLogoDataUri;

  try {
    const res = await fetch('/logos/vidabricks-gold.png');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const uri = reader.result as string;
        cachedLogoDataUri = uri;
        resolve(uri);
      };
      reader.onerror = () => resolve('/logos/vidabricks-gold.png');
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return '/logos/vidabricks-gold.png';
  }
}

/**
 * Helper to get active profile URL for agent
 */
export function getAgentProfileUrl(agent: Agent): string {
  return typeof window !== 'undefined'
    ? `${window.location.origin}/agents/${agent.slug}`
    : `https://agents.vidabricks.com/agents/${agent.slug}`;
}

/**
 * Resolves QR target text safely.
 * If override is provided but is a base64 Data URL (e.g. data:image/png;base64,...),
 * it must NOT be passed to QRCode generator (which would crash due to QR capacity limits).
 */
export function resolveQrTargetText(
  agent: Agent,
  type: 'profile' | 'vcard',
  override?: string
): string {
  if (
    override &&
    typeof override === 'string' &&
    !override.startsWith('data:') &&
    !override.startsWith('blob:') &&
    override.length < 2500
  ) {
    return override;
  }
  if (type === 'vcard') {
    return generateVCardString(agent);
  }
  return getAgentProfileUrl(agent);
}

/**
 * Generate SVG paths for a given QR text with high error correction
 */
async function generateQrSvgPaths(text: string): Promise<{ size: number; innerSvg: string }> {
  try {
    const rawSvg = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#111111',
        light: '#ffffff',
      },
    });

    const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+) \d+"/);
    const size = viewBoxMatch ? parseInt(viewBoxMatch[1], 10) : 33;
    const innerSvg = rawSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

    return { size, innerSvg };
  } catch (err) {
    // Fallback to Medium error correction if text is long
    const rawSvg = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#111111',
        light: '#ffffff',
      },
    });

    const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+) \d+"/);
    const size = viewBoxMatch ? parseInt(viewBoxMatch[1], 10) : 33;
    const innerSvg = rawSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

    return { size, innerSvg };
  }
}

/**
 * Generate 100% Vector SVG of Front of Digital Business Card (3.5" x 2" ratio: 1050x600)
 * Every single text element, badge, border, and QR code module is a true vector.
 */
export async function generateCardFrontSvg(
  agent: Agent,
  profileUrlOverride?: string
): Promise<string> {
  const profileUrl = resolveQrTargetText(agent, 'profile', profileUrlOverride);
  const { size: qrMatrixSize, innerSvg: qrSvgContent } = await generateQrSvgPaths(profileUrl);
  const logoUri = await getLogoDataUri();

  const fullName = `${agent.firstName} ${agent.lastName}`;
  const hasRera = Boolean(agent.reraNumber && agent.reraNumber.trim() && agent.reraNumber !== 'N/A');
  const brnText = hasRera
    ? `RERA BRN: ${agent.reraNumber!.trim()} • Dubai, UAE`
    : 'Dubai, UAE';

  // QR scale inside white box (224x224 at position x=748, y=161)
  const qrScale = (224 / qrMatrixSize).toFixed(4);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1050 600" width="1050" height="600">
  <defs>
    <!-- Background Luxury Gradient -->
    <linearGradient id="vb-front-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#121824" />
      <stop offset="50%" stop-color="#0b101c" />
      <stop offset="100%" stop-color="#05070d" />
    </linearGradient>

    <!-- Gold Accent Stripe Gradient -->
    <linearGradient id="vb-gold-stripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c9a84c" />
      <stop offset="50%" stop-color="#dfc77b" />
      <stop offset="100%" stop-color="#96782c" />
    </linearGradient>

    <!-- Subtle Radial Gold Glow -->
    <radialGradient id="vb-gold-glow" cx="95%" cy="10%" r="50%">
      <stop offset="0%" stop-color="#c9a84c" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#c9a84c" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadow for White Container -->
    <filter id="vb-card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Card Base with Rounded Corners -->
  <rect x="0" y="0" width="1050" height="600" rx="28" fill="url(#vb-front-bg)" />
  <rect x="0" y="0" width="1050" height="600" rx="28" fill="url(#vb-gold-glow)" />

  <!-- Bottom Metallic Gold Stripe -->
  <rect x="0" y="592" width="1050" height="8" rx="4" fill="url(#vb-gold-stripe)" />

  <!-- Outer Card Gold Border -->
  <rect x="1.5" y="1.5" width="1047" height="597" rx="28" fill="none" stroke="#c9a84c" stroke-opacity="0.45" stroke-width="3" />

  <!-- Top Branding: Logo & Company Name -->
  <g id="vb-brand-header">
    <image href="${escapeXml(logoUri)}" x="50" y="32" width="70" height="70" preserveAspectRatio="xMidYMid meet" />
    <text x="135" y="66" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="2">VIDABRICKS</text>
    <text x="135" y="89" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="13" fill="#dfc77b" letter-spacing="3">LUXURY REAL ESTATE</text>
  </g>

  <!-- Left Side: Agent Personal Details -->
  <g id="vb-agent-details">
    <text x="50" y="215" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="48" fill="#ffffff">${escapeXml(fullName)}</text>
    <text x="50" y="262" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="25" fill="#dfc77b">${escapeXml(agent.jobTitle || 'Property Consultant')}</text>
    <text x="50" y="300" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="500" font-size="17" fill="#94a3b8">${escapeXml(brnText)}</text>

    <!-- Profile Action Pill Badge -->
    <rect x="50" y="335" width="290" height="32" rx="8" fill="#c9a84c" fill-opacity="0.18" stroke="#c9a84c" stroke-opacity="0.5" stroke-width="1" />
    <text x="64" y="356" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="13.5" fill="#dfc77b" letter-spacing="0.5">VIEW MY PROFILE ON PROFILE QR</text>
  </g>

  <!-- Right Side: Profile QR Code Vector Box -->
  <g id="vb-profile-qr-container">
    <rect x="720" y="145" width="280" height="280" rx="20" fill="#ffffff" stroke="#c9a84c" stroke-opacity="0.6" stroke-width="3" filter="url(#vb-card-shadow)" />
    <!-- 100% Vector QR Code Paths -->
    <g transform="translate(748, 161) scale(${qrScale})" shape-rendering="crispEdges">
      ${qrSvgContent}
    </g>
    <!-- Label Under QR Code -->
    <text x="860" y="409" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="13" fill="#0a0e1a" letter-spacing="1">VIEW MY PROFILE</text>
  </g>

  <!-- Footer Divider Line -->
  <line x1="50" y1="530" x2="1000" y2="530" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1" />

  <!-- Footer Information -->
  <g id="vb-footer">
    <text x="50" y="562" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="400" font-size="16" fill="#94a3b8">Tameem House, Barsha Heights, Dubai</text>
    <text x="1000" y="562" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" fill="#94a3b8">agents.vidabricks.com/${escapeXml(agent.slug)}</text>
  </g>

</svg>`;
}

/**
 * Generate 100% Vector SVG of Back of Digital Business Card (3.5" x 2" ratio: 1050x600)
 * Features direct vCard contact QR code and clickable/selectable agent contact info.
 */
export async function generateCardBackSvg(
  agent: Agent,
  vcardStringOverride?: string
): Promise<string> {
  const vcardText = resolveQrTargetText(agent, 'vcard', vcardStringOverride);
  const { size: qrMatrixSize, innerSvg: qrSvgContent } = await generateQrSvgPaths(vcardText);

  // QR scale inside white box (224x224 at position x=748, y=161)
  const qrScale = (224 / qrMatrixSize).toFixed(4);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1050 600" width="1050" height="600">
  <defs>
    <!-- Back Luxury Dark Gradient -->
    <linearGradient id="vb-back-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c121e" />
      <stop offset="50%" stop-color="#070a12" />
      <stop offset="100%" stop-color="#04060b" />
    </linearGradient>

    <!-- Gold Accent Stripe Gradient -->
    <linearGradient id="vb-gold-stripe-back" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c9a84c" />
      <stop offset="50%" stop-color="#dfc77b" />
      <stop offset="100%" stop-color="#96782c" />
    </linearGradient>

    <!-- Drop Shadow for White Container -->
    <filter id="vb-card-shadow-back" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Card Base with Rounded Corners -->
  <rect x="0" y="0" width="1050" height="600" rx="28" fill="url(#vb-back-bg)" />

  <!-- Bottom Metallic Gold Stripe -->
  <rect x="0" y="592" width="1050" height="8" rx="4" fill="url(#vb-gold-stripe-back)" />

  <!-- Outer Card Gold Border -->
  <rect x="1.5" y="1.5" width="1047" height="597" rx="28" fill="none" stroke="#c9a84c" stroke-opacity="0.45" stroke-width="3" />

  <!-- Top Action Pill Badge -->
  <g id="vb-back-badge">
    <rect x="50" y="48" width="310" height="34" rx="8" fill="#c9a84c" fill-opacity="0.15" stroke="#c9a84c" stroke-opacity="0.5" stroke-width="1.5" />
    <text x="64" y="70" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="14" fill="#dfc77b" letter-spacing="0.5">SAVE MY CONTACT ON VCARD QR</text>
  </g>

  <!-- Header -->
  <text x="50" y="136" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="38" fill="#ffffff">Connect Directly with ${escapeXml(agent.firstName)}</text>

  <!-- Contact List with Vector Icons -->
  <g id="vb-contact-list">
    <!-- Phone -->
    <g transform="translate(50, 190)">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" transform="scale(1.1)" fill="none" stroke="#dfc77b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <text x="40" y="19" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="22" fill="#dfc77b">PHONE:</text>
      <text x="140" y="19" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="23" fill="#f1f5f9">${escapeXml(agent.phone || '')}</text>
    </g>

    <!-- Email -->
    <g transform="translate(50, 245)">
      <rect width="20" height="16" x="2" y="4" rx="2" transform="scale(1.1)" fill="none" stroke="#dfc77b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" transform="scale(1.1)" fill="none" stroke="#dfc77b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <text x="40" y="19" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="22" fill="#dfc77b">EMAIL:</text>
      <text x="140" y="19" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="23" fill="#f1f5f9">${escapeXml(agent.email || '')}</text>
    </g>

    <!-- Web -->
    <g transform="translate(50, 300)">
      <circle cx="12" cy="12" r="10" transform="scale(1.1)" fill="none" stroke="#dfc77b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" transform="scale(1.1)" fill="none" stroke="#dfc77b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M2 12h20" transform="scale(1.1)" fill="none" stroke="#dfc77b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <text x="40" y="19" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="22" fill="#dfc77b">WEB:</text>
      <text x="140" y="19" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="23" fill="#f1f5f9">vidabricks.com</text>
    </g>
  </g>

  <!-- Footer note -->
  <text x="50" y="558" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="400" font-size="16" fill="#94a3b8">Dubai Luxury Real Estate Brokerage</text>


  <!-- Right Side: Contact vCard QR Code Vector Box -->
  <g id="vb-vcard-qr-container">
    <rect x="720" y="145" width="280" height="280" rx="20" fill="#ffffff" stroke="#c9a84c" stroke-opacity="0.6" stroke-width="3" filter="url(#vb-card-shadow-back)" />
    <!-- 100% Vector QR Code Paths -->
    <g transform="translate(748, 161) scale(${qrScale})" shape-rendering="crispEdges">
      ${qrSvgContent}
    </g>
    <!-- Label Under QR Code -->
    <text x="860" y="409" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="13" fill="#0a0e1a" letter-spacing="1">SAVE MY CONTACT</text>
  </g>
</svg>`;
}

/**
 * Generate 100% Vector SVG of Both Front & Back Side-by-Side (2200x600)
 */
export async function generateCardSheetSvg(
  agent: Agent,
  profileUrlOverride?: string,
  vcardStringOverride?: string
): Promise<string> {
  const frontSvg = await generateCardFrontSvg(agent, profileUrlOverride);
  const backSvg = await generateCardBackSvg(agent, vcardStringOverride);

  // Extract inner elements of each SVG
  const frontInner = frontSvg.replace(/<\?xml[^>]*\?>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
  const backInner = backSvg.replace(/<\?xml[^>]*\?>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 2200 660" width="2200" height="660">
  <!-- Front Card (Left) -->
  <g transform="translate(30, 30)">
    ${frontInner}
  </g>

  <!-- Back Card (Right) -->
  <g transform="translate(1120, 30)">
    ${backInner}
  </g>
</svg>`;
}

/**
 * Trigger download of any SVG string with given filename
 */
export function downloadSvgString(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Download Front, Back, or Side-by-Side Sheet Vector SVG
 */
export async function downloadCardSvg(
  agent: Agent,
  side: 'front' | 'back' | 'sheet'
): Promise<void> {
  if (side === 'front') {
    const svg = await generateCardFrontSvg(agent);
    downloadSvgString(svg, `${agent.slug}-vidabricks-card-front-vector.svg`);
  } else if (side === 'back') {
    const svg = await generateCardBackSvg(agent);
    downloadSvgString(svg, `${agent.slug}-vidabricks-card-back-vector.svg`);
  } else {
    const svg = await generateCardSheetSvg(agent);
    downloadSvgString(svg, `${agent.slug}-vidabricks-card-both-vector.svg`);
  }
}

/**
 * Download Both Front & Back SVGs in sequence
 */
export async function downloadBothCardSvgs(agent: Agent): Promise<void> {
  await downloadCardSvg(agent, 'front');
  await new Promise((resolve) => setTimeout(resolve, 500));
  await downloadCardSvg(agent, 'back');
}

/* =========================================================================================
 * 100% NATIVE VECTOR PDF ENGINE
 * Uses native vector PDF operators (doc.text, doc.rect, doc.roundedRect) for 100% scalable,
 * selectable, search-friendly, crisp-printed PDF cards with zero raster pixelation.
 * ========================================================================================= */

/**
 * Draw 100% Vector QR Code directly onto jsPDF canvas using vector rectangles
 */
function drawVectorQrOnPdf(
  doc: jsPDF,
  qrText: string,
  startX: number,
  startY: number,
  boxSizeMm: number
): void {
  try {
    const qr = QRCode.create(qrText, { errorCorrectionLevel: 'H' });
    const matrixSize = qr.modules.size;
    const cellMm = boxSizeMm / matrixSize;

    doc.setFillColor(17, 17, 17);
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (qr.modules.get(r, c)) {
          doc.rect(startX + c * cellMm, startY + r * cellMm, cellMm, cellMm, 'F');
        }
      }
    }
  } catch (err) {
    console.warn('Vector QR generation retry with Medium error correction:', err);
    try {
      const qr = QRCode.create(qrText, { errorCorrectionLevel: 'M' });
      const matrixSize = qr.modules.size;
      const cellMm = boxSizeMm / matrixSize;

      doc.setFillColor(17, 17, 17);
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (qr.modules.get(r, c)) {
            doc.rect(startX + c * cellMm, startY + r * cellMm, cellMm, cellMm, 'F');
          }
        }
      }
    } catch (err2) {
      console.error('Vector QR generation failed:', err2);
    }
  }
}

/**
 * Render Front of Card in Pure Vector Format into jsPDF Page (Dimensions: 88.9mm x 50.8mm)
 */
export async function renderCardFrontVectorPdf(
  doc: jsPDF,
  agent: Agent,
  profileUrlOverride?: string,
  offsetX: number = 0,
  offsetY: number = 0
): Promise<void> {
  const profileUrl = resolveQrTargetText(agent, 'profile', profileUrlOverride);

  // Background Dark Fill
  doc.setFillColor(11, 16, 28);
  doc.rect(offsetX + 0, offsetY + 0, 88.9, 50.8, 'F');

  // Outer Gold Border (Rounded)
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.roundedRect(offsetX + 1, offsetY + 1, 86.9, 48.8, 2, 2, 'D');

  // Bottom Gold Stripe
  doc.setFillColor(201, 168, 76);
  doc.rect(offsetX + 0, offsetY + 49.8, 88.9, 1.0, 'F');

  // Top Left Company Branding (100% Vector Typography + Logo)
  const logoUri = await getLogoDataUri();
  let brandTextX = offsetX + 5;
  if (logoUri) {
    try {
      doc.addImage(logoUri, 'PNG', offsetX + 5, offsetY + 3.0, 7.5, 7.5);
      brandTextX = offsetX + 14.0;
    } catch {
      brandTextX = offsetX + 5;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(255, 255, 255);
  doc.text('VIDABRICKS', brandTextX, offsetY + 6.8);

  doc.setFontSize(5.5);
  doc.setTextColor(223, 199, 123);
  doc.text('LUXURY REAL ESTATE', brandTextX, offsetY + 9.6);

  // Agent Full Name (100% Vector Text)
  const fullName = `${agent.firstName} ${agent.lastName}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15.5);
  doc.setTextColor(255, 255, 255);
  doc.text(fullName, offsetX + 5, offsetY + 19.5);

  // Job Title (100% Vector Text)
  doc.setFontSize(8.8);
  doc.setTextColor(223, 199, 123);
  doc.text(agent.jobTitle || 'Property Consultant', offsetX + 5, offsetY + 23.8);

  // RERA BRN or Dubai UAE (100% Vector Text)
  const hasRera = Boolean(agent.reraNumber && agent.reraNumber.trim() && agent.reraNumber !== 'N/A');
  const brnText = hasRera
    ? `RERA BRN: ${agent.reraNumber!.trim()} • Dubai, UAE`
    : 'Dubai, UAE';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(148, 163, 184);
  doc.text(brnText, offsetX + 5, offsetY + 27.5);

  // Profile Action Badge (Vector Box + Vector Text)
  doc.setFillColor(35, 33, 26);
  doc.roundedRect(offsetX + 5, offsetY + 30.5, 45, 3.8, 0.8, 0.8, 'F');
  doc.setDrawColor(201, 168, 76);
  doc.roundedRect(offsetX + 5, offsetY + 30.5, 45, 3.8, 0.8, 0.8, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(223, 199, 123);
  doc.text('VIEW MY PROFILE ON PROFILE QR', offsetX + 6, offsetY + 33.1);

  // Right Side: White QR Code Container (Vector Box)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(offsetX + 58.5, offsetY + 12.5, 25.5, 25.5, 1.8, 1.8, 'F');
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.roundedRect(offsetX + 58.5, offsetY + 12.5, 25.5, 25.5, 1.8, 1.8, 'D');

  // Vector QR Code Modules
  drawVectorQrOnPdf(doc, profileUrl, offsetX + 61.0, offsetY + 14.0, 20.5);

  // Label under QR Code (100% Vector Text)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.2);
  doc.setTextColor(10, 14, 26);
  doc.text('VIEW MY PROFILE', offsetX + 71.25, offsetY + 36.3, { align: 'center' });

  // Footer Divider Line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.1);
  doc.line(offsetX + 5, offsetY + 43.5, offsetX + 83.9, offsetY + 43.5);

  // Footer Text (100% Vector Text)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(148, 163, 184);
  doc.text('Tameem House, Barsha Heights, Dubai', offsetX + 5, offsetY + 47.0);

  doc.setFont('courier', 'normal');
  doc.setFontSize(4.8);
  doc.text(`agents.vidabricks.com/${agent.slug}`, offsetX + 83.9, offsetY + 47.0, { align: 'right' });
}

/**
 * Render Back of Card in Pure Vector Format into jsPDF Page (Dimensions: 88.9mm x 50.8mm)
 */
export async function renderCardBackVectorPdf(
  doc: jsPDF,
  agent: Agent,
  vcardStringOverride?: string,
  offsetX: number = 0,
  offsetY: number = 0
): Promise<void> {
  const vcardText = resolveQrTargetText(agent, 'vcard', vcardStringOverride);

  // Background Dark Fill
  doc.setFillColor(10, 14, 24);
  doc.rect(offsetX + 0, offsetY + 0, 88.9, 50.8, 'F');

  // Outer Gold Border (Rounded)
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.roundedRect(offsetX + 1, offsetY + 1, 86.9, 48.8, 2, 2, 'D');

  // Bottom Gold Stripe
  doc.setFillColor(201, 168, 76);
  doc.rect(offsetX + 0, offsetY + 49.8, 88.9, 1.0, 'F');

  // Action Pill Badge Top Left
  doc.setFillColor(35, 33, 26);
  doc.roundedRect(offsetX + 5, offsetY + 4.5, 46, 3.8, 0.8, 0.8, 'F');
  doc.setDrawColor(201, 168, 76);
  doc.roundedRect(offsetX + 5, offsetY + 4.5, 46, 3.8, 0.8, 0.8, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(223, 199, 123);
  doc.text('SAVE MY CONTACT ON VCARD QR', offsetX + 6, offsetY + 7.1);

  // Connect Heading (100% Vector Text)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Connect Directly with ${agent.firstName}`, offsetX + 5, offsetY + 14.5);

  // Contact list (100% Vector Text)
  doc.setFontSize(7.0);
  doc.setTextColor(223, 199, 123);
  doc.text('PHONE:', offsetX + 5, offsetY + 20.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  doc.text(agent.phone || '', offsetX + 18, offsetY + 20.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(223, 199, 123);
  doc.text('EMAIL:', offsetX + 5, offsetY + 26.0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  doc.text(agent.email || '', offsetX + 18, offsetY + 26.0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(223, 199, 123);
  doc.text('WEB:', offsetX + 5, offsetY + 31.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  doc.text('vidabricks.com', offsetX + 18, offsetY + 31.5);

  // Footer note (100% Vector Text)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(148, 163, 184);
  doc.text('Dubai Luxury Real Estate Brokerage', offsetX + 5, offsetY + 47.0);

  // Right Side: White QR Code Container (Vector Box)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(offsetX + 58.5, offsetY + 12.5, 25.5, 25.5, 1.8, 1.8, 'F');
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.roundedRect(offsetX + 58.5, offsetY + 12.5, 25.5, 25.5, 1.8, 1.8, 'D');

  // Vector vCard QR Code Modules
  drawVectorQrOnPdf(doc, vcardText, offsetX + 61.0, offsetY + 14.0, 20.5);

  // Label under Contact QR (100% Vector Text)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.2);
  doc.setTextColor(10, 14, 26);
  doc.text('SAVE MY CONTACT', offsetX + 71.25, offsetY + 36.3, { align: 'center' });
}

/**
 * Export ultra-crisp print-ready 3.5" x 2" Single-Sided Business Card Vector PDF (1 Page Only: Front or Back)
 * Formatted precisely to standard 3.5" × 2" (88.9mm × 50.8mm) with 100% vector text & geometry.
 */
export async function downloadBusinessCardSingleVectorPdf(
  agent: Agent,
  side: 'front' | 'back',
  qrDataUrlOrText?: string
): Promise<void> {
  const cardWidthMm = 88.9;
  const cardHeightMm = 50.8;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [cardWidthMm, cardHeightMm],
    compress: true,
  });

  if (side === 'front') {
    await renderCardFrontVectorPdf(doc, agent, qrDataUrlOrText);
  } else {
    await renderCardBackVectorPdf(doc, agent, qrDataUrlOrText);
  }

  const sideLabel = side === 'front' ? 'FRONT' : 'BACK';
  doc.save(`${agent.slug}-card-${sideLabel}-vector-print-ready.pdf`);
}

/**
 * Downloads TWO separate print-ready Vector PDFs (one for Front, one for Back) in sequence.
 */
export async function downloadBusinessCardBothSeparateVectorPdfs(
  agent: Agent,
  profileQrOverride?: string,
  vcardQrOverride?: string
): Promise<void> {
  await downloadBusinessCardSingleVectorPdf(agent, 'front', profileQrOverride);
  await new Promise((resolve) => setTimeout(resolve, 600));
  await downloadBusinessCardSingleVectorPdf(agent, 'back', vcardQrOverride);
}

/**
 * Export ultra-crisp print-ready 3.5" x 2" Double-Sided Business Card Vector PDF (Combined 2 Pages: Front & Back)
 */
export async function downloadBusinessCardVectorPdf(
  agent: Agent,
  profileQrOverride?: string,
  vcardQrOverride?: string
): Promise<void> {
  const cardWidthMm = 88.9;
  const cardHeightMm = 50.8;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [cardWidthMm, cardHeightMm],
    compress: true,
  });

  // Page 1: Front of Card (Profile QR)
  await renderCardFrontVectorPdf(doc, agent, profileQrOverride);

  // Page 2: Back of Card (Contact QR)
  doc.addPage([cardWidthMm, cardHeightMm], 'landscape');
  await renderCardBackVectorPdf(doc, agent, vcardQrOverride);

  doc.save(`${agent.slug}-vidabricks-card-vector-print-ready.pdf`);
}

/**
 * Export A4 Sheet with Front & Back business cards ready for print & cut in pure vector format
 */
export async function downloadBusinessCardSheetVectorPdf(
  agent: Agent,
  profileQrOverride?: string,
  vcardQrOverride?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const cardW = 88.9;
  const cardH = 50.8;
  const startX = (210 - cardW) / 2; // 60.55 mm

  // Header branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(201, 168, 76);
  doc.text('VIDABRICKS REAL ESTATE LLC', 105, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Luxury Business Card (Vector Edition) — ${agent.firstName} ${agent.lastName}`, 105, 29, { align: 'center' });

  // Front Card Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(201, 168, 76);
  doc.text('FRONT SIDE (PROFILE QR CODE):', startX, 44);

  // Render front card directly at startX, 48
  await renderCardFrontVectorPdf(doc, agent, profileQrOverride, startX, 48);

  // Back Card Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(201, 168, 76);
  doc.text('BACK SIDE (VCARD CONTACT QR CODE):', startX, 114);

  // Render back card directly at startX, 118
  await renderCardBackVectorPdf(doc, agent, vcardQrOverride, startX, 118);

  // Trim guides & instructions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Standard 3.5" × 2" (88.9 × 50.8 mm) • 100% Vector PDF • Print & Cut Ready', 105, 180, { align: 'center' });

  doc.save(`${agent.slug}-vidabricks-card-a4-sheet.pdf`);
}
