import Chrome from "../components/Chrome";
import Footer from "../components/Footer";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Chrome />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
