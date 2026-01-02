import { useState } from "react";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import Upload from "./pages/Upload";

export default function App() {
  const [page, setPage] = useState("feed");
  const [search, setSearch] = useState("");

  return (
    <div className="app-shell">
      <div className="app-ambient" aria-hidden />

      <Navbar
        onCreate={() => setPage("upload")}
        onSearch={setSearch}
        onHome={() => setPage("feed")}
      />

      <main className="app-main">
        {page === "feed" && <Feed search={search} />}
        {page === "upload" && <Upload onDone={() => setPage("feed")} />}
      </main>
    </div>
  );
}
