const { Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys, WebpayPlus } = require('transbank-sdk');

const getEnvironment = () => {
  switch (process.env.WEBPAY_ENVIRONMENT) {
    case 'PRODUCCION':
      return Environment.Production;
    case 'TEST':
    default:
      return Environment.Integration;
  }
};

module.exports = {
  configureWebpay: () => {
    const environment = getEnvironment();
    const commerceCode = process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
    const apiKey = process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY;

    console.log('Configurando Webpay con:', {
      environment: Environment.toString(environment),
      commerceCode,
      apiKey: apiKey ? '****' + apiKey.slice(-4) : 'usando clave por defecto'
    });

    return new WebpayPlus.Transaction(
      new Options(commerceCode, apiKey, environment)
    );
  }
};