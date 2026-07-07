import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip } from '../Chip/Chip'
import { Button } from '../Button/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table'

const meta: Meta<typeof Table> = {
  title: 'Core/Table',
  component: Table,
}
export default meta

type Story = StoryObj<typeof Table>

const TENANTS = [
  { name: 'Acme Language School', plan: 'Growth', status: 'Active' as const, users: 214 },
  { name: 'Bright Path Academy', plan: 'Starter', status: 'Active' as const, users: 42 },
  { name: 'Northwind Tutors', plan: 'Starter', status: 'Trial' as const, users: 9 },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Plan</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Users</TableHeaderCell>
          <TableHeaderCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {TENANTS.map((t) => (
          <TableRow key={t.name}>
            <TableCell className="font-medium">{t.name}</TableCell>
            <TableCell className="text-slate">{t.plan}</TableCell>
            <TableCell>
              <Chip variant={t.status === 'Active' ? 'completed' : 'level'}>{t.status}</Chip>
            </TableCell>
            <TableCell className="text-slate">{t.users}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
                <Button variant="danger" size="sm">
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/** Below `minWidth` (480px here, for the story) the table scrolls instead of squeezing columns. */
export const NarrowContainerScrolls: Story = {
  render: () => (
    <div style={{ width: 320, border: '1px dashed #ccc', padding: 8 }}>
      <Table minWidth={480}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Plan</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Users</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {TENANTS.map((t) => (
            <TableRow key={t.name}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell className="text-slate">{t.plan}</TableCell>
              <TableCell>
                <Chip variant={t.status === 'Active' ? 'completed' : 'level'}>{t.status}</Chip>
              </TableCell>
              <TableCell className="text-slate">{t.users}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}
