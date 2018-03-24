import EventEmitter from 'eventemitter3'
import pEvent from 'p-event'
import Component from './Component.html'

const states = {
  init: 'init',
  running: 'running',
  opening: 'opening',
  opened: 'opened',
  closing: 'closing',
  closed: 'closed',
  end: 'end'
}

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

  static fire(...args) {
    return new this(...args).run()
  }

  constructor(...args) {
    super()
    this.params = Object.freeze(this.constructor._argsToParams(args)) // todo: make unable to reassign to
    this.element = window.document.createElement('div') // todo: make unable to reassign to
    this.component = new this.constructor._Component({ target: this.element })
    this._innerParams = Object.freeze(this.constructor._getInnerParams(this.params))

    const { title, body } = this._innerParams
    this.component.set({ title, body })
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
  static _Component = Component
  static _getInnerParams({ title = '', body = '' }) {
    return { title, body }
  }

  state = 'init'
  _setState (state, data) {
    // TODO: checks, here and wherever state is expected to be something particular
    this.state = state
    this.emit(state, data)
  }
  run() {
    if (this.state === 'init'){
      this._setState('running')
      Promise.resolve() // side-effects begin on nextTick
        .then(() => {
          this._setState('opening')
          window.document.body.appendChild(this.element)
          return timeout(1000).then(() => {
            this._setState('opened')

            /* messin around */
            setTimeout(() => {
              this._close()
                .then(() => {
                  this.emit('end', 'result')
                })
                .catch(error => this.emit(error))
            }, 3000)
            /* /messin around */
          })
        })
        .catch(error => this.emit(error))
    }
    return this
  }

  _close() {
    this._setState('closing')
    return timeout(1000).then(() => {
      this.component.destroy()
      window.document.body.removeChild(this.element)
      this.element = null
      this._setState('closed')
    })
  }
}

export default Swal
