import Chrome from "./components/Chrome";
import Slate from "./components/Slate";
import Kinetic from "./components/Kinetic";
import Capabilities from "./components/Capabilities";
import Work from "./components/Work";
import Previz from "./components/Previz";
import Process from "./components/Process";
import Proof from "./components/Proof";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Chrome />
      <main id="main">
        <Slate />
        <Kinetic />
        <Capabilities />
        <Work />
        <Previz />
        <Process />
        <Proof />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
