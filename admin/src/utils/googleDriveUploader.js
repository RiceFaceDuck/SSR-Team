/**
 * ==========================================
 * 📁 Google Drive Uploader Utility
 * ==========================================
 */

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw14VDK_0Peq-8-RJbGFpvMkMnsZWp0_99j6uzvo9EDIHFF9QG014HW6isdi2gDVom1/exec";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // 🎯 แก้ไข: ส่งข้อมูลเต็มๆ (Data URL) กลับไปเหมือนระบบ ThemeController เดิม
      // ป้องกัน Error 'split' จากฝั่ง Google Apps Script
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
  });
};

const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/webp', quality);
      resolve({ dataUrl, mimeType: 'image/webp' });
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
};

export const uploadImageToDrive = async (file, prefix = 'image', autoCompress = false) => {
  if (!file) {
    throw new Error("กรุณาเลือกไฟล์ก่อนทำการอัปโหลด");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, GIF, WEBP) เท่านั้น");
  }

  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  // ถ้าระบบเปิด autoCompress ไว้ จะข้ามการเช็คขนาดไฟล์ต้นฉบับไปเลย เพราะเดี๋ยวก็จะโดนย่อให้เล็กอยู่ดี
  if (!autoCompress && file.size > maxSizeBytes) {
    throw new Error(`ขนาดไฟล์ใหญ่เกินไป (สูงสุด ${maxSizeMB}MB)`);
  }

  try {
    let base64Data;
    let mimeType = file.type;
    let cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');

    if (autoCompress && file.type !== 'image/gif') {
      const compressed = await compressImage(file, 300, 300, 0.7);
      base64Data = compressed.dataUrl;
      mimeType = compressed.mimeType;
      cleanFileName = cleanFileName.replace(/\.[^/.]+$/, "") + ".webp";
    } else {
      base64Data = await fileToBase64(file);
    }
    
    const uniqueFileName = `${prefix}_${Date.now()}_${cleanFileName}`;
    
    // 🎯 แก้ไข: ปรับ Key ให้ตรงกับที่ Google Apps Script ของลูกพี่รอรับอยู่เป๊ะๆ
    const payload = {
      base64: base64Data,       // เดิมเขียน fileData ทำให้สคริปต์พัง
      filename: uniqueFileName, // เดิมเขียน fileName
      mimeType: mimeType
    };

    // ส่งข้อมูลแบบเดียวกับที่ ThemeController ทำ (ถอด Header Text/Plain ออกให้เหมือนเดิม)
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === "success" && result.url) {
      return result.url;
    } else {
      throw new Error(result.message || "อัปโหลดสำเร็จแต่ระบบไม่ได้ส่ง URL กลับมา");
    }

  } catch (error) {
    console.error("🔥 Google Drive Upload Error:", error);
    throw new Error(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
  }
};