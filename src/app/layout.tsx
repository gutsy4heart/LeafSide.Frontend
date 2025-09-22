import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart-context";
import { AuthProvider } from "./auth-context";
import { LanguageProvider } from "./language-context";
import CartNav from "./CartNav";
import Footer from "./components/Footer";
import ClientWrapper from "./components/ClientWrapper";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeafSide",  
  description: "LeafSide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function removeExtensionAttributes() {
                  const elements = document.querySelectorAll('[bis_skin_checked], [bis_register]');
                  elements.forEach(element => {
                    element.removeAttribute('bis_skin_checked');
                    element.removeAttribute('bis_register');
                  });
                }
                
                // Run immediately
                removeExtensionAttributes();
                
                // Set up observer
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes') {
                        const target = mutation.target;
                        if (target.hasAttribute('bis_skin_checked') || target.hasAttribute('bis_register')) {
                          target.removeAttribute('bis_skin_checked');
                          target.removeAttribute('bis_register');
                        }
                      }
                    });
                  });
                  
                  observer.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked', 'bis_register']
                  });
                }
                
                // Periodic cleanup
                setInterval(removeExtensionAttributes, 50);
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <ClientWrapper>
        <LanguageProvider>
        <AuthProvider>
        <CartProvider>
        <div className="relative overflow-x-hidden">
          <header className="border-b border-white/10">
            <div className="container flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative h-9 w-9">
                  {/* Leaf */}
                  <div className="absolute top-1 left-1 h-6 w-4 bg-green-400 rounded-sm transform rotate-12 shadow-lg shadow-green-400/50">
                    <div className="absolute top-0 left-1/2 w-0.5 h-full bg-green-300"></div>
                    <div className="absolute top-1 left-0.5 w-1 h-0.5 bg-green-300 transform rotate-45"></div>
                    <div className="absolute top-2 left-0.5 w-1 h-0.5 bg-green-300 transform rotate-45"></div>
                    <div className="absolute top-3 left-0.5 w-1 h-0.5 bg-green-300 transform rotate-45"></div>
                  </div>
                  {/* Book */}
                  <div className="absolute top-2 right-1 h-5 w-3 bg-blue-600 rounded-sm shadow-lg shadow-blue-600/50">
                    <div className="absolute top-0.5 left-0.5 w-2 h-0.5 bg-blue-400"></div>
                    <div className="absolute top-1 left-0.5 w-2 h-0.5 bg-blue-400"></div>
                    <div className="absolute top-1.5 left-0.5 w-2 h-0.5 bg-blue-400"></div>
                  </div>
                </div>
                <span className="text-lg font-semibold tracking-tight">LeafSide</span>
              </Link>
              <CartNav />
            </div>
          </header>

          <main className="container py-8">
            {children}
          </main>

          <Footer />
        </div>
        </CartProvider>
        </AuthProvider>
        </LanguageProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}

// moved to client component in ./CartNav
