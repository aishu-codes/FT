import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChefHat,
  CircleUserRound,
  Clock3,
  Compass,
  Flame,
  Gift,
  Heart,
  Leaf,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UtensilsCrossed,
  X,
} from "lucide-react";

type Category = "All" | "Bowls" | "Wraps" | "Small plates" | "Drinks";

type MenuItem = {
  id: number;
  name: string;
  category: Exclude<Category, "All">;
  description: string;
  price: number;
  rating: number;
  time: string;
  tags: string[];
  image: string;
  accent: string;
  spicy?: boolean;
};

type CartItem = MenuItem & { quantity: number };

const categories: { label: Category; icon: string }[] = [
  { label: "All", icon: "✦" },
  { label: "Bowls", icon: "◒" },
  { label: "Wraps", icon: "◉" },
  { label: "Small plates", icon: "◌" },
  { label: "Drinks", icon: "◍" },
];

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Miso crunch bowl",
    category: "Bowls",
    description: "Brown rice, charred broccoli, edamame, crispy tofu, sesame miso.",
    price: 14.5,
    rating: 4.9,
    time: "12 min",
    tags: ["Vegan", "High protein"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=88",
    accent: "from-[#f3cf73] to-[#ed9f43]",
    spicy: true,
  },
  {
    id: 2,
    name: "Citrus salmon bowl",
    category: "Bowls",
    description: "Sushi rice, roasted salmon, avocado, pickled ginger, yuzu ponzu.",
    price: 18.75,
    rating: 4.8,
    time: "16 min",
    tags: ["Gluten-free", "Popular"],
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=88",
    accent: "from-[#efb075] to-[#d96a50]",
  },
  {
    id: 3,
    name: "Green goddess wrap",
    category: "Wraps",
    description: "Herb falafel, crunchy greens, avocado, cucumber, green tahini.",
    price: 12.9,
    rating: 4.7,
    time: "10 min",
    tags: ["Vegan", "Fresh"],
    image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=900&q=88",
    accent: "from-[#d5e36d] to-[#76a76b]",
  },
  {
    id: 4,
    name: "Kimchi chicken toastie",
    category: "Small plates",
    description: "Sourdough, gochujang chicken, melted cheddar, kimchi slaw.",
    price: 13.5,
    rating: 4.9,
    time: "14 min",
    tags: ["Chef's pick", "Spicy"],
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=88",
    accent: "from-[#e9956e] to-[#bd4f3c]",
    spicy: true,
  },
  {
    id: 5,
    name: "Cucumber lime fizz",
    category: "Drinks",
    description: "Fresh cucumber, lime, mint, sparkling water, agave.",
    price: 5.5,
    rating: 4.6,
    time: "4 min",
    tags: ["Refreshing", "Vegan"],
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=88",
    accent: "from-[#c8dd83] to-[#7aaf87]",
  },
  {
    id: 6,
    name: "Sesame sweet potato fries",
    category: "Small plates",
    description: "Roasted sweet potato, sesame furikake, lime leaf aioli.",
    price: 8.25,
    rating: 4.8,
    time: "9 min",
    tags: ["Shareable", "Vegetarian"],
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=88",
    accent: "from-[#f4bf65] to-[#de7a45]",
  },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = menuItems.filter((item) => {
      const inCategory = activeCategory === "All" || item.category === activeCategory;
      const inSearch = !normalizedSearch || `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(normalizedSearch);
      return inCategory && inSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "fastest") return Number.parseInt(a.time) - Number.parseInt(b.time);
      return b.rating - a.rating;
    });
  }, [activeCategory, search, sort]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 35 || subtotal === 0 ? 0 : 2.95;
  const total = subtotal + delivery;

  function addToCart(item: MenuItem) {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) return current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      return [...current, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to your bag`, { description: "You can customize it in your bag." });
  }

  function updateQuantity(id: number, delta: number) {
    setCart((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }

  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]);
    toast(favorites.includes(id) ? "Removed from favorites" : "Saved for later");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f5ee] text-[#25261e]">
      <div className="bg-[#25261e] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f8d46c]">
        Free delivery on orders over $35 · Made fresh, never frozen
      </div>

      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f5ee]/90 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between gap-6">
          <button className="group flex items-center gap-3" onClick={() => scrollToSection("top")} aria-label="Ember Bowl home">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#f1c654] text-[#25261e] shadow-[4px_4px_0_#25261e] transition-transform group-active:translate-y-0.5 group-active:shadow-[2px_2px_0_#25261e]">
              <Flame size={22} strokeWidth={2.5} />
            </span>
            <span className="text-left leading-none">
              <span className="block font-display text-[21px] font-bold tracking-tight">ember bowl</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-[#77796e]">bright food, good mood</span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <button className="transition-colors hover:text-[#d95d38]" onClick={() => scrollToSection("menu")}>Menu</button>
            <button className="transition-colors hover:text-[#d95d38]" onClick={() => scrollToSection("why-us")}>Our approach</button>
            <button className="transition-colors hover:text-[#d95d38]" onClick={() => scrollToSection("locations")}>Find us</button>
          </nav>

          <div className="flex items-center gap-2">
            <button className="hidden h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-sm font-semibold transition-colors hover:border-[#d95d38] hover:text-[#d95d38] sm:flex" onClick={() => isAuthenticated ? toast(`Welcome back, ${user?.name?.split(" ")[0] ?? "friend"}!`) : startLogin()}>
              <CircleUserRound size={17} />
              <span>{isAuthenticated ? "Account" : "Sign in"}</span>
            </button>
            <button className="relative grid h-11 w-11 place-items-center rounded-full bg-[#25261e] text-[#f8d46c] transition-transform hover:-translate-y-0.5" onClick={() => setIsCartOpen(true)} aria-label="Open shopping bag">
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#e96842] px-1 text-[10px] font-bold text-white">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="container grid gap-12 pb-20 pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="relative z-10 max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9d5c8] bg-white/60 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#75776a]">
              <Sparkles size={14} className="text-[#dd683c]" />
              The fresh side of fast food
            </div>
            <h1 className="max-w-[650px] font-display text-[clamp(3.6rem,7vw,6.9rem)] font-black leading-[0.89] tracking-[-0.065em] text-[#25261e]">
              Good food<br /><span className="relative inline-block text-[#dc603a]">for right now<span className="absolute -bottom-1 left-1/4 h-2 w-3/4 -rotate-2 rounded-full bg-[#d7e463]" /></span>
            </h1>
            <p className="mt-8 max-w-md text-[17px] leading-7 text-[#67695e]">Big flavor, thoughtful ingredients, and zero sad desk lunches. Order a little sunshine for delivery or pickup.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={() => scrollToSection("menu")} className="h-12 rounded-full bg-[#dc603a] px-6 text-sm font-bold text-white shadow-[4px_4px_0_#25261e] transition-all hover:bg-[#c9502f] hover:shadow-[2px_2px_0_#25261e] active:translate-y-0.5">
                Order something good <ArrowRight size={17} className="ml-1" />
              </Button>
              <button onClick={() => scrollToSection("why-us")} className="flex h-12 items-center gap-2 rounded-full px-5 text-sm font-bold transition-colors hover:bg-white/70">How it works <ChevronDown size={17} /></button>
            </div>
            <div className="mt-10 flex items-center gap-5 text-sm text-[#73766b]">
              <div className="flex -space-x-2">
                {["https://i.pravatar.cc/80?img=32", "https://i.pravatar.cc/80?img=12", "https://i.pravatar.cc/80?img=47"].map((src) => <img key={src} src={src} alt="Ember Bowl customer" className="h-8 w-8 rounded-full border-2 border-[#f7f5ee] object-cover" />)}
              </div>
              <span><strong className="text-[#25261e]">4.9/5</strong> from 2,000+ happy eaters</span>
            </div>
          </div>

          <div className="relative min-h-[460px] lg:min-h-[580px]">
            <div className="absolute right-0 top-2 h-[92%] w-[88%] rotate-3 rounded-[42px] bg-[#d7e463]" />
            <div className="absolute right-[7%] top-8 h-[88%] w-[87%] -rotate-3 overflow-hidden rounded-[42px] border-[10px] border-white bg-[#efb165] shadow-[0_24px_70px_rgba(48,44,27,0.16)]">
              <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90" alt="Colorful rice bowl with greens and roasted vegetables" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-7 left-7 text-white"><p className="font-display text-3xl font-bold">Lunch, leveled up.</p><p className="mt-1 text-sm text-white/80">The miso crunch bowl</p></div>
            </div>
            <div className="absolute -left-3 bottom-16 z-10 flex rotate-[-7deg] items-center gap-3 rounded-2xl border-4 border-[#25261e] bg-[#f8d46c] px-4 py-3 shadow-[5px_5px_0_#25261e] sm:left-0">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#25261e] text-[#f8d46c]"><Truck size={18} /></span>
              <span><span className="block text-[10px] font-black uppercase tracking-[0.14em]">On its way</span><span className="block font-display text-lg font-bold">to your door</span></span>
            </div>
            <div className="absolute -right-1 top-16 z-10 grid h-28 w-28 -rotate-12 place-items-center rounded-full border-4 border-[#25261e] bg-[#dc603a] text-center text-white shadow-[5px_5px_0_#25261e] sm:right-3">
              <span><span className="block text-[10px] font-black uppercase tracking-[0.14em]">made with</span><span className="block font-display text-2xl font-bold leading-none">good</span><span className="block font-display text-2xl font-bold leading-none">energy</span></span>
            </div>
          </div>
        </section>

        <section id="menu" className="scroll-mt-24 bg-[#25261e] py-20 text-white lg:py-24">
          <div className="container">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#f1c654]">The good stuff</p><h2 className="font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">Pick your mood.</h2></div>
              <p className="max-w-sm text-sm leading-6 text-white/55">Everything is cooked to order, packed with care, and ready when you are.</p>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => <button key={category.label} onClick={() => setActiveCategory(category.label)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${activeCategory === category.label ? "bg-[#f1c654] text-[#25261e]" : "bg-white/10 text-white/65 hover:bg-white/15 hover:text-white"}`}><span>{category.icon}</span>{category.label}</button>)}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu" className="h-10 w-full rounded-full border border-white/10 bg-white/10 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f1c654]" /></div>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-full border border-white/10 bg-[#25261e] px-3 text-xs font-semibold text-white/65 outline-none focus:border-[#f1c654]"><option value="recommended">Recommended</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="fastest">Fastest</option></select>
              </div>
            </div>

            {filteredItems.length > 0 ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredItems.map((item, index) => <article key={item.id} className="group overflow-hidden rounded-[24px] bg-[#32332a] transition-transform duration-200 hover:-translate-y-1" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="relative aspect-[1.15] overflow-hidden"><img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" /><button onClick={() => toggleFavorite(item.id)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-[#f1c654] hover:text-[#25261e]" aria-label={`Save ${item.name}`}><Heart size={17} fill={favorites.includes(item.id) ? "currentColor" : "none"} /></button>{item.spicy && <span className="absolute bottom-3 left-3 rounded-full bg-[#dc603a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">A little spicy</span>}</div>
              <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-[24px] font-bold leading-none text-white">{item.name}</h3><p className="mt-2 text-sm leading-5 text-white/55">{item.description}</p></div><span className="whitespace-nowrap font-display text-xl font-bold text-[#f1c654]">{money.format(item.price)}</span></div><div className="mt-5 flex items-center justify-between"><div className="flex items-center gap-3 text-xs font-semibold text-white/50"><span className="flex items-center gap-1 text-[#f1c654]"><Star size={13} fill="currentColor" />{item.rating}</span><span className="flex items-center gap-1"><Clock3 size={13} />{item.time}</span></div><button onClick={() => addToCart(item)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f1c654] text-[#25261e] transition-all hover:bg-white active:scale-95" aria-label={`Add ${item.name} to bag`}><Plus size={18} /></button></div><div className="mt-4 flex flex-wrap gap-1.5">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/45">{tag}</span>)}</div></div>
            </article>)}</div> : <div className="mt-10 rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center"><p className="font-display text-2xl font-bold">Nothing on the pass yet</p><p className="mt-2 text-sm text-white/55">Try a different search or category.</p><button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-5 rounded-full bg-[#f1c654] px-5 py-2 text-sm font-bold text-[#25261e]">Reset menu</button></div>}
          </div>
        </section>

        <section id="why-us" className="scroll-mt-24 bg-[#f1c654] py-20 lg:py-24">
          <div className="container grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#7d6422]">Why Ember Bowl</p><h2 className="max-w-sm font-display text-5xl font-black leading-[0.95] tracking-[-0.05em] text-[#25261e]">Fast food with a little more feeling.</h2><p className="mt-6 max-w-sm text-[15px] leading-7 text-[#625326]">We believe convenience should still taste like someone cared. That means bright produce, clever recipes, and food that travels well.</p><button onClick={() => toast("Our ingredient story is coming soon")} className="mt-7 flex items-center gap-2 text-sm font-black text-[#25261e] underline decoration-2 underline-offset-4">Meet the makers <ArrowRight size={16} /></button></div>
            <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-[24px] bg-[#25261e] p-6 text-white sm:translate-y-7"><Leaf className="text-[#d7e463]" size={24} /><h3 className="mt-10 font-display text-2xl font-bold">Bright by default</h3><p className="mt-3 text-sm leading-6 text-white/55">Whole ingredients, bold sauces, no beige food energy.</p></div><div className="rounded-[24px] bg-[#e96842] p-6 text-white"><ChefHat className="text-white" size={24} /><h3 className="mt-10 font-display text-2xl font-bold">Made to order</h3><p className="mt-3 text-sm leading-6 text-white/75">Your bowl starts cooking after you click order.</p></div><div className="rounded-[24px] bg-[#f7f5ee] p-6 text-[#25261e] sm:translate-y-7"><Gift className="text-[#dc603a]" size={24} /><h3 className="mt-10 font-display text-2xl font-bold">Feel-good perks</h3><p className="mt-3 text-sm leading-6 text-[#717367]">Earn points every bite and unlock very tasty surprises.</p></div></div>
          </div>
        </section>

        <section id="locations" className="scroll-mt-24 bg-[#f7f5ee] py-20 lg:py-24">
          <div className="container grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="relative overflow-hidden rounded-[28px] bg-[#dbdfb9] p-5 sm:p-8"><div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border-[20px] border-[#f1c654]/60" /><div className="relative overflow-hidden rounded-[20px] bg-[#9baa7a] p-7 sm:p-10"><div className="grid aspect-[1.6] place-items-center rounded-[16px] border border-white/30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.32)_1px,transparent_1px)] [background-size:22px_22px] text-center text-white"><div><MapPin size={34} className="mx-auto" /><p className="mt-3 font-display text-3xl font-bold">Brooklyn · Austin · Chicago</p><p className="mt-2 text-sm text-white/70">More good food coming your way</p></div></div></div></div>
            <div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#dc603a]">Eat in, take out</p><h2 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.05em]">Come say<br />hi IRL.</h2><p className="mt-6 max-w-md text-[15px] leading-7 text-[#717367]">Need your food now-now? Pick up from a neighborhood kitchen and skip the delivery wait.</p><div className="mt-7 flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d7e463]"><Compass size={21} /></div><div><p className="text-sm font-bold">Find your closest bowl</p><p className="mt-0.5 text-xs text-[#888b7d]">Use your location to see pickup times</p></div><ArrowRight className="ml-auto text-[#dc603a]" size={18} /></div></div>
          </div>
        </section>
      </main>

      <footer className="bg-[#25261e] py-10 text-white"><div className="container flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1c654] text-[#25261e]"><Flame size={20} /></span><span className="font-display text-xl font-bold">ember bowl</span></div><p className="mt-3 max-w-xs text-sm leading-6 text-white/45">Bright food for busy people, made with care in your neighborhood.</p></div><div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-white/60"><button onClick={() => toast("FAQ is coming soon")}>FAQ</button><button onClick={() => toast("Support is coming soon")}>Support</button><button onClick={() => toast("Privacy page is coming soon")}>Privacy</button><button onClick={() => toast("Instagram link coming soon")}>Instagram</button></div><p className="text-xs text-white/35">© 2026 Ember Bowl</p></div></footer>

      {isCartOpen && <div className="fixed inset-0 z-50"><button className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} aria-label="Close cart" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f7f5ee] text-[#25261e] shadow-2xl"><div className="flex items-center justify-between border-b border-black/8 px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dc603a]">Your order</p><h2 className="mt-1 font-display text-3xl font-bold">The good bag</h2></div><button onClick={() => setIsCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-black/5 hover:bg-black/10" aria-label="Close cart"><X size={19} /></button></div><div className="flex-1 overflow-y-auto px-6 py-5">{cart.length === 0 ? <div className="grid h-full content-center justify-items-center text-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f1c654]"><ShoppingBag size={28} /></div><h3 className="mt-5 font-display text-2xl font-bold">Your bag is waiting.</h3><p className="mt-2 max-w-xs text-sm leading-6 text-[#77796e]">Add a bowl, a wrap, or a little something extra to get started.</p><button onClick={() => { setIsCartOpen(false); scrollToSection("menu"); }} className="mt-6 rounded-full bg-[#25261e] px-5 py-3 text-sm font-bold text-white">Browse the menu</button></div> : <div className="space-y-4">{cart.map((item) => <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3"><img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="truncate font-bold">{item.name}</h3><span className="font-bold">{money.format(item.price * item.quantity)}</span></div><p className="mt-1 text-xs text-[#8a8c80]">{item.tags[0]} · {item.time}</p><div className="mt-3 flex items-center gap-2"><button onClick={() => updateQuantity(item.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-black/10" aria-label={`Decrease ${item.name}`}><Minus size={13} /></button><span className="w-5 text-center text-sm font-bold">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-[#f1c654]" aria-label={`Increase ${item.name}`}><Plus size={13} /></button></div></div></div>)}</div>}</div>{cart.length > 0 && <div className="border-t border-black/8 bg-white px-6 py-5"><div className="space-y-2 text-sm"><div className="flex justify-between text-[#77796e]"><span>Subtotal</span><span>{money.format(subtotal)}</span></div><div className="flex justify-between text-[#77796e]"><span>Delivery</span><span>{delivery === 0 ? "Free" : money.format(delivery)}</span></div><div className="mt-3 flex justify-between border-t border-black/8 pt-3 font-display text-2xl font-bold"><span>Total</span><span>{money.format(total)}</span></div></div><button onClick={() => toast.success("Checkout is ready to connect", { description: "Payment and address flows can be added next." })} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#dc603a] text-sm font-bold text-white transition-colors hover:bg-[#c9502f]">Continue to checkout <ArrowRight size={16} /></button><p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-[#8a8c80]"><Check size={13} className="text-[#719553]" /> Secure, encrypted checkout</p></div>}</aside></div>}
    </div>
  );
}
