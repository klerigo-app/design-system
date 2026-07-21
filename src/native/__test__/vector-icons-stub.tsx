/**
 * Stand-in for `@expo/vector-icons` under Vitest.
 *
 * Same reason as rn-stub and svg-stub: the real package pulls in
 * `react-native`, whose Flow-typed source rolldown cannot parse.
 *
 * `name`, `size` and `color` land on data attributes rather than styles,
 * because on the real component they are props rather than styles too — the
 * same reason `Field` hands `placeholderTextColor` through as a prop. Tests
 * read them via `iconOf` below, which is what lets an assertion check that a
 * checkmark is the glyph asked for and that its colour came from the palette
 * rather than a literal.
 */
import { type ReactElement } from 'react'

export interface IconProps {
  name: string
  size?: number
  color?: string
  testID?: string
}

const iconFamily = (family: string) =>
  function Icon({ name, size, color, testID }: IconProps): ReactElement {
    return (
      <span
        data-testid={testID}
        data-icon-family={family}
        data-icon={name}
        data-icon-size={size}
        data-icon-color={color}
      />
    )
  }

export const Feather = iconFamily('Feather')

/** Read back the glyph and colour a component asked for. */
export function iconOf(element: Element): { name: string | null; color: string | null } {
  return {
    name: element.getAttribute('data-icon'),
    color: element.getAttribute('data-icon-color'),
  }
}
