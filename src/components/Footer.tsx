import { Link } from "@tanstack/react-router";
import { Sparkles, Twitter, Instagram, Facebook, Linkedin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 dark:border-white/8 bg-gradient-soft dark:bg-[#0f1525]/80 theme-transition">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Mind<span className="text-gradient">Bloom</span></span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Your personal mental wellness companion. Bloom into your best self, one mindful moment at a time.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="social link" className="h-9 w-9 rounded-full glass dark:bg-white/5 dark:border-white/10 flex items-center justify-center hover:shadow-glow transition-shadow">
                  <Icon className="h-4 w-4 text-foreground/70" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li><Link to="/assessment" className="hover:text-foreground">Assessment</Link></li>
              <li><Link to="/activities" className="hover:text-foreground">Activities</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/hub" className="hover:text-foreground">Wellness Hub</Link></li>
              <li><Link to="/achievements" className="hover:text-foreground">Achievements</Link></li>
              <li><a href="#emergency" className="hover:text-foreground">Emergency Help</a></li>
              <li><a href="#community" className="hover:text-foreground">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>hello@mindbloom.app</li>
              <li>+1 (555) 123-4567</li>
              <li><Link to="/contact" className="hover:text-foreground">Get in touch</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 dark:border-white/8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} MindBloom. Crafted with <Heart className="h-3 w-3 text-primary fill-primary" /> for your well-being.
          </p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
