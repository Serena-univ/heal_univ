const fetch = require('node-fetch');

exports.handler = async function(event) {
  const params = event.queryStringParameters;

  const url = new URL("https://script.google.com/macros/s/AKfycbwdrG0hu8TLSJuwf2C1u6J-7TyVRaS8jZxt3b7JlreJzga1f27GHboxba7G6yLSsl_0/exec
");
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
