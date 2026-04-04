interface MenuItem {
    name: string;
    description: string;
    price: string;
    image: string;
    tag?: string;
}

interface MenuCategory {
    title: string;
    subtitle: string;
    items: MenuItem[];
}

const menuData: MenuCategory[] = [
    {
        title: 'Signature Bowls',
        subtitle: 'Our most beloved creations, perfected over years',
        items: [
            {
                name: 'Tonkotsu Classic',
                description:
                    'Rich, creamy pork bone broth simmered for 18 hours. Topped with chashu pork, soft-boiled egg, bamboo shoots, and scallions.',
                price: '$16',
                image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
                tag: 'Best Seller',
            },
            {
                name: 'Spicy Miso',
                description:
                    'Bold red miso broth with a kick of chili oil. Served with ground pork, corn, bean sprouts, and butter.',
                price: '$17',
                image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600&h=400&fit=crop',
            },
            {
                name: 'Shoyu Ramen',
                description:
                    'Light yet deeply savory soy sauce broth with dashi undertones. Adorned with nori, menma, naruto, and tender chicken.',
                price: '$15',
                image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop',
            },
            {
                name: 'Black Garlic Tonkotsu',
                description:
                    'Our signature tonkotsu enriched with roasted black garlic oil. Topped with braised pork belly, wood ear mushrooms, and pickled ginger.',
                price: '$18',
                image: 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?w=600&h=400&fit=crop',
                tag: "Chef's Pick",
            },
        ],
    },
    {
        title: 'Seasonal Specials',
        subtitle: 'Limited-time creations inspired by the seasons',
        items: [
            {
                name: 'Spring Truffle Shio',
                description:
                    'Delicate salt-based broth infused with truffle oil. Featuring asparagus, soft tofu, and shaved parmesan.',
                price: '$20',
                image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop',
                tag: 'Limited',
            },
            {
                name: 'Yuzu Citrus Ramen',
                description:
                    'Refreshing chicken broth brightened with yuzu zest. Served with shrimp tempura, watercress, and citrus oil.',
                price: '$19',
                image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop',
                tag: 'New',
            },
            {
                name: 'Lobster Tsukemen',
                description:
                    'Premium dipping ramen with rich lobster bisque-style broth. Cold noodles served alongside with lobster claw and seasonal vegetables.',
                price: '$24',
                image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&h=400&fit=crop',
                tag: 'Premium',
            },
        ],
    },
    {
        title: 'Sides & Small Plates',
        subtitle: 'Perfect companions to your bowl',
        items: [
            {
                name: 'Gyoza (6 pcs)',
                description: 'Pan-fried pork and cabbage dumplings with crispy bottoms. Served with ponzu dipping sauce.',
                price: '$9',
                image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&h=400&fit=crop',
            },
            {
                name: 'Karaage Chicken',
                description: 'Japanese-style fried chicken marinated in ginger and soy. Served with kewpie mayo and lemon.',
                price: '$10',
                image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop',
            },
            {
                name: 'Takoyaki (8 pcs)',
                description: 'Crispy octopus balls drizzled with takoyaki sauce, kewpie mayo, bonito flakes, and aonori.',
                price: '$8',
                image: 'https://images.unsplash.com/photo-1578028076641-2b74046d3251?w=600&h=400&fit=crop',
            },
            {
                name: 'Edamame',
                description: 'Steamed soybeans tossed with sea salt and a hint of chili flakes. Simple and addictive.',
                price: '$5',
                image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b8e0?w=600&h=400&fit=crop',
            },
            {
                name: 'Chashu Don',
                description: 'A bowl of steamed rice topped with our braised chashu pork, soft-boiled egg, and pickled vegetables.',
                price: '$11',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
            },
        ],
    },
];

function TagBadge({ tag }: { tag: string }) {
    const colorMap: Record<string, string> = {
        'Best Seller': 'bg-deep-red text-white',
        "Chef's Pick": 'bg-muted-gold text-charcoal',
        Limited: 'bg-warm-brown text-white',
        New: 'bg-emerald-600 text-white',
        Premium: 'bg-purple-700 text-white',
    };

    return (
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${colorMap[tag] ?? 'bg-stone text-charcoal'}`}>
            {tag}
        </span>
    );
}

function Menu() {
    return (
        <div>
            {/* Hero */}
            <section className="relative h-80 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=1600&h=500&fit=crop"
                    alt="Ramen bowls on a table"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-dark-overlay flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="font-display text-5xl font-bold mb-3">Our Menu</h1>
                        <p className="text-lg text-white/80 font-light">
                            Handcrafted bowls made with the finest ingredients
                        </p>
                    </div>
                </div>
            </section>

            {/* Menu Sections */}
            <div className="max-w-7xl mx-auto px-8 py-16">
                {menuData.map((category) => (
                    <section key={category.title} className="mb-20 last:mb-0">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl font-bold text-charcoal mb-2">{category.title}</h2>
                            <p className="text-warm-brown">{category.subtitle}</p>
                            <div className="w-16 h-0.5 bg-muted-gold mx-auto mt-4" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {category.items.map((item) => (
                                <div
                                    key={item.name}
                                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
                                >
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {item.tag && <TagBadge tag={item.tag} />}
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-display text-xl font-semibold text-charcoal">
                                                {item.name}
                                            </h3>
                                            <span className="text-deep-red font-bold text-lg ml-3 whitespace-nowrap">
                                                {item.price}
                                            </span>
                                        </div>
                                        <p className="text-sm text-charcoal/70 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

export default Menu;
