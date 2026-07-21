import { type ReactElement } from 'react'
import { ButtonBase, type ButtonBaseProps, type ButtonVisual } from './ButtonBase'
import { type Theme } from '../theme'

const visual = (theme: Theme): ButtonVisual => ({
  backgroundColor: theme.colors.coral[500],
  // The one sanctioned literal: coral-500 is theme-invariant, so a label on it
  // must not flip either.
  color: '#FFFFFF',
  hoverBackgroundColor: theme.colors.coralHover,
  restShadow: theme.shadows.buttonLiftCoral,
  pressedShadow: theme.shadows.buttonPressedCoral,
  pressTranslate: 3,
})

/**
 * The main call to action — coral fill with the brand's hard coloured lift.
 *
 * Explicit return type avoids a non-portable @types/react reference in the
 * emitted declaration when this package is built as a git dependency (TS2883).
 */
export function PrimaryButton(props: ButtonBaseProps): ReactElement {
  return <ButtonBase {...props} visual={visual} />
}

export type PrimaryButtonProps = ButtonBaseProps
