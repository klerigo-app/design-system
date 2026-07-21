import { type ReactElement } from 'react'
import { ButtonBase, type ButtonBaseProps, type ButtonVisual } from './ButtonBase'
import { type Theme } from './theme'

const visual = (theme: Theme): ButtonVisual => ({
  backgroundColor: theme.colors.sun[500],
  // Ink rather than white: sun-500 is a light fill, so its label is themed and
  // does flip. Only the labels on coral and error are literal.
  color: theme.colors.ink,
  hoverBackgroundColor: theme.colors.sunHover,
  restShadow: theme.shadows.buttonLiftSun,
  pressedShadow: theme.shadows.buttonPressedSun,
  pressTranslate: 3,
})

/** Celebratory action — sun fill, same lift-and-sink as primary. */
export function RewardButton(props: ButtonBaseProps): ReactElement {
  return <ButtonBase {...props} visual={visual} />
}

export type RewardButtonProps = ButtonBaseProps
