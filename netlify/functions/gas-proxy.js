const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const params = event.queryStringParameters;

  const url = new URL("https://script.google.com/macros/s/AKfycbxkhDUi1lxRkGHFxA7JVCWKlhUvIWbAD8xhxpEbN1ZCFN5b7PIIQIFZHbjRMo2OCMlj/exec");
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString());
    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Error: " + error.toString()
    };
  }
};
