const API_KEY = '';

async function testGemini() {
  const prompt = "You are an expert plant pathologist. Analyze this plant image and return ONLY a valid JSON object with two keys: 'disease' (string — name of the disease or 'Healthy' if none found) and 'cure' (string — recommended treatment or care steps, max 3 sentences). Do not include markdown or extra text.";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          contents: [
              {
                  parts: [
                      { text: prompt }
                  ]
              }
          ],
          generationConfig: {
              response_mime_type: "application/json",
          }
      })
  });

  const result = await response.json();
  console.log("Status:", response.status);
  console.log(JSON.stringify(result, null, 2));
}

testGemini();
