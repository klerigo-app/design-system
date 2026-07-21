import { Modal } from './Modal'

/**
 * Type-level tests for the native Modal prop union — the counterpart of
 * src/components/Modal/Modal.types.test-d.tsx.
 *
 * Both Modals carry the same contract, and keeping both files is the point:
 * the whole reason web's Modal changed alongside native's was to stop the two
 * prop contracts diverging. If one drifts, one of these stops compiling.
 *
 * See the web file for why this is a `.test-d.tsx`: tsconfig excludes
 * `*.test.tsx` from typechecking, so assertions written there are never run.
 */

const noop = () => {}

export const valid = (
  <>
    <Modal isOpen onClose={noop} title="t" onConfirm={noop} confirmText="Confirm" />
    <Modal
      isOpen
      onClose={noop}
      title="t"
      onConfirm={noop}
      confirmText="Confirm"
      onCancel={noop}
      cancelText="Cancel"
    />
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
