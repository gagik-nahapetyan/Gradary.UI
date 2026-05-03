import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OrderType } from '@/types/api'

interface SortableHeaderProps {
  label: string
  field: string
  currentOrderBy?: string
  currentOrderType?: OrderType
  onSort: (field: string, orderType: OrderType) => void
}

export function SortableHeader({
  label,
  field,
  currentOrderBy,
  currentOrderType,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentOrderBy === field

  const handleClick = () => {
    if (!isActive || currentOrderType === 'Desc') {
      onSort(field, 'Asc')
    } else {
      onSort(field, 'Desc')
    }
  }

  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8 font-medium" onClick={handleClick}>
      {label}
      {isActive ? (
        currentOrderType === 'Asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />
      )}
    </Button>
  )
}
