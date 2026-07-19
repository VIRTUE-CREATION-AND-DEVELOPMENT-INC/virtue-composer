import "./composer.css";
import "./globals.css";

export const metadata = {
  title: "Virtue Composer",
  description: "Virtue Composer component workbench"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
