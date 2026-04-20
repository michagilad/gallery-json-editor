import "./globals.css";

export const metadata = {
  title: "Gallery JSON Editor",
  description:
    "Import, visually edit, and export gallery block JSON with drag & drop.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
