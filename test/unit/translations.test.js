import { expect } from 'chai';
import { describe, it } from 'mocha';

import fi from '../../app/intl/fi';
import sv from '../../app/intl/sv';
import en from '../../app/intl/en';

/**
 * This array contains language terms that are defined (and translated) but
 * do not seem to have any use in any part of the code. Consider removing these
 * from the translations file altogether.
 */
const ignoredTerms = [
  //  'destination-label-change',
  //  'origin-label-change',
  //  'splash-welcome',
];

describe('translations', () => {
  it('English translations should have all the Finnish terms', () => {
    const missing = {};
    Object.keys(fi.fi)
      .filter(key => !ignoredTerms.includes(key))
      .filter(key => en.en[key] === undefined)
      .forEach(key => {
        missing[key] = fi.fi[key];
      });
    expect(missing).to.deep.equal(
      {},
      'the English translations are missing for these Finnish terms',
    );
  });

  it('Swedish translations should have all the Finnish terms', () => {
    const missing = {};
    Object.keys(fi.fi)
      .filter(key => !ignoredTerms.includes(key))
      .filter(key => sv.sv[key] === undefined)
      .forEach(key => {
        missing[key] = fi.fi[key];
      });
    expect(missing).to.deep.equal(
      {},
      'the Swedish translations are missing for these Finnish terms',
    );
  });
});
