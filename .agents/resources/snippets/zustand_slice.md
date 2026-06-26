```javascript
/**
 * AI Snippet: Standard Zustand Slice
 * Remember: Keep slices small and domain-focused.
 */
export const createExampleSlice = (set, get) => ({
  // 1. State
  data: [],
  isLoading: false,
  error: null,

  // 2. Actions
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      // const result = await apiCall();
      // set({ data: result, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  resetData: () => {
    set({ data: [], error: null, isLoading: false });
  }
});
```
