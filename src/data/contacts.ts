export const FOUNDER_LINKS = {
  portfolio: 'https://mlkdesign.github.io',
  behance: 'https://www.behance.net/eugenemilka',
  freelancehunt: 'https://freelancehunt.com/freelancer/milka_jak.html#portfolio',
  linkedin: 'https://www.linkedin.com/in/jack-milka-742434173/',
  instagram: 'https://www.instagram.com/eugenemi/',
  telegram: 'https://t.me/EugeneMilka',
} as const;

/** Prepared legal routes. Content has not been provided yet. */
export const LEGAL_ROUTES = {
  privacy: '/privacy',
  confidentiality: '/confidentiality',
  terms: '/terms',
} as const;

/** Contact form endpoint (serverless). Override with VITE_CONTACT_ENDPOINT. */
export const CONTACT_ENDPOINT: string = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact';
