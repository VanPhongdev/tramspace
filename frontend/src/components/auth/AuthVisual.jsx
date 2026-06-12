/**
 * AuthVisual — phần visual bên trái (hoặc phải tùy trang) chứa
 * branding, floating cards, animations.
 *
 * Props:
 *  - cards : 'login' | 'register'  — chọn bộ floating card phù hợp
 */
export default function AuthVisual({ cards = 'login' }) {
  return (
    <section className="auth-visual" aria-hidden="true">
      <div className="auth-visual-content">
        {/* Headline */}
        <div className="auth-visual-headline">
          <h1>TramSpace</h1>
          <p>
            Khám phá không gian sáng tạo, kết nối cộng đồng và chia sẻ những
            khoảnh khắc đáng nhớ trong một môi trường tinh tế.
          </p>
        </div>

        {cards === 'login' ? <LoginCards /> : <RegisterCards />}
      </div>

      {/* Decorative blobs */}
      <div
        className="blob"
        style={{
          top: 40, right: 40,
          width: 128, height: 128,
          background: 'rgba(20,184,166,0.20)',
        }}
      />
      <div
        className="blob"
        style={{
          bottom: 80, left: 80,
          width: 192, height: 192,
          background: 'rgba(70,72,212,0.15)',
        }}
      />
    </section>
  );
}

/* ─── Login Floating Cards ─────────────────────────── */
function LoginCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        padding: 16,
      }}
    >
      {/* Card 1 — Article */}
      <div
        className="glass floating"
        style={{
          gridColumn: 'span 2',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxWidth: 400,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(20,184,166,0.20)',
              overflow: 'hidden', flexShrink: 0,
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG6WannLdHvVMEj8OaifwCUYwEr3IbhSs8btmLgcHcC3PkJCAsYzXAKKaR_6omzrTxeyfFMDK6rWYAbSEoGG59Xj9qzSAeJjmmloyQQ-NXCVloqXnggj5GyQvCew_QZ4IC5EIKkFWleVrFbprQxoEGeRgFFs_aiso5wVdXpq78JVcWtxDXdjx6npb45FhUs0ezDbZD88ZcBk7w0Y-FOHgiKCB3DD8tErMYXFUrYkVvza-HgubgUPHu2zf3qGOap-iE6yS3F1Nw69s"
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <p style={{ fontWeight: 500, fontSize: 14, color: '#161d1b' }}>Minh Tú</p>
            <p style={{ fontSize: 10, color: '#3c4947' }}>Vừa chia sẻ một bài viết</p>
          </div>
        </div>
        <h3 style={{ fontWeight: 600, fontSize: 20, color: '#161d1b', marginBottom: 8 }}>
          Bí quyết tối ưu hóa không gian làm việc
        </h3>
        <p
          style={{
            fontSize: 16, color: '#3c4947', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          Khám phá cách sắp xếp bàn làm việc giúp tăng 40% năng suất mỗi ngày...
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 16, color: '#006b5f' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>favorite</span>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat_bubble</span>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
        </div>
      </div>

      {/* Card 2 — Community */}
      <div
        className="glass floating-delayed"
        style={{
          borderRadius: 12, padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          marginTop: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: 'rgba(96,99,238,0.15)',
              padding: 8, borderRadius: 8,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#4648d4' }}>groups</span>
          </div>
          <p style={{ fontWeight: 500, fontSize: 14, color: '#161d1b' }}>Cộng đồng Design</p>
        </div>
        <p style={{ marginTop: 12, fontSize: 14, color: '#3c4947' }}>
          12 thành viên mới tham gia hôm nay.
        </p>
        <div style={{ marginTop: 16, display: 'flex' }}>
          {[
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAHcD5ZuUxs_do2pXsrnHO5vTYi-YwMf6fEYXmTOM-RDQEPLRHmmQC8yooxfxYyI11zjsQQPUq_-xr3KJGDHHI7c07C1baeArYbNUHHtNne23FA2tduYY1BPik4OVYc2mb9DLkjERWfsQf_6YJgR9lUcY2GaFEsqMbJFpTjTEK0pq3uWE1uiYi7Oy6w7AKGYW355UQ3mfMlmcAXQGi5RtryA5RHzIXxK37-fgq7ybRRMMHgg7j-y4RDrxH1Jw5qItaEHPVHSDU5DrY',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDNmuA3paY869hz1YzxlBpr5uy9-TSbQ9XPmiVO5redkY6JSfjOzIERAC8E4O4hTSRoXFz0suCecOK_pNQeo1Gg_esA3g2_4VFO1RRokVm6XaUJkpGurbPO1psTRfaG9ZQg_Q7wVzEu5iGPnEBYJrxk9CdAu6xnK8pWl5aoZPmFOGXIR1CrCR6J1VBVRPvqrgS3iaIWUjYaGevYgmeeZaEMcp104iXGWGBAWtykOM6Ta9qtO-vdux66mwCN_jxLdXxzjQV6BNCv7co',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCP7MhhL8bd0f-PWula5Cu8mGrxdI-ohznxkhHjxcaYHSs8dKiYXOZCjxAfcsj3L-2YwHBX4dIVHKXCY5CuJVrPX-wVYQPRuJhn3JgU5ZJHcfJfat8mF2D1j67IFVMbm-VoxH_a6LCsa4o5kgbqJJctV0QHFRk5d3fx1Hvvf-Hko5WHqoUaxjVlfaO9YzL6u3CXijSLsACDyC9Cuue1QxaY9QgSokeOQlOgU6-QNG_NJKPKt3lnXsPRj9WhlddUYgdWSb0vpEwNU_I',
          ].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid white',
                marginLeft: i === 0 ? 0 : -8,
              }}
            />
          ))}
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px solid white',
              marginLeft: -8,
              background: '#e3eae7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}
          >
            +9
          </div>
        </div>
      </div>

      {/* Card 3 — Messages */}
      <div
        className="glass floating-reverse"
        style={{
          borderRadius: 12, padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          marginTop: -32,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: '#006b5f',
            }}
          >
            Tin nhắn mới
          </span>
          <div
            className="pulse-dot"
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#ba1a1a' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e9efec', flexShrink: 0 }} />
          <div
            style={{
              flex: 1, background: '#eff5f2',
              padding: '6px 10px', borderRadius: 8,
              fontSize: 12, color: '#161d1b',
            }}
          >
            Chào bạn! Bạn đã xem bản thảo mới chưa?
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Register Floating Cards ──────────────────────── */
function RegisterCards() {
  return (
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Card 1 — Member */}
      <div
        className="glass-card floating-anim"
        style={{
          borderRadius: 12, padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVTfRNICzkD-9pHK4tpMrWV6R-BRaOGv5_9lE4taryBjVVIbv-n-nEbXT0j-hIZZh3unbUP6KqhrHJPoYFEIedI7RH7ZpUTbdQcmLKgrx0JAqnklh1YdmTprpTTZPIGDd-6b7j4fAQ46Tjw1PH3EuLZhjVrfpvHDrbnUOBMbWX5o6EG-A_AstrGWSH6F9uXm92LvYGlotRqK2PR6Kbk8UkaRSIFQxPcmRbvT2a0yj1Ug4jWLzu9Iv9PAbQPMFRkGuxicVoStwFU_g"
          alt="Member Avatar"
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <p style={{ fontWeight: 500, fontSize: 14, color: '#161d1b' }}>Minh Anh</p>
          <p style={{ fontWeight: 600, fontSize: 12, color: '#3c4947', letterSpacing: '0.05em' }}>
            Vừa tham gia cộng đồng
          </p>
        </div>
      </div>

      {/* Card 2 — Post */}
      <div
        className="glass-card floating-anim-delayed"
        style={{
          borderRadius: 12, padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          marginTop: 32,
        }}
      >
        <div
          style={{
            width: '100%', height: 120, borderRadius: 8,
            overflow: 'hidden', marginBottom: 12,
          }}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyiiXu9-wUCyOprOP8DuyIRxjn0NJ52iJQRYteUn1wmpe5xKI-MZ3dRmEPOP3EX0NSQQ_2lgmzNNhozaiEHJIuut5W2SFjdvAfW7ytqNsZVUBrN05ZOhGW3EhiP1oeHI_3TUzwhLBibDegi4AHjnuzsETJNoh3I3qb3RmSYNMFYFasGPLSxtIl-0f3lI7y3HDJhoYhKO05kGjO-0EWIOes8GKkKwEE9GQmpjip2dq73vQEg6Z1ISXtXBfl5PvenXV39nJRqh-S8pE"
            alt="Post"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <p style={{ fontWeight: 500, fontSize: 14, color: '#161d1b' }}>Xu hướng thiết kế 2024</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16, color: '#006b5f', fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <span style={{ fontSize: 12, color: '#3c4947', fontWeight: 600 }}>1.2k</span>
        </div>
      </div>

      {/* Card 3 — Message bubble */}
      <div
        className="glass-card floating-anim"
        style={{
          borderRadius: 12, padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          position: 'absolute', bottom: -48, right: 0,
          width: 256,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <span className="material-symbols-outlined" style={{ color: '#006b5f' }}>chat</span>
          <p style={{ fontSize: 16, color: '#161d1b', fontStyle: 'italic', lineHeight: 1.5 }}>
            "Một trải nghiệm hoàn toàn mới lạ cho những người yêu thích sự tối giản..."
          </p>
        </div>
      </div>
    </div>
  );
}
