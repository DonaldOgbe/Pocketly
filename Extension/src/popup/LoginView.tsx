import { useState, type FormEvent } from "react";
import browser from "webextension-polyfill";
import { login } from "../api/auth";
import { WEB_APP_URL } from "../config";

type LoginViewProps = {
  onSuccess: () => void;
};

const LoginView = ({ onSuccess }: LoginViewProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logoUrl = chrome.runtime.getURL("icons/icon48.png");

  return (
    <div className="w-[360px] bg-white p-5 font-sans">
      <div className="flex items-center gap-2">
        <img src={logoUrl} alt="Pocketly" className="h-7 w-7 rounded-lg" />
        <span className="text-base font-bold text-brand-pink">Pocketly</span>
      </div>

      <h1 className="mt-4 text-sm font-semibold text-gray-900">Log in to save bookmarks</h1>

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-pink"
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-pink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-gray-500">
        No account?{" "}
        <button
          type="button"
          onClick={() => browser.tabs.create({ url: `${WEB_APP_URL}/register` })}
          className="font-medium text-brand-pink underline"
        >
          Register on the web
        </button>
      </p>
    </div>
  );
};

export default LoginView;