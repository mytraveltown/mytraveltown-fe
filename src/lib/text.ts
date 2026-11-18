/**
 * Central copy file. All user-facing text lives here, grouped by page/component.
 *   import { searchText } from "@/lib/text";   // or: import { text } from "@/lib/text";
 */

/** Copy for common. */
export const commonText = {
  brandName: "MyTravelTown",
} as const;

/** Copy for the search page and the location autocomplete. */
export const searchText = {
  seo: {
    withFilters: (heading: string, summary: string, brandName: string) =>
      `${heading}. ${summary}. Compare prices and book on ${brandName}.`,
  },
  heading: {
    searching: "Searching...",
    found: (count: number) => `${count} Travel Package${count === 1 ? "" : "s"} Found`,
    defaultSubtitle: "Browse published travel packages from verified partners.",
  },
  summary: {
    from: (value: string) => `From ${value}`,
    to: (value: string) => `To ${value}`,
    keyword: (value: string) => `"${value}"`,
    separator: " · ",
  },
  errors: {
    loadFailed: "Failed to load packages",
  },
  toolbar: {
    filters: "Filters",
    grid: "Grid",
    list: "List",
    moreFilters: "More filters",
  },
  sortOptions: {
    newest: "Recommended",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
  },
  packageTypeOptions: {
    all: "All",
    domestic: "Domestic",
    international: "International",
  },
  durationOptions: {
    any: "Any",
    short: "1–3 Days",
    medium: "4–7 Days",
    long: "8+ Days",
  },
  hotelOptions: {
    any: "Any",
    threeStar: "3 Star & above",
    fourStar: "4 Star & above",
    fiveStar: "5 Star",
  },
  mealOptions: [
    "Breakfast only",
    "Breakfast & Lunch",
    "Lunch & Dinner",
    "Breakfast, Lunch & Dinner",
    "Breakfast & Dinner",
    "All meals included",
    "No meals included",
  ],
  flightOptions: {
    any: "Any",
    included: "Flights included",
    excluded: "Without flights",
  },
  transferOptions: {
    any: "Any",
    airport: "Airport pickup & drop",
    railway: "Railway station pickup & drop",
  },
  visaOptions: {
    any: "Any",
    notRequired: "Visa-free",
    required: "Visa required",
  },
  experienceOptions: {
    any: "Any",
    fivePlus: "5+ years",
    tenPlus: "10+ years",
  },
  loadingMore: "Loading more packages...",
  empty: {
    title: "No packages found",
    description: "Try different destinations or clear your filters.",
    clearFilters: "Clear filters",
  },
  drawer: {
    title: "Filters",
    closeAria: "Close filters",
    description: "Find your perfect trip — swipe down to close",
    apply: "Apply Filters",
    clearAll: "Clear all filters",
  },
  panel: {
    title: "Filters",
    subtitle: "Find your perfect trip",
    keyword: "Keyword",
    keywordPlaceholder: "Package, city, destination...",
    from: "From",
    fromPlaceholder: "Departure city",
    to: "To",
    toPlaceholder: "Destination city",
    packageType: "Package Type",
    duration: "Duration",
    hotel: "Hotel (Star)",
    budget: "Budget",
    budgetMinAria: "Minimum budget",
    budgetMaxAria: "Maximum budget",
    meals: "Meals",
    anyMeals: "Any meals",
    flights: "Flights",
    transfers: "Transfers",
    visa: "Visa",
    experience: "Partner Experience",
    search: "Search Packages",
    clearAll: "Clear all filters",
    support: "Support",
  },
  autocomplete: {
    noMatches: "No matching locations. Pick one from the list.",
    packageCount: (count: number) => `${count} ${count === 1 ? "package" : "packages"}`,
  },
} as const;

/** Copy for the package details page, share and wishlist buttons. */
export const packageText = {
  notFound: "Package not found",
  browse: "Browse packages",
  photoAlt: "Package photo",
  fallbackAlt: "Package",
  seo: {
    summary: (title: string, days: number, nights: number) => `${title} - ${days} Days / ${nights} Nights`,
    route: (from: string, to: string) => `${from} to ${to}`,
    fromPrice: (formattedPrice: string) => `from ${formattedPrice} per person`,
  },
  inclusions: {
    heading: "Inclusions",
    flights: "Flights Included",
    cabToHotel: (from: string) => `Cab to hotel from ${from}`,
    cabFromHotel: (to: string) => `Cab from hotel to ${to}`,
    airportOrRailway: "Airport / Railway",
    airport: "Airport",
    railwayStation: "Railway Station",
    hotelStay: (stars: string | number) => `${stars}-Star Hotel Stay`,
    standardStars: "Standard",
    meals: "Meals Included",
    visa: "Visa Required",
  },
  gallery: {
    morePhotos: (count: number) => `+${count} Photos`,
    title: (count: number) => `All Photos (${count})`,
    closeAria: "Close gallery",
    backAria: "Back to package",
    prevAria: "Previous photo",
    nextAria: "Next photo",
    viewAll: (count: number) => `View all ${count} photos`,
    viewPhotoAria: (alt: string) => `Open photo: ${alt}`,
    counter: (current: number, total: number) => `${current} / ${total}`,
    thumbAria: (position: number) => `View photo ${position}`,
  },
  details: {
    available: "Available",
    duration: (days: number, nights: number) => `${days} Days · ${nights} Nights`,
    aboutHeading: "About This Package",
    readMore: "Read more",
    readLess: "Read less",
    itineraryHeading: "Day-by-Day Itinerary",
    dayLabel: (dayNumber: number) => `DAY ${dayNumber}`,
    hotelStars: (stars: number) => `${stars}-Star Hotel`,
    standardHotel: "Standard Hotel",
  },
  partner: {
    verified: "Verified Partner",
    tagline: `Travel partner on ${commonText.brandName}`,
    viewProfile: "View Profile",
  },
  booking: {
    pricing: "Pricing",
    perPerson: "/ Person ",
    contactForQuote: "Contact agent for quote",
    travelDateLabel: "TRAVEL DATE",
    selectDate: "Select travel date",
    done: "Done",
    guestsLabel: "GUESTS",
    guest: "Guest",
    guests: "Guests",
    packagePrice: "Package Price",
    convenienceFee: "Convenience Fee",
    free: "FREE",
    gst: "GST (5%)",
    totalPayable: "Total Payable",
    couponLabel: "Apply coupon for ₹0 convenience fee",
    couponApplied: "Convenience fee waived",
    paymentPlanLabel: "PAYMENT OPTION",
    planAdvanceTitle: (percent: number) => `Pay ${percent}% now to confirm`,
    planAdvanceNote:
      "Pay the balance later, online with MyTravelTown or directly to your travel partner.",
    planFullTitle: "Pay full amount now",
    planFullNote: "Nothing to pay later.",
    payNow: "Pay now",
    payLater: "Balance due later",
    payButton: (amount: string) => `Pay ${amount}`,
    dateHint: "Please select a travel date to continue.",
    bookNow: "Book Now",
    cancellationNote: "Free cancellation policy applies per agent terms.",
  },
  reviews: {
    heading: "Ratings & Reviews",
    basedOn: (total: number) => `Based on ${total} ${total === 1 ? "review" : "reviews"}`,
    starLabel: (stars: number) => `${stars} star`,
    ratingAria: (rating: number) => `Rated ${rating} out of 5`,
    selectRatingAria: (rating: number) => `Rate ${rating} out of 5`,
    empty: "Be the first to share your experience.",
    noRatingsYet: "No ratings yet",
    emptyState: {
      title: "No reviews yet",
      travellerDescription:
        "This package hasn't been reviewed yet. Reviews are shared by travellers after they complete the trip.",
      ownerDescription:
        "Once travellers complete this trip, their ratings and reviews will appear here and you can reply to them.",
    },
    verified: "Verified traveller",
    yourReview: "Your review",
    loadMore: "Load more reviews",
    loadFailed: "Could not load reviews",
    delete: "Delete",
    deleteConfirmTitle: "Delete your review?",
    deleteConfirmDescription: "This removes your rating, review and uploaded media. You can write a new review afterwards.",
    cancel: "Cancel",
    deleted: "Review deleted",
    deleteFailed: "Could not delete review",
    playVideo: "Review video",
    photoAlt: (name: string) => `Photo from ${name}'s review`,
    deleteReviewTitle: "Delete this review?",
    deleteReviewDescription: "This removes the rating, review, its replies and uploaded media.",
    replies: {
      reply: "Reply",
      placeholder: "Write a reply...",
      submit: "Post reply",
      posted: "Reply posted",
      postFailed: "Could not post reply",
      tooShort: (min: number) => `Reply must be at least ${min} characters.`,
      deleteAria: "Delete reply",
      deleteConfirmTitle: "Delete this reply?",
      deleteConfirmDescription: "This reply will be removed for everyone.",
      deleted: "Reply deleted",
      deleteFailed: "Could not delete reply",
    },
    form: {
      heading: "Write a review",
      ratingLabel: "Your rating",
      commentLabel: "Your review",
      commentPlaceholder: "Tell other travellers about the stay, itinerary, guide and overall experience.",
      mediaLabel: "Photos & videos (optional)",
      mediaHint: (maxFiles: number, maxMb: number) =>
        `Up to ${maxFiles} files. JPG, PNG, WEBP, MP4, MOV or WEBM, ${maxMb} MB each.`,
      addMedia: "Add media",
      removeMedia: "Remove file",
      submit: "Submit review",
      submitting: "Submitting...",
      success: "Thanks! Your review has been posted.",
      submitFailed: "Could not submit review",
      ratingRequired: "Please select a star rating.",
      commentTooShort: (min: number) => `Review must be at least ${min} characters.`,
      tooManyFiles: (max: number) => `You can upload up to ${max} files.`,
      fileTooLarge: (name: string, maxMb: number) => `${name} is larger than ${maxMb} MB.`,
      fileTypeInvalid: (name: string) => `${name} is not a supported image or video.`,
      characterCount: (count: number, max: number) => `${count}/${max}`,
    },
  },
  related: {
    heading: "You Might Also Love",
    duration: (days: number, from: string, to: string) => `${days} Days · ${from} → ${to}`,
  },
  share: {
    triggerAria: "Share package",
    title: "Share this trip",
    options: {
      whatsapp: "WhatsApp",
      telegram: "Telegram",
      instagram: "Instagram",
      copy: "Copy link",
    },
    linkAria: "Package link",
    copied: "Copied",
    copy: "Copy",
    linkCopied: "Link copied",
    linkCopiedInstagram: "Link copied. Paste it in Instagram",
    copyFailed: "Could not copy link. Please copy it manually.",
  },
  wishlist: {
    loginRequired: "Please log in to save packages to your wishlist",
    remove: "Remove from wishlist",
    add: "Add to wishlist",
  },
} as const;

/** Copy for package cards and the wishlist grid. */
export const packageCardText = {
  card: {
    flightIncluded: " · Flight included",
    duration: (days: number, nights: number) => `${days} Days · ${nights} Nights`,
    from: "From",
    partnerPackage: "Partner package",
    viewDetails: "View details →",
    bookNow: "Book Now",
  },
  wishlist: {
    loadFailed: "Failed to load wishlist",
    emptyTitle: "Your wishlist is empty",
    emptyDescription: "Tap the heart on any package to save it here.",
    explore: "Explore packages",
  },
} as const;

/** Copy for layout (Header, Footer, LegalPageLayout). */
export const layoutText = {
  header: {
    searchPlaceholder: "Destination city or region",
    searchAriaLabel: "Search destinations",
    wishlistAriaLabel: "My wishlist",
    profileAriaLabel: "Profile",
    menuAriaLabel: "Menu",
    addPackage: "Add Package",
    becomePartner: "Become a Partner",
    loginSignUp: "Login & SignUp",
    logout: "Logout",
    wishlist: "Wishlist",
    avatarFallback: "U",
    notifications: {
      ariaLabel: (unread: number) => (unread > 0 ? `Notifications, ${unread} unread` : "Notifications"),
      heading: "Notifications",
      empty: "Nothing yet. New bookings and reviews on your packages will show up here.",
      emptyBookings: "No bookings yet. Paid bookings on your packages will show up here.",
      emptyReviews: "No reviews yet. When travellers review your packages, they will show up here.",
      tabs: { all: "All", booking: "Bookings", review: "Reviews" },
      tabsAriaLabel: "Filter notifications",
      loadFailed: "Could not load notifications",
      retry: "Try again",
      viewMore: "View more",
      newBooking: "New booking",
      newReview: "New review",
      replied: "Replied",
      replyCta: "Reply",
      viewBooking: "View booking",
      bookedBy: (name: string) => `Booked by ${name}`,
      reviewBy: (name: string) => `by ${name}`,
      guests: (count: number) => `${count} ${count === 1 ? "guest" : "guests"}`,
      travelDate: (date: string) => `Travel ${date}`,
      justNow: "Just now",
    },
    mobileNav: {
      home: "Home",
      explore: "Explore",
      about: "About",
      contact: "Contact",
    },
  },
  footer: {
    tagline:
      "India's first AI-powered marketplace for curated travel experiences and a verified partner network.",
    exploreTitle: "Explore",
    exploreLinks: {
      home: "Home",
      packages: "Packages",
      about: "About Us",
      contact: "Contact Us",
      partner: "Become a Partner",
    },
    policiesTitle: "Our Policies",
    policyLinks: {
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      pricing: "Pricing Policy",
      refund: "Refund & Cancellation Policy",
    },
    contactTitle: "Contact Us",
    phone: "+91 9999319545",
    email: "support@mytraveltown.com",
    officeAddress: "Gaur City Centre, Greater Noida West, Uttar Pradesh - 201318",
    copyright: (year: number, brand: string) => `© ${year} ${brand}. All rights reserved.`,
    credit: "Made in Bharat",
    creditFlagAlt: "Indian flag",
  },
  legal: {
    backToHome: "Back to home",
    contactTitle: "Contact Us",
    contactIntro: "If you have any questions or concerns, please contact us at:",
    defaultEmail: "support@mytraveltown.com",
  },
} as const;

/** Copy for hero (Hero, CtaBanner, AppSection). */
export const heroText = {
  hero: {
    imageAlt: "Taj Mahal at golden sunset",
    title: "India's First AI TravelTech Marketplace",
    fields: {
      from: "From",
      where: "Where",
      guests: "Guests",
    },
    originPlaceholder: "Origin city",
    originAriaLabel: "Origin city",
    destinationPlaceholder: "Destination",
    destinationAriaLabel: "Destination",
    decreaseGuests: "Decrease guests",
    increaseGuests: "Increase guests",
    search: "Search",
    features: [
      {
        title: "Verified Travel Partners",
        desc: "Every agent vetted for quality & reliability",
        stat: "Trusted Agents",
      },
      {
        title: "Compare Multiple Packages",
        desc: "Side-by-side deals to find your best trip",
        stat: "Save up to 30%",
      },
      {
        title: "Smart Search & Discovery",
        desc: "AI-powered search across India & abroad",
        stat: "AI-Powered",
      },
      {
        title: "Trusted & Secure Platform",
        desc: "Safe bookings with verified payments",
        stat: "100% secure",
      },
    ],
  },
  ctaBanner: {
    imageAlt: "Traveler exploring the world",
    title: "The Future of Travel Journey Starts Here",
    description: "Explore Better Travel Deals from Verified Travel Experts, Starting at Just",
    price: "₹4,999",
    button: "Explore more →",
  },
  appSection: {
    title: "MTT App Coming Soon on iOS and Android",
    description:
      "Plan, compare, and book your next trip, all from your pocket. Launching soon on iOS and Android.",
    features: [
      "Discover curated travel packages",
      "Compare deals from verified experts",
      "Manage bookings on the go",
    ],
    appStore: { label: "Download on the", name: "App Store" },
    googlePlay: { label: "Get it on", name: "Google Play" },
    phonesAlt: "MyTravelTown app on mobile",
  },
} as const;

/** Copy for the home page sections, FAQ section, featured itineraries, trending destinations and Evolved. */
export const homeText = {
  evolved: {
    headingLine1: "Grow Your Travel Business",
    headingLine2: "with Us",
    description:
      "Create your travel business profile and list your travel packages on a growing digital marketplace to help you generate more bookings and revenue.",
    ctaLabel: "Become a Partner",
    locationBadge: "Goa, India",
    imageAlt: "Travel the world with MyTravelTown",
    quote: "\"Finding the best travel packages in Goa for you…\"",
  },
  faq: {
    defaultEyebrow: "Got Questions?",
    defaultTitle: "Frequently Asked Questions",
  },
  featuredItineraries: {
    eyebrow: "Plan Smarter. Travel Better.",
    title: "Top Travel Packages",
    subtitle: "Explore curated holiday packages from trusted travel partners.",
    viewAll: "View all",
    perPerson: "/Person",
    startingFrom: "Starting from",
    toggleLabel: "Filter destinations by package type",
    typeCountLabel: (typeLabel: string, count: number) =>
      `${typeLabel}, ${count} ${count === 1 ? "package" : "packages"}`,
    scrollPrevious: "Scroll to previous destinations",
    scrollNext: "Scroll to next destinations",
    packageTypes: [
      { value: "domestic", label: "Domestic" },
      { value: "international", label: "International" },
    ],
    empty: (typeLabel: string) => `No ${typeLabel.toLowerCase()} destinations available yet.`,
    loadFailed: "Could not load destinations. Please try again.",
    explore: "Explore packages",
    price: (formattedAmount: string) => `₹${formattedAmount}`,
    packageCount: (count: number) => `${count} ${count === 1 ? "package" : "packages"}`,
    imageAlt: (destination: string) => `${destination} holiday packages`,
  },
  trendingDestinations: {
    eyebrow: "Explore the World",
    title: "Trending Destinations",
    subtitle: "Discover our most popular domestic and international destinations.",
    destinations: [
      {
        key: "india",
        title: "India",
        region: "Asia",
        tag: "Incredible India",
        search: "India",
        info: "Best Time: Oct - Mar",
      },
      {
        key: "vietnam",
        title: "Vietnam",
        region: "Asia",
        tag: "Nature & Culture",
        search: "Vietnam",
        info: "Famous for Ha Long Bay",
      },
      {
        key: "uae",
        title: "UAE",
        region: "Middle East",
        tag: "Luxury Meets Adventure",
        search: "UAE",
        info: "Dubai, Abu Dhabi & Desert Safari",
      },
      {
        key: "thailand",
        title: "Thailand",
        region: "Asia",
        tag: "Land of Smiles",
        search: "Thailand",
        info: "Beaches & Nightlife",
      },
      {
        key: "bali",
        title: "Bali",
        region: "Indonesia",
        tag: "Island of Gods",
        search: "Bali",
        info: "Luxury & Adventure",
      },
    ],
  },
} as const;

/** Copy for the About page. */
export const aboutText = {
  hero: {
    badge: "About MyTravelTown",
    title: "A Smarter Way to Travel",
    description:
      "MyTravelTown brings travelers and verified travel experts together on one intelligent platform.",
  },
  idea: {
    imageAlt: "Travel planning team",
    title: "The Idea Behind MyTravelTown",
    paragraph1Before: "MyTravelTown is ",
    paragraph1Highlight: "India's First AI TravelTech Marketplace",
    paragraph1After:
      ", built to connect travelers with trusted travel experts and curated travel experiences. We make it easier for travelers to discover, compare, and connect with the right travel partners while helping travel businesses grow through greater visibility and smarter digital solutions.",
    paragraph2:
      "Founded in 2025 by Kartik Rajput and Rakshit Mudgal, MyTravelTown was created with a vision to bridge the gap between travelers seeking meaningful experiences and travel experts looking to reach the right audience. We are building more than just a travel platform, we are creating a travel community where travelers can discover new opportunities, travel experts can grow their businesses, and everyone can enjoy a better travel experience.",
    paragraph3:
      "At MyTravelTown, we believe travel is more than just booking a package. It's about discovering new destinations, creating unforgettable memories, and experiencing the world with confidence. Our mission is to create better journeys, stronger connections, and more meaningful travel experiences for everyone.",
  },
  whyChoose: {
    title: "Why Choose MyTravelTown?",
    items: [
      {
        title: "Dedicated Travel Marketplace",
        description: "A platform built specifically for travelers and travel experts.",
      },
      {
        title: "Verified Travel Partners",
        description: "Connect with trusted and verified travel experts.",
      },
      {
        title: "Compare Multiple Packages",
        description: "Explore and compare travel options in one place.",
      },
      {
        title: "Smart Search & Travel Discovery",
        description: "Find the right trip faster with intelligent recommendations.",
      },
      {
        title: "AI-Powered Travel Discovery",
        description: "Discover destinations and experiences tailored to your preferences.",
      },
      {
        title: "Discover Better Travel Deals",
        description:
          "Compare options and choose the package that best fits your budget and preferences.",
      },
      {
        title: "Save Time & Travel Smarter",
        description: "Simplify travel planning with intelligent discovery and comparison tools.",
      },
      {
        title: "Trusted & Secure Platform",
        description: "Verified partners and authentic listings for worry-free travel.",
      },
    ],
  },
  missionVision: {
    missionTitle: "Our Mission",
    missionDescription:
      "To simplify travel discovery and empower travel businesses through innovative technology, trusted connections, and smart travel solutions.",
    visionTitle: "Our Vision",
    visionDescription:
      "To become India's most trusted AI travel marketplace where travelers discover meaningful experiences and travel experts grow without boundaries.",
  },
  faq: {
    eyebrow: "Learn More",
    title: "Frequently Asked Questions",
  },
  cta: {
    title: "Ready to Grow Your Travel Business?",
    description:
      "List your travel packages on MyTravelTown and reach travelers actively searching for their next adventure.",
    buttonLabel: "Become a Partner",
  },
} as const;

/** Copy for the Contact page. */
export const contactText = {
  hero: {
    badge: "Contact Us",
    title: "Need Travel Assistance?",
    description:
      "We are a team of passionate people who care about travel and the experiences we create. If you have a question, suggestion, need support or any inquiries, we will be happy to assist you.",
  },
  form: {
    title: "Get in touch with our team",
    subtitle: "Connect with us and discover the best travel solutions for your needs.",
    nameLabel: "Full Name *",
    namePlaceholder: "Your full name",
    phoneLabel: "Phone Number *",
    phonePlaceholder: "9876543210",
    emailLabel: "Email *",
    emailPlaceholder: "you@example.com",
    subjectLabel: "Subject *",
    subjectPlaceholder: "Select a subject",
    subjectOptions: [
      "General Inquiry",
      "Travel Package Inquiry",
      "Become a Travel Partner",
      "Business Partnership",
      "Technical Support",
    ],
    messageLabel: "Additional Details *",
    messagePlaceholder: "Tell us more about your inquiry...",
    captchaLabel: "Captcha *",
    captchaPlaceholder: "Answer",
    captchaRefresh: "Refresh",
    captchaQuestion: (a: number, b: number) => `${a} + ${b} = ?`,
    submit: "Send Enquiry",
    submitting: "Sending...",
    success: "Enquiry sent! We'll get back to you soon.",
    enquiryRegarding: (subject: string) => `Enquiry regarding: ${subject}`,
    emailPrefix: (email: string) => `Email: ${email}`,
  },
  errors: {
    requiredFields: "Please fill in all required fields",
    invalidPhone: "Please enter a valid 10-digit phone number",
    phoneLength: "Phone number must be exactly 10 digits",
    wrongCaptcha: "Incorrect captcha answer. Please try again.",
    messageTooLong: "Message must be 255 characters or less",
    sendFailed: "Failed to send enquiry. Please try again.",
  },
  info: {
    emailTitle: "Email Us",
    emailValue: "support@mytraveltown.com",
    phoneTitle: "Call Us",
    phoneValue: "+91 99993 19545",
    addressTitle: "Visit Us",
    address: "Gaur City Centre, Greater Noida West, Uttar Pradesh - 201318",
    followUs: "Follow Us",
    socialLabels: {
      instagram: "Instagram",
      linkedin: "LinkedIn",
      facebook: "Facebook",
    },
  },
  office: {
    imageAlt: "Travel destinations in India",
    brand: "MYTRAVELTOWN",
    title: "Our Office",
  },
  cta: {
    badge: "Explore Packages",
    title: "Looking for your next adventure?",
    description:
      "Browse verified travel packages from trusted partners and compare options in one place.",
    buttonLabel: "Browse Packages",
  },
  faq: {
    eyebrow: "Learn More",
    title: "Frequently Asked Questions",
  },
} as const;

/** Meta titles and descriptions for static pages, approved by the SEO team. */
export const seoText = {
  home: {
    title: "MyTravelTown: India's First AI TravelTech Marketplace",
    description:
      "MyTravelTown is India's first AI travel-tech marketplace for discovering verified travel agents and curated tour packages on a secure platform. Visit Now!",
  },
  about: {
    title: "About MyTravelTown | Travel Packages Listing Platform in India",
    description:
      "Find the best travel packages in India on MyTravelTown. Compare trips, destinations and packages in one place from trusted travel partners.",
  },
  partner: {
    title: "Become A Travel Partner at India's First AI Travel Marketplace",
    description:
      "Partner with MyTravelTown and be ready to get your travel packages customised to your travel goals easily with us at India's first AI-powered travel marketplace.",
  },
  contact: {
    title: "Contact Us | Best Travel Packages Platform in India",
    description:
      "Contact MyTravelTown to discover how India's travel packages platform can assist travellers in finding the right trips and help travel partners grow their business.",
  },
  terms: {
    title: "Terms & Conditions | India's First AI TravelTech Platform",
    description:
      "Review MyTravelTown's terms and conditions to understand the rules, responsibilities and policies that govern your use of India's AI-powered travel marketplace.",
  },
  privacy: {
    title: "Your Privacy is Safe With Us | Best TravelTech Company In India",
    description:
      "Travelling is safe with MyTravelTown. Discover how our AI travel-tech platform keeps your trip safe with trusted partners, support and secure booking experiences.",
  },
  refund: {
    title: "Easy Refunds | India's First AI Travel Marketplace",
    description:
      "MyTravelTown (India's first AI travel marketplace) Easy Refund Policy – Learn Here. Find out how to cancel, get refunds and get help when you book your next trip.",
  },
  packages: {
    title: "Best Travel Packages Platform in India | MyTravelTown",
    description:
      "MyTravelTown: Book your next vacation with the perfect travel packages. Discover destinations, compare travel options and connect with trusted travel agents.",
  },
} as const;

/** Copy for the remaining-balance panel on a customer's booking. */
export const bookingBalanceText = {
  paidLabel: "Booking payment",
  remainingLabel: "Remaining balance",
  progressLabel: (percent: number) => `${percent}% of total paid`,
  note: "Pay online with MyTravelTown or directly to your travel partner.",
  payButton: (amount: string) => `Pay Remaining Balance ${amount}`,
  paying: "Opening payment...",
} as const;

export const text = {
  common: commonText,
  seo: seoText,
  search: searchText,
  package: packageText,
  packageCard: packageCardText,
  layout: layoutText,
  hero: heroText,
  home: homeText,
  about: aboutText,
  contact: contactText,
} as const;

/** Copy for the booking invoice page (/booking/:id/invoice). */
export const invoiceText = {
  backToProfile: "Back to profile",
  print: "Print Invoice",
  notFound: "Invoice not found",
  title: "Invoice",
  tagline: "India's First AI TravelTech Marketplace",
  supportEmail: "support@mytraveltown.com",
  gstinLabel: "GSTIN",
  meta: {
    invoiceNo: "Invoice No.",
    bookingId: "Booking ID",
    issued: "Issue Date",
    travel: "Travel Date",
  },
  billedTo: "Billed To",
  travelPartner: "Travel Partner",
  partnerGstin: "Partner GSTIN",
  table: {
    description: "Description",
    amount: "Amount",
  },
  guests: (count: number) => `${count} guest${count === 1 ? "" : "s"}`,
  packageRef: (id: number | string) => `Package #${id}`,
  totals: {
    subtotal: "Subtotal",
    convenienceFee: "Convenience Fee",
    free: "FREE",
    gst: "GST (5%)",
    total: "Total Amount",
    paidAtBooking: "Paid at booking",
    balanceDue: "Balance Due",
    paid: "Paid",
    paidTo: (mode: "agent" | "platform") => (mode === "agent" ? "paid to travel partner" : "paid online"),
  },
  payment: {
    title: "Payment Details",
    status: "Payment Status",
    paidOn: "Paid On",
    coupon: "Coupon Applied",
  },
  balanceNotice: (amount: string) =>
    `Balance of ${amount} is due. Pay online here or directly to your travel partner.`,
  payBalance: "Pay balance online",
  thankYou: "Thank you for booking with MyTravelTown!",
  terms:
    "Payment and cancellation terms apply as per the travel partner's policy. For any queries, contact support@mytraveltown.com.",
  computerGenerated: "This is a computer-generated invoice and does not require a signature.",
} as const;

/** Popup-only copy for the "Become a Partner" promo. Heading, description and CTA reuse homeText / layoutText. */
export const partnerPromoText = {
  laterLabel: "Maybe later",
} as const;

/** Post-trip "rate your trip" dialog. */
export const reviewPromptText = {
  title: "How was your trip?",
  tripSummary: (packageName: string, from: string, to: string) => `${packageName} · ${from} to ${to}`,
  description: "Tap a star to rate it. Your review helps other travellers choose with confidence.",
  formDescription: "Add a few words about the stay, itinerary and guide. Photos are optional.",
  later: "Remind me later",
  never: "Don't ask again",
} as const;

/** "Become a Partner" page demo video. */
export const partnerDemoText = {
  watchDemo: "Watch Demo",
  videoLabel: "How to register and list packages as a MyTravelTown travel partner",
  fallback: "Your browser does not support embedded videos.",
  /** Screen-reader name for the language switch (no visible label). */
  languageLabel: "Video language",
  languages: { en: "English", hi: "हिन्दी" },
} as const;
