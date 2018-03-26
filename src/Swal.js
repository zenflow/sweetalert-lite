import EventEmitter from 'eventemitter3'
import pEvent from 'p-event'
import Component from './Component.html'

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

class Swal extends EventEmitter {
  _promise = pEvent(this, 'end')
  then(onResolve, onReject) {
    return this._promise.then(onResolve, onReject)
  }
  catch(onReject) {
    return this._promise.catch(onReject)
  }
  finally(onFinally) {
    return this._promise.then(onFinally)
  }
  // TODO: return `Promise.resolve()` if event is in the past
  // TODO: extract this kind of logic into a base class
  running () {
    return pEvent(this, 'running')
  }
  opening () {
    return pEvent(this, 'opening')
  }
  opened () {
    return pEvent(this, 'opened')
  }
  closing () {
    return pEvent(this, 'closing')
  }
  closed () {
    return pEvent(this, 'closed')
  }
  end () {
    return pEvent(this, 'end')
  }

  static fire(...args) {
    return new this(...args).run()
  }
  constructor(...args) {
    super()
    // todo: make this unable to be reassigned
    this.params = Object.freeze(this.constructor._argsToParams(args))
    this._element = window.document.createElement('div')
    this._component = new this.constructor._Component({ target: this._element })
  }
  static _argsToParams(args) {
    if (typeof args[0] === 'object' && args[0].constructor === Object) {
      return args[0]
    } else {
      const params = {}
      this._shorthand.forEach((param, index) => {
        if (args[index] !== undefined) {
          params[param] = args[index]
        }
      })
      return params
    }
  }
  static _shorthand = ['title', 'body']
  run() {
    this._setState('running')
    this.emit('running')
    Promise.resolve() // side-effects begin on nextTick
      .then(() => this._main(this.params)) // sync errors are captured as rejections
      .then(
        result => {
          this._setState('end')
          this.emit('end', result)
        },
        error => {
          this._setState('error')
          this.emit('error', error)
        },
      )
      .then(() => this._destroy()) // _destroy() after resolving or rejecting _promise
    return this
  }
  _main(params) {
    const { title, body } = params
    this._component.set({ title, body })

    let result
    this._setState('opening')
    this.emit('opening')
    return this._open()
      .then(() => {
        this._setState('opened')
        this.emit('opened')
        return this._getResult()
      })
      .then(_result => {
        result = _result
        this._setState('closing')
        this.emit('closing')
        return this._close()
      })
      .then(() => {
        this._setState('closed')
        this.emit('closed')
        return result
      })
  }
  static _Component = Component
  _open() {
    window.document.body.appendChild(this._element)
    return timeout(500)
  }
  _getResult() {
    // TODO: { value, dismiss } ?
    return new Promise((resolve, reject) => {
      this._component.on('click:ok', () => {
        resolve('result')
      })
    })
  }
  _close() {
    return timeout(500).then(() => {
      window.document.body.removeChild(this._element)
    })
  }
  _destroy() {
    this._component.destroy()
    this._component = null
    this._element = null
  }

  _state = 'init'
  get state() {
    return this._state
  }
  _setState(state) {
    // TODO: validate state transition
    this._state = state
  }
  static states = {
    init: 'init',
    running: 'running',
    opening: 'opening',
    opened: 'opened',
    closing: 'closing',
    closed: 'closed',
    end: 'end',
  }
}

export default Swal
