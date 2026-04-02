import { useState } from 'react'
import './App.css'

function App() {
  const [clicked, setClicked] = useState(false)

  return (
    <main className="app-shell">
      <div className="card">
        <p className="eyebrow">GitHub Copilot app test</p>
        <h1>Hello world</h1>
        <p className="copy">
          Tiny app, one click, one state change, one test.
        </p>
        <button type="button" onClick={() => setClicked(true)}>
          {clicked ? 'Hello from Copilot ✨' : 'Say hello'}
        </button>
      </div>
    </main>
  )
}

export default App
