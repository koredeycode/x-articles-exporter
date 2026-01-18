import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Install } from './pages/Install'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/install" element={<Install />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

