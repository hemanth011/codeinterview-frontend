import { createSlice } from '@reduxjs/toolkit'

const stored = localStorage.getItem('user')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored ? JSON.parse(stored) : null,
    token: localStorage.getItem('token') || null,
  },
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout(state) {
      state.user = null
      state.token = null
      localStorage.clear()
    },
  },
})

export const { setAuth, logout } = authSlice.actions
export default authSlice.reducer