let PENDING = 'PENDING'
let FULFILLED = 'FULFILLED'
let REJECTED = 'REJECTED'

export class MyPromise {
  // 状态
  status = PENDING
  // 存放成功状态的值
  value = undefined
  // 存放失败状态的值
  reasion = undefined
  // 存放成功、失败时的回调
  onResolvedCallback: any[] = []
  onRejectCallback: any[] = []

  resolve = (_val: any) => {
    if (this.status === PENDING) {
      this.status = FULFILLED
      this.value = _val
      // 从成功回调数组里取出回调依次执行
      this.onResolvedCallback.forEach((fn) => fn())
    }
  }

  reject = (_reason: any) => {
    if (this.status === PENDING) {
      this.status = REJECTED
      this.reasion = _reason
      // 从失败回调数组里取出回调依次执行
      this.onRejectCallback.forEach((fn) => fn())
    }
  }

  then(onFulfilled?: any, onRejected?: any) {
    // 判断传入的参数是不是 function，如果不是则变成一个 function
    // onFulfilled =
    //   typeof onFulfilled === 'function' ? onFulfilled : (args: any) => args
    // onRejected =
    //   typeof onRejected === 'function' ? onRejected : (args: any) => args

    if (this.status === FULFILLED) {
      onFulfilled(this.value)
    } else if (this.status === REJECTED) {
      onRejected(this.reasion)
    } else if (this.status === PENDING) {
      // 当状态还是pending时，说明 executor 是异步函数，将成功、失败的回调存起来
      this.onResolvedCallback.push(() => {
        onFulfilled(this.value)
      })
      this.onRejectCallback.push(() => {
        onRejected(this.reasion)
      })
    }
  }

  constructor(executor: any) {
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
}

const promise = new MyPromise((resolve: any, reject: any) => {
  setTimeout(() => {
    resolve('成功')
  }, 0)
}).then((value: any) => {
  console.log('success', value)
})
