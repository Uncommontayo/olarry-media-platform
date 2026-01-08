import { useState } from "react";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import { theme } from "./styles/theme";

export default function App() {
  const [search, setSearch] = useState("");
  const [filterUsername, setFilterUsername] = useState(null);

  function handleHome() {
    setSearch("");
    setFilterUsername(null);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.background,
      color: theme.colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Navbar
        onSearch={setSearch}
        onHome={handleHome}
        onFilterUser={setFilterUsername}
      />
      <main>
        <Feed search={search} filterUsername={filterUsername} />
      </main>
    </div>
  );
}
