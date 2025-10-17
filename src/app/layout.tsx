import "./globals.css";
import Nav from "./components/Nav/Nav"; 
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/recipes/new", label: "Add Recipe" },
  { href: "/explore", label: "Users" },
];

export const metadata = {
  title: "Cooking Web App",
  description: "A recipe sharing platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Nav links={links}/>
        {children}
      </body>
    </html>
  );
}