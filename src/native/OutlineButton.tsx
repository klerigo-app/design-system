import { type ReactElement } from 'react'
import { ButtonBase, type ButtonBaseProps, type ButtonVisual } from './ButtonBase'
import { type Theme } from './theme'

const visual = (theme: Theme): ButtonVisual => ({
  backgroundColor: 'transparent',
  color: theme.colors.ink,
  // border-input, not slate. The component this replaces used `slate`, which
  // matched neither web variant — it was outline-shaped with the wrong border
  // colour under the wrong name.
  borderColor: theme.colors.borderInput,
  borderWidth: 1,
  hoverBackgroundColor: theme.colors.paper,
  pressTranslate: 0,
})

/**
 * Quiet bordered action — web's `outline` variant.
 *
 * This is what `SecondaryButton` used to be, renamed and with its border
 * corrected. Neutral actions like "Log out" and "Try again" belong here.
 */
export function OutlineButton(props: ButtonBaseProps): ReactElement {
  return <ButtonBase {...props} visual={visual} />
}

export type OutlineButtonProps = ButtonBaseProps
