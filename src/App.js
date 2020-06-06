import React from 'react'
import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'

const dragDropMachine = Machine(
  {
    id: 'dragDropMachine',
    initial: 'idle',
    context: {
      // element position
      x: 0,
      y: 0,
      // where you clicked relative to the target element
      offsetX: 0,
      offsetY: 0,
    },
    states: {
      idle: {
        on: {
          mousedown: {
            target: 'dragging',
            actions: ['startDrag'],
          },
        },
      },
      dragging: {
        on: {
          mouseup: {
            target: 'idle',
          },
          mousemove: {
            target: 'dragging',
            internal: true,
            actions: ['updateDrag'],
          },
        },
      },
    },
  },
  {
    actions: {
      startDrag: assign((ctx, mouseEvent) => {
        const { x, y } = mouseEvent.target.getBoundingClientRect()
        return {
          ...ctx,
          x,
          y,
          offsetX: mouseEvent.clientX - x,
          offsetY: mouseEvent.clientY - y,
        }
      }),
      updateDrag: assign((ctx, mouseEvent) => {
        return {
          ...ctx,
          x: mouseEvent.clientX - ctx.offsetX,
          y: mouseEvent.clientY - ctx.offsetY,
        }
      }),
    },
  }
)

export default function App() {
  const [state, send] = useMachine(dragDropMachine, {
    actions: {
      log: (c, e) => console.log('****', e.type),
    },
  })

  const handleMouse = React.useCallback(e => {
    send(e)
  },[send])

  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouse)
    document.addEventListener('mousemove', handleMouse)
    return () => {
      document.removeEventListener('mouseup', handleMouse)
      document.removeEventListener('mousemove', handleMouse)
    }
  },[handleMouse])



  return (
    <div className="App">
      <div
        style={{
          position: 'absolute',
          height: '150px',
          width: '150px',
          backgroundColor: 'purple',
          borderRadius: '50%',
          top: state.context.y,
          left: state.context.x,
        }}
        onMouseDown={handleMouse}
      />
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
        }}
      >
        {state.value}
      </div>
    </div>
  )
}
