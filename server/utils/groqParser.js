const axios = require('axios');

const parsePrescription = async (transcript) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a medical prescription parser. Extract structured data from the doctor's spoken prescription in English or Tamil. 
Return ONLY valid JSON — no explanation, no markdown:
{
  "patientName": "",
  "medicines": [
    {
      "name": "",
      "dosage": "",
      "timing": "",
      "duration": "",
      "quantity": 0,
      "instructions": ""
    }
  ]
}`
          },
          { role: 'user', content: transcript }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rawContent = response.data.choices[0].message.content;
    const parsedData = JSON.parse(rawContent);
    return parsedData;

  } catch (error) {
    console.error("Groq Parser Error:", error.response ? error.response.data : error.message);
    throw new Error("Failed to parse prescription from voice");
  }
};

module.exports = { parsePrescription };
