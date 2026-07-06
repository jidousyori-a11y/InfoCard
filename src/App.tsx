import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { SearchPage } from "./pages/SearchPage";
import { BrowsePage } from "./pages/BrowsePage";
import { CardDetailPage } from "./pages/CardDetailPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">情報カード</h1>
          <nav className="app__nav">
            <NavLink to="/browse">閲覧</NavLink>
            <NavLink to="/" end>
              検索
            </NavLink>
            {import.meta.env.DEV && <NavLink to="/register">登録</NavLink>}
          </nav>
        </header>
        <main className="app__main">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/cards/:id" element={<CardDetailPage />} />
            {import.meta.env.DEV && <Route path="/register" element={<RegisterPage />} />}
            {import.meta.env.DEV && <Route path="/register/:id" element={<RegisterPage />} />}
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
