import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Docs from './pages/Docs'
import Login from './pages/Login'
import Register from './pages/Register'
import UiShowcase from './pages/UiShowcase'  // 新增导入
import Downloads from './pages/Downloads'    // 新增导入
import Profile from './pages/Profile'    // 新增导入
import Settings from './pages/Settings'  // 新增导入

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="docs" element={<Docs />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="ui-showcase" element={<UiShowcase />} />  // 新增路由
        <Route path="downloads" element={<Downloads />} />      // 新增路由
        <Route path="profile" element={<Profile />} />    // 新增路由
        <Route path="settings" element={<Settings />} />  // 新增路由
      </Route>
    </Routes>
  )
}