/**
 * StoryStrip — thanh story cuộn ngang.
 * Props: stories — array từ /api/stories/feed
 */
export default function StoryStrip({ stories = [] }) {
  return (
    <div className="story-strip">
      {/* Nút thêm story của bạn */}
      <div className="story-item">
        <button className="story-add-btn" aria-label="Thêm tin của bạn">
          <div className="story-ring story-ring--add">
            <div className="story-ring-inner">
              <span className="material-symbols-outlined">add</span>
            </div>
          </div>
          <span className="story-name">Tin của bạn</span>
        </button>
      </div>

      {/* Story feature chưa phát triển nên chưa hiển thị user stories */}
    </div>
  );
}
