export default function RegisterPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Registrieren</h1>
        <form className="flex flex-col gap-4 w-1/3">
          <input
            type="text"
            placeholder="Name"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border border-gray-300 rounded"
          />
          <button className="p-2 bg-green-500 text-white rounded" type="submit">
            Registrieren
          </button>
        </form>
      </div>
    );
  }
  