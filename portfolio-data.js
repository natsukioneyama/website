/*
 * portfolio-data.js
 * ---------------------------------------------------------
 * Single source of truth for Overview projects/media.
 *
 * - Array order === overview.html display order.
 * - Each project's `media` array order === in-project display order.
 * - `id` is a stable identifier used as the grouping key for
 *   hover-highlight / touch-tap / lightbox grouping, so that two
 *   projects that happen to share the same title + credit never
 *   merge into one group. `id` is NOT used for sort order.
 * ---------------------------------------------------------
 */
window.PORTFOLIO_PROJECTS = [
  {
    id: "vogue-adria-danilo-pavlovic",
    category: "overview",
    title: "VOGUE ADRIA",
    line1: "Danilo Pavlovic",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/vogueadria/summer2026/01.webp", full: "img/vogueadria/summer2026/01.webp", alt: "Danilo Pavlovic", width: 275, height: 350, dataW: 275, dataH: 350 },
      { type: "image", thumb: "thmbs/vogueadria/summer2026/02.webp", full: "img/vogueadria/summer2026/02.webp", alt: "Danilo Pavlovic", width: 275, height: 350, dataW: 275, dataH: 350 },
      { type: "image", thumb: "thmbs/vogueadria/summer2026/03.webp", full: "img/vogueadria/summer2026/03.webp", alt: "Danilo Pavlovic", width: 350, height: 283, dataW: 350, dataH: 283 }
    ]
  },
  {
    id: "krzysztof-jan",
    category: "overview",
    title: "Krzysztof Jan",
    line1: "",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/img/krzysztofjan_01/01.webp", full: "img/img/krzysztofjan_01/01.webp", alt: "krzysztofjan", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/img/krzysztofjan_01/02.webp", full: "img/img/krzysztofjan_01/02.webp", alt: "krzysztofjan", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/img/krzysztofjan_01/03.webp", full: "img/img/krzysztofjan_01/03.webp", alt: "krzysztofjan", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/img/krzysztofjan_01/05.webp", full: "img/img/krzysztofjan_01/05.webp", alt: "krzysztofjan", width: 280, height: 350, dataW: 280, dataH: 350 }
    ]
  },
  {
    id: "carl-diner",
    category: "overview",
    title: "Carl Diner",
    line1: "",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/img/carldiner_01/01.webp", full: "img/img/carldiner_01/01.webp", alt: "carldiner", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/img/carldiner_01/02.webp", full: "img/img/carldiner_01/02.webp", alt: "carldiner", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/img/carldiner_01/03.webp", full: "img/img/carldiner_01/03.webp", alt: "carldiner", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/img/carldiner_01/04.webp", full: "img/img/carldiner_01/04.webp", alt: "carldiner", width: 280, height: 350, dataW: 280, dataH: 350 }
    ]
  },
  {
    id: "beauty-antoine-charlie",
    category: "overview",
    title: "Beauty",
    line1: "Antoine & Charlie",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/beauty/beauty01/01.webp", full: "img/beauty/beauty01/01.webp", alt: "antoine&charlie", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/beauty/beauty01/02.webp", full: "img/beauty/beauty01/02.webp", alt: "antoine&charlie", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/beauty/beauty01/03.webp", full: "img/beauty/beauty01/03.webp", alt: "antoine&charlie", width: 280, height: 350, dataW: 280, dataH: 350 }
    ]
  },
  {
    id: "replica-man-pavel-golik",
    category: "overview",
    title: "REPLICA MAN",
    line1: "Pavel Golik",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/replicaman/ss24/01.webp", full: "img/replicaman/ss24/01.webp", alt: "replicaman", width: 263, height: 350, dataW: 263, dataH: 350 },
      { type: "image", thumb: "thmbs/replicaman/ss24/02.webp", full: "img/replicaman/ss24/02.webp", alt: "replicaman", width: 350, height: 263, dataW: 350, dataH: 263 },
      { type: "image", thumb: "thmbs/replicaman/ss24/03.webp", full: "img/replicaman/ss24/03.webp", alt: "replicaman", width: 263, height: 350, dataW: 263, dataH: 350 },
      { type: "image", thumb: "thmbs/replicaman/ss24/04.webp", full: "img/replicaman/ss24/04.webp", alt: "replicaman", width: 350, height: 280, dataW: 350, dataH: 280 },
      { type: "image", thumb: "thmbs/replicaman/ss24/05.webp", full: "img/replicaman/ss24/05.webp", alt: "replicaman", width: 263, height: 350, dataW: 263, dataH: 350 }
    ]
  },
  {
    id: "beauty-papers-jeremie-monnier",
    category: "overview",
    title: "BEAUTY PAPERS",
    line1: "Jérémie Monnier",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/beautypapers/01/01.webp", full: "img/beautypapers/01/01.webp", alt: "beautypapers", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/beautypapers/01/02.webp", full: "img/beautypapers/01/02.webp", alt: "beautypapers", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/beautypapers/01/03.webp", full: "img/beautypapers/01/03.webp", alt: "beautypapers", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/beautypapers/01/04.webp", full: "img/beautypapers/01/04.webp", alt: "beautypapers", width: 280, height: 350, dataW: 280, dataH: 350 }
    ]
  },
  {
    id: "costume-sascha-oda",
    category: "overview",
    title: "",
    line1: "Sascha Oda",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/costume/saschaoda/01/01.webp", full: "img/costume/saschaoda/01/01.webp", alt: "costume", width: 265, height: 350, dataW: 265, dataH: 350 },
      { type: "image", thumb: "thmbs/costume/saschaoda/01/02.webp", full: "img/costume/saschaoda/01/02.webp", alt: "costume", width: 265, height: 350, dataW: 265, dataH: 350 },
      { type: "image", thumb: "thmbs/costume/saschaoda/01/03.webp", full: "img/costume/saschaoda/01/03.webp", alt: "costume", width: 265, height: 350, dataW: 265, dataH: 350 }
    ]
  },
  {
    id: "port-magazine-aude-le-barbey",
    category: "overview",
    title: "PORT MAGAZINE",
    line1: "Aude Le Barbey",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/portmagazine/isuue38/audelebarbey/01.webp", full: "img/portmagazine/isuue38/audelebarbey/01.webp", alt: "audelebarbey", width: 263, height: 350, dataW: 263, dataH: 350 },
      { type: "image", thumb: "thmbs/portmagazine/isuue38/audelebarbey/03.webp", full: "img/portmagazine/isuue38/audelebarbey/03.webp", alt: "audelebarbey", width: 350, height: 233, dataW: 350, dataH: 233 },
      { type: "image", thumb: "thmbs/portmagazine/isuue38/audelebarbey/04.webp", full: "img/portmagazine/isuue38/audelebarbey/04.webp", alt: "audelebarbey", width: 350, height: 263, dataW: 350, dataH: 263 }
    ]
  },
  {
    id: "office-jesper-lund",
    category: "overview",
    title: "Office",
    line1: "Jesper Lund",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/office/ofiicexkeen/01.webp", full: "img/office/ofiicexkeen/01.webp", alt: "JesperLund", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/office/ofiicexkeen/02.webp", full: "img/office/ofiicexkeen/02.webp", alt: "JesperLund", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/office/ofiicexkeen/03.webp", full: "img/office/ofiicexkeen/03.webp", alt: "JesperLund", width: 280, height: 350, dataW: 280, dataH: 350 }
    ]
  },
  {
    id: "marrknull-aw26-jumbo-tsui",
    category: "overview",
    title: "MARRKNULL AW26",
    line1: "Jumbo Tsui",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/marrknull/AW26/01.webp", full: "img/marrknull/AW26/01.webp", alt: "maarknullaw26", width: 264, height: 350, dataW: 264, dataH: 350 },
      { type: "image", thumb: "thmbs/marrknull/AW26/02.webp", full: "img/marrknull/AW26/02.webp", alt: "maarknullaw26", width: 264, height: 350, dataW: 264, dataH: 350 },
      { type: "image", thumb: "thmbs/marrknull/AW26/03.webp", full: "img/marrknull/AW26/03.webp", alt: "maarknullaw26", width: 265, height: 350, dataW: 265, dataH: 350 }
    ]
  },
  {
    id: "numero-china-carla-rossi",
    category: "overview",
    title: "NUMERO CHINA",
    line1: "Carla Rossi",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/numerochina/01/01.webp", full: "img/numerochina/01/01.webp", alt: "numerochina", width: 270, height: 350, dataW: 270, dataH: 350 },
      { type: "image", thumb: "thmbs/numerochina/01/04.webp", full: "img/numerochina/01/04.webp", alt: "numerochina", width: 350, height: 227, dataW: 350, dataH: 227 },
      { type: "image", thumb: "thmbs/numerochina/01/05.webp", full: "img/numerochina/01/05.webp", alt: "numerochina", width: 350, height: 227, dataW: 350, dataH: 227 }
    ]
  },
  {
    id: "vogue-mexico-ward-ivan-rafik",
    category: "overview",
    title: "VOGUE MEXICO",
    line1: "Ward Ivan Rafik",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/voguemexico/01/01.webp", full: "img/voguemexico/01/01.webp", alt: "voguemexico", width: 280, height: 350, dataW: 280, dataH: 350 },
      { type: "image", thumb: "thmbs/voguemexico/01/02.webp", full: "img/voguemexico/01/02.webp", alt: "voguemexico", width: 350, height: 263, dataW: 350, dataH: 263 }
    ]
  },
  {
    id: "numero-berlin-boris-ovini",
    category: "overview",
    title: "NUMERO BERLIN",
    line1: "Boris Ovini",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/numeroberlin/visionary/01.webp", full: "img/numeroberlin/visionary/01.webp", alt: "numeroberlin", width: 263, height: 350, dataW: 263, dataH: 350 },
      { type: "image", thumb: "thmbs/numeroberlin/visionary/02.webp", full: "img/numeroberlin/visionary/02.webp", alt: "numeroberlin", width: 350, height: 255, dataW: 350, dataH: 255 },
      { type: "image", thumb: "thmbs/numeroberlin/visionary/03.webp", full: "img/numeroberlin/visionary/03.webp", alt: "numeroberlin", width: 350, height: 233, dataW: 350, dataH: 233 },
      { type: "image", thumb: "thmbs/numeroberlin/visionary/04.webp", full: "img/numeroberlin/visionary/04.webp", alt: "numeroberlin", width: 233, height: 350, dataW: 233, dataH: 350 },
      { type: "image", thumb: "thmbs/numeroberlin/visionary/07.webp", full: "img/numeroberlin/visionary/07.webp", alt: "numeroberlin", width: 350, height: 233, dataW: 350, dataH: 233 }
    ]
  },
  {
    id: "sans-title-tess-petronio",
    category: "overview",
    title: "SANS TITLE",
    line1: "Tess Petronio",
    line2: "",
    media: [
      { type: "image", thumb: "thmbs/sanstitle/001/01.webp", full: "img/sanstitle/001/01.webp", alt: "sanstitle", width: 350, height: 233, dataW: 350, dataH: 233 },
      { type: "image", thumb: "thmbs/sanstitle/001/02.webp", full: "img/sanstitle/001/02.webp", alt: "sanstitle", width: 233, height: 350, dataW: 233, dataH: 350 },
      { type: "image", thumb: "thmbs/sanstitle/001/03.webp", full: "img/sanstitle/001/03.webp", alt: "sanstitle", width: 233, height: 350, dataW: 233, dataH: 350 }
    ]
  }
];
