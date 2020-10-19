module.exports = ({ env }) => ({
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY_DEVELOPMENT'),
    },
    settings: {
      defaultFrom: 'thanhsonng.211+fustic@gmail.com',
      defaultReplyTo: 'thanhsonng.211+fustic@gmail.com',
    },
  },
});
