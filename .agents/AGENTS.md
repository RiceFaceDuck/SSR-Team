# SSR Team Fantasy - AI Coding Guidelines

You are an agent working on the **SSR Team Fantasy** project. 

## 1. Architectural Rules (Clean Architecture)
- **Presentation Layer** (`views/`, `components/`): Dumb UI components. Must use React/Vite.
- **Application Layer** (`hooks/`, `store/slices/`): Business logic, state management (Zustand).
- **Domain Layer** (`engine/`): Core game rules and logic (Functions).
- **Infrastructure Layer** (`services/firebase/`): Database and Auth interactions.
- **Rule**: Domain MUST NOT import Infrastructure directly. Infrastructure MUST NOT import Presentation.

## 2. State Management
- Use Zustand for global state. Divide stores into very small, domain-focused slices.

## 3. Database Security
- All critical write operations (Economy, GW Score updates) MUST happen in Cloud Functions or be strictly protected by Firestore Rules. Never trust client-side calculations for sensitive data.
- Core Firestore Document IDs (Gameweek IDs, Player API IDs) are IMMUTABLE.

## 4. AI Workflow
- Utilize the `Quick-Lookup Table` in `ARCHITECTURE.md` to find file paths directly. Bypassing manual directory scanning is strictly required to save tokens.
- When working with Firestore, ALWAYS check `Schema Key/README.md` first.
- If asked to create a new feature from scratch, use your `scaffold-clean-architecture` skill.
- Before submitting code, if instructed, run `npm run verify:ai` (if configured) to ensure code style and types are correct.

## 5. Performance & UX Rules
- การจัดการ Firebase Reads/Writes ต้องคำนึงถึงความประหยัด และความเร็วในระดับที่ "ผู้ใช้ทั่วไปรับได้"
- เมื่อตรวจพบไฟล์ที่ทำงานหนัก หรือโค้ดเริ่มยาว ให้ทำการ Refactor แยกไฟล์ Components/Services ใหม่ทันที! โดยยึดหลัก Single Responsibility Principle (SRP) (รวมถึงไฟล์ฝั่ง Backend/Service ด้วย)
- ค้นคว้า คิดค้น ลูกเล่นการใช้งานเพิ่มเติม เพื่อให้ผู้เล่นรู้สึกถึงประสบการณ์การใช้งานที่ดีขึ้น ให้ความรู้สึกว่าเป็นเกมที่มี "คุณภาพสูง" (High-Quality UX)

## 6. Communication Rules
- **[Antigravity]** ต้องใช้ภาษาไทยในการสื่อสารกับผู้ใช้เสมอ ทั้งใน Implementation Plan การสนทนา และ Documentations ต่างๆ
