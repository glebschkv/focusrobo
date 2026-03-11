const PARADE_PETS = ['bunny', 'chick', 'frog', 'capybara', 'cat', 'hedgehog', 'fox', 'corgi'];

export function Footer() {
  return (
    <footer className="site-footer py-12 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/app-icon.png" alt="PhoNo" style={{ width: 24, height: 24, borderRadius: 4 }} />
            <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>PhoNo</span>
          </div>

          <div className="flex gap-6 text-sm">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="mailto:hello@phono.app">Contact</a>
          </div>

          <div style={{ fontSize: 12 }}>
            &copy; {new Date().getFullYear()} PhoNo Inc.
          </div>
        </div>
      </div>

      {/* Pet parade */}
      <div className="pet-parade">
        {PARADE_PETS.map((pet, i) => (
          <img
            key={pet}
            src={`/pets/${pet}-baby.png`}
            alt=""
            className="pet-parade__pet"
            style={{ animationDelay: `${i * 2.5}s`, left: `${i * -50}px` }}
            loading="lazy"
          />
        ))}
      </div>
    </footer>
  );
}
