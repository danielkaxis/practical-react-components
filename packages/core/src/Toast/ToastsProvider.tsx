import React, { useReducer, useContext, useRef } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import styled, { css } from 'styled-components'

import { spacing, shape } from '../designparams'

import { BaseToast } from './Toast'
import { toastReducer } from './toastReducer'

import { useToastCallbacks, SimpleToastsDurations } from './useToasts'
import { ToastAction, NI, ToastsContext } from './context'

export interface ToastsPlacement {
  readonly justify: 'center' | 'right'
  readonly top: string
}

const ToastsWrapper = styled.div<ToastsPlacement>`
  position: fixed;
  top: ${({ top }) => top};
  width: 360px;
  border-radius: ${shape.radius.medium};
  margin: ${spacing.medium} ${spacing.large};

  ${({ justify }) =>
    justify === 'center'
      ? css`
          left: 50%;
          transform: translateX(-50%);
        `
      : css`
          right: 0;
        `}
`

/**
 *
 * Toasts provider
 *
 * Used to provide a context for dispatching toast actions.
 *
 * Note: Do not use this directly! Instead use the `useToasts` hook which wraps
 * the dispatch ref.
 *
 */
export const ToastsProvider: React.FC<SimpleToastsDurations> = ({
  children,
  ...toastsOptions
}) => {
  const __dispatchRef = useRef<React.Dispatch<ToastAction>>(NI)

  const callbacks = useToastCallbacks(__dispatchRef, toastsOptions)

  return (
    <ToastsContext.Provider value={{ ...callbacks, __dispatchRef }}>
      {children}
    </ToastsContext.Provider>
  )
}

export const ToastTransition: React.FC = ({ children, ...props }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <CSSTransition
      nodeRef={ref}
      classNames="practical"
      appear={true}
      timeout={400}
      mountOnEnter={true}
      unmountOnExit={true}
      {...props}
    >
      {React.isValidElement(children)
        ? React.cloneElement(children, { ref })
        : null}
    </CSSTransition>
  )
}

export interface ToastsAnchorProps {
  /**
   * Where the toasts should be placed.
   *
   * Default: top right
   */
  readonly placement: ToastsPlacement
}

export const ToastsAnchor: React.FC<ToastsAnchorProps> = ({ placement }) => {
  const [toasts, dispatch] = useReducer(toastReducer, new Map())
  const { hideToast, __dispatchRef } = useContext(ToastsContext)
  __dispatchRef.current = dispatch

  return (
    <ToastsWrapper {...placement}>
      <TransitionGroup component={null}>
        {[...toasts.entries()].map(([id, props], index) => (
          <ToastTransition key={id}>
            <BaseToast
              key={id}
              toastId={id}
              zIndex={-index}
              dismissToast={hideToast}
              {...props}
            />
          </ToastTransition>
        ))}
      </TransitionGroup>
    </ToastsWrapper>
  )
}
