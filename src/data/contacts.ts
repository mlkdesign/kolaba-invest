export const FOUNDER_LINKS = {
  portfolio: 'https://mlkdesign.github.io/milka-cv/',
  behance: 'https://www.behance.net/eugenemilka',
  freelancehunt: 'https://freelancehunt.com/freelancer/milka_jak.html#portfolio',
  linkedin: 'https://www.linkedin.com/in/yevhenii-milka-742434173/',
  instagram: 'https://www.instagram.com/eugenemi/',
  telegram: 'https://t.me/EugeneMilka',
} as const;

/** App root, e.g. `/` locally or `/kolaba-invest/` on GitHub Pages. */
export const BASE_PATH: string = import.meta.env.BASE_URL;

/** Prepared legal routes. Content has not been provided yet. */
export const LEGAL_ROUTES = {
  privacy: `${BASE_PATH}privacy`,
  confidentiality: `${BASE_PATH}confidentiality`,
  terms: `${BASE_PATH}terms`,
} as const;

/** Contact form endpoint (serverless). Override with VITE_CONTACT_ENDPOINT. */
export const CONTACT_ENDPOINT: string = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact';
