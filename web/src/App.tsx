import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Install } from './pages/Install'

import { Footer } from './components/Footer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/install" element={<Install />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App

