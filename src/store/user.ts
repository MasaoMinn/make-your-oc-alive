// stores/useUserStore.ts
import { create } from 'zustand'
import Cookies from 'js-cookie'

export const USER_COOKIE_KEY = 'auth_user'

export type UserInfo = {
  id: number;
  name: string;
  token: string;
}

export type UserStore = {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  clearUser: () => void;
  isLoggedIn: () => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: loadUserFromCookie(),

  setUser: (user: UserInfo) => {
    Cookies.set(USER_COOKIE_KEY, JSON.stringify(user), { expires: 7 }) // 7 天有效
    set({ user })
  },

  clearUser: () => {
    Cookies.remove(USER_COOKIE_KEY)
    set({ user: null })
    window.location.replace('./')
  },

  isLoggedIn: () => !!get().user?.token,
}))

function loadUserFromCookie(): UserInfo | null {
  try {
    const cookieValue = Cookies.get(USER_COOKIE_KEY)
    if (!cookieValue) return null
    return JSON.parse(cookieValue)
  } catch {
    return null
  }
}
