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

        // ไม่ต้องดึงและเขียน Firestore ที่นี่ ปล่อยให้ onAuthStateChanged ใน useAuthSync จัดการ
        // เพื่อป้องกันการซ้ำซ้อนของ Read/Write โควต้า Firebase

        return {
            success: true,
            user: { uid: user.uid } // ส่งกลับแค่ status พอ เพราะ App จะหมุนไปตาม state
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