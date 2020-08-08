'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
const { removeUserInfo } = require('../../../utils/response');

function sanitizeCategory(category) {
  let sanitized = category;

  sanitized = sanitizeEntity(sanitized, { model: strapi.models.category });
  sanitized = removeUserInfo(sanitized);

  return sanitized;
}

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.category.search(ctx.query);
    } else {
      entities = await strapi.services.category.find(ctx.query);
    }

    return entities.map(sanitizeCategory);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    let entity;
    try {
      entity = await strapi.services.category.findOne({ id });
    } catch {
      entity = await strapi.services.category.findOne({ slug: id });
    }
    return sanitizeCategory(entity);
  },
};
