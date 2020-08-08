module.exports = ({ env }) => ({
  upload: {
    provider: 'aws-s3',
    providerOptions: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
      region: 'ap-southeast-1',
      params: {
        Bucket: 'fustic-store-cms',
      },
    },
  },
});
