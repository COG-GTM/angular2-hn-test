import { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    date: string;
    time: string;
    partySize: string;
    specialRequests: string;
}

const timeSlots = [
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '5:00 PM',
    '5:30 PM',
    '6:00 PM',
    '6:30 PM',
    '7:00 PM',
    '7:30 PM',
    '8:00 PM',
    '8:30 PM',
    '9:00 PM',
];

const partySizes = ['1', '2', '3', '4', '5', '6', '7', '8+'];

function Reservations() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        date: '',
        time: '',
        partySize: '',
        specialRequests: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div>
            {/* Hero */}
            <section className="relative h-80 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=500&fit=crop"
                    alt="Restaurant interior with warm lighting"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-dark-overlay flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="font-display text-5xl font-bold mb-3">Reservations</h1>
                        <p className="text-lg text-white/80 font-light">Reserve your table at Ichiban Ramen</p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-5 gap-16">
                    {/* Booking Form */}
                    <div className="col-span-3">
                        <h2 className="font-display text-3xl font-bold text-charcoal mb-2">Book a Table</h2>
                        <p className="text-warm-brown mb-8">
                            Fill out the form below and we will confirm your reservation within 24 hours.
                        </p>

                        {submitted ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                                <div className="text-4xl mb-4">🎉</div>
                                <h3 className="font-display text-2xl font-bold text-emerald-800 mb-2">
                                    Reservation Submitted!
                                </h3>
                                <p className="text-emerald-700">
                                    Thank you, <strong>{formData.name}</strong>! We will send a confirmation to{' '}
                                    <strong>{formData.email}</strong> shortly.
                                </p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({
                                            name: '',
                                            email: '',
                                            date: '',
                                            time: '',
                                            partySize: '',
                                            specialRequests: '',
                                        });
                                    }}
                                    className="mt-6 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                                >
                                    Make Another Reservation
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-stone bg-white focus:outline-none focus:ring-2 focus:ring-deep-red/30 focus:border-deep-red transition-colors"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-stone bg-white focus:outline-none focus:ring-2 focus:ring-deep-red/30 focus:border-deep-red transition-colors"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium text-charcoal mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            required
                                            min={today}
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-stone bg-white focus:outline-none focus:ring-2 focus:ring-deep-red/30 focus:border-deep-red transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="time" className="block text-sm font-medium text-charcoal mb-2">
                                            Time *
                                        </label>
                                        <select
                                            id="time"
                                            name="time"
                                            required
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-stone bg-white focus:outline-none focus:ring-2 focus:ring-deep-red/30 focus:border-deep-red transition-colors"
                                        >
                                            <option value="">Select time</option>
                                            {timeSlots.map((slot) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="partySize"
                                            className="block text-sm font-medium text-charcoal mb-2"
                                        >
                                            Party Size *
                                        </label>
                                        <select
                                            id="partySize"
                                            name="partySize"
                                            required
                                            value={formData.partySize}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-stone bg-white focus:outline-none focus:ring-2 focus:ring-deep-red/30 focus:border-deep-red transition-colors"
                                        >
                                            <option value="">Guests</option>
                                            {partySizes.map((size) => (
                                                <option key={size} value={size}>
                                                    {size} {size === '1' ? 'Guest' : 'Guests'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="specialRequests"
                                        className="block text-sm font-medium text-charcoal mb-2"
                                    >
                                        Special Requests
                                    </label>
                                    <textarea
                                        id="specialRequests"
                                        name="specialRequests"
                                        rows={3}
                                        value={formData.specialRequests}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-stone bg-white focus:outline-none focus:ring-2 focus:ring-deep-red/30 focus:border-deep-red transition-colors resize-none"
                                        placeholder="Allergies, dietary restrictions, special occasions..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-deep-red text-white font-semibold rounded-lg hover:bg-deep-red/90 transition-colors text-lg"
                                >
                                    Reserve My Table
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Sidebar: Location, Map, Hours */}
                    <div className="col-span-2 space-y-8">
                        {/* Map Placeholder */}
                        <div>
                            <h3 className="font-display text-xl font-semibold text-charcoal mb-4">Find Us</h3>
                            <div className="bg-stone rounded-xl h-64 flex items-center justify-center border border-stone">
                                <div className="text-center text-charcoal/50">
                                    <svg
                                        className="w-12 h-12 mx-auto mb-3 text-charcoal/30"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <p className="font-medium">Map Placeholder</p>
                                    <p className="text-sm mt-1">123 Noodle Lane, San Francisco, CA 94102</p>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <h3 className="font-display text-xl font-semibold text-charcoal mb-4">Location</h3>
                            <address className="not-italic text-charcoal/70 leading-relaxed">
                                <div className="flex items-start gap-3 mb-3">
                                    <svg
                                        className="w-5 h-5 text-deep-red mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <div>
                                        123 Noodle Lane
                                        <br />
                                        San Francisco, CA 94102
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <svg
                                        className="w-5 h-5 text-deep-red flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    <span>(415) 555-RAMEN</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg
                                        className="w-5 h-5 text-deep-red flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>hello@ichibanramen.com</span>
                                </div>
                            </address>
                        </div>

                        {/* Hours */}
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <h3 className="font-display text-xl font-semibold text-charcoal mb-4">Hours of Operation</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-stone/50">
                                    <span className="text-charcoal/80">Monday - Thursday</span>
                                    <span className="font-medium text-charcoal">11:30 AM - 9:30 PM</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-stone/50">
                                    <span className="text-charcoal/80">Friday - Saturday</span>
                                    <span className="font-medium text-charcoal">11:30 AM - 10:30 PM</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-stone/50">
                                    <span className="text-charcoal/80">Sunday</span>
                                    <span className="font-medium text-charcoal">12:00 PM - 9:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-charcoal/80">Happy Hour (Fri-Sat)</span>
                                    <span className="font-medium text-deep-red">4:00 PM - 6:00 PM</span>
                                </div>
                            </div>
                            <p className="text-xs text-charcoal/50 mt-4">
                                * Kitchen closes 30 minutes before closing time. Last seating is 45 minutes before close.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reservations;
