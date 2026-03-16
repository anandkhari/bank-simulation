import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "RBC Royal Bank - Secure Sign In",
  description: "Secure online banking login",
  icons: {
    icon: "/rbc-logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}