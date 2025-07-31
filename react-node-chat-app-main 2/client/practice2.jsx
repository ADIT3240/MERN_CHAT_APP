import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import auth from '@/pages/auth'
import chat from '@/pages/chat'
import profile from '@/pages/profile'

const practice2 = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>practice2</div>} />
        <Route path="/auth" element={<auth />} />
        <Route path="/chat" element={<chat />} />
        <Route path="/profile" element={<profile />} />
        <Route path="*" element={<Navigate to="/auth" />} />

      </Routes>
    </Router>
  )
}

export default practice2