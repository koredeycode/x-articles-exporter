import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Docs } from './pages/Docs'
import { Home } from './pages/Home'

import { Footer } from './components/Footer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App

