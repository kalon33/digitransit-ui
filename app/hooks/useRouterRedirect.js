import { useEffect } from 'react';

/**
 * Generic hook to handle router redirects with query parameters
 * @param {Object} params - Redirect parameters
 * @param {Object} params.match - Router match object
 * @param {Object} params.router - Router object
 * @param {boolean} params.shouldRedirect - Whether to perform redirect
 * @param {string} [params.pathname] - Optional new pathname (if null, keeps current)
 * @param {Object} [params.query] - Query parameters to merge with existing ones
 */
export const useRouterRedirect = ({
  match,
  router,
  shouldRedirect,
  pathname = null,
  query = {},
}) => {
  useEffect(() => {
    if (!shouldRedirect) {
      return;
    }

    const basePath = pathname
      ? { ...match.location, pathname }
      : match.location;

    const path = {
      ...basePath,
      query: {
        ...basePath.query,
        ...query,
      },
    };

    router.replace(path);
  }, [shouldRedirect, pathname, query, match, router]);
};
