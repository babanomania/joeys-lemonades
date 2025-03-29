'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type LemonadeSize = 'Small' | 'Large'
type SweetnessLevel = 'Less Sweet' | 'Normal' | 'Extra Sweet'
type IceLevel = 'No Ice' | 'Light Ice' | 'Regular Ice' | 'Extra Ice'

interface CartItem {
  id: string
  name: string
  price: number
  customizations: {
    size: LemonadeSize
    sweetness: SweetnessLevel
    ice: IceLevel
  }
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (index: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => [...prevItems, item])
  }

  const removeFromCart = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
