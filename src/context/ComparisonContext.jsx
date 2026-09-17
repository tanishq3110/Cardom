import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getCompareIds,
  saveCompareIds,
  addToCompare as utilsAddToCompare,
  removeFromCompare as utilsRemoveFromCompare,
  clearCompare as utilsClearCompare,
  MAX_COMPARE_CARS,
} from '@/utils/comparison'
import { fetchCarsByIds } from '@/services/carsApi'

const ComparisonContext = createContext(null)

export function ComparisonProvider({ children }) {
  const [compareIds, setCompareIds] = useState(() => getCompareIds())
  const [compareCars, setCompareCars] = useState([])
  const [carsLoading, setCarsLoading] = useState(false)
  const [notice, setNotice] = useState('')

  // 1. Sync state when localStorage changes across windows/custom events
  useEffect(() => {
    const handleUpdate = () => {
      setCompareIds(getCompareIds())
    }
    window.addEventListener('cardom_compare_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('cardom_compare_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // 2. Hydrate car objects from compareIds & prune invalid/deleted IDs
  const hydrateCars = useCallback(async (ids) => {
    if (!ids || ids.length === 0) {
      setCompareCars([])
      setCarsLoading(false)
      return
    }

    setCarsLoading(true)
    try {
      const { data } = await fetchCarsByIds(ids)
      const validCars = Array.isArray(data) ? data : []
      setCompareCars(validCars)

      // Automatically prune non-existent/deleted car IDs from localStorage
      if (validCars.length < ids.length) {
        const validIds = validCars.map((c) => String(c.id))
        saveCompareIds(validIds)
        setCompareIds(validIds)
      }
    } catch (err) {
      console.warn('[Cardom Comparison] Failed to hydrate compared cars:', err)
    } finally {
      setCarsLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrateCars(compareIds)
  }, [compareIds, hydrateCars])

  // 3. User Actions
  const showNotice = useCallback((msg) => {
    setNotice(msg)
    setTimeout(() => {
      setNotice((prev) => (prev === msg ? '' : prev))
    }, 3500)
  }, [])

  const addCar = useCallback(
    (carId) => {
      if (!carId) return false
      const res = utilsAddToCompare(carId)
      if (!res.success && res.reason === 'max_reached') {
        showNotice('Compare up to 3 cars at a time.')
        return false
      }
      setCompareIds(getCompareIds())
      return true
    },
    [showNotice]
  )

  const removeCar = useCallback((carId) => {
    if (!carId) return
    utilsRemoveFromCompare(carId)
    setCompareIds(getCompareIds())
  }, [])

  const toggleCar = useCallback(
    (carId) => {
      if (!carId) return false
      if (compareIds.includes(carId)) {
        removeCar(carId)
        return false
      } else {
        return addCar(carId)
      }
    },
    [compareIds, addCar, removeCar]
  )

  const clearAll = useCallback(() => {
    utilsClearCompare()
    setCompareIds([])
    setCompareCars([])
  }, [])

  const isInCompare = useCallback(
    (carId) => {
      return Boolean(carId && compareIds.includes(String(carId)))
    },
    [compareIds]
  )

  const value = {
    compareIds,
    compareCars,
    carsLoading,
    notice,
    showNotice,
    addCar,
    removeCar,
    toggleCar,
    clearAll,
    isInCompare,
    maxAllowed: MAX_COMPARE_CARS,
  }

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
}

