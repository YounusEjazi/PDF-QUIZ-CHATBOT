import SignInButton from "@/components/SignInButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <p className="text-gray-600 mb-6 text-center">
          Wähle eine Login-Option:
        </p>
        {/* Login mit E-Mail */}
        <SignInButton
          text="Login mit E-Mail"
          provider="credentials"
          redirectUrl="/auth/login"
        />
        {/* Login mit Google */}
        <SignInButton
          text="Login mit Google"
          provider="google"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
