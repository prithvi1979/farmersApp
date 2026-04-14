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

        try {
            // PRIMARY ATTEMPT: Gemini Flash
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
                throw new Error(result.error?.message || 'Failed to analyze image with Gemini AI');
            }

            const aiResponseText = result.candidates[0].content.parts[0].text;
            
            try {
                // Because we passed response_mime_type: "application/json", Gemini usually returns pure JSON
                const parsedData = JSON.parse(aiResponseText);
                return res.json({ success: true, data: parsedData });
            } catch (parseError) {
                console.error('Failed to parse Gemini AI response:', aiResponseText);
                const jsonMatch = aiResponseText.match(/{[\s\S]*}/);
                if (jsonMatch) {
                    try {
                        const extractedData = JSON.parse(jsonMatch[0]);
                        return res.json({ success: true, data: extractedData });
                    } catch (e) {
                         throw new Error('Invalid JSON format received from Gemini AI');
                    }
                }
                throw new Error('Invalid JSON format received from Gemini AI');
            }

        } catch (primaryError) {
            console.warn('Gemini failed, switching to Groq Fallback...', primaryError.message);

            // FALLBACK ATTEMPT: Groq Llama 3.2 Vision
            const groqKey = process.env.GROQ_API_KEY;
            if (!groqKey) throw new Error('No Groq fallback key available');

            const actualMimeType = mimeType || "image/jpeg";
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.2-90b-vision-preview",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                { type: "image_url", image_url: { url: `data:${actualMimeType};base64,${base64Data}` } }
                            ]
                        }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!groqResponse.ok) {
                const groqErr = await groqResponse.json();
                console.error('Groq API Error:', groqErr);
                return res.status(500).json({ success: false, error: 'Both primary and fallback AI models are busy.' });
            }

            const groqData = await groqResponse.json();
            const groqText = groqData.choices[0].message.content;
            
            try {
                const parsedData = JSON.parse(groqText);
                return res.json({ success: true, data: parsedData });
            } catch (fallbackParseError) {
                console.error('Failed to parse Groq AI response:', groqText);
                const jsonMatch = groqText.match(/{[\s\S]*}/);
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

exports.getMandiPrice = async (req, res) => {
    try {
        const { crop, location } = req.body;
        
        if (!crop || !location) {
            return res.status(400).json({ success: false, error: 'Crop and location are required' });
        }
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured in .env' });
        }

        const prompt = `You are an agronomy market specialist. Find the nearest Mandi (agricultural market) to ${location} and get the very latest mandi price for ${crop}. \nReturn ONLY a valid JSON object with three keys: 'mandiName' (string, the name and location of the mandi), 'price' (string, the exact price or price range with currency e.g., "₹45/kg"), and 'date' (string, the precise date of that price). Do not include any markdown or explanatory text, just the raw JSON.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
                tools: [
                    { googleSearch: {} }
                ]
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error('Gemini API Error:', result);
            return res.status(500).json({ success: false, error: result.error?.message || 'Failed to analyze search data with AI' });
        }

        const aiResponseText = result.candidates[0].content.parts[0].text;
        
        try {
            const parsedData = JSON.parse(aiResponseText);
            return res.json({ success: true, data: parsedData });
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponseText);
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
        console.error('Mandi Price API Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.generateSoilReport = async (req, res) => {
    try {
        const { soilTest } = req.body;
        if (!soilTest) {
            return res.status(400).json({ success: false, error: 'Soil test data is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured' });
        }

        const prompt = `You are an expert agronomist. Analyze these soil test results: ${JSON.stringify(soilTest)}. 
Return ONLY a valid JSON object with the following keys:
- 'score' (number between 0 and 100 representing overall soil health)
- 'cropsToGrow' (array of strings, e.g., ["Tomato", "Carrot"])
- 'cropsToAvoid' (array of strings, e.g., ["Rice"])
- 'fertilizerPlan' (array of objects with 'period' (string) and 'action' (string) e.g., [{"period": "Week 1", "action": "Add compost"}])
- 'recommendation' (string, a short general summary of what to do)
Do not include any markdown or explanatory text, just the raw JSON.`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error('Gemini API Error:', result);
            return res.status(500).json({ success: false, error: result.error?.message || 'Failed to generate report' });
        }

        const aiResponseText = result.candidates[0].content.parts[0].text;
        
        try {
            const parsedData = JSON.parse(aiResponseText);
            return res.json({ success: true, data: parsedData });
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponseText);
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
        console.error('Soil Report API Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.askClarification = async (req, res) => {
    try {
        const { question, context } = req.body;
        if (!question || !context) {
            return res.status(400).json({ success: false, error: 'Question and context are required' });
        }

        const apiKey = process.env.CEREBRAS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'CEREBRAS_API_KEY is not configured' });
        }

        const systemPrompt = `You are an expert agronomist providing clarification to a farmer based on a specific cultivation task.
The task context is: 
Title: ${context.title}
Description: ${context.description}

Answer the farmer's question precisely using plain text. Do not use markdown unless absolutely necessary. Keep it under 3 paragraphs.`;

        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3.1-8b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                max_completion_tokens: 400,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cerebras API Error:', data);
            return res.status(500).json({ success: false, error: data.error?.message || 'Failed to get clarification from Cerebras AI' });
        }

        const aiMessage = data.choices[0].message.content;
        return res.json({ success: true, response: aiMessage });

    } catch (error) {
        console.error('Ask Clarification Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
