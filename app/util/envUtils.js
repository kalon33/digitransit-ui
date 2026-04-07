/**
 * Check if application is running in a dev environment.
 * RUN_ENV === 'development' in digitransit-kubernetes-deploy for dev instances.
 * For running dev locally, NODE_ENV is checked.
 */
export function IS_DEV() {
  return (
    process.env.RUN_ENV === 'development' ||
    process.env.NODE_ENV !== 'production'
  );
}

/**
 * Check if application is running in a prod environment.
 */
export function IS_PROD() {
  return !IS_DEV();
}
