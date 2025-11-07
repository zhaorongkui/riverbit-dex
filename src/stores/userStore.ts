import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 定义用户信息类型
interface UserInfo {
  address: string;
  balance: string;
  points: string;
}

// 定义存储的状态和方法类型
interface UserStore {
  userInfo: UserInfo;
  setUserInfo: (info: Partial<UserInfo>) => void;
  resetUserInfo: () => void;
}

// 创建用户信息存储
const userInfoStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        // 初始用户信息
        userInfo: {
          address: '',
          balance: '',
          points: ''
        },
        
        // 更新用户信息，支持部分更新
        setUserInfo: (info) => set((state) => ({
          userInfo: { ...state.userInfo, ...info }
        })),
        
        // 重置用户信息为初始状态
        resetUserInfo: () => set({
          userInfo: {
            address: '',
            balance: '',
            points: ''
          }
        })
      }),
      {
        // 存储的名称，用于localStorage的key
        name: 'user-storage',
        // 只持久化userInfo字段
        partialize: (state) => ({ userInfo: state.userInfo })
      }
    )
  )
);

export default userInfoStore;