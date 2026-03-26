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
