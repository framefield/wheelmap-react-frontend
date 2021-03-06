// @flow

import type { Feature, FeatureCollection } from '../Feature';
import { globalFetchManager } from '../FetchManager';
import EventTarget, { CustomEvent } from '../EventTarget';


type FeatureCacheEvent = Event & {
  target: FeatureCache, // eslint-disable-line no-use-before-define
  feature: Feature,
};

/**
 * Base clase for a cache of GeoJSON features (cached by id). Subclass this and override the
 * `fetchFeature` method.
 */

export default class FeatureCache<
  FeatureType: Class<Feature>,
  FeatureCollectionType: Class<FeatureCollection>
> extends EventTarget<FeatureCacheEvent> {
  cache: { [string]: ?FeatureType } = {};

  /**
   * Caches a given GeoJSON Feature by id.
   *
   * @param {Feature} feature A GeoJSON-compatible Feature to cache. Must include an id in one of
   *   the following paths:
   *     - id
   *     - properties.id
   *     - _id
   *     - properties._id
   */
  cacheFeature(feature: FeatureType): void {
    const featureId = this.constructor.getIdForFeature(feature);
    if (!featureId) return;
    this.cache[featureId] = feature;
  }

  static getIdForFeature(feature: FeatureType): string { // eslint-disable-line no-unused-vars
    throw new Error('Please implement this in your subclass.');
  }

  /**
   * Caches all features in a given GeoJSON FeatureCollection by id.
   *
   * @param {FeatureCollection} geoJSON A GeoJSON-compatible FeatureCollection that includes all
   *   features that should be cached.
   */
  cacheGeoJSON(geoJSON: FeatureCollectionType): void {
    if (!geoJSON || !geoJSON.features) {
      return;
    }
    geoJSON.features.forEach(feature => this.cacheFeature(feature));
  }

  fetchFeature(id: string, resolve: ((FeatureType) => void), reject: ((response: any) => void)) {
    this.constructor.fetchFeature(id).then(
      (response: Response) => {
        if (response.status === 200) {
          return this.constructor.getFeatureFromResponse(response).then((feature) => {
            this.cacheFeature(feature);
            resolve(feature);
            const changeEvent = new CustomEvent('change', { target: this, feature });
            this.dispatchEvent(changeEvent);
          }, reject);
        }
        if (response.status === 404) {
          this.cache[id] = null;
        }
        return reject(response);
      },
      reject,
    );
  }

  /**
   * Gets a feature from cache or fetches it from the web.
   * @param {string} id
   */
  getFeature(id: string): Promise<?FeatureType> {
    const feature = this.getCachedFeature(id);
    return new Promise((resolve, reject) => {
      if (feature || feature === null) {
        resolve(feature);
        return;
      }
      this.fetchFeature(id, resolve, reject);
    });
  }


  reloadFeature(id: string): Promise<?FeatureType> {
    delete this.cache[id];
    return this.getFeature(id);
  }


  /** @private */ getCachedFeature(id: string): ?FeatureType {
    return this.cache[id];
  }


  static getFeatureFromResponse(response: Response): Promise<FeatureType> {
    return response.json();
  }


  updateFeatureAttribute(id: string, newProperties: $PropertyType<FeatureType, 'properties'>) {
    const feature = this.cache[id];
    if (!feature) throw new Error('Cannot update a feature that is not in cache.');

    const existingProperties = feature.properties;
    if (existingProperties) {
      Object.assign(existingProperties, newProperties);
    } else {
      feature.properties = Object.assign({}, newProperties);
    }
    const changeEvent = new CustomEvent('change', { target: this, feature });
    this.dispatchEvent(changeEvent);
    console.log('Updated feature', feature);
  }


  /**
   * Fetches a non-cached feature from its store, using `fetch`.
   * @param {string} id
   */
  // eslint-disable-next-line
  /** @protected @abstract */ static fetchFeature(id: string): Promise<Response> {
    throw new Error('Not implemented. Please override this method in your subclass.');
  }

  /**
   * Fetches a non-cached feature from its store, using WhatWG `fetch`.
   * @param {string} url
   */
  /** @protected @abstract */ static fetch(url: string): Promise<Response> {
    return globalFetchManager.fetch(url);
  }
}
