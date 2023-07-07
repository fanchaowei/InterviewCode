let PENDING = 'PENDING'
let FULFILLED = 'FULFILLED'
let REJECTED = 'REJECTED'

export class promise {
  private status: string = PENDING
  private value: any = undefined
  private reason: any = undefined
  private onResolveCallback: Function[] = []
  private onRejectCallback: Function[] = []

  constructor(executor: Function) {
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
  resolve(val: any) {
    if (this.status === PENDING) {
      this.status = FULFILLED
      this.value = val
      this.onResolveCallback.forEach((fn) => fn())
    }
  }
  reject(rea: any) {
    if (this.status === PENDING) {
      this.status = REJECTED
      this.reason = rea
      this.onRejectCallback.forEach((fn) => fn())
    }
  }

  then(onFulfilled?: Function, onRejected?: Function) {
    if (this.status === FULFILLED) {
      onFulfilled ? onFulfilled(this.value) : null
    } else if (this.status === REJECTED) {
      onRejected ? onRejected(this.reason) : null
    } else {
      this.onResolveCallback.push(() => {
        onFulfilled ? onFulfilled(this.value) : null
      })

      this.onRejectCallback.push(() => {
        onRejected ? onRejected(this.reason) : null
      })
    }
  }
}
