'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');

function sanitizeGeneralConfig(config) {
  let sanitized;

  sanitized = sanitizeEntity(config, { model: strapi.models['general-config'] });

  delete sanitized.created_by;
  delete sanitized.updated_by;

  return sanitized;
}

module.exports = {
  async find() {
    const entity = await strapi.services['general-config'].find();
    return sanitizeGeneralConfig(entity);
  },
};
