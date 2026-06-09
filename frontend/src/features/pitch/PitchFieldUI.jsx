import React from 'react';

/**
 * UI Component สำหรับวาดพื้นหลังและเส้นสนามฟุตบอล
 * อ้างอิงจากรูปต้นแบบ: แสดงแค่ 2 ใน 3 ของสนาม (แดนตัวเอง) 
 */
export default function PitchFieldUI({ children }) {
  return (
    <div className="w-full h-full flex-1 min-h-0 bg-[#699D3C] 
                    rounded-none sm:rounded-[1rem] shadow-lg relative overflow-hidden flex flex-col justify-between">
       
       {/* 1. ลวดลายหญ้าแบบแถบแนวนอนสลับสี (Horizontal Grass Stripes) หรือแนวตั้งก็ได้ 
            ให้เป็นแนวตั้งเหมือนเดิม */}
       <div className="absolute inset-0 pointer-events-none flex" style={{ opacity: 0.8 }}>
          {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className={`h-full flex-1 ${i % 2 === 0 ? 'bg-[#5B8D2F]' : 'bg-transparent'}`}></div>
          ))}
       </div>

       {/* 2. กรอบสนาม (แสดงเฉพาะแดนตัวเอง ขอบบนไม่มีเส้นเพราะเป็นเส้นกลางสนาม) */}
       <div className="absolute inset-2 sm:inset-4 border-[1.5px] border-t-0 border-white/40 pointer-events-none z-0">
          
          {/* เส้นแบ่งครึ่งสนาม (อยู่บนสุดของกรอบ) */}
          <div className="absolute left-0 right-0 top-0 h-[1.5px] bg-white/40"></div>
          
          {/* วงกลมครึ่งสนาม (เฉพาะครึ่งล่าง) */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-32 h-16 sm:w-40 sm:h-20 border-[1.5px] border-t-0 border-white/40 rounded-b-full"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full"></div>

          {/* 3. กรอบเขตโทษ (Penalty Boxes) ด้านล่าง (แดนเรา) */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-40 sm:w-48 h-16 sm:h-20 border-[1.5px] border-b-0 border-white/40 flex items-end justify-center">
             {/* กรอบ 6 หลา (กรอบประตูเล็ก) */}
             <div className="w-16 sm:w-20 h-6 sm:h-8 border-[1.5px] border-b-0 border-white/40"></div>
          </div>
          {/* หัวกะโหลกล่าง (D-Curve Bottom) */}
          <div className="absolute left-1/2 bottom-16 sm:bottom-20 -translate-x-1/2 w-16 sm:w-20 h-6 sm:h-8 border-[1.5px] border-b-0 border-white/40 rounded-t-full"></div>
       </div>

       {/* 5. โซนของนักเตะที่ถูกจัดวาง */}
       <div className="relative z-10 flex flex-col justify-evenly h-full pt-6 pb-6">
          {children}
       </div>
       
    </div>
  );
}
