import { HashRouter, Route, Routes } from "react-router-dom";
import { LocaleProvider } from "./hooks/useLocale";
import { TranslatorProvider } from "./hooks/useTranslator";
import { BookmarksProvider } from "./hooks/useBookmarks";
import { SoundProvider } from "./hooks/useSound";
import { BootScreen } from "./screens/BootScreen";
import { NewsListScreen } from "./screens/NewsListScreen";
import { ArticleScreen } from "./screens/ArticleScreen";
import { BookmarksScreen } from "./screens/BookmarksScreen";

export default function App() {
  return (
    <LocaleProvider>
      <TranslatorProvider>
        <SoundProvider>
          <BookmarksProvider>
            {/* HashRouter keeps deep links working on GitHub Pages (no server rewrites). */}
            <HashRouter>
              <div className="crt-scanlines min-h-dvh">
                <Routes>
                  <Route path="/" element={<BootScreen />} />
                  <Route path="/news" element={<NewsListScreen />} />
                  <Route path="/news/:id" element={<ArticleScreen />} />
                  <Route path="/bookmarks" element={<BookmarksScreen />} />
                </Routes>
              </div>
            </HashRouter>
          </BookmarksProvider>
        </SoundProvider>
      </TranslatorProvider>
    </LocaleProvider>
  );
}
