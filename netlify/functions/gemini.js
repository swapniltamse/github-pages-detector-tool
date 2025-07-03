// The Netlify serverless function for securely calling the Gemini API
exports.handler = async function (event) {
  // Define CORS headers to allow requests from any origin
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle the browser's preflight 'OPTIONS' request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204, // No Content
      headers,
      body: "",
    };
  }

  // We only want to process POST requests for our main logic
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // Method Not Allowed
      headers,
      body: "Method Not Allowed",
    };
  }

  try {
    // 1. Get the prompt from the request body
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Prompt is required." }),
      };
    }

    // 2. Access your secret API key from Netlify's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "API key is not configured on the server.",
        }),
      };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 3. Prepare the payload for the Google Gemini API
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    // 4. Call the Google Gemini API from the server
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API Error:", errorBody);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Gemini API failed with status: ${response.status}`,
        }),
      };
    }

    const data = await response.json();

    // 5. Send the successful response back to your website
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    // 6. Handle any other errors
    console.error("Proxy Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
