'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
const { removeUserInfo } = require('../../../utils/response');

function sanitizeGeneralConfig(config) {
  let sanitized = config;

  sanitized = sanitizeEntity(sanitized, { model: strapi.models['general-config'] });
  sanitized = removeUserInfo(sanitized);

  return sanitized;
}

module.exports = {
  async find() {
    const entity = await strapi.services['general-config'].find();
    return sanitizeGeneralConfig(entity);
  },
};
