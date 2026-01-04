import useStorybook from "../../hooks/useStorybook";
import StorybookBook from "./StorybookBook";
import StorybookNav from "./StorybookNav";
import StorybookAudioBar from "./StorybookAudioBar";
import "./storybook-reader.css";

export default function StorybookReaderPage() {
  const sb = useStorybook();
  const page = sb.pages[sb.index];

  return (
    <div className="reader-root">
      {/* HEADER */}
      <div className="reader-header">
        <h1>📘 Storybook</h1>
        {sb.status && (
          <span className={`status ${sb.status.toLowerCase()}`}>
            {sb.status}
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="reader-body">
        <StorybookBook page={page} />
      </div>

      {/* AUDIO */}
      {page?.audioUrl && (
        <StorybookAudioBar audioUrl={page.audioUrl} />
      )}

      {/* NAV */}
      <StorybookNav
        index={sb.index}
        total={sb.pages.length}
        onPrev={sb.prevPage}
        onNext={sb.nextPage}
      />
    </div>
  );
}
