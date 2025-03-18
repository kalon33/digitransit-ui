/* eslint no-bitwise: ["error", { "allow": [">>", "&", "|", "<<"] }] */
// eslint-disable-next-line
export function LightenDarkenColor(color, amt) {
  /* https://css-tricks.com/snippets/javascript/lighten-darken-color/ */

  let col = color;
  let usePound = false;

  if (col[0] === '#') {
    col = col.slice(1);
    usePound = true;
  }

  const num = parseInt(col, 16);

  let r = (num >> 16) + amt;

  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  let g = (num & 0x0000ff) + amt;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  return (
    (usePound ? '#' : '') +
    String(`000000${(g | (b << 8) | (r << 16)).toString(16)}`).slice(-6)
  );
}

export function getModeIconColor(config, mode) {
  if (!config?.colors?.iconColors) {
    return undefined;
  }
  return mode === 'subway'
    ? config.colors.iconColors['mode-metro']
    : config.colors.iconColors[`mode-${mode}`];
}
