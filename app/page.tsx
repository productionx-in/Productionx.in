import Chrome from "./components/Chrome";
import Slate from "./components/Slate";
import Clients from "./components/Clients";
import Capabilities from "./components/Capabilities";
import Work from "./components/Work";
import WebWork from "./components/WebWork";
import Previz from "./components/Previz";
import Process from "./components/Process";
import Proof from "./components/Proof";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

/**
 * Ordered the way a brand-building enquiry actually forms: who you are → who
 * trusts you → what you do → proof you have done it → how it runs → who is
 * behind it → how to start.
 */
export default function Page() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Chrome />
      <main id="main">
        <Slate />
        <Clients />
        <Capabilities />
        <Work />
        <WebWork />
        <Previz />
        <Process />
        <Proof />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
