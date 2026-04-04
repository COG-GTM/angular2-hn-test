interface Milestone {
    year: string;
    title: string;
    description: string;
}

const milestones: Milestone[] = [
    {
        year: '2012',
        title: 'The Journey Begins',
        description:
            'Chef Takeshi Yamamoto leaves his acclaimed position at a Michelin-starred restaurant in Tokyo to pursue his dream of bringing authentic ramen to San Francisco.',
    },
    {
        year: '2013',
        title: 'Perfecting the Broth',
        description:
            'After a year of experimenting with over 200 broth variations, Chef Takeshi finally perfects his signature 18-hour tonkotsu recipe using locally sourced pork bones.',
    },
    {
        year: '2015',
        title: 'Grand Opening',
        description:
            'Ichiban Ramen opens its doors on Noodle Lane. The first week sees a line around the block, with all 40 seats filled every night.',
    },
    {
        year: '2017',
        title: 'SF Weekly Best Ramen',
        description:
            'Named "Best Ramen in San Francisco" by SF Weekly, solidifying our place in the city\'s vibrant food scene.',
    },
    {
        year: '2019',
        title: 'Farm Partnerships',
        description:
            'We establish direct partnerships with local farms in Sonoma County to source organic vegetables, eggs, and heritage pork for our bowls.',
    },
    {
        year: '2022',
        title: 'Expansion & Innovation',
        description:
            'Launch of our seasonal menu program and expanded kitchen, allowing us to experiment with new flavors while honoring tradition.',
    },
    {
        year: '2025',
        title: '10th Anniversary',
        description:
            'Celebrating a decade of serving the community. Over 500,000 bowls served and counting. A new chapter begins.',
    },
];

function OurStory() {
    return (
        <div>
            {/* Hero */}
            <section className="relative h-80 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1554502078-ef0fc409efce?w=1600&h=500&fit=crop"
                    alt="Japanese restaurant interior"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-dark-overlay flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="font-display text-5xl font-bold mb-3">Our Story</h1>
                        <p className="text-lg text-white/80 font-light">A passion for ramen, rooted in tradition</p>
                    </div>
                </div>
            </section>

            {/* Origin Story */}
            <section className="max-w-7xl mx-auto px-8 py-20">
                <div className="grid grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-charcoal mb-6">
                            From Tokyo to San Francisco
                        </h2>
                        <div className="space-y-4 text-charcoal/80 leading-relaxed">
                            <p>
                                Ichiban Ramen was born from a simple belief: that a bowl of ramen can be more than just a
                                meal — it can be an experience that warms the soul. Our founder, Chef Takeshi Yamamoto,
                                spent over 15 years mastering the art of ramen in Japan before bringing his craft across
                                the Pacific.
                            </p>
                            <p>
                                Growing up in his grandmother's kitchen in Fukuoka, Takeshi learned that great ramen
                                starts with patience. Her tonkotsu broth simmered for an entire day, filling the house
                                with an aroma that drew neighbors from blocks away. That memory became the foundation of
                                everything we do at Ichiban.
                            </p>
                            <p>
                                When Takeshi arrived in San Francisco in 2012, he was struck by the city's love for
                                authentic food and its willingness to embrace new flavors. He knew this was the place to
                                share his family's ramen tradition with the world.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=700&fit=crop"
                            alt="Chef Takeshi preparing ramen"
                            className="rounded-xl shadow-xl w-full h-[500px] object-cover"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-deep-red text-white p-6 rounded-lg shadow-lg">
                            <p className="font-display text-lg font-semibold">Chef Takeshi Yamamoto</p>
                            <p className="text-sm text-white/80">Founder & Head Chef</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="bg-charcoal text-white py-20">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl font-bold mb-4">Our Philosophy</h2>
                        <div className="w-16 h-0.5 bg-muted-gold mx-auto" />
                    </div>

                    <div className="grid grid-cols-2 gap-16">
                        <div className="bg-white/5 rounded-xl p-10 border border-white/10">
                            <div className="text-4xl mb-4">🍲</div>
                            <h3 className="font-display text-2xl font-semibold mb-4">The Broth</h3>
                            <p className="text-white/70 leading-relaxed">
                                Our tonkotsu broth is the heart and soul of Ichiban. We simmer premium pork bones for a
                                minimum of 18 hours, coaxing out every ounce of collagen and flavor. The result is a
                                broth so rich and creamy that it coats every noodle perfectly. We never use shortcuts,
                                concentrates, or artificial flavors — just bones, water, time, and dedication.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-10 border border-white/10">
                            <div className="text-4xl mb-4">🍜</div>
                            <h3 className="font-display text-2xl font-semibold mb-4">The Noodles</h3>
                            <p className="text-white/70 leading-relaxed">
                                We make our noodles fresh in-house every morning using a blend of premium Japanese flour,
                                kansui (alkaline mineral water), and free-range eggs. Each batch is carefully kneaded,
                                rested, and cut to achieve the perfect texture — firm with a satisfying chew that holds
                                up beautifully in our rich broths. The noodle is the vessel that carries the broth to
                                your palate, and we treat it with the respect it deserves.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="max-w-4xl mx-auto px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl font-bold text-charcoal mb-2">Our Journey</h2>
                    <p className="text-warm-brown">A decade of crafting unforgettable bowls</p>
                    <div className="w-16 h-0.5 bg-muted-gold mx-auto mt-4" />
                </div>

                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[120px] top-0 bottom-0 w-px bg-stone" />

                    <div className="space-y-12">
                        {milestones.map((milestone, index) => (
                            <div key={milestone.year} className="flex gap-8 items-start">
                                <div className="w-[100px] flex-shrink-0 text-right">
                                    <span className="font-display text-2xl font-bold text-deep-red">
                                        {milestone.year}
                                    </span>
                                </div>
                                <div className="relative flex-shrink-0">
                                    <div className="w-3 h-3 rounded-full bg-muted-gold border-2 border-cream mt-2" />
                                </div>
                                <div className={`pb-8 ${index === milestones.length - 1 ? 'pb-0' : ''}`}>
                                    <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
                                        {milestone.title}
                                    </h3>
                                    <p className="text-charcoal/70 leading-relaxed">{milestone.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default OurStory;
