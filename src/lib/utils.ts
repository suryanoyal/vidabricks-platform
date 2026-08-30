import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+971')) {
    // Format UAE numbers: +971 50 123 4567
    const rest = clean.slice(4);
    if (rest.length >= 2) {
      const code = rest.slice(0, 2);
      const part1 = rest.slice(2, 5);
      const part2 = rest.slice(5);
      return `+971 ${code}${part1 ? ` ${part1}` : ''}${part2 ? ` ${part2}` : ''}`;
    }
  }
  return clean;
}

export function cleanPhoneForUrl(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleanNumber = cleanPhoneForUrl(phone);
  const encodedMsg = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanNumber}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}
