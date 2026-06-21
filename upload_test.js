const fs = require('fs');

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw14VDK_0Peq-8-RJbGFpvMkMnsZWp0_99j6uzvo9EDIHFF9QG014HW6isdi2gDVom1/exec";

const uploadImage = async (filePath, filename) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = `data:image/png;base64,${fileBuffer.toString('base64')}`;
    
    const uniqueFileName = `ultra_minimal_${Date.now()}_${filename}`;
    
    const payload = {
      base64: base64Data,
      filename: uniqueFileName,
      mimeType: 'image/png'
    };

    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === "success" && result.url) {
      console.log(`Success ${filename}:`, result.url);
      return result.url;
    } else {
      console.error(`Failed ${filename}:`, result);
    }
  } catch (err) {
    console.error(`Error uploading ${filename}:`, err.message);
  }
};

async function run() {
  await uploadImage("C:\\Users\\bents\\.gemini\\antigravity\\brain\\f6822981-963c-4334-a617-5652d63a364b\\arsenal_ultra_minimal_1782012958550.png", "arsenal.png");
  await uploadImage("C:\\Users\\bents\\.gemini\\antigravity\\brain\\f6822981-963c-4334-a617-5652d63a364b\\avl_ultra_minimal_1782013080797.png", "avl.png");
  await uploadImage("C:\\Users\\bents\\.gemini\\antigravity\\brain\\f6822981-963c-4334-a617-5652d63a364b\\bou_ultra_minimal_1782013093361.png", "bou.png");
}

run();
