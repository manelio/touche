import evented from 'touche/mixins/evented'
import createGestureManager from 'touche/gestures/manager'
import createInputManager from 'touche/input/manager'
import createCalculator from 'touche/calculations/calculator'

let _instanceId = 0;

export default () => {
  let instanceId = _instanceId++

  function _trigger(event, ...args) {
    this.trigger(event, ...args)
  }
  let trigger


  const calculator = createCalculator()

  const gestureManager = createGestureManager({instanceId})
  .callback((event, ...args) => {
    if (event === 'emit') {
      trigger(...args)
    }
  })
  
  const inputManager = createInputManager({
    instanceId
  })
  .on('beforeinput', () => trigger('beforeinput'))
  .on('input', (input, session) => {
    trigger('touche.input', input)
    const result = calculator.process(input, session)
    if (result.recentered) {
      trigger('touche.recentered', result, input, session)
    }
    gestureManager.process(input, session, calculator)
    trigger('touche.post', input, session, calculator)
  })

  const manager = Object.assign({}, evented, {
    hash(fn) {
      return this
    },
    addInput(input) {
      inputManager.add(input)
      return this
    },
    addGesture(gesture) {
      gestureManager.add(gesture)
      return this
    },
  }).initialize()

  trigger = _trigger.bind(manager)
  return manager
}
