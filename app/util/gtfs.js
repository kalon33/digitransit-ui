export const typeToName = {
  0: 'tram',
  1: 'subway',
  2: 'rail',
  3: 'bus',
  4: 'ferry',
  7: 'funicular',
  109: 'rail',
};

/**
 * Splits a gtfsId into feedId and entityId, feedId cannot contain a colon
 * @param {string} gtfsId gtfsId of the entity in format FeedId:EntityId
 * @returns {{feedId: string, entityId: string}}
 */
export function splitGtfsId(gtfsId) {
  const i = gtfsId.indexOf(':');
  return {
    feedId: gtfsId.slice(0, i),
    entityId: gtfsId.slice(i + 1, gtfsId.length),
  };
}
