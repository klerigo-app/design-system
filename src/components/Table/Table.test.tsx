import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table'

function renderTable(rows: number, columns: number) {
  return render(
    <Table>
      <TableHead>
        <TableRow>
          {Array.from({ length: columns }, (_, c) => (
            <TableHeaderCell key={c}>Col {c}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }, (_, r) => (
          <TableRow key={r}>
            {Array.from({ length: columns }, (_, c) => (
              <TableCell key={c}>{`r${r}c${c}`}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>,
  )
}

describe('Table', () => {
  it('renders an arbitrary number of rows and columns', () => {
    renderTable(3, 5)
    expect(screen.getAllByRole('row')).toHaveLength(4) // 1 header row + 3 body rows
    expect(screen.getByText('r2c4')).toBeInTheDocument()
  })

  it('wraps the table in a horizontally scrollable container', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Contenido</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const table = screen.getByTestId('table')
    expect(table.parentElement?.className).toContain('overflow-x-auto')
  })

  it('applies the default 720px minimum width so narrow containers scroll instead of squeezing', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Contenido</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('table').style.minWidth).toBe('720px')
  })

  it('accepts a custom minWidth', () => {
    render(
      <Table data-testid="table" minWidth={480}>
        <TableBody>
          <TableRow>
            <TableCell>Contenido</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('table').style.minWidth).toBe('480px')
  })
})
