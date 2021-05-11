export function isPromise(p) {
  return p && Object.prototype.toString.call(p) === '[object Promise]'
}

export function timeparse(time) {
  if (typeof time == 'string') {
    return new Date(time.substr(0, 16))
  }
  return time
}
