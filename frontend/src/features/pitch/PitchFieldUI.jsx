import React from 'react';

/**
 * UI Component สำหรับวาดพื้นหลังและเส้นสนามฟุตบอล
 * อ้างอิงจากรูปต้นแบบ: พื้นหญ้าสีเขียวสดใส สลับแถบมืด-สว่างแนวตั้ง
 */
export default function PitchFieldUI({ children }) {
  return (
    <div className="w-full aspect-[3/4.5] sm:h-[600px] sm:aspect-auto bg-[#699D3C] 
                    rounded-none sm:rounded-[1rem] shadow-lg relative overflow-hidden flex flex-col justify-between">
       
       {/* 1. ลวดลายหญ้าแบบแถบแนวตั้งสลับสี (Vertical Grass Stripes) ตามต้นแบบ */}
       <div className="absolute inset-0 pointer-events-none flex" style={{ opacity: 0.8 }}>
          {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className={`h-full flex-1 ${i % 2 === 0 ? 'bg-[#5B8D2F]' : 'bg-transparent'}`}></div>
          ))}
       </div>

       {/* 2. พื้นหลังจำลอง: ตกแต่งเส้นสนามฟุตบอลในกระดาน (Pitch Lines) สีขาวโปร่งแสง */}
       {/* เส้นขอบสนามรอบนอก */}
       <div className="absolute inset-2 sm:inset-4 border-[1.5px] border-white/40 pointer-events-none z-0"></div>

       {/* วงกลมกลางสนาม */}
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 border-[1.5px] border-white/40 rounded-full pointer-events-none z-0"></div>
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/60 rounded-full pointer-events-none z-0"></div>
       
       {/* เส้นแบ่งครึ่งสนาม */}
       <div className="absolute left-2 right-2 top-1/2 h-[1.5px] bg-white/40 pointer-events-none z-0"></div>
       
       {/* 3. กรอบเขตโทษ (Penalty Boxes) ด้านบน */}
       <div className="absolute left-1/2 top-2 -translate-x-1/2 w-32 sm:w-44 h-12 sm:h-16 border-[1.5px] border-t-0 border-white/40 pointer-events-none z-0 flex justify-center">
          {/* กรอบ 6 หลา (กรอบประตูเล็ก) */}
          <div className="w-12 sm:w-16 h-4 sm:h-6 border-[1.5px] border-t-0 border-white/40"></div>
       </div>
       {/* หัวกะโหลกบน (D-Curve Top) */}
       <div className="absolute left-1/2 top-14 sm:top-18 -translate-x-1/2 w-12 sm:w-16 h-4 sm:h-6 border-[1.5px] border-t-0 border-white/40 rounded-b-full pointer-events-none z-0"></div>

       {/* 4. กรอบเขตโทษ (Penalty Boxes) ด้านล่าง */}
       <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-32 sm:w-44 h-12 sm:h-16 border-[1.5px] border-b-0 border-white/40 pointer-events-none z-0 flex items-end justify-center">
          {/* กรอบ 6 หลา (กรอบประตูเล็ก) */}
          <div className="w-12 sm:w-16 h-4 sm:h-6 border-[1.5px] border-b-0 border-white/40"></div>
       </div>
       {/* หัวกะโหลกล่าง (D-Curve Bottom) */}
       <div className="absolute left-1/2 bottom-14 sm:bottom-18 -translate-x-1/2 w-12 sm:w-16 h-4 sm:h-6 border-[1.5px] border-b-0 border-white/40 rounded-t-full pointer-events-none z-0"></div>

       {/* 5. โซนของนักเตะที่ถูกจัดวาง (Children: PitchRows) */}
       <div className="relative z-10 flex flex-col justify-evenly h-full py-8">
          {children}
       </div>
       
    </div>
  );
}
