import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import MetacogBuilder from "./pages/MetacogBuilder";
import PersonalAssistant from "./pages/PersonalAssistant";
import FileViewer from "./pages/FileViewer";
import BibleStudy from "./pages/BibleStudy";
import BookWriter from "./pages/BookWriter";
import Settings from "./pages/Settings";
import Accounts from "./pages/Accounts";
import Subscription from "./pages/Subscription";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="metacog-builder" element={<MetacogBuilder />} />
          <Route path="personal-assistant" element={<PersonalAssistant />} />
          <Route path="file-viewer" element={<FileViewer />} />
          <Route path="bible-study" element={<BibleStudy />} />
          <Route path="book-writer" element={<BookWriter />} />
          <Route path="settings" element={<Settings />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
