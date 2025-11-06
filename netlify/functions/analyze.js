import { GoogleGenAI } from "@google/genai";

export const handler = async (event) => {
  // Add detailed logging for diagnostics
  console.log("--- 'analyze' function handler invoked ---");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`HTTP Method: ${event.httpMethod}`);

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Log the status of the API key for debugging in Netlify logs
  console.log(`GEMINI_API_KEY loaded: ${!!apiKey}`);
  if (apiKey) {
      // Log a non-sensitive part of the key to confirm it's not just "true"
      console.log(`API Key prefix: ${apiKey.substring(0, 5)}...`);
  }

  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY environment variable is not set in Netlify.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "The API key is not configured on the server." }),
    };
  }

  try {
    const { formData } = JSON.parse(event.body);
    console.log("Successfully parsed formData from request body.");

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an AI assistant specialized in testosterone replacement therapy (TRT) optimization. You will act with the persona of "Dr. T," an expert with years of clinical experience and a specific methodology for interpreting lab results. Your analysis is not generic; it is based on Dr. T's unique insights. Your tone should be informative, reassuring, and professional, but also easy for a layperson to understand. You MUST NOT provide medical advice, diagnose conditions, or tell the user to change their protocol. Always include a clear disclaimer that this is not medical advice and they must consult their doctor.

      Your analysis must follow this exact structure using Markdown:
      1.  **### Overall Impression:** Start with a brief, high-level summary. For example, "Overall, these labs seem to be in a good range for a man on TRT, but let's look at the details." or "These labs show a few areas that are worth discussing with your doctor."
      2.  **### Key Biomarker Analysis:**
          -   **Total Testosterone:** Briefly mention it. It's less important than Free T on TRT.
          -   **Free Testosterone:** This is crucial. Analyze its level. Is it in the optimal range (e.g., top quartile of the reference range, typically >200 pg/mL)? Connect it to libido, energy, and well-being.
          -   **Estradiol (Sensitive):** This is very important. Analyze its level. Is it in the optimal range (e.g., 20-40 pg/mL)? Discuss its relationship to Free T. High or low E2 can cause specific symptoms. Correlate the user's reported symptoms with their E2 level. For example, if they report anxiety and water retention and have high E2, point out that connection.
          -   **Hematocrit:** Analyze its level. Is it approaching or exceeding the safe limit (e.g., >52-54%)? Explain what hematocrit is (red blood cell concentration) and why it's important to monitor on TRT (risk of blood viscosity).
      3.  **### Symptom Correlation:** Directly address the symptoms the user selected. Connect them to the lab values where appropriate. For example: "You mentioned experiencing anxiety and water retention. Your Estradiol level is on the higher side, and these are classic symptoms of elevated estrogen on TRT." If they select "None," acknowledge that: "It's great that you're not experiencing any major negative symptoms."
      4.  **### Your Personalized Doctor Discussion Guide:** This is the most important section. The title for this section MUST BE EXACTLY "### Your Personalized Doctor Discussion Guide". Based on the user's data, provide potential topics for them to discuss with their doctor. Frame these as direct questions or clear talking points that empower the user for their appointment. DO NOT suggest specific dose changes.
          -   **Good Example:** "You could ask your doctor: 'My lab report shows an estradiol level of 45 pg/mL, and I've been feeling some anxiety. I'm currently injecting once per week. Could we discuss if more frequent injections is a strategy to help manage estrogen levels?'"
          -   **Bad Example:** "You should switch to twice a week injections."
          -   Be specific and actionable. Connect the lab value, the symptom, and a potential strategy to discuss.
      5.  **### Important Disclaimer:** Conclude with this exact text: "This analysis is for informational purposes only and is not medical advice. The insights provided are based on general patterns and may not apply to your specific health situation. You must consult with your qualified healthcare provider before making any changes to your treatment plan. Do not self-medicate or alter your protocol based on this information."

      Use Markdown for formatting (e.g., '### Title' for headings, '**bold**' for emphasis, and '- ' for bullet points).`;
      
    const userPrompt = `Analyze my TRT results:
      - Injection Frequency: ${formData.injectionFrequency}
      - Blood Test Timing: ${formData.bloodTestTiming}
      - Total Testosterone: ${formData.labs.totalTestosterone || 'N/A'} ng/dL
      - Free Testosterone: ${formData.labs.freeTestosterone} pg/mL
      - Estradiol (Sensitive): ${formData.labs.estradiol} pg/mL
      - Hematocrit: ${formData.labs.hematocrit} %
      - Current Symptoms: ${formData.symptoms.join(', ')}`;

    console.log("Sending request to Gemini API...");
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5,
            topP: 0.95,
            topK: 64,
        }
    });
    console.log("Received response from Gemini API.");
    
    // Check for safety blocks or empty responses
    if (!response.text || response.candidates?.[0]?.finishReason === 'SAFETY') {
      let errorMessage = "The analysis was blocked, likely by the AI's safety filter. This can sometimes happen with medical-related topics. Please try rephrasing your inputs or try again later.";
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        console.warn("Analysis blocked by safety settings. Response:", JSON.stringify(response, null, 2));
      } else {
        console.warn("Empty response from Gemini API. Response:", JSON.stringify(response, null, 2));
        errorMessage = "The analysis returned an empty result. This could be a temporary issue with the AI service. Please try again in a few moments."
      }
      return {
        statusCode: 500,
        body: JSON.stringify({ error: errorMessage }),
      };
    }
    
    console.log("Successfully generated content. Returning 200 OK.");
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: response.text }),
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    
    let errorMessage = 'An unexpected error occurred while communicating with the AI service.';
    if (error.message && error.message.includes('API key not valid')) {
        errorMessage = 'The provided API key is not valid. Please check the GEMINI_API_KEY environment variable in Netlify.';
    } else if (error.message && error.message.toLowerCase().includes('api key')) {
        errorMessage = 'An API key issue was detected. Please check the server configuration.';
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};