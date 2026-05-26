"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [markedCount, setMarkedCount] = useState(0);
  const [error, setError] = useState("");
  const [loadingCount, setLoadingCount] = useState(false);

  // Unread count fetch karo login hone ke baad
  const fetchCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const res = await fetch("/api/gmail/count");
      const data = await res.json();
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
        setUserEmail(data.email || "");
      }
    } catch {
      setUnreadCount(null);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchCount();
  }, [session, fetchCount]);

  // Mark all as read button
  const handleMarkRead = async () => {
    setIsRunning(true);
    setError("");
    setIsDone(false);
    try {
      const res = await fetch("/api/gmail/mark-read", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMarkedCount(data.totalMarked);
        setUnreadCount(0);
        setIsDone(true);
      } else {
        setError(data.error || "Kuch gadbad ho gayi. Dobara try karo.");
      }
    } catch {
      setError("Network error. Internet check karo aur dobara try karo.");
    } finally {
      setIsRunning(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // ── LOGIN PAGE ──────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo / Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gmail Cleaner</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Saare unread emails ek click mein mark as read karo
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Shuru karo</h2>
            <p className="text-gray-500 text-sm mb-6">
              Apne Gmail account se login karo
            </p>

            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {/* Google Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google se Login karo
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Hum sirf unread emails read karte hain — koi data store nahi hota.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: "⚡", title: "Instant", desc: "Ek click mein" },
              { icon: "🔒", title: "Secure", desc: "OAuth 2.0" },
              { icon: "🆓", title: "Free", desc: "Bilkul free" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="text-xl mb-1">{f.icon}</div>
                <div className="text-xs font-semibold text-gray-900">{f.title}</div>
                <div className="text-xs text-gray-500">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD (logged in) ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Gmail Cleaner</span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            Logout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            {session.user?.image && (
              <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="font-semibold text-gray-900 text-sm">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{userEmail || session.user?.email}</p>
            </div>
          </div>

          {/* Unread Count Card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-gray-500 mb-1">Abhi unread emails hain</p>
            {loadingCount ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <p className="text-4xl font-bold text-blue-600">
                {unreadCount !== null ? unreadCount.toLocaleString() : "—"}
              </p>
            )}
            {unreadCount !== null && !loadingCount && (
              <p className="text-xs text-gray-400 mt-1">
                {unreadCount === 0 ? "Inbox saaf hai! 🎉" : "unread emails inbox mein"}
              </p>
            )}
          </div>

          {/* Success state */}
          {isDone && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-green-700 font-semibold text-sm">
                ✅ {markedCount.toLocaleString()} emails mark as read ho gaye!
              </p>
              <p className="text-green-600 text-xs mt-1">Inbox ab saaf hai!</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Main Action Button */}
          <button
            onClick={handleMarkRead}
            disabled={isRunning || unreadCount === 0}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all text-sm
              ${isRunning
                ? "bg-blue-400 cursor-not-allowed"
                : unreadCount === 0
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mark ho rahe hain... thoda wait karo
              </span>
            ) : unreadCount === 0 ? (
              "✅ Inbox already saaf hai!"
            ) : (
              `⚡ Saare ${unreadCount !== null ? unreadCount.toLocaleString() : ""} Unread Mark as Read Karo`
            )}
          </button>

          <button
            onClick={fetchCount}
            disabled={loadingCount}
            className="w-full mt-2 py-2 rounded-xl text-gray-500 text-xs hover:bg-gray-50 transition-colors"
          >
            🔄 Count refresh karo
          </button>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-gray-400">
          Starred aur Important emails safe hain — unhe touch nahi kiya jayega.
        </p>
      </div>
    </div>
  );
}
