'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');
const { removeUserInfo } = require('../../../utils/response');
const { CartValidator, StockValidator, StockSubtractor } = require('../../../utils/order');
const {
  orderConfirmationLocalTemplate,
  orderConfirmationWorldwideTemplate,
} = require('../../../utils/email');

async function calculateTotalAmount(products) {
  const generalConfig = await strapi.services['general-config'].find();
  const initTotal = {
    vnd: generalConfig.shipping_fee_vnd || 0,
    usd: generalConfig.shipping_fee_usd || 0,
  };
  return products.reduce((acc, entry) => ({
    vnd: acc.vnd + entry.product.price_vnd * entry.quantity,
    usd: acc.usd + entry.product.price_usd * entry.quantity,
  }), initTotal);
}

async function addTotalAmount(order) {
  let transformed = { ...order };
  const totalAmount = await calculateTotalAmount(order.products);
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

module.exports = {
  async create(ctx) {
    const cart = typeof ctx.request.body === 'string'
      ? JSON.parse(ctx.request.body)
      : ctx.request.body;

    const cartValidator = new CartValidator(cart.products);
    const cartValid = await cartValidator.isValid();
    if (!cartValid) return ctx.badRequest('Cart is invalid');

    const stockValidator = new StockValidator(cartValidator);
    const stockValid = await stockValidator.isValid();
    if (!stockValid) return ctx.badRequest(await stockValidator.getEntries());

    const stockSubtractor = new StockSubtractor(stockValidator);
    await stockSubtractor.subtract();

    const entity = await strapi.services.order.create(ctx.request.body);
    return transformOrder(entity);
  },

  async confirm(ctx) {
    const { id } = ctx.params;
    const order = await strapi.services.order.findOne({ id });
    const emailTemplate = order.country === 'Vietnam'
      ? orderConfirmationLocalTemplate
      : orderConfirmationWorldwideTemplate;

    const general_config = await strapi.services['general-config'].find();
    const total_amount = await calculateTotalAmount(order.products);

    await strapi.plugins.email.services.email.sendTemplatedEmail(
      {
        to: order.email,
      },
      emailTemplate,
      {
        order,
        general_config,
        total_amount,
      },
    );
    await strapi.services.order.update({ id }, {
      status: 'pending',
    });

    return { success: true };
  },
};
