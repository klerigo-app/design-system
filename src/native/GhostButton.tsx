import { type ReactElement } from 'react'
import { ButtonBase, type ButtonBaseProps, type ButtonVisual } from './ButtonBase'
import { type Theme } from './theme'

const visual = (theme: Theme): ButtonVisual => ({
  backgroundColor: 'transparent',
  color: theme.colors.slate,
  // Ghost is the one variant whose label colour also moves on hover
  // (`hover:bg-border hover:text-ink`, Button.tsx:31).
  hoverBackgroundColor: theme.colors.border,
  hoverColor: theme.colors.ink,
  pressTranslate: 0,
})

/** The quietest action — no fill, no border. Modal's cancel button. */
export function GhostButton(props: ButtonBaseProps): ReactElement {
  return <ButtonBase {...props} visual={visual} />
}

export type GhostButtonProps = ButtonBaseProps
