import { currentUser } from '../../data/mockData';

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

      {/* Story items — từ database */}
      {stories.map((story) => (
        <div key={story.id} className="story-item">
          <button className="story-btn" aria-label={`Xem tin của ${story.name}`}>
            <div className="story-ring">
              <div
                className="story-ring-inner story-ring-inner--avatar"
                style={{ background: story.color }}
              >
                <span className="story-initials">{story.initials}</span>
              </div>
            </div>
            <span className="story-name">{story.name}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
