export const geolocationMessages = {};

const sections = ['heading', 'text', 'a'];
const events = {
  timeout: {
    type: 'info',
    persistence: 'repeat',
    priority: 2,
  },
  denied: {
    type: 'info',
    persistence: 'repeat', // TODO: enabled for testing. Probably to be shown only once.
    priority: 3,
  },
  failed: {
    type: 'error',
    persistence: 'repeat',
    priority: 4,
  },
  prompt: {
    type: 'info',
    persistence: 'repeat',
    priority: 2,
  },
};

export function initGeolocationMessages(translations, language) {
  Object.keys(events).forEach(e => {
    const message = {
      ...events[e],
      id: `geolocation_${e}`,
      icon: 'caution_white_exclamation',
      iconColor: '#dc0451',
      backgroundColor: '#fdf0f5',
      content: {},
    };

    message.content[language] = [];

    sections.forEach(s => {
      const key = `geolocation-${e}-${s}`;
      message.content[language].push({
        type: s,
        content: translations[key],
      });
    });
    geolocationMessages[e] = message;
  });
}
