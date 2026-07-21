import { type ReactElement } from 'react'
import { ButtonBase, type ButtonBaseProps, type ButtonVisual } from './ButtonBase'
import { type Theme } from './theme'

const visual = (theme: Theme): ButtonVisual => ({
  backgroundColor: theme.colors.error,
  // Literal white, as on the coral fill: the error fill carries its own
  // contrast in both schemes.
  color: '#FFFFFF',
  hoverBackgroundColor: theme.colors.errorHover,
  // No shadow, and a 1px sink rather than 3px — web's danger variant has
  // `active:translate-y-[1px]` and no `shadow-lift-*` (Button.tsx:33).
  pressTranslate: 1,
})

/**
 * Destructive action.
 *
 * Modal used to hand-roll this fill inline; it now composes this instead. The
 * issue's note that "danger is admin-only, so mobile doesn't need it yet" was
 * true of the screens and false of the code.
 */
export function DangerButton(props: ButtonBaseProps): ReactElement {
  return <ButtonBase {...props} visual={visual} />
}

export type DangerButtonProps = ButtonBaseProps
