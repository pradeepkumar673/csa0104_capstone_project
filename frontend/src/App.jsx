import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signin from './pages/login'
import Signup from './pages/signup'



const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Signin />} />
      <Route path="/Signup" element={<Signup />} />
    </Routes>
  )
}

export default App