import { Agent, BrokerageSettings } from './types';

export function generateVCardString(agent: Agent, settings?: BrokerageSettings): string {
  const orgName = 'VidaBricks Real Estate LLC';
  const firstName = agent.firstName?.trim() || '';
  const lastName = agent.lastName?.trim() || '';
  const fullNameWithSuffix = [firstName, lastName, 'VidaBricks'].filter(Boolean).join(' ');

  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;VidaBricks`,
    `FN:${fullNameWithSuffix}`,
    `ORG:${orgName}`,
    `TITLE:${agent.jobTitle}`,
    `TEL;TYPE=CELL,VOICE,pref:${agent.phone}`,
    agent.whatsapp && agent.whatsapp !== agent.phone
      ? `TEL;TYPE=WHATSAPP,VOICE:${agent.whatsapp}`
      : '',
    `EMAIL;TYPE=WORK,INTERNET:${agent.email}`,
    `ADR;TYPE=WORK:;;Tameem House, Barsha Heights;Dubai;;;United Arab Emirates`,
    agent.photo && agent.photo.startsWith('http') ? `PHOTO;VALUE=URI:${agent.photo}` : '',
    'REV:' + new Date().toISOString(),
    'END:VCARD',
  ];

  return vcardLines.filter(Boolean).join('\r\n');
}

export function downloadVCard(agent: Agent, settings?: BrokerageSettings): void {
  const vcardData = generateVCardString(agent, settings);
  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${agent.firstName}_${agent.lastName}_VidaBricks.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
