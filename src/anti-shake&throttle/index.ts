// 防抖就像按 B 回城，多次使用只生效最后的一次。
// 节流就像 q、w、e 小技能，第一次触发之后，后面的触发都会在冷却时间内无效。
// 防抖
export function antiShake(fn: Function, wait: number) {
  let timer: number
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, wait)
  }
}

// 节流
export function throttle(fn: Function, wait: number) {
  let timer: number
  return (...args: any[]) => {
    if (timer) return
    timer = setTimeout(() => {
      fn(...args)
      timer = 0
    }, wait)
  }
}
