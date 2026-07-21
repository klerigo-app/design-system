import { type ReactElement } from 'react'
import { ButtonBase, type ButtonBaseProps, type ButtonVisual } from './ButtonBase'
import { type Theme } from '../theme'

const visual = (theme: Theme): ButtonVisual => ({
  // surface-raised, not transparent — web's secondary sits on its own surface
  // (Button.tsx:30), which is what keeps the teal border legible over paper.
  backgroundColor: theme.colors.surfaceRaised,
  color: theme.colors.teal[500],
  borderColor: theme.colors.teal[500],
  borderWidth: 2,
  hoverBackgroundColor: theme.colors.teal[50],
  // No lift and no sink: only primary, reward and danger move on press.
  pressTranslate: 0,
})

/**
 * The teal-bordered secondary action, matching web's `secondary` variant.
 *
 * NOTE: this name previously belonged to a slate-bordered outline button. That
 * component is now `OutlineButton`, with its border corrected to
 * `border-input`. The prop shape is unchanged, so an un-migrated call site
 * compiles and silently turns teal — which is why the klerigo-app migration
 * lands with this change rather than after it. See §8 of the design spec.
 */
export function SecondaryButton(props: ButtonBaseProps): ReactElement {
  return <ButtonBase {...props} visual={visual} />
}

export type SecondaryButtonProps = ButtonBaseProps
