export default function CreateElement(tag, options = {}, children = []) {
  let el = document.createElement(tag)

  Object.keys(options)
    .filter(Boolean)
    .forEach(attr => {
      if (attr in el) el[attr] = options[attr]
      else el.setAttribute(attr, options[attr])
    })

  children = children instanceof Array ? children : [children]
  children.forEach(child => el.appendChild(child))

  return el
}
