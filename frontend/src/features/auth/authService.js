import { auth, db } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * ฟังก์ชันเข้าสู่ระบบด้วย Google 
 * พร้อมสร้าง Profile พื้นฐานถ้าเป็นการล็อกอินครั้งแรก
 */
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        
        // เปิดหน้าต่าง Pop-up ให้เลือกบัญชี Google
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // ดึงข้อมูลพื้นฐานจากบัญชี Google
        const { uid, displayName, email, photoURL } = user;

        // อ้างอิงไปที่เอกสารผู้ใช้ใน Firestore
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        let userData = {};

        // ตรวจสอบว่าเป็นการล็อกอินครั้งแรกหรือไม่?
        if (!userDocSnap.exists()) {
            // -- ล็อกอินครั้งแรก: สร้าง Profile ใหม่ --
            userData = {
                uid: uid,
                displayName: displayName || 'ผู้จัดการทีมหน้าใหม่',
                email: email,
                photoURL: photoURL || '',
                role: 'player', 
                energyBottles: 100, // 🧪 แจกทุนตั้งต้น 100 ขวด
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp()
            };
            
            // บันทึกลง Firestore
            await setDoc(userDocRef, userData);
            console.log("สร้าง Profile ใหม่เรียบร้อย พร้อม 100 Energy Bottles!");
            
        } else {
            // -- เคยล็อกอินแล้ว: ดึงข้อมูลเดิมมาใช้ --
            userData = userDocSnap.data();
            
            // อัปเดตเวลาล็อกอินล่าสุด (ไม่ต้องอัปเดตขวด)
            await setDoc(userDocRef, { 
                lastLoginAt: serverTimestamp() 
            }, { merge: true });
            
            console.log("ยินดีต้อนรับกลับมาครับโค้ช!");
        }

        // คืนค่าข้อมูล User กลับไปให้ฝั่ง UI ใช้งานต่อ
        return {
            success: true,
            user: userData
        };

    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการล็อกอิน:", error);
        
        // จัดการ Error กรณีผู้ใช้กดปิดหน้าต่างเอง (ไม่ถือว่าระบบพัง)
        if (error.code === 'auth/popup-closed-by-user') {
             return { success: false, message: 'คุณได้ยกเลิกการล็อกอิน' };
        }
        
        return { 
            success: false, 
            message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' 
        };
    }
};

/**
 * ฟังก์ชันออกจากระบบ (Logout)
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("ออกจากระบบเรียบร้อย");
        return { success: true };
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการออกจากระบบ:", error);
        return { success: false, message: 'ไม่สามารถออกจากระบบได้ในขณะนี้' };
    }
};