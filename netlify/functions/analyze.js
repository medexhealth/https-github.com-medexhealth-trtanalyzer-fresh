import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
  // --- DIAGNOSTICS ---
  console.log(`[Analyze] Invoked at ${new Date().toISOString()}`);

  // 1. Method Check
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 2. API Key Check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing in Netlify env vars.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error: API Key missing." }),
    };
  }

  try {
    // 3. Parse Data
    const { formData } = JSON.parse(event.body);
    
    // 4. Initialize Gemini (Standard Stable Version)
    const genAI = new GoogleGenerativeAI(apiKey);
    // Note: We use 1.5-flash because 2.5 does not exist yet.
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are Dr. T, an expert endocrinologist specialized in TRT. 
        Analyze the provided lab results. 
        Your tone: Professional, reassuring, informative. 
        CRITICAL: 
        1. Do NOT give medical advice. 
        2. Do NOT tell the user to change their dose. 
        3. Structure your response in Markdown with these exact sections:
           - ### Overall Impression
           - ### Key Biomarker Analysis (Free T, Estradiol, Hematocrit)
           - ### Symptom Correlation
           - ### Your Personalized Doctor Discussion Guide (Specific questions to ask their doctor)
           - ### Important Disclaimer`
    });

    // 5. Construct Prompt
    const prompt = `
      Patient Protocol:
      - Injection Frequency: ${formData.injectionFrequency}
      - Timing: ${formData.bloodTestTiming}
      
      Lab Results:
      - Total T: ${formData.labs.totalTestosterone || 'N/A'}
      - Free T: ${formData.labs.freeTestosterone}
      - Estradiol: ${formData.labs.estradiol}
      - Hematocrit: ${formData.labs.hematocrit}
      
      Reported Symptoms: ${formData.symptoms.join(', ')}
    `;

    // 6. Generate
    console.log("Sending to Gemini...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("Success.");
    return {
      statusCode: 200,
      body: JSON.stringify({ result: responseText }),
    };

  } catch (error) {
    console.error("GenAI Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI Service Error: " + error.message }),
    };
  }
};