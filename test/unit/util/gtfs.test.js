import { splitGtfsId } from '../../../app/util/gtfs';

describe('splitGtfsId', () => {
  it('should split gtfsId into feedId and entityId', () => {
    const gtfsId = 'FOO:1234';
    const { feedId, entityId } = splitGtfsId(gtfsId);
    expect(feedId).to.equal('FOO');
    expect(entityId).to.equal('1234');
  });

  it('should gtfs work with colons in entityId', () => {
    const gtfsId = 'FOO:BAR:1234';
    const { feedId, entityId } = splitGtfsId(gtfsId);
    expect(feedId).to.equal('FOO');
    expect(entityId).to.equal('BAR:1234');
  });
});
