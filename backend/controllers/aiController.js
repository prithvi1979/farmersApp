const User = require('../models/User');

exports.diagnosePlant = async (req, res) => {
    try {
        const { image, mimeType } = req.body;
        
        if (!image) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured in .env' });
        }

        // Strip the data URI prefix if present (e.g., "data:image/jpeg;base64,")
        let base64Data = image;
        if (image.startsWith('data:')) {
            const parts = image.split(',');
            if (parts.length > 1) {
                base64Data = parts[1];
            }
        }

        const prompt = "You are an expert plant pathologist. Analyze this plant image and return ONLY a valid JSON object with two keys: 'disease' (string — name of the disease or 'Healthy' if none found) and 'cure' (string — recommended treatment or care steps, max 3 sentences). Do not include markdown or extra text. Example: {\"disease\": \"Tomato Blight\", \"cure\": \"Remove infected leaves and apply copper fungicide.\"}";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType || "image/jpeg",
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    response_mime_type: "application/json",
                }
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error('Gemini API Error:', result);
            return res.status(500).json({ success: false, error: result.error?.message || 'Failed to analyze image with AI' });
        }

        const aiResponseText = result.candidates[0].content.parts[0].text;
        
        try {
            // Because we passed response_mime_type: "application/json", Gemini usually returns pure JSON
            const parsedData = JSON.parse(aiResponseText);
            return res.json({ success: true, data: parsedData });
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponseText);
            // Fallback: Use regex to extract JSON if it was wrapped in markdown ```json ... ```
            const jsonMatch = aiResponseText.match(/{[\s\S]*}/);
            if (jsonMatch) {
                try {
                    const extractedData = JSON.parse(jsonMatch[0]);
                    return res.json({ success: true, data: extractedData });
                } catch (e) {
                    return res.status(500).json({ success: false, error: 'Invalid format received from AI' });
                }
            }
            return res.status(500).json({ success: false, error: 'Invalid format received from AI' });
        }
        
    } catch (error) {
        console.error('Diagnosis Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.chat = async (req, res) => {
    try {
        const { message, deviceId } = req.body;

        if (!message || !deviceId) {
            return res.status(400).json({ success: false, error: 'Message and deviceId are required' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'GROQ_API_KEY is not configured' });
        }

        // Fetch User context
        const user = await User.findOne({ deviceId });
        
        // Build Persona context string
        let contextString = "You are a helpful agronomy AI assistant.";
        if (user) {
            const persona = user.persona || "Farmer";
            const plants = user.chosenPlants && user.chosenPlants.length > 0 ? user.chosenPlants.join(', ') : "various crops";
            const location = user.location && user.location.city ? `${user.location.city}, ${user.location.state}` : "their local region";
            
            contextString = `You are a highly knowledgeable agronomy AI assistant. The user is a ${persona} located in ${location}, currently growing: ${plants}. Provide brief, expert, and actionable farming or gardening advice tailored to their specific crops and location. Do not use markdown if possible, keep it to plain text arrays or short paragraphs.`;
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: contextString },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Groq API Error:', data);
            return res.status(500).json({ success: false, error: data.error?.message || 'Failed to communicate with AI' });
        }

        const aiMessage = data.choices[0].message.content;

        return res.json({ success: true, response: aiMessage });

    } catch (error) {
        console.error('Chat AI Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
