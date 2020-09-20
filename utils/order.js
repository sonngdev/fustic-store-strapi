module.exports.CartValidator = class CartValidator {
  constructor(cart) {
    this.cart = cart;
  }

  async isValid() {
    if (!Array.isArray(this.cart)) return false;
    if (this.cart.length < 1) return false;

    for (const entry of this.cart) {
      const product = await strapi.services.product.findOne({ id: entry.product.id });
      if (!product) return false;
      if (!product.sizes.find((s) => s.name === entry.size)) return false;
    }

    return true;
  }

  getCart() {
    return this.cart;
  }
}

module.exports.StockValidator = class StockValidator {
  constructor(cartValidator) {
    this.cartValidator = cartValidator;
  }

  async isValid() {
    const cartValid = await this.cartValidator.isValid();
    if (!cartValid) return false;

    const entries = await this.getEntries();
    return entries.every((entry) => entry.stockExceedance === 0);
  }

  async getEntries() {
    const cart = this.cartValidator.getCart();
    const entries = [];

    for (const entry of cart) {
      const product = await strapi.services.product.findOne({ id: entry.product.id });
      const size = product.sizes.find((s) => s.name === entry.size);
      const stockExceedance = entry.quantity - size.quantity;

      entries.push({
        product: product,
        sizeName: entry.size,
        quantity: entry.quantity,
        stockExceedance: stockExceedance > 0 ? stockExceedance : 0,
      });
    }

    return entries;
  }
}

module.exports.StockSubtractor = class StockSubtractor {
  constructor(stockValidator) {
    this.stockValidator = stockValidator;
  }

  async subtract() {
    const stockValid = await this.stockValidator.isValid();
    if (!stockValid) throw new Error('Stock can\'t be subtracted due to invalid stock validator');

    const entries = await this.stockValidator.getEntries();
    for (const entry of entries) {
      const product = await strapi.services.product.findOne({ id: entry.product.id });
      const newSizes = product.sizes.map((size) => {
        if (size.name !== entry.sizeName) return size;
        return { ...size, quantity: size.quantity - entry.quantity };
      });
      await strapi.services.product.update({ id: entry.product.id }, { sizes: newSizes });
    }
  }
}
