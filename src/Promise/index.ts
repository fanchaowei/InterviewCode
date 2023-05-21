import { MyPromise1Type } from './type'

let PENDING = 'PENDING'
let FULFILLED = 'FULFILLED'
let REJECTED = 'REJECTED'

// 基础版
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

// const promise = new MyPromise((resolve: any, reject: any) => {
//   setTimeout(() => {
//     resolve('成功')
//   }, 0)
// }).then((value: any) => {
//   console.log('success', value)
// })

// ------------------------------------------------------------------------------------

// 较完整版本
export class MyPromise1 implements MyPromise1Type<any> {
  private status = PENDING
  private value: any = undefined
  private reason: any = undefined
  private onResolveCallback: any[] = []
  private onRejectCallback: any[] = []

  // Promise.resolve 方法
  static resolve(data: any) {
    return new MyPromise1((resolve: any, reject: any) => {
      resolve(data)
    })
  }

  // Promise.reject 方法
  static reject(data: any) {
    return new MyPromise1((resolve: any, reject: any) => {
      reject(data)
    })
  }

  // Promise.all 方法
  static all(promises: any[]) {
    return new MyPromise1((resolve: any, reject: any) => {})
  }

  // Promise.catch 方法
  catch(onRejected: any) {
    return this.then(null, onRejected)
  }

  private resolve = (_value: any) => {
    // 如果 value 是一个 Promise，递归执行
    if (_value instanceof MyPromise1) {
      return _value.then(this.resolve, this.reject)
    }

    if (this.status === PENDING) {
      this.status = FULFILLED
      this.value = _value
      this.onResolveCallback.forEach((fn) => fn())
    }
  }

  private reject = (_reason: any) => {
    if (this.status === PENDING) {
      this.status = REJECTED
      this.reason = _reason
      this.onRejectCallback.forEach((fn) => fn())
    }
  }

  then(onFulfilled?: any, onRejected?: any) {
    // 判断传入的参数是不是 function，如果不是则变成一个 function
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (args: any) => args
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err: any) => {
            throw err
          }

    let p = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // then 内是异步执行的，所以需要用 setTimeout 包裹
        setTimeout(() => {
          try {
            // 执行成功回调，并将返回值传入 resolvePromise 进行解析
            let x = onFulfilled(this.value)
            // 传给 resolvePromise 也是处理了新的 Promise 的 then 的值穿透问题
            resolvePromise(p, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(p, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === PENDING) {
        this.onResolveCallback.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(p, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })

        this.onRejectCallback.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(p, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })

    return p
  }

  constructor(executor: any) {
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
}
// 该函数用于解析 then 返回的值 x
// 这个函数的 x 参数代表什么？
// 1. 如果 x 是一个普通值，直接 resolve(x)
// 2. 如果 x 是一个 promise 对象，取它的结果，决定 promise2 的状态
// 3. 如果 x 是一个 thenable 对象（具有 then 方法的对象），那么就让它立即执行 then 方法
// 4. 如果 x 的取值过程中抛出了异常，那么就以这个异常作为结果 reject(error)
function resolvePromise(promise2: any, x: any, resolve: any, reject: any) {
  // 如果 promise2 和 x 指向同一对象，以 TypeError 为据应拒绝执行 promise
  if (x === promise2) {
    return reject(new TypeError('循环引用'))
  }
  // called 是一个标识，用于判断是否已经调用过成功或失败回调
  let called = false
  // 如果 x 是一个对象或者函数
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then
      // 如果 then 是一个函数，则将 x 作为函数的作用域 this 调用之
      if (typeof then === 'function') {
        then(
          x,
          (y: any) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          (r: any) => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        // 如果 then 不是一个函数，则以 x 为参数执行 promise
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  }
}

const promise = new MyPromise1((resolve: any, reject: any) => {
  reject('失败')
})
  .then()
  .then()
  .then(
    (data) => {
      console.log(data)
    },
    (err) => {
      console.log('err', err)
    }
  )

MyPromise1.resolve(
  new MyPromise1((resolve: any, reject: any) => {
    setTimeout(() => {
      resolve('ok')
    }, 3000)
  })
)
  .then((data: any) => {
    console.log(data, 'success')
  })
  .catch((err) => {
    console.log(err, 'error')
  })
