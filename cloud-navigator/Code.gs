const GEMINI_API_KEY = 'AIzaSyDUdBmcFKa_nW2AcxhEjL-7QhsIF8RIwx0';
const MODEL_NAME = 'gemini-1.5-flash';

// This function runs whenever an SMS is "posted" to the script URL
function doPost(e) {
  try {
    const rawSms = e.postData.contents; // The text sent from the phone
    
    // 1. Ask Gemini to clean the data
    const cleanedData = parseSmsWithGemini(rawSms);
    
    // 2. Save it to the Google Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(), 
      cleanedData.merchant, 
      cleanedData.amount, 
      cleanedData.category,
      rawSms // Keeping raw text for backup
    ]);
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

function parseSmsWithGemini(smsText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  
  // Add this logic inside your parseSmsWithGemini function
const prompt = `
  You are a cynical, sarcastic Pirate Accountant for an app called MoneyGate. 
  Extract the transaction amount, merchant name, and category (Essential or Luxury) from this SMS: "${smsText}".

  Follow these personality rules based on the spending amount:
  1. If the spending is low: Be monotone and slightly bored. 
  2. If they are spending a lot (approaching a limit): Be extremely sarcastic and witty. Make them feel the burn of their choices without being too mean.
  3. If the spending is excessive (over the limit): Give a very sad, disappointed reply like: "My dear child, please... don't exploit our gold anymore. The treasure chest is gasping for air."

  Return the result ONLY as a JSON object: 
  {"amount": 100, "merchant": "Name", "category": "Luxury", "pirate_reply": "Your sarcastic/sad reply here"}`;
  
  /*const prompt = `Extract the transaction amount, merchant name, and category from this Indian bank SMS. 
  Categories should be either 'Essential' (for bills, rent, groceries) or 'Luxury' (for cafes, games, movies, shopping).
  SMS: "${smsText}"
  Return ONLY a raw JSON object like this: {"amount": 500, "merchant": "Starbucks", "category": "Luxury"}`;*/

  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  const jsonString = result.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
  
  return JSON.parse(jsonString);
}
