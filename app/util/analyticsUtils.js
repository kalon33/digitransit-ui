import Cookies from 'universal-cookie';

/**
 * This file contains functions for UI analytics.
 * Contains code used in both client and server
 */

/**
 * Add an analytics event to be sent to analytics server
 * Currently events have fields { event, category, action, name }
 *
 * @param {object} event
 *
 * @return void
 */
export function addAnalyticsEvent(event) {
  if (window.dataLayer) {
    let newEvent = event;
    if (event.event === undefined) {
      // this is the default event field if none is defined
      newEvent = { event: 'sendMatomoEvent', ...event };
    }
    window.dataLayer.push(newEvent);
  }
}

/**
 * Get code to initialize UI analytics in server side
 *
 * @param {number|string} GTMid Google Tag Manager id
 *
 * @return string
 */
export function getAnalyticsInitCode(config, req) {
  const { hostname, cookies } = req;
  const useAnalytics =
    !config.useCookiesPrompt || cookies.cookieConsent === 'true';

  if (!useAnalytics) {
    return '';
  }

  if (
    config.analyticsScript &&
    hostname &&
    (!hostname.match(/dev|test/) || config.devAnalytics)
  ) {
    return config.analyticsScript(
      hostname,
      config.sendAnalyticsCustomEventGoals,
    );
  }

  let script = config.GTMid
    ? // Google Tag Manager script
      `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${config.GTMid}');</script>\n`
    : '';
  if (config.crazyEgg) {
    script = `${script}<script type="text/javascript" src="//script.crazyegg.com/pages/scripts/0030/3436.js" async="async" ></script>`;
  }
  return script;
}

const handleChange = () => {
  if (!window.CookieInformation) {
    return false;
  }
  const allow = window.CookieInformation.getConsentGivenFor(
    'cookie_cat_statistic',
  );
  const cookies = new Cookies();
  const oldState = cookies.get('cookieConsent') === true;
  cookies.set('cookieConsent', allow);
  if (oldState && !allow) {
    // no consent any more, reload page
    window.location.reload();
  }
  return allow;
};

/**
 * Client side intialization for UI analytics
 *
 * @return void
 */
export function initAnalyticsClientSide(config) {
  const cookies = new Cookies();
  const useAnalytics =
    !config.useCookiesPrompt || cookies.get('cookieConsent') === true;

  if (useAnalytics) {
    window.dataLayer = window.dataLayer || [];
  }
  if (config.useCookiesPrompt) {
    window.addEventListener(
      'CookieInformationConsentGiven',
      handleChange,
      false,
    );
  }
}

/**
 * Handle user analytics
 * @param {object} user - user object
 * @param {object} config - configuration object
 */
export function handleUserAnalytics(user, config) {
  if (config.loginAnalyticsEventName && user?.sub) {
    addAnalyticsEvent({
      event: config.loginAnalyticsEventName,
      [config.loginAnalyticsKey]: user.sub,
    });
  }
}
