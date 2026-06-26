import { updateTutorialState } from '../../features/auth/authService';

export const createTutorialSlice = (set, get) => ({
  tutorialActive: false,
  currentTutorialScreen: null, // 'market' or 'pitch'
  tutorialStep: 0,

  // เรียกใช้เมื่อเข้าหน้าที่มี Tutorial
  startTutorial: (screen, userData) => {
    // ถ้าผู้ใช้เคยดูแล้ว จะไม่เริ่ม
    if (userData?.tutorialState?.[`hasSeen${screen.charAt(0).toUpperCase() + screen.slice(1)}`]) {
      return;
    }
    set({ tutorialActive: true, currentTutorialScreen: screen, tutorialStep: 0 });
  },

  nextTutorialStep: () => set((state) => ({ tutorialStep: state.tutorialStep + 1 })),

  prevTutorialStep: () => set((state) => ({ tutorialStep: Math.max(0, state.tutorialStep - 1) })),

  // จบ Tutorial หรือกด Skip
  finishTutorial: async () => {
    const state = get();
    const { currentTutorialScreen, userData } = state;

    if (currentTutorialScreen && userData) {
      // เรียก Service ไปอัปเดตบน Firestore
      await updateTutorialState(userData.uid, currentTutorialScreen);

      // อัปเดต Local State ของ User เพื่อไม่ให้มันเด้งอีก
      const updateField = `hasSeen${currentTutorialScreen.charAt(0).toUpperCase() + currentTutorialScreen.slice(1)}`;
      set((s) => ({
        userData: {
          ...s.userData,
          tutorialState: {
            ...s.userData.tutorialState,
            [updateField]: true,
          },
        },
      }));
    }

    set({ tutorialActive: false, currentTutorialScreen: null, tutorialStep: 0 });
  },

  skipTutorial: () => {
    get().finishTutorial();
  },
});
