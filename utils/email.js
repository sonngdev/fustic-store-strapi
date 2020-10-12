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
${getEntryPrice(location)}
<% }); %>
`;

const getEmailHtml = (location) => `
<table style="font-family: Arial, Helvetica, sans-serif;">
  <tr style="font-family: Arial, Helvetica, sans-serif;">
    <td colspan="2" style="font-family: Arial, Helvetica, sans-serif;"><h1 style="font-family: Arial, Helvetica, sans-serif;">Thank you for your purchase!</h1></td>
  </tr>

  <tr style="font-family: Arial, Helvetica, sans-serif;">
    <td colspan="2" style="font-family: Arial, Helvetica, sans-serif;">
      <p style="font-family: Arial, Helvetica, sans-serif; margin: 0 0 15px;">Hi <%= order.first_name %>, we’re getting your order ready to be shipped. Please allow ${getShippingTime(location)} to process the order in addition to the transit time.</p>
    </td>
  </tr>

  <tr style="font-family: Arial, Helvetica, sans-serif;">
    <td colspan="2" style="font-family: Arial, Helvetica, sans-serif;">
      <p style="font-family: Arial, Helvetica, sans-serif; margin: 0 0 15px;">NOTE: All orders are final sale. Please make sure you purchase the correct style, size & color.</p>
    </td>
  </tr>

  <tr style="font-family: Arial, Helvetica, sans-serif;">
    <td colspan="2" style="font-family: Arial, Helvetica, sans-serif;">
      <p style="font-family: Arial, Helvetica, sans-serif; margin: 0 0 15px;">
        <strong style="font-family: Arial, Helvetica, sans-serif;">Customer info:</strong><br style="font-family: Arial, Helvetica, sans-serif;">
        ${getCustomerInfo(location).map((info) => (
          `<small style="font-family: Arial, Helvetica, sans-serif;">${info}</small><br style="font-family: Arial, Helvetica, sans-serif;">\n        `
        )).join('')}
      </p>
    </td>
  </tr>

  <tr style="font-family: Arial, Helvetica, sans-serif;">
    <td colspan="2" style="font-family: Arial, Helvetica, sans-serif;"><a href="${getStoreUrl()}" target="_blank" rel="noreferrer noopener" style="font-family: Arial, Helvetica, sans-serif;">Visit our store</a></td>
  </tr>
</table>

<hr style="font-family: Arial, Helvetica, sans-serif; margin: 30px 0 15px;">

<table class="products" style="font-family: Arial, Helvetica, sans-serif; width: 100%;" width="100%">
  <tr style="font-family: Arial, Helvetica, sans-serif;">
    <td colspan="3" style="font-family: Arial, Helvetica, sans-serif; padding-bottom: 5px; width: 60px;" width="60">
      <h2 style="font-family: Arial, Helvetica, sans-serif;">Order summary</h2>
    </td>
  </tr>

  <% _.forEach(order.products, (entry) => { %>
    <tr style="font-family: Arial, Helvetica, sans-serif;">
      <td style="font-family: Arial, Helvetica, sans-serif; padding-bottom: 5px; width: 60px;" width="60"><img src="<%= entry.product.images && entry.product.images[0] ? entry.product.images[0].url : '' %>" alt="<%= entry.product.name %>" class="product-thumbnail" style="font-family: Arial, Helvetica, sans-serif; width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" width="50" height="50"></td>
      <td style="font-family: Arial, Helvetica, sans-serif; padding-bottom: 5px;">
        <div class="name" style="font-family: Arial, Helvetica, sans-serif; margin-bottom: 4px;"><small style="font-family: Arial, Helvetica, sans-serif;"><strong style="font-family: Arial, Helvetica, sans-serif;"><%= entry.product.name %></strong></small></div>
        <div class="size-quantity" style="font-family: Arial, Helvetica, sans-serif;"><small style="font-family: Arial, Helvetica, sans-serif;"><%= entry.size %> • <%= entry.quantity %></small></div>
      </td>
      <td style="font-family: Arial, Helvetica, sans-serif; padding-bottom: 5px; padding-right: 10px; text-align: right;" align="right">${getEntryPrice(location)}</td>
    </tr>
  <% }); %>
</table>
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
