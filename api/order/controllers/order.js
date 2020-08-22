'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
const { removeUserInfo } = require('../../../utils/response');

async function calculateTotalAmount(order) {
  const generalConfig = await strapi.services['general-config'].find();
  const initTotal = {
    vnd: generalConfig.shipping_fee_vnd || 0,
    usd: generalConfig.shipping_fee_usd || 0,
  };
  return order.products.reduce((acc, entry) => ({
    vnd: acc.vnd + entry.product.price_vnd * entry.quantity,
    usd: acc.usd + entry.product.price_usd * entry.quantity,
  }), initTotal);
}

async function addTotalAmount(order) {
  let transformed = { ...order };
  const totalAmount = await calculateTotalAmount(order);
  transformed.total_amount_vnd = totalAmount.vnd;
  transformed.total_amount_usd = totalAmount.usd;
  return transformed;
}

async function transformOrder(order) {
  let transformed = { ...order };
  transformed = sanitizeEntity(order, { model: strapi.models.order });
  transformed = removeUserInfo(transformed);
  transformed = await addTotalAmount(transformed);
  return transformed;
}

async function subtractProductQuantity(entries) {
  for (const entry of entries) {
    const product = await strapi.services.product.findOne({ id: entry.product.id });
    const newSizes = product.sizes.map((productSize) => {
      if (productSize.name === entry.size) {
        return { ...productSize, quantity: productSize.quantity - entry.quantity };
      }
      return productSize;
    })
    await strapi.services.product.update({ id: product.id }, { sizes: newSizes });
  }
}

module.exports = {
  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.order.create(data, { files });
    } else {
      entity = await strapi.services.order.create(ctx.request.body);
    }
    await subtractProductQuantity(entity.products);

    return transformOrder(entity);
  },
};
