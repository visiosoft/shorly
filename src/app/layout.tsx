import { Providers } from './providers';
import './globals.css';
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: 'Shorly - URL Shortener',
  description: 'Modern, secure, and analytics-powered URL shortener',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 