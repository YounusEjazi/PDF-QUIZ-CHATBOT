export const Icons = {
    spinner: (props: React.ComponentProps<"svg">) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" className="opacity-25" />
        <path d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z" className="opacity-75" />
      </svg>
    ),
    google: (props: React.ComponentProps<"svg">) => (
      <svg {...props} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#4285F4"
          d="M24 24v-7.5h19.2C43.4 19.4 44 21.6 44 24c0 2.4-.6 4.6-1.8 6.6L24 24z"
        />
        <path
          fill="#34A853"
          d="M24 24v7.5l10.8 8.4c-3.6 3-8.4 4.8-13.8 4.8C12 44.7 4.7 37.3 4.7 28.5c0-2.4.6-4.6 1.8-6.6L24 24z"
        />
        <path
          fill="#FBBC05"
          d="M10.5 33.3l13.8-10.8-1.2-7.2H4.7c-1.2 2.1-1.8 4.2-1.8 6.6 0 6 4.2 11.1 9.6 13.2z"
        />
        <path
          fill="#EA4335"
          d="M24 12.3c3.6 0 6.6 1.2 9 3.6L36.9 12C33.3 8.4 28.8 6 24 6c-9.3 0-16.5 7.5-16.5 16.5 0 2.4.6 4.6 1.8 6.6l7.5-6C14.4 19.8 18.6 12.3 24 12.3z"
        />
      </svg>
    ),
  };
  