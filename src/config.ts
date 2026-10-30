import defaults from './brand.defaults.json';

const name = import.meta.env.VITE_APP_NAME?.trim() || defaults.appName;

export const brand = {
  name,
  uppercaseName: name.toUpperCase(),
  tagline: 'FEEL GOOD. FEEL YOU.',
};
