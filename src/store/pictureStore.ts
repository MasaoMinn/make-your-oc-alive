// stores/useUserStore.ts
// 移除cookies导入和相关代码
import { create } from 'zustand'

// 删除cookie相关常量
// export const PICTURE_COOKIE_KEY = 'auth_picture'

export type PictureInfo = {
  id: string;
  size: number;
  created_at: number;
  name: string;
}

export type PictureStore = {
  picture: PictureInfo | null;
  setPicture: (picture: PictureInfo) => void;
  clearPicture: () => void;
}

// 修改store实现，移除cookie相关操作
export const usePictureStore = create<PictureStore>((set) => ({
  // 初始状态设为null，不再从cookie加载
  picture: null,

  // 只更新内存状态，不再存储到cookie
  setPicture: (picture: PictureInfo) => {
    set({ picture })
  },

  // 只清除内存状态，不再操作cookie
  clearPicture: () => {
    set({ picture: null })
    // 移除页面跳转，让前端自行处理
  },
}))

// 删除从cookie加载的函数
// function loadPictureFromCookie(): PictureInfo | null {
//   try {
//     const cookieValue = Cookies.get(PICTURE_COOKIE_KEY)
//     if (!cookieValue) return null
//     return JSON.parse(cookieValue)
//   } catch {
//     return null
//   }
// }