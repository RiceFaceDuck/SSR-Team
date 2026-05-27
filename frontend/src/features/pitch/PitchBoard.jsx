import React from 'react';
import PlayerSlot from './PlayerSlot';

export default function PitchBoard() {
  return (
    <div className="w-full h-96 bg-gradient-to-b from-[#2EAC6D] to-[#208B55] rounded-[2.5rem] shadow-[inset_0_20px_40px_rgba(0,0,0,0.2),0_15px_30px_rgba(46,172,109,0.3)] border-[6px] border-white/20 relative overflow-hidden flex flex-col justify-between py-6 px-4">
       {/* เส้นสนาม */}
       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/30 rounded-full pointer-events-none"></div>
       <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/30 pointer-events-none"></div>
       
       {/* โซนกองหน้า */}
       <div className="flex justify-around w-full z-10 px-8">
         <PlayerSlot position="FWD" />
         <PlayerSlot position="FWD" />
       </div>

       {/* โซนกองกลาง */}
       <div className="flex justify-around w-full z-10 px-2">
         <PlayerSlot position="MID" />
         <PlayerSlot position="MID" />
         <PlayerSlot position="MID" />
         <PlayerSlot position="MID" />
       </div>

       {/* โซนกองหลัง */}
       <div className="flex justify-around w-full z-10 px-2">
         <PlayerSlot position="DEF" />
         <PlayerSlot position="DEF" />
         <PlayerSlot position="DEF" />
         <PlayerSlot position="DEF" />
       </div>
    </div>
  );
}