/**
 * English copy.
 *
 * This object is the source of truth for the dictionary's shape — `ar.ts` is
 * typed against it, so a missing Arabic string is a build error rather than an
 * English word appearing mid-sentence on the Arabic site.
 */
export const en = {
  meta: {
    // Sits directly after the site name in every <title>, so it must not
    // repeat "real estate" — it says what is on offer, not what we are.
    tagline: "Villas, Hotels & Land for Investment",
    description:
      "Crete Roots curates exceptional villas, hotels and land opportunities for investors — with the returns, yields and development potential stated up front.",
    keywords: [
      "luxury villas",
      "hotel investment",
      "land for sale",
      "real estate investment",
      "property ROI",
    ],
  },

  common: {
    skipToContent: "Skip to content",
    contactUs: "Contact Us",
    viewProperty: "View property",
    viewAllProperties: "View all properties",
    allInventory: "All inventory",
    allOpportunities: "All opportunities",
    viewCategory: "View category",
    exploreProperties: "Explore Properties",
    investmentOpportunities: "Investment Opportunities",
    exploreOpportunities: "Explore Opportunities",
    speakToAdvisor: "Speak to an advisor",
    requestInvestmentDetails: "Request Investment Details",
    demoData: "Demo data",
    listing: "listing",
    listings: "listings",
    property: "property",
    properties: "properties",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    switchLanguage: "Switch language",
  },

  nav: {
    properties: "Properties",
    villas: "Villas",
    hotels: "Hotels",
    land: "Land",
    investments: "Investments",
    about: "About",
    contact: "Contact",
    home: "Home",
    admin: "Admin",
  },

  hero: {
    eyebrow: "Crete Roots Company · Villas, Hotels & Land",
    titleLineOne: "Invest in",
    titleLineTwo: "What Lasts.",
    lead: "Exceptional villas, hotels and land opportunities curated for ambitious investors.",
    nowShowing: "Now showing",
    captionTitle: "Palm Residence",
    captionMeta: "Palm Jumeirah, Dubai · 620 m² · 4 bedrooms",
    scrollCue: "Scroll to explore",
    ariaLabel: "Crete Roots — invest in what lasts",
  },

  quickSearch: {
    ariaLabel: "Quick search",
    lookingFor: "I am looking for",
    market: "Market",
    budget: "Budget up to",
    anyType: "Any asset type",
    anyMarket: "Any market",
    noMaximum: "No maximum",
    submit: "Search",
  },

  stats: {
    ariaLabel: "Crete Roots at a glance",
    trustedBy: "Trusted by investors across 24 markets",
  },

  featured: {
    eyebrow: "Featured properties",
    titleLineOne: "Currently on the",
    titleLineTwo: "Crete Roots desk.",
    lead: "A rotating selection from across the portfolio — villas held for appreciation, hospitality assets trading today, and land where the consent is already granted.",
  },

  categories: {
    eyebrow: "Explore by category",
    titleLineOne: "Three ways to hold",
    titleLineTwo: "real assets.",
    villa: {
      label: "01 — Villas",
      title: "VILLAS",
      copy: "Private residences held for use, for yield, or for both. Architect-led, coastal and city, from Dubai to the Côte d'Azur.",
    },
    hotel: {
      label: "02 — Hotels",
      title: "HOTELS",
      copy: "Trading hospitality assets and consented conversions, sold with the operator, the accounts and the booking book in place.",
    },
    land: {
      label: "03 — Land",
      title: "LAND",
      copy: "Development parcels where the scarcity is structural — zoning, water rights, frontage or consent that cannot be recreated.",
    },
  },

  investmentHome: {
    eyebrow: "Invest beyond property",
    titleLineOne: "Every asset, stated as",
    titleLineTwo: "capital and return.",
    lead: "Yield, occupancy, revenue and development upside are published on the listing itself — not held back until the second meeting.",
    investment: "Investment",
    annualRevenue: "Est. annual revenue",
    projectedRoi: "Projected ROI",
    occupancy: "Occupancy",
    appreciation: "Appreciation p.a.",
    market: "Market",
    roiShort: "ROI",
  },


  tour: {
    eyebrow: "Explore in",
    title: "Full Photo Tours",
    lead: "Step through the property before you step on a plane. Every listing carries a complete set — exterior, every principal room, the grounds and the view from the terrace — shot in one visit so the light is consistent across the set.",
    features: [
      "Room-by-room photo set",
      "Floor area and layout stated",
      "High-resolution photography",
      "Location and neighbourhood map",
    ],
    cta: "Open the tour",
    counter: "{index} of {total}",
    thumbLabel: "Show photograph {index}",
    mapLabel: "View location",
  },
  why: {
    eyebrow: "Why Crete Roots",
    titleLineOne: "A shorter list,",
    titleLineTwo: "checked more carefully.",
    pillars: [
      {
        title: "Curated opportunities",
        copy: "We list a fraction of what we see. An asset earns a place here on the strength of its location, its title and its numbers — never on the size of the fee.",
      },
      {
        title: "Verified information",
        copy: "Areas, consents, titles and trading accounts are checked against source documents before publication. Where something is unconfirmed, we say so on the listing.",
      },
      {
        title: "Global markets",
        copy: "Twenty-four markets across the Gulf, the Mediterranean, the Atlantic coast and the Indian Ocean — with local counsel and local valuation in each.",
      },
      {
        title: "Investment-focused",
        copy: "Every listing carries its yield, occupancy and development upside. You should be able to decide whether an asset is worth a conversation without having one.",
      },
    ],
    aside: {
      title: "More than a property.",
      titleAccent: "It is a position.",
      copy: "Every listing states its yield, its occupancy and its development upside.",
      cta: "See the numbers",
    },
  },

  cta: {
    eyebrow: "Private introductions",
    titleLineOne: "Your next investment",
    titleLineTwo: "starts here.",
    lead: "Tell us the market, the ticket size and the hold period. We will come back with what is available — including what never reaches a public listing.",
  },

  footer: {
    navigate: "Navigate",
    contact: "Contact",
    follow: "Follow",
    rights: "A demonstration platform — all inventory shown is fictional.",
    privacy: "Privacy",
    terms: "Terms",
    disclosures: "Disclosures",
    footerNav: "Footer navigation",
  },

  search: {
    search: "Search",
    searchPlaceholder: "Name, city or country",
    searchAriaLabel: "Search properties",
    assetType: "Asset type",
    market: "Market",
    sortBy: "Sort by",
    allTypes: "All types",
    allMarkets: "All markets",
    minPrice: "Min price",
    maxPrice: "Max price",
    minArea: "Min area",
    bedroomsOrKeys: "Bedrooms / keys",
    investmentType: "Investment type",
    minRoi: "Min projected ROI",
    availability: "Availability",
    noMinimum: "No minimum",
    noMaximum: "No maximum",
    anyArea: "Any area",
    any: "Any",
    anyStrategy: "Any strategy",
    anyReturn: "Any return",
    anyStatus: "Any status",
    advancedFilters: "Advanced filters",
    hideAdvanced: "Hide advanced filters",
    clearAll: "Clear all",
    searching: "Searching…",
    showingResultsFor: "Showing results for",
    sort: {
      newest: "Most recent",
      priceAsc: "Price — low to high",
      priceDesc: "Price — high to low",
      roiDesc: "Projected ROI",
      areaDesc: "Area",
    },
    empty: {
      title: "Nothing matches yet",
      copy: "Widen the price range, clear a filter, or tell us what you are looking for and we will source it off-market.",
    },
  },

  card: {
    projectedRoi: "projected ROI",
    viewDetails: "View details",
    bedroomsShort: "bd",
    bathroomsShort: "ba",
    keys: "keys",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    area: "Area",
    saveToShortlist: "Save {title} to shortlist",
    removeFromShortlist: "Remove {title} from shortlist",
  },

  propertiesPage: {
    eyebrow: "The portfolio",
    titleLineOne: "Every asset on the",
    titleLineTwo: "Crete Roots desk.",
    lead: "Villas, hospitality assets and development land across twenty-four markets. Filter by what actually decides the investment: budget, yield, strategy and consent.",
  },

  villasPage: {
    eyebrow: "01 — Villas",
    titleLineOne: "Houses built to be",
    titleLineTwo: "lived in and held.",
    lead: "Private residences where the architecture is the asset. Each one is checked for title, built area and running cost before it reaches this page.",
    notes: [
      {
        heading: "Architecture first",
        body: "We list houses by practices with a body of work, not developer product with a marketing name attached. Every listing names the year of completion and the last major works.",
      },
      {
        heading: "Held, not flipped",
        body: "Most buyers here hold for seven years or more. The figures we publish — yield, occupancy, appreciation — are framed for that horizon rather than a quick resale.",
      },
      {
        heading: "Usable as well as investable",
        body: "A villa that cannot be lived in comfortably is a poor investment whatever the spreadsheet says. Orientation, shade and running costs are part of every assessment.",
      },
    ],
  },

  hotelsPage: {
    eyebrow: "02 — Hotels",
    titleLineOne: "Hospitality assets that",
    titleLineTwo: "already trade.",
    lead: "Operating hotels and consented conversions, offered with management in place. Occupancy, rate and revenue are disclosed at listing, not at exclusivity.",
    notes: [
      {
        heading: "Accounts on the table",
        body: "Three seasons of trading history are assembled before a hotel is listed. Where a property is pre-opening or ramping, we say so rather than showing a stabilised projection.",
      },
      {
        heading: "The operator matters",
        body: "A hotel is a business. Every listing states whether the management contract, the team and the direct booking book transfer with the sale.",
      },
      {
        heading: "Capex already cycled",
        body: "We note the last full refurbishment on every asset, because a hotel sold just before its capex cycle is a different investment from one sold just after.",
      },
    ],
  },

  landPage: {
    eyebrow: "03 — Land",
    titleLineOne: "Ground where the",
    titleLineTwo: "constraint is the value.",
    lead: "Parcels selected for what cannot be replicated next door: a granted consent, registered water rights, protected frontage, or an island that is simply finished.",
    notes: [
      {
        heading: "Consent status, stated plainly",
        body: "Granted, applied for, or absent — each listing says which. A parcel priced on a hoped-for rezoning is priced on current zoning here, and labelled as an option.",
      },
      {
        heading: "Servicing is disclosed",
        body: "Road, power, water and drainage to the boundary are confirmed before listing. Off-grid parcels are listed as off-grid, with the intended servicing route named.",
      },
      {
        heading: "Scarcity you can point at",
        body: "Height caps, dune set-backs, reef protection, dark-sky designations. We list the specific mechanism that limits supply around the parcel, not a general growth story.",
      },
    ],
  },

  detail: {
    breadcrumb: "Breadcrumb",
    aboutThisProperty: "About this property",
    features: "Features",
    location: "Location",
    openFullMap: "Open full map",
    mapNote:
      "Marker shows the approximate area. Exact coordinates are shared at viewing stage.",
    mapAlt: "Map showing the location of {title}",
    plotArea: "Plot area",
    builtArea: "Built area",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    keys: "Keys",
    yearBuilt: "Year built",
    investmentOverview: "Investment overview",
    rows: {
      investment: "Investment",
      annualRevenue: "Estimated annual revenue",
      annualRevenueNote: "Gross, before operating costs",
      projectedRoi: "Projected ROI",
      projectedRoiNote: "Total return, annualised",
      occupancy: "Occupancy",
      appreciation: "Expected appreciation",
      appreciationNote: "Per annum, capital value",
      investmentType: "Investment type",
    },
    nextStep: "Next step",
    requestPackLineOne: "Request the",
    requestPackLineTwo: "investment pack.",
    requestPackLead:
      "Financials, title documents, the full photography set and viewing availability — sent directly by the advisor covering {title}.",
    reference: "Reference",
    responseTime: "Response time",
    oneBusinessDay: "One business day",
    comparableAssets: "Comparable assets",
    othersIn: "Others in",
    gallery: {
      openFullScreen: "Open {title} gallery full screen",
      previous: "Previous image",
      next: "Next image",
      show: "Show image {n}",
      close: "Close gallery",
      label: "{title} gallery",
      imageAlt: "{title} — image {n}",
    },
  },

  investmentsPage: {
    eyebrow: "Investment opportunities",
    titleLineOne: "Property, expressed as",
    titleLineTwo: "capital and return.",
    lead: "Ranked by projected return, with the assumptions on the listing rather than behind an NDA. Sort, compare, then ask us for the workings.",
    strategiesRepresented: "Strategies represented",
    sideBySide: "Side by side",
    tableTitleLineOne: "The whole portfolio,",
    tableTitleLineTwo: "on one page.",
    tableLead:
      "Every published asset with its headline investment figures. A dash means we do not hold that figure — not that it is zero.",
    tableCaption: "Crete Roots portfolio investment comparison",
    searchByRoi: "Search by ROI",
    columns: {
      asset: "Asset",
      type: "Type",
      strategy: "Strategy",
      investment: "Investment",
      annualRevenue: "Annual revenue",
      roi: "ROI",
      occupancy: "Occupancy",
      link: "Link",
    },
    highestEyebrow: "Highest projected return",
    highestTitleLineOne: "Where the numbers",
    highestTitleLineTwo: "are strongest today.",
    viewAria: "View {title}",
  },

  aboutPage: {
    eyebrow: "About Crete Roots",
    titleLineOne: "A shorter list,",
    titleLineTwo: "checked more carefully.",
    lead: "Crete Roots exists because buying a villa, a hotel or a development parcel should not require three months of due diligence to establish what a listing could simply have said.",
    statement:
      "Most property platforms are built to generate enquiries. The numbers that would let you rule an asset out are the numbers they hold back, because an enquiry is worth more than an honest answer.",
    paragraphs: [
      "Crete Roots is built the other way round. Every listing carries its price, its area, its consent status, its trading history where one exists, and its projected return with the basis stated. You should be able to decide an asset is not for you without speaking to anybody.",
      "What remains after that filter is a much shorter list — and a much better conversation. We cover villas held for use and for yield, hospitality assets that already trade, and land where the scarcity is structural rather than narrative.",
      "We work across twenty-four markets from three offices, with local counsel and local valuation in each. We do not operate assets, we do not take a position alongside our clients, and we do not list what we have not checked.",
    ],
    imageAlt: "Interior of a Crete Roots-listed residence",
    offices: "Offices",
    howWeWork: "How we work",
    principlesTitleLineOne: "Four rules we",
    principlesTitleLineTwo: "do not bend.",
    principles: [
      {
        title: "Publish the numbers",
        body: "Yield, occupancy, revenue and appreciation belong on the listing. If an asset only looks good once the figures are hidden, it does not belong on the platform.",
      },
      {
        title: "Say what is unconfirmed",
        body: "A consent applied for is not a consent granted. A ramping hotel is not a stabilised one. We label the difference rather than smoothing it into a projection.",
      },
      {
        title: "Fewer listings, checked harder",
        body: "Title, built area, servicing and trading history are verified against source documents before anything is published. That work is the product.",
      },
      {
        title: "Local counsel everywhere",
        body: "Ownership structures, non-resident rules and transfer taxes differ in every market we cover. Each transaction is run with counsel and valuation on the ground.",
      },
    ],
  },

  contactPage: {
    eyebrow: "Contact",
    titleLineOne: "Tell us what you",
    titleLineTwo: "are looking for.",
    lead: "Market, ticket size, hold period. We will come back with what is available — including what never reaches a public listing.",
    directLines: "Direct lines",
    email: "Email",
    telephone: "Telephone",
    offices: "Offices",
    hours: "Hours",
    hoursValue: "Sunday–Thursday, 09:00–18:00 GST",
    offMarketNote:
      "For off-market enquiries, please include the market and the ticket range in your message — it lets us come back with something specific rather than a brochure.",
    sendEnquiry: "Send an enquiry",
    submit: "Send enquiry",
  },

  form: {
    name: "Name",
    phone: "Phone",
    email: "Email",
    message: "Message",
    sending: "Sending…",
    prefill: "I would like the full investment pack for {title}.",
    privacyNote:
      "We use your details only to answer this enquiry. Nothing is shared with a third party.",
    received: "Enquiry received.",
    thanks: "Thank you — an advisor will come back to you within one business day.",
    checkFields: "Please check the highlighted fields.",
    couldNotRecord:
      "We could not record that just now. Please try again, or email us directly.",
    errors: {
      name: "Please enter your name",
      email: "Please enter a valid email address",
      phone: "Please enter a valid phone number",
      message: "Please tell us a little more — at least 10 characters",
    },
  },

  notFound: {
    eyebrow: "404",
    titleLineOne: "This address is",
    titleLineTwo: "no longer listed.",
    lead: "The property may have been withdrawn or sold. The portfolio is a good place to pick the search back up.",
    browse: "Browse the portfolio",
    notFoundTitle: "Page not found",
  },

  demo: {
    badge: "Demo data",
    disclaimerLead: "Demo data.",
    disclaimer:
      "This catalogue is illustrative sample content. The valuations, yields, occupancy and revenue shown are fictional, are not a forecast, and are not investment advice. Connect a database and publish verified inventory before presenting any figure here as real.",
  },

  enums: {
    propertyType: { villa: "Villa", hotel: "Hotel", land: "Land" },
    propertyTypePlural: { villa: "Villas", hotel: "Hotels", land: "Land" },
    status: {
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
      off_market: "Off market",
    },
    investmentType: {
      buy_to_hold: "Buy to hold",
      rental_yield: "Rental yield",
      hospitality_operation: "Hospitality operation",
      development: "Development",
      capital_appreciation: "Capital appreciation",
    },
    inquiryStatus: { new: "New", contacted: "Contacted", closed: "Closed" },
  },

  legal: {
    eyebrow: "Legal",
    privacy: {
      title: "Privacy",
      lead: "How Crete Roots handles the information you send us.",
      sections: [
        {
          heading: "What we collect",
          body: "When you submit an enquiry we store the name, email address, telephone number and message you provide, along with the property the enquiry relates to. We do not collect anything else, and the site sets no advertising or analytics cookies.",
        },
        {
          heading: "What we do with it",
          body: "Your details are used to answer your enquiry and, where you have asked for it, to send information about comparable assets. They are not sold, and they are not shared with a third party outside the professional advisers working on a transaction you are party to.",
        },
        {
          heading: "How long we keep it",
          body: "Enquiries are retained while the conversation is live and for a reasonable period afterwards. You can ask us to delete your record at any time by writing to {email}.",
        },
        {
          heading: "This page needs replacing",
          body: "This is placeholder copy provided with the platform. Before launch, have a qualified adviser draft a privacy notice that reflects your actual processing, your lawful basis, your retention periods and the jurisdictions you operate in.",
        },
      ],
    },
    terms: {
      title: "Terms",
      lead: "The basis on which this site is made available.",
      sections: [
        {
          heading: "Information only",
          body: "Everything published on this site is provided for information. It is not an offer, an invitation to treat, or a contract, and nothing here forms part of any agreement for the sale or purchase of a property.",
        },
        {
          heading: "Accuracy",
          body: "Areas, consents, valuations and trading figures are compiled from sources we consider reliable but are not warranted. Any figure that matters to your decision should be verified independently before you commit to a transaction.",
        },
        {
          heading: "This page needs replacing",
          body: "This is placeholder copy provided with the platform. Have counsel draft terms that reflect your jurisdiction, your regulatory position and your actual liability position before launch.",
        },
      ],
    },
    disclosures: {
      title: "Disclosures",
      lead: "What the figures on this site do and do not mean.",
      sections: [
        {
          heading: "Demonstration inventory",
          body: "The properties currently published on this platform are fictional demonstration records. Titles, valuations, yields, occupancy rates, revenue and coordinates are illustrative. No real owner, developer, operator or transaction is represented.",
        },
        {
          heading: "Projections are not forecasts",
          body: "Where a return, yield or appreciation figure is shown, it is a projection based on stated assumptions. Projections are not forecasts, are not guaranteed, and are not a reliable indicator of future performance. Property values can fall as well as rise.",
        },
        {
          heading: "Not investment advice",
          body: "Nothing on this site is investment, tax or legal advice, and nothing here takes account of your circumstances or objectives. Take independent advice before committing capital.",
        },
        {
          heading: "Currency and cost",
          body: "Prices are quoted in the currency shown on each listing and exclude transfer taxes, registration fees, agency fees and financing costs, all of which vary by market.",
        },
      ],
    },
  },

  admin: {
    dashboard: "Crete Roots Dashboard",
    overview: "Overview",
    properties: "Properties",
    leads: "Leads",
    settings: "Settings",
    signOut: "Sign out",
    signIn: "Sign in",
    viewSite: "View site",
    checking: "Checking…",
    password: "Password",
    email: "Email",
    credentialsRejected: "Those credentials were not accepted.",
    notAuthorised: "Not authorised.",
    signInPrompt: "Sign in with your Crete Roots administrator account.",
    passwordPrompt: "Enter the dashboard password to continue.",
    notAdmin: "That account is signed in but is not an administrator.",
    notConfigured: "Access is not configured.",
    notConfiguredBody:
      "Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in the environment, or connect Supabase and sign in with a user whose profile role is admin.",
    devBannerStrong: "Development mode.",
    devBanner:
      "No ADMIN_PASSWORD is set, so this dashboard is unlocked. It is blocked automatically in production builds — set the variable before deploying.",
    demoBanner:
      "Running on the bundled demo catalogue. Edits are real but live in memory only and reset when the server restarts —",
    demoBannerLink: "connect Supabase",
    demoBannerEnd: "to persist them.",
    today: "Today",
    addProperty: "Add property",
    published: "Published",
    drafts: "Drafts",
    newLeads: "New leads",
    publishedValue: "Published value",
    recentLeads: "Recent leads",
    allLeads: "All leads",
    recentlyAdded: "Recently added",
    allProperties: "All properties",
    noEnquiries: "No enquiries yet.",
    generalEnquiry: "General enquiry",
    draft: "Draft",
    inventory: "Inventory",
    total: "total",
    publishedCount: "published",
    feature: "Feature",
    featured: "Featured",
    edit: "Edit",
    view: "View",
    viewLive: "View live",
    delete: "Delete",
    confirm: "Confirm",
    cancel: "Cancel",
    deleting: "Deleting…",
    deleteConfirm: "Delete “{title}” permanently?",
    deleteInquiryConfirm: "Delete the enquiry from {name}?",
    noProperties: "No properties yet. Add the first one to get started.",
    backToList: "Back to list",
    newProperty: "New property",
    newPropertyLead:
      "Create it as a draft first. Images can be reordered and the cover chosen once the record exists.",
    updated: "updated",
    saveChanges: "Save changes",
    createProperty: "Create property",
    saving: "Saving…",
    propertyCreated: "Property created.",
    propertyUpdated: "Property updated.",
    couldNotSave: "Could not save.",
    enquiries: "Enquiries",
    message: "Message",
    hide: "Hide",
    configuration: "Configuration",
    homeFigures: "Home page figures",
    homeFiguresLead:
      "The four headline numbers in the trust bar. These are stated as fact to every visitor, so keep them defensible.",
    value: "Value",
    label: "Label",
    saveFigures: "Save figures",
    figuresUpdated: "Headline figures updated.",
    dataSource: "Data source",
    supabaseConnected: "Supabase connected.",
    supabaseConnectedBody:
      "Properties, images, features, enquiries and these figures are persisted to Postgres, with Row Level Security enforcing public read of published inventory only.",
    demoModeStrong: "Running on demo data.",
    demoModeBody:
      "Everything in the dashboard works, but changes live in the server process and reset on restart.",
    setupSteps: [
      "Create a Supabase project and run supabase/migrations/0001_init.sql.",
      "Copy .env.example to .env.local and fill in the project URL, the anon key and the service role key.",
      "Load the demo catalogue with npm run seed.",
      "Create a user, then set that row's profiles.role to admin.",
    ],
    images: "Images",
    imagesCount: "{n} in the gallery. Position 1 is used as the cover.",
    addByUrl: "Add by URL",
    add: "Add",
    cover: "Cover",
    noImages: "No images yet.",
    imagesNote:
      "Reordering here rewrites the gallery order and the cover. To batch-edit the whole list, paste URLs into the Media field in the form below.",
    moveEarlier: "Move image {n} earlier",
    moveLater: "Move image {n} later",
    removeImage: "Remove image {n}",
    deleteEnquiryAria: "Delete enquiry from {name}",
    form: {
      identity: "Identity",
      title: "Title",
      slug: "URL slug",
      tagline: "Tagline",
      taglineHint:
        "One editorial line. Used on cards and in the meta description.",
      description: "Description",
      arabic: "Arabic",
      arabicHint:
        "Leave any Arabic field blank to fall back to the English text on the Arabic site.",
      titleAr: "Title (Arabic)",
      taglineAr: "Tagline (Arabic)",
      descriptionAr: "Description (Arabic)",
      locationAr: "Display location (Arabic)",
      cityAr: "City (Arabic)",
      countryAr: "Country (Arabic)",
      featuresAr: "Features (Arabic)",
      classification: "Classification",
      type: "Type",
      availability: "Availability",
      investmentStrategy: "Investment strategy",
      publishedHint: "Visible on the public site and in the sitemap.",
      featuredHint: "Appears in the featured row on the home page.",
      location: "Location",
      displayLocation: "Display location",
      city: "City",
      country: "Country",
      latitude: "Latitude",
      longitude: "Longitude",
      specification: "Specification",
      price: "Price",
      currency: "Currency",
      currencyHint: "Three-letter ISO code.",
      area: "Area (m²)",
      bedrooms: "Bedrooms / keys",
      bathrooms: "Bathrooms",
      yearBuilt: "Year built",
      investmentFigures: "Investment figures",
      investmentNote:
        "Leave a field blank where you do not hold the figure. Blank renders as an em dash on the listing; zero would state that the figure is zero.",
      roi: "Projected ROI (%)",
      annualRevenue: "Annual revenue",
      occupancy: "Occupancy (%)",
      appreciation: "Appreciation (%)",
      media: "Media",
      mediaNote:
        "One image URL per line. The first line becomes the cover unless a cover URL is set explicitly.",
      coverImage: "Cover image URL",
      galleryUrls: "Gallery URLs",
      features: "Features",
      featuresNote: "One feature per line.",
    },
  },
};

/**
 * The dictionary's shape, derived from the English copy.
 *
 * Deliberately not `as const`: literal types would make every Arabic string a
 * type error rather than a translation. Widened values still catch a missing
 * key, a renamed key, or an array of the wrong length.
 */
export type Dictionary = typeof en;
