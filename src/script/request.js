export default function Request({ url, method, body }) {
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest()
    req.onreadystatechange = function() {
      if (this.readyState !== 4) return
      let json
      if (this.response) {
        try {
          json = JSON.parse(this.response)
        } catch (e) {}
      }

      if (this.status >= 400) return reject(json)
      return resolve(json)
    }
    req.open(method, url, true)
    req.setRequestHeader('Content-Type', 'application/json')
    if (body) req.send(JSON.stringify(body))
    else req.send()
  })
}
