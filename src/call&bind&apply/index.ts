Function.prototype.myCall = function (context: any = window) {
  context.fn = this
  let args = [...arguments].slice(1)
  let result = context.fn(...args)
  delete context.fn
  return result
}

Function.prototype.myApply = function (context: any = window) {
  context.fn = this
  let args = arguments[1]
  let result = context.fn(...args)
  delete context.fn
  return result
}

Function.prototype.myBind = function (context: any = window) {
  context.fn = this
  let _args = [...arguments].slice(1)
  return (...args: any[]) => {
    let result = context.fn(..._args, ...args)
    return result
  }
}
