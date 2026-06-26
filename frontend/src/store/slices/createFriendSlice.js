import {
  fetchFriends,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  searchUserByUid,
} from '../../services/firebase/friendService';

export const createFriendSlice = (set, get) => ({
  friends: [],
  isFriendsLoading: false,

  loadFriends: async (userId) => {
    if (!userId) return;
    set({ isFriendsLoading: true });
    try {
      const friends = await fetchFriends(userId);
      set({ friends, isFriendsLoading: false });
    } catch (error) {
      console.error('Failed to load friends:', error);
      set({ isFriendsLoading: false });
    }
  },

  searchFriend: async (uid) => {
    try {
      return await searchUserByUid(uid);
    } catch (error) {
      console.error('Failed to search friend:', error);
      return null;
    }
  },

  addFriend: async (senderUid, receiverUid, senderData, receiverData) => {
    try {
      await sendFriendRequest(senderUid, receiverUid, senderData, receiverData);
      await get().loadFriends(senderUid); // Reload list
      return { success: true };
    } catch (error) {
      console.error('Failed to send friend request:', error);
      return { success: false, error: error.message };
    }
  },

  acceptFriend: async (currentUid, friendUid) => {
    try {
      await acceptFriendRequest(currentUid, friendUid);
      await get().loadFriends(currentUid);
      return { success: true };
    } catch (error) {
      console.error('Failed to accept friend:', error);
      return { success: false, error: error.message };
    }
  },

  removeOrRejectFriend: async (currentUid, friendUid) => {
    try {
      await removeFriend(currentUid, friendUid);
      await get().loadFriends(currentUid);
      return { success: true };
    } catch (error) {
      console.error('Failed to remove friend:', error);
      return { success: false, error: error.message };
    }
  },
});
