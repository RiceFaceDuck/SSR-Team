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

export const uploadImageToDrive = async (file) => {
  if (!file) {
    throw new Error("กรุณาเลือกไฟล์ก่อนทำการอัปโหลด");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, GIF, WEBP) เท่านั้น");
  }

  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`ขนาดไฟล์ใหญ่เกินไป (สูงสุด ${maxSizeMB}MB)`);
  }

  try {
    const base64Data = await fileToBase64(file);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueFileName = `sponsor_${Date.now()}_${cleanFileName}`;
    
    // 🎯 แก้ไข: ปรับ Key ให้ตรงกับที่ Google Apps Script ของลูกพี่รอรับอยู่เป๊ะๆ
    const payload = {
      base64: base64Data,       // เดิมเขียน fileData ทำให้สคริปต์พัง
      filename: uniqueFileName, // เดิมเขียน fileName
      mimeType: file.type
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