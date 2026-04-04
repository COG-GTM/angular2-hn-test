import { NavLink } from 'react-router-dom';

function Navbar() {
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `transition-colors duration-200 font-medium ${
            isActive
                ? 'text-deep-red border-b-2 border-deep-red pb-1'
                : 'text-charcoal hover:text-deep-red'
        }`;

    return (
        <nav className="bg-cream/95 backdrop-blur-sm border-b border-stone sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                <NavLink to="/menu" className="flex items-center gap-3 group">
                    <span className="text-3xl">🍜</span>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-charcoal tracking-wide group-hover:text-deep-red transition-colors">
                            Ichiban Ramen
                        </h1>
                        <p className="text-xs tracking-[0.3em] text-warm-brown uppercase -mt-1">
                            Authentic Japanese
                        </p>
                    </div>
                </NavLink>

                <div className="flex items-center gap-10">
                    <NavLink to="/menu" className={linkClass}>
                        Menu
                    </NavLink>
                    <NavLink to="/our-story" className={linkClass}>
                        Our Story
                    </NavLink>
                    <NavLink to="/reservations" className={linkClass}>
                        Reservations
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
