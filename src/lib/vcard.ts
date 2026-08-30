import { Agent, BrokerageSettings } from './types';

export function generateVCardString(agent: Agent, settings?: BrokerageSettings): string {
  const orgName = settings?.legalName || 'Vidabricks Real Estate LLC';
  const officeAddress = settings?.address || 'Tameem House, Barsha Heights, Dubai, UAE';
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agents/${agent.slug}`
    : `https://agents.vidabricks.com/agents/${agent.slug}`;

  const notes = [
    `RERA BRN: ${agent.reraNumber || 'N/A'}`,
    `Company: ${orgName}`,
    `Specialisations: ${agent.specialisations.join(', ')}`,
    `Languages: ${agent.languages.join(', ')}`,
    agent.bio ? `Bio: ${agent.bio}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${agent.lastName};${agent.firstName};;;`,
    `FN:${agent.firstName} ${agent.lastName}`,
    `ORG:${orgName}`,
    `TITLE:${agent.jobTitle}`,
    `TEL;TYPE=CELL,VOICE,pref:${agent.phone}`,
    agent.whatsapp && agent.whatsapp !== agent.phone
      ? `TEL;TYPE=WHATSAPP,VOICE:${agent.whatsapp}`
      : '',
    `EMAIL;TYPE=WORK,INTERNET:${agent.email}`,
    `URL;TYPE=WORK:${profileUrl}`,
    `ADR;TYPE=WORK:;;Tameem House, Barsha Heights;Dubai;;;United Arab Emirates`,
    `NOTE:${notes}`,
    agent.photo ? `PHOTO;VALUE=URI:${agent.photo}` : '',
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
  link.setAttribute('download', `${agent.firstName}_${agent.lastName}_Vidabricks.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
