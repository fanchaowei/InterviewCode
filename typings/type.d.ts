declare interface Function {
  myCall(context: any): any
  myApply(context: any): any
  myBind(context: any): any
}
declare interface MyPromise1Type<T> {
  catch(onRejected: any): MyPromise1<T>
}
