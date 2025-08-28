import React from 'react'
import ReactDOMServer from 'react-dom/server'
import App from '../src/App'

// Render to string for a CLI snapshot of the UI
const html = ReactDOMServer.renderToString(<App />)
// Wrap in a root container like index.html
const doc = `<div id="root">${html}</div>`
console.log(doc)

