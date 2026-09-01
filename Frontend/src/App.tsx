import Sidebar from "./components/Sidebar";
import BookmarksPage from "./pages/BookmarksPage";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <BookmarksPage />
      </div>
    </div>
  );
}

export default App;