import { signInWithGoogle } from '../lib/auth';

export default function Login() {
  async function handleSignIn() {
    try {
      const user = await signInWithGoogle();
      // Create backend session
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });
    } catch (err) {
      console.error('Sign in failed', err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">The Last-Minute Life Saver</h1>
          <p className="mt-3 text-gray-400 text-lg">
            AI that doesn&apos;t just remind you — it does the work.
          </p>
        </div>
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
        <p className="text-gray-600 text-sm">
          Powered by Gemini AI · Built for VIBE 2 SHIP
        </p>
      </div>
    </div>
  );
}
