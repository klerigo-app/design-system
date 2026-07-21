/**
 * Stand-in for `react-native-svg` under Vitest.
 *
 * Same reason as rn-stub: the real package imports `react-native`, whose
 * Flow-typed source rolldown cannot parse. See that file's header for the
 * general shape of this arrangement.
 *
 * These map onto the DOM's own SVG elements and pass every prop straight
 * through, so `expect(rect).toHaveAttribute('fill', …)` reads exactly what the
 * component asked for. That is the whole point here — `LogoMark` is a set of
 * fills and one path, and getting a fill wrong is the only way it can be wrong.
 * It proves nothing about how react-native-svg rasterises any of it.
 */
import { type ReactNode } from 'react'

interface SvgProps {
  children?: ReactNode
  [key: string]: unknown
}

export function Svg({ children, ...props }: SvgProps) {
  return <svg {...(props as object)}>{children}</svg>
}

export function Rect(props: SvgProps) {
  return <rect {...(props as object)} />
}

export function Path(props: SvgProps) {
  return <path {...(props as object)} />
}

export function Circle(props: SvgProps) {
  return <circle {...(props as object)} />
}

export default Svg
