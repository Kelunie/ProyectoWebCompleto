import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LiveRoomsList from './components/LiveRoomsList'
import SpectatorRoom from './components/SpectatorRoom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiveRoomsList />} />
        <Route path="/room/:roomId" element={<SpectatorRoom />} />
      </Routes>
    </BrowserRouter>
  )
}