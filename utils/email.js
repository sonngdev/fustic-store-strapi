const { getStoreUrl } = require('./url');


/**
|--------------------------------------------------
| HELPERS
|--------------------------------------------------
*/
const LOCATION = {
  LOCAL: 'LOCAL',
  WORLDWIDE: 'WORLDWIDE',
}

const getShippingTime = (location) => {
  if (location === LOCATION.LOCAL) {
    return '3-5 business days';
  }
  if (location === LOCATION.WORLDWIDE) {
    return '2-3 business weeks';
  }
}

const getCustomerInfo = (location) => {
  if (location === LOCATION.LOCAL) {
    return [
      '<%= order.first_name %> <%= order.last_name %>',
      '<%= order.address %>',
      '<%= order.district %>',
      '<%= order.city %>',
      '<%= order.country %>',
      '<%= order.zip_code %>',
      '<%= order.phone %>',
    ];
  }
  if (location === LOCATION.WORLDWIDE) {
    return [
      '<%= order.first_name %> <%= order.last_name %>',
      '<%= order.address %>',
      '<%= order.country %>',
      '<%= order.zip_code %>',
      '<%= order.phone %>',
    ];
  }
}

const getEntryPrice = (location) => {
  if (location === LOCATION.LOCAL) {
    return '<%= (entry.product.price_vnd * entry.quantity).toLocaleString() %> VND';
  }
  if (location === LOCATION.WORLDWIDE) {
    return '$<%= (entry.product.price_usd * entry.quantity).toLocaleString() %>';
  }
}

const getShippingPrice = (location) => {
  if (location === LOCATION.LOCAL) {
    return '<%= general_config.shipping_fee_vnd.toLocaleString() %> VND';
  }
  if (location === LOCATION.WORLDWIDE) {
    return '$<%= general_config.shipping_fee_usd.toLocaleString() %>';
  }
}

const getTotalPrice = (location) => {
  if (location === LOCATION.LOCAL) {
    return '<%= total_amount.vnd.toLocaleString() %> VND';
  }
  if (location === LOCATION.WORLDWIDE) {
    return '$<%= total_amount.usd.toLocaleString() %>';
  }
}


/**
|--------------------------------------------------
| EMAIL SETTINGS
|--------------------------------------------------
*/
const emailSubject = 'Your order on Fustic.Store';

const getEmailText = (location) => `
****************************
Thank you for your purchase!
****************************

Hi <%= order.first_name %>, we’re getting your order ready to be shipped. Please allow ${getShippingTime(location)} to process the order in addition to the transit time.

NOTE: All orders are final sale. Please make sure you purchase the correct style, size & color.

*Customer info:*
${getCustomerInfo(location).join('\n')}

Visit our store (${getStoreUrl()})

-------------
Order summary
-------------

<% _.forEach(order.products, (entry) => { %>
*<%= entry.product.name %>*
<%= entry.size %> • <%= entry.quantity %>
${getEntryPrice(location)}\n
<% }); %>

*SHIPPING*
${getShippingPrice(location)}

*TOTAL*
${getTotalPrice(location)}
`;

const getEmailHtml = (location) => `
<main style="font-family: Arial, Helvetica, sans-serif;">
  <h1>Thank you for your purchase!</h1>
  <p style="margin: 0 0 15px;">Hi <%= order.first_name %>, we’re getting your order ready to be shipped. Please allow ${getShippingTime(location)} to process the order in addition to the transit time.</p>
  <p style="margin: 0 0 15px;">NOTE: All orders are final sale. Please make sure you purchase the correct style, size & color.</p>
  <p style="margin: 0 0 15px;">
    <strong>Customer info:</strong><br>
    ${getCustomerInfo(location).map((info) => (
      `<small>${info}</small><br>\n    `
    )).join('')}
  </p>
  <a href="${getStoreUrl()}" target="_blank" rel="noreferrer noopener">Visit our store</a>

  <hr style="margin: 30px 0 15px;">

  <table class="products" style="width: 100%;" width="100%">
    <tr>
      <td colspan="3" style="padding-bottom: 5px; width: 60px;" width="60">
        <h2>Order summary</h2>
      </td>
    </tr>

    <% _.forEach(order.products, (entry) => { %>
      <tr>
        <td style="padding-bottom: 5px; width: 60px;" width="60"><img src="<%= entry.product.images && entry.product.images[0] ? entry.product.images[0].url : '' %>" alt="<%= entry.product.name %>" class="product-thumbnail" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" width="50" height="50"></td>
        <td style="padding-bottom: 5px;">
          <div class="name" style="margin-bottom: 4px;"><small><strong><%= entry.product.name %></strong></small></div>
          <div class="size-quantity"><small><%= entry.size %> • <%= entry.quantity %></small></div>
        </td>
        <td style="padding-bottom: 5px; padding-right: 10px; text-align: right;" align="right">${getEntryPrice(location)}</td>
      </tr>
    <% }); %>

    <tr>
      <td style="padding-bottom: 5px; width: 60px;" width="60"></td>
      <td style="padding-bottom: 5px;">
        <div class="shipping" style="margin-bottom: 10px;"><small>SHIPPING</small></div>
        <div><small><strong>TOTAL</strong></small></div>
      </td>
      <td style="padding-bottom: 5px; padding-right: 10px; text-align: right;" align="right">
        <div class="shipping" style="margin-bottom: 10px;">${getShippingPrice(location)}</div>
        <div><strong>${getTotalPrice(location)}</strong></div>
      </td>
    </tr>
  </table>
</main>
`;


module.exports.orderConfirmationLocalTemplate = {
  subject: emailSubject,
  text: getEmailText(LOCATION.LOCAL),
  html: getEmailHtml(LOCATION.LOCAL),
};

module.exports.orderConfirmationWorldwideTemplate = {
  subject: emailSubject,
  text: getEmailText(LOCATION.WORLDWIDE),
  html: getEmailHtml(LOCATION.WORLDWIDE),
};
