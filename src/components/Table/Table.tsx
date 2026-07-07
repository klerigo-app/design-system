import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type TableHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * Minimum table width in px before the wrapper starts scrolling
   * horizontally instead of squeezing columns. Measured against the
   * wrapper's own rendered width, not the viewport — a table nested in a
   * narrow sidebar column scrolls sooner than one alone on a wide page.
   * Match this to how many columns the table actually needs — a narrow
   * 3-column table doesn't need the same floor as a wide 7-column one.
   */
  minWidth?: number
}

/**
 * Generic data table shell — composes with TableHead/TableBody/TableRow/
 * TableHeaderCell/TableCell like plain HTML table elements, so it supports
 * any number of rows and columns with no fixed schema. Below `minWidth` the
 * table scrolls horizontally in its own wrapper instead of the layout
 * squeezing columns unreadably.
 */
export function Table({ className, style, minWidth = 720, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-left text-sm', className)}
        style={{ minWidth, ...style }}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>

export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead className={className} {...props} />
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={className} {...props} />
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={className} {...props} />
}

export type TableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement>

export function TableHeaderCell({ className, ...props }: TableHeaderCellProps) {
  return (
    <th
      className={cn(
        'border-b border-border px-2 pb-2 font-display text-xs text-muted first:pl-0 last:pr-0',
        className,
      )}
      {...props}
    />
  )
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      className={cn('border-t border-border px-2 py-2.5 text-ink first:pl-0 last:pr-0', className)}
      {...props}
    />
  )
}
