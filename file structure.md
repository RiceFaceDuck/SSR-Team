# Project File Structure

## Root `C:\SSR Team`
- `admin/`: Admin Dashboard Application (Vite + React)
- `frontend/`: User Facing Application (Vite + React)
- `.firebase/`, `firebase.json`, `.firebaserc`: Firebase configuration
- `deploy_all.bat`, `push_github.bat`: Utility scripts

## Admin Structure `admin/src/`
- `components/`: Shared UI components (Dropzone, DataTable, etc.)
- `config/`: Firebase config (`firebase.js`)
- `features/`: Domain-driven feature modules
  - `players/`: Player Management Feature
    - `components/`: `ExcelPreview.jsx`, `PlayerManualForm.jsx`, `forms/` (Identity, GameInfo, Stats)
    - `hooks/`: `usePlayers.js` (Business logic)
    - `utils/`: `excelParser.js`, `templateUtil.js`
    - `views/`: `PlayerList.jsx`, `PlayerDetails.jsx`
    - `PlayerFeature.jsx`: Main entry point for the player module
  - `managers/`: Manager Management Feature (New!)
    - `components/`: `ManagerForm.jsx`
    - `views/`: `ManagerList.jsx`
  - `gameweek/`, `quests/`, `rewards/`, `users/`, `verify/`: Other features
- `services/`: External integrations
  - `firebase/`: `playerDatabase.js`, `managerDatabase.js`, etc.
  - `api/`: `apiFootballService.js`
- `store/`: Zustand global state
- `utils/`: Global utilities

## Frontend Structure `frontend/src/`
- `components/`: Shared UI components
- `features/`: Domain-driven feature modules (`auth/`, `market/`, `pitch/`, etc.)
  - `pitch/`:
    - `components/`:
      - `PitchBenchArea.jsx`: แถบนักเตะสำรองและผู้จัดการทีม
      - `FloatingActionBar.jsx`: ปุ่มควบคุมการจัดวางนักเตะ
      - `PlayerActionPopup.jsx`: ป็อปอัปเมนูเมื่อคลิกผู้เล่นในสนาม
      - `Pitch.jsx`, `PlayerNode.jsx`, `SquadHeader.jsx`, `SquadActions.jsx`
    - `hooks/`:
      - `usePitchLogic.js`: Custom hook จัดการ Logic ของ PitchScreen
    - `FormationSelector.jsx`: เมนูเลือกแผนการเล่น
    - `PitchBoard.jsx`: คอมโพเนนต์หลักที่จัดเรียงนักเตะบนสนาม
    - `PitchScreen.jsx`: หน้าจอหลัก (Layout รวม)
    - `ManagerSelectionModal.jsx`: ป็อปอัปเลือกผู้จัดการทีม
    - `components/save/`:
      - `AdSponsorView.jsx`: UI แสดงโฆษณาสปอนเซอร์
      - `SquadSummaryView.jsx`: UI สรุปทีมและยืนยันการเซฟ
      - `SaveSquadManager.jsx`: ควบคุมการทำงานของป็อปอัปบันทึกทีมและดูโฆษณา
    - `PowerCardPopup.jsx`: ป็อปอัปสำหรับดึงข้อมูลการ์ดและสวมใส่ให้นักเตะ
  - `profile/`:
    - `ProfileScreen.jsx`: หน้าจอโปรไฟล์หลักและกระเป๋าเงิน (Wallet)
    - `components/`:
      - `ProfileSettingsModal.jsx`: ป็อปอัปสำหรับตั้งค่าบัญชีและชื่อทีม
- `services/`: External integrations 
  - `firebase/`: `squadService.js`, `managerService.js`, `cardService.js`
- `store/`: Zustand global state
  - `useUserStore.js`: Store หลักที่รวม Slices เข้าด้วยกัน
  - `slices/`: 
    - `createAuthSlice.js`: จัดการข้อมูลผู้ใช้
    - `squadCoreSlice.js`: จัดการการจัดทีม แผนการเล่น สถานะพื้นฐานและการเซฟ
    - `squadActionSlice.js`: จัดการการกระทำในสนาม 
    - `squadMarketSlice.js`: จัดการการซื้อขายนักเตะ
    - `squadAutoFillSlice.js`: จัดการการจัดทีมอัตโนมัติ
    - `squadCardSlice.js`: จัดการระบบการ์ดเสริมพลัง
    - `createWalletSlice.js`: จัดการงบและ Balls
- `hooks/`, `utils/`: Global app structure
