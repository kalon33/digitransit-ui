import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classList } from '@hsl-fi/utilities';
import { Alert } from '@hsl-fi/icons';
import { CrisisPriority } from '@hsl-fi/content-delivery-api-types';
import { useConfigContext } from '../configurations/ConfigContext';
import { getJson } from '../util/xhrPromise';
import './crisis-banner-hsl.scss';

const CrisisBannerHsl = ({ lang = 'fi', initialBanners = null }) => {
  const config = useConfigContext();
  const [banners, setBanners] = useState(() => {
    if (initialBanners) {
      return initialBanners;
    }
    if (config.showStaticCrisisBanners) {
      return config.staticCrisisBanners || [];
    }
    return [];
  });

  useEffect(() => {
    if (
      initialBanners ||
      config.showStaticCrisisBanners ||
      !config.URL.BANNERS
    ) {
      return;
    }
    getJson(`${config.URL.BANNERS}&language=${lang}`)
      .then(data => setBanners(data))
      .catch(() => setBanners([]));
  }, [lang]);

  if (!banners.length) {
    return null;
  }

  return (
    <div className="crisis-banners">
      {banners.map(({ body, priority }) => (
        <div
          key={body}
          className={classList(
            'crisis-banners-banner',
            priority === CrisisPriority.Primary
              ? 'crisis-banners-banner-primary'
              : 'crisis-banners-banner-secondary',
          )}
        >
          {priority === CrisisPriority.Primary && (
            <div className="crisis-banners-banner-primary-icon">
              <Alert width="19" fill="#ffffff" />
            </div>
          )}
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      ))}
    </div>
  );
};

CrisisBannerHsl.propTypes = {
  lang: PropTypes.string,
  initialBanners: PropTypes.arrayOf(
    PropTypes.shape({
      body: PropTypes.string,
      priority: PropTypes.string,
    }),
  ),
};

export default CrisisBannerHsl;
