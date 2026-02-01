"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Shield,
  Heart,
  Phone,
  Mail,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Facebook
} from "lucide-react";

import { fadeInUp, viewport } from "@/components/marketing/animations";
import { GainzioLogo } from "../shared/logo";

export function SiteFooter() {
  return (
    <motion.footer
      className="bg-[#020617] text-white pt-16 pb-8 border-t border-white/5 font-sans relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
    >
      {/* Background Gradients/Mesh (Optional subtle branding) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Column 1: About Gainzio */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">About Gainzio</h3>
            </div>

            <div className="space-y-4">
              <GainzioLogo size="sm" />
              <p className="text-sm text-slate-400 leading-relaxed">
                Gainzio, powered by modern infrastructure, cultivates a futuristic earning ecosystem empowering individuals with tasks, financial tools, and digital skills — transforming the internet into a hub of opportunity.
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">Quick Links</h3>
            </div>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Dashboard", href: "/member/dashboard" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">Policies</h3>
            </div>
            <ul className="space-y-3">
              {[
                { label: "Terms of Use", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Payout Policy", href: "/payout-policy" },
                { label: "Content Guidelines", href: "/guidelines" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Features (Replacing Courses) */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">Features</h3>
            </div>
            <ul className="space-y-3">
              {[
                { label: "Verified Tasks", href: "/member/tasks" },
                { label: "Instant Wallet", href: "/member/wallet" },
                { label: "Referral System", href: "/member/referrals" },
                { label: "App Download", href: "/download" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>
          </div>

          {/* Column 5: Get in Touch */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">Get in Touch</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                <div>
                  <p className="text-lg font-semibold text-white">+91 97782 43093</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">support@gainzio.app</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">
                    Gainzio HQ, Bangalore<br />
                    Karnataka, India - 560001
                  </p>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              <Link href="#" className="p-2 bg-slate-800 rounded-full hover:bg-emerald-500 hover:text-white transition-all text-slate-400">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-full hover:bg-emerald-500 hover:text-white transition-all text-slate-400">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-full hover:bg-emerald-500 hover:text-white transition-all text-slate-400">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-full hover:bg-emerald-500 hover:text-white transition-all text-slate-400">
                <Youtube className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Gainzio Network. Made with <Heart className="w-3 h-3 inline text-red-500" fill="currentColor" /> for the future. All Rights Reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}
