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
  - `gameweek/`, `quests/`, `rewards/`, `users/`, `verify/`: Other features
- `services/`: External integrations
  - `firebase/`: `playerDatabase.js`, etc.
  - `api/`: `apiFootballService.js`
- `store/`: Zustand global state
- `utils/`: Global utilities

## Frontend Structure `frontend/src/`
- `components/`: Shared UI components
- `features/`: Domain-driven feature modules (`auth/`, `market/`, `pitch/`, etc.)
  - `pitch/`:
    - `BenchArea.jsx`: แถบนักเตะสำรอง/เสริม (Tabs)
    - `FloatingActionBar.jsx`: ปุ่มควบคุมการเซฟและล้างสนาม
    - `FormationSelector.jsx`: เมนูเลือกแผนการเล่น
    - `PitchBoard.jsx`: คอมโพเนนต์หลักที่จัดเรียงนักเตะบนสนาม
    - `PitchFieldUI.jsx`: UI วาดลายหญ้าและเส้นสนามฟุตบอล
    - `PitchScreen.jsx`: หน้าจอหลัก (Layout รวม)
    - `PlayerSlot.jsx`: การ์ดนักเตะบนสนาม/ม้านั่ง
    - `SaveSquadModal.jsx`: ป็อปอัปบันทึกทีมและดูโฆษณา
- `services/`: External integrations (`firebase/squadService.js`)
- `store/`: Zustand global state
  - `useUserStore.js`: Store หลักที่รวม Slices เข้าด้วยกัน
  - `slices/`: 
    - `createAuthSlice.js`: จัดการข้อมูลผู้ใช้
    - `createSquadSlice.js`: จัดการการจัดทีม แผนการเล่น
    - `createWalletSlice.js`: จัดการงบและ Balls
- `hooks/`, `utils/`: Global app structure
