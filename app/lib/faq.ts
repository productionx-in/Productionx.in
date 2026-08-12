/**
 * The questions people actually ask on a first call.
 *
 * One source, used twice: the visible section renders from it, and the
 * FAQPage structured data in the layout is generated from the same array. They
 * cannot drift apart, which matters because Google treats schema that does not
 * match the visible page as a violation rather than a bonus.
 *
 * Each answer is written to stand on its own at roughly 40–60 words. That is
 * not a trick for machines — it is the length at which an answer is complete
 * enough to be useful when quoted with no surrounding page, whether the thing
 * quoting it is an AI assistant or a prospect forwarding a paragraph to their
 * boss.
 */
export type QA = { q: string; a: string };

export const FAQ: QA[] = [
  {
    q: "What does ProductionX do?",
    a:
      "ProductionX is a brand and marketing studio in Hyderabad working across three disciplines: brand and marketing strategy, content production with an in-house crew, and digital — websites, search, AI content and real-estate previsualisation. Clients take one discipline on its own, or all three on a single monthly retainer.",
  },
  {
    q: "Do you shoot with a real crew, or is it all AI?",
    a:
      "Both, chosen on what the job needs. Brand films, product and fashion shoots and event coverage are filmed by our own crew with our own kit. AI generation is used where a shoot is impractical — unbuilt property, concept frames, or campaign cutaways with no budget for a full unit.",
  },
  {
    q: "What is real-estate previsualisation?",
    a:
      "Previsualisation builds a property in a render pipeline before it is constructed, so a sales team can walk buyers through the space while the site is still soil. The same frames feed the brochure, the ads and the launch campaign, and they match the finished building at handover.",
  },
  {
    q: "Can you manage our social media as well as film it?",
    a:
      "Yes, and that is the usual arrangement. One shoot day feeds a month of content, and we run the presence end to end: content calendar, captions, scheduling, community, growth, competitor tracking, monthly analytics and paid integration. The content and the channel are handled by the same team.",
  },
  {
    q: "Do you build websites too?",
    a:
      "Yes. Website design, build and search sit in the same studio as the content, so the campaign and the landing page are one piece of work rather than two suppliers negotiating with each other. Keywords, Google Business Profile and local ranking are handled before launch, not retrofitted afterwards.",
  },
  {
    q: "How do you price work?",
    a:
      "Work is scoped against the brief. Ongoing content and social media run as a monthly retainer with a three-month minimum and 50% advance to initiate; brand films, websites and previsualisation are quoted per project. You get a rough number on the first call, before anything is booked.",
  },
  {
    q: "How does a project start, and how quickly do you reply?",
    a:
      "Send a brief and we come back within 24 hours to book a free 30-minute discovery call. You get a direction, a rough number, and an honest read on whether we are the right studio — including when we are not. Then treatment, approval, production, review and delivery.",
  },
];
