// The Netlify serverless function
exports.handler = async function (event, context) {
  // 1. Get the prompt from the request body sent by your website
  const { prompt } = JSON.parse(event.body);

  // 2. Access your secret API key from Netlify's environment variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key is not set." }),
    };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // 3. Prepare the payload for the Google Gemini API
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  try {
    // 4. Call the Google Gemini API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    // 5. Send the successful response back to your website
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    // 6. Handle any errors and send them back to your website
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
