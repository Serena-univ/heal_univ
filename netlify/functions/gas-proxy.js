const fetch = require('node-fetch');

exports.handler = async function(event) {
  const params = event.queryStringParameters;

  const url = new URL("https://script.google.com/macros/s/AKfycbzKtNHiLbI7JYOBXH5U_JE0-K97e6K2fCw4B0MVkMjeDq2zmoORlMw9l8QsL_LieYs/exec");
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString());
    const text = await response.text();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Error: " + err.toString()
    };
  }
};
