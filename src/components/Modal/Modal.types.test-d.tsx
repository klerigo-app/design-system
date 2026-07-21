import { Modal } from './Modal'

/**
 * Type-level tests for the Modal prop union.
 *
 * These live in a `.test-d.tsx` file rather than a `.test.tsx` one on purpose:
 * tsconfig excludes `src/**‌/*.test.tsx` from typechecking, so an assertion
 * written there would never be checked. This extension is picked up by
 * `tsc --noEmit` and ignored by Vitest's runner.
 *
 * Each `@ts-expect-error` is the assertion: if the code below ever stops being
 * an error, tsc fails with "unused '@ts-expect-error' directive". So this file
 * passing means the union genuinely rejects a caller who forgets a string —
 * which is the entire point of making them required.
 */

const noop = () => {}

export const valid = (
  <>
    {/* Minimal: confirm only. */}
    <Modal isOpen onClose={noop} title="t" onConfirm={noop} confirmText="Confirm" />

    {/* Cancel button, with its label. */}
    <Modal
      isOpen
      onClose={noop}
      title="t"
      onConfirm={noop}
      confirmText="Confirm"
      onCancel={noop}
      cancelText="Cancel"
    />

    {/* Type-to-confirm, with its prompt. */}
    <Modal
      isOpen
      onClose={noop}
      title="t"
      onConfirm={noop}
      confirmText="Delete"
      confirmationValue="unit-1"
      confirmationLabel="Type the unit name"
    />
  </>
)

export const invalid = (
  <>
    {/* @ts-expect-error confirmText is required — it used to default to 'Confirmar'. */}
    <Modal isOpen onClose={noop} title="t" onConfirm={noop} />

    {/* @ts-expect-error a cancel button requires a label for it. */}
    <Modal isOpen onClose={noop} title="t" onConfirm={noop} confirmText="Confirm" onCancel={noop} />

    {/* @ts-expect-error a cancel label without a cancel button is meaningless. */}
    <Modal isOpen onClose={noop} title="t" onConfirm={noop} confirmText="C" cancelText="Cancel" />

    {/* @ts-expect-error type-to-confirm requires the prompt that explains it. */}
    <Modal isOpen onClose={noop} title="t" onConfirm={noop} confirmText="C" confirmationValue="x" />
  </>
)
