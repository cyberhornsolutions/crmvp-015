import { useState } from 'react'
import './App.css'
import Home from './pages/Home.jsx'
import Header from './components/Header'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
    <Home />
    </>
  )
}

export default App
