'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'

import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  isDrawerOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_DRAWER'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] }

interface CartContextType {
  items: CartItem[]
  isDrawerOpen: boolean
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleDrawer: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextType | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.product_id === action.payload.product_id
      )
      if (existingIndex >= 0) {
        const updated = [...state.items]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        }
        return { ...state, items: updated }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity < 1) {
        return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen }
    case 'SET_DRAWER':
      return { ...state, isDrawerOpen: action.payload }
    case 'LOAD_CART':
      return { ...state, items: action.payload }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isDrawerOpen: false,
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('intima-cart')
      if (saved) {
        const items = JSON.parse(saved) as CartItem[]
        if (Array.isArray(items)) {
          dispatch({ type: 'LOAD_CART', payload: items })
        }
      }
    } catch {
      localStorage.removeItem('intima-cart')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('intima-cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'quantity'>) => {
    const id = `${item.product_id}-${Date.now()}`
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id, quantity: 1 } })
    toast.success(`${item.name} added to cart`)
  }, [])


  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = state.items.reduce((sum, item) => sum + item.price_ghs * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleDrawer: () => dispatch({ type: 'TOGGLE_DRAWER' }),
        openDrawer: () => dispatch({ type: 'SET_DRAWER', payload: true }),
        closeDrawer: () => dispatch({ type: 'SET_DRAWER', payload: false }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
