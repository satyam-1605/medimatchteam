// State-wise Government Health Schemes for India
export interface StateScheme {
  id: string;
  name: string;
  shortName: string;
  state: string;
  description: string;
  eligibility: string;
  coverage: string;
  officialUrl: string | null;
  isNational: boolean;
}

// State name to scheme mappings
export const STATE_SCHEMES: StateScheme[] = [
  // National Scheme (available everywhere)
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    shortName: "AB-PMJAY",
    state: "National",
    description: "India's flagship health insurance scheme providing ₹5 lakh coverage per family for secondary and tertiary care hospitalization at empanelled hospitals.",
    eligibility: "Families identified through SECC 2011 database. Over 50 crore beneficiaries covered.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://pmjay.gov.in",
    isNational: true,
  },
  // Rajasthan
  {
    id: "bhamashah-swasthya-bima",
    name: "Bhamashah Swasthya Bima Yojana",
    shortName: "BSBY",
    state: "Rajasthan",
    description: "Rajasthan's state health insurance scheme providing cashless treatment at empanelled hospitals for BPL and eligible families.",
    eligibility: "BPL families, state government employees, and eligible categories registered with Bhamashah card.",
    coverage: "₹3,00,000 per family per year (general) + ₹3,00,000 for critical illnesses",
    officialUrl: "https://health.rajasthan.gov.in",
    isNational: false,
  },
  {
    id: "chiranjeevi",
    name: "Mukhyamantri Chiranjeevi Swasthya Bima Yojana",
    shortName: "Chiranjeevi",
    state: "Rajasthan",
    description: "Comprehensive health insurance for all families in Rajasthan with cashless treatment up to ₹25 lakh annually.",
    eligibility: "All families in Rajasthan. Registration through Jan Aadhaar or SSO portal.",
    coverage: "₹25,00,000 per family per year",
    officialUrl: "https://chiranjeevi.rajasthan.gov.in",
    isNational: false,
  },
  // Delhi
  {
    id: "delhi-arogya-kosh",
    name: "Delhi Arogya Kosh",
    shortName: "DAK",
    state: "Delhi",
    description: "Financial assistance for treatment of serious illnesses for Delhi residents at empanelled hospitals.",
    eligibility: "Delhi residents with income less than ₹3 lakh per annum for diseases not covered under other schemes.",
    coverage: "Up to ₹5,00,000 per case",
    officialUrl: "https://health.delhi.gov.in",
    isNational: false,
  },
  {
    id: "delhi-arogya-nidhi",
    name: "Delhi Arogya Nidhi",
    shortName: "DAN",
    state: "Delhi",
    description: "Medical treatment assistance for BPL patients at government hospitals in Delhi.",
    eligibility: "BPL families in Delhi for treatment at government hospitals.",
    coverage: "Variable based on treatment requirements",
    officialUrl: "https://health.delhi.gov.in",
    isNational: false,
  },
  // Telangana
  {
    id: "aarogyasri",
    name: "Dr. YSR Aarogyasri Health Care Trust",
    shortName: "Aarogyasri",
    state: "Telangana",
    description: "Telangana's flagship health scheme covering over 2,000 procedures including surgeries, therapies, and critical care.",
    eligibility: "White ration card holders in Telangana (annual income below ₹5 lakh).",
    coverage: "₹5,00,000 per family per year + additional ₹5,00,000 for critical care",
    officialUrl: "https://www.aarogyasri.telangana.gov.in",
    isNational: false,
  },
  // Andhra Pradesh
  {
    id: "ap-aarogyasri",
    name: "YSR Aarogyasri",
    shortName: "YSR Aarogyasri",
    state: "Andhra Pradesh",
    description: "Comprehensive health coverage for families in Andhra Pradesh covering 2,434 medical procedures.",
    eligibility: "White ration card holders in Andhra Pradesh.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://aarogyasri.ap.gov.in",
    isNational: false,
  },
  // Maharashtra
  {
    id: "mahatma-phule-jan-arogya",
    name: "Mahatma Jyotiba Phule Jan Arogya Yojana",
    shortName: "MJPJAY",
    state: "Maharashtra",
    description: "Maharashtra's health insurance scheme covering surgeries and therapies for BPL and eligible families.",
    eligibility: "Yellow and orange ration card holders, farmers with Aadhaar-linked bank accounts.",
    coverage: "₹1,50,000 per family per year (₹2,50,000 for kidney transplant)",
    officialUrl: "https://www.jeevandayee.gov.in",
    isNational: false,
  },
  // Tamil Nadu
  {
    id: "cm-health-insurance-tn",
    name: "Chief Minister's Comprehensive Health Insurance Scheme",
    shortName: "CMCHIS",
    state: "Tamil Nadu",
    description: "Universal health coverage for Tamil Nadu residents covering 1,027 procedures at network hospitals.",
    eligibility: "All families in Tamil Nadu with annual income below ₹1.2 lakh.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://www.cmchistn.com",
    isNational: false,
  },
  // Karnataka
  {
    id: "arogya-karnataka",
    name: "Arogya Karnataka",
    shortName: "Arogya Karnataka",
    state: "Karnataka",
    description: "Free outpatient and inpatient care for BPL families at government and empanelled private hospitals.",
    eligibility: "BPL card holders and Antyodaya Anna Yojana families.",
    coverage: "₹1,50,000 per family per year (primary + secondary care)",
    officialUrl: "https://karunadu.karnataka.gov.in",
    isNational: false,
  },
  {
    id: "yeshasvini",
    name: "Yeshasvini Cooperative Farmers Health Care Scheme",
    shortName: "Yeshasvini",
    state: "Karnataka",
    description: "Self-funded health scheme for cooperative society members covering surgeries and treatments.",
    eligibility: "Members of cooperative societies in Karnataka.",
    coverage: "Up to ₹2,50,000 per member per year for surgeries",
    officialUrl: "https://yeshasvini.karnataka.gov.in",
    isNational: false,
  },
  // Gujarat
  {
    id: "mukhyamantri-amrutum",
    name: "Mukhyamantri Amrutum Yojana",
    shortName: "MAY",
    state: "Gujarat",
    description: "Health insurance for BPL families in Gujarat covering critical illnesses and surgeries.",
    eligibility: "BPL families with annual income below ₹4 lakh (rural) or ₹4.50 lakh (urban).",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://magujarat.com",
    isNational: false,
  },
  // Kerala
  {
    id: "kasp",
    name: "Karunya Arogya Suraksha Padhathi",
    shortName: "KASP",
    state: "Kerala",
    description: "Kerala's comprehensive health scheme providing cashless treatment at empanelled hospitals.",
    eligibility: "Families with annual income below ₹3 lakh.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://sha.kerala.gov.in",
    isNational: false,
  },
  // West Bengal
  {
    id: "swasthya-sathi",
    name: "Swasthya Sathi",
    shortName: "Swasthya Sathi",
    state: "West Bengal",
    description: "Universal health coverage for West Bengal families with smart card-based cashless treatment.",
    eligibility: "All families in West Bengal (female head of family as primary beneficiary).",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://swasthyasathi.gov.in",
    isNational: false,
  },
  // Odisha
  {
    id: "biju-swasthya-kalyan",
    name: "Biju Swasthya Kalyan Yojana",
    shortName: "BSKY",
    state: "Odisha",
    description: "Health assurance providing free treatment at government and empanelled private hospitals.",
    eligibility: "All families covered under National/State Food Security, NFSA/SFSS beneficiaries.",
    coverage: "₹5,00,000 per family + ₹10,00,000 for women members per year",
    officialUrl: "https://bsky.odisha.gov.in",
    isNational: false,
  },
  // Punjab
  {
    id: "sarbat-sehat-bima",
    name: "Sarbat Sehat Bima Yojana",
    shortName: "SSBY",
    state: "Punjab",
    description: "Comprehensive health insurance covering secondary and tertiary care for Punjab residents.",
    eligibility: "SECC 2011 beneficiaries + all ration card holder families.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://sha.punjab.gov.in",
    isNational: false,
  },
  // Madhya Pradesh
  {
    id: "ayushman-bharat-mp",
    name: "Ayushman Bharat Niramayam",
    shortName: "AB Niramayam",
    state: "Madhya Pradesh",
    description: "Integrated with AB-PMJAY, extending coverage to additional beneficiaries in MP.",
    eligibility: "SECC families + state-added categories including Samagra Samajik Suraksha beneficiaries.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://health.mp.gov.in",
    isNational: false,
  },
  // Uttar Pradesh
  {
    id: "ayushman-bharat-up",
    name: "Ayushman Bharat - UP",
    shortName: "AB-UP",
    state: "Uttar Pradesh",
    description: "Extension of AB-PMJAY with additional state beneficiaries for comprehensive coverage.",
    eligibility: "SECC beneficiaries + workers in unorganized sector registered with e-shram portal.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://health.up.gov.in",
    isNational: false,
  },
  // Chhattisgarh
  {
    id: "khubchand-baghel",
    name: "Dr. Khubchand Baghel Swasthya Sahayata Yojana",
    shortName: "KBSSY",
    state: "Chhattisgarh",
    description: "Universal health coverage for all Chhattisgarh residents with cashless treatment facilities.",
    eligibility: "All families of Chhattisgarh with ration cards.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://dkbssy.cg.nic.in",
    isNational: false,
  },
  // Jharkhand
  {
    id: "mukhyamantri-jan-arogya",
    name: "Mukhyamantri Jan Arogya Yojana",
    shortName: "MJAY",
    state: "Jharkhand",
    description: "Comprehensive health scheme extending AB-PMJAY to additional beneficiaries in Jharkhand.",
    eligibility: "All ration card holder families in Jharkhand.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://jksha.gov.in",
    isNational: false,
  },
  // Bihar
  {
    id: "mukhyamantri-swasthya-bima",
    name: "Mukhyamantri Swasthya Bima Yojana",
    shortName: "MSBY",
    state: "Bihar",
    description: "State health insurance integrated with AB-PMJAY for Bihar residents.",
    eligibility: "SECC beneficiaries and state-added categories.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://statehealthinsurance.bihar.gov.in",
    isNational: false,
  },
  // Assam
  {
    id: "atal-amrit-abhiyan",
    name: "Atal Amrit Abhiyan",
    shortName: "AAA",
    state: "Assam",
    description: "Health assurance scheme covering selected diseases for economically weaker sections.",
    eligibility: "Families with annual income below ₹5 lakh.",
    coverage: "₹2,00,000 per family per year",
    officialUrl: "https://aaaofficer.assam.gov.in",
    isNational: false,
  },
  // Himachal Pradesh
  {
    id: "himcare",
    name: "HIMCARE",
    shortName: "HIMCARE",
    state: "Himachal Pradesh",
    description: "Universal health coverage for HP residents not covered under AB-PMJAY.",
    eligibility: "All residents of Himachal Pradesh (non-PMJAY beneficiaries need to register).",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://hpsbys.in",
    isNational: false,
  },
  // Uttarakhand
  {
    id: "atal-ayushman",
    name: "Atal Ayushman Uttarakhand Yojana",
    shortName: "AAUY",
    state: "Uttarakhand",
    description: "Universal health coverage extending AB-PMJAY benefits to all Uttarakhand residents.",
    eligibility: "All families with ration cards in Uttarakhand.",
    coverage: "₹5,00,000 per family per year",
    officialUrl: "https://ayushmanuttarakhand.org",
    isNational: false,
  },
  // Goa
  {
    id: "deen-dayal-swasthya-seva",
    name: "Deen Dayal Swasthya Seva Yojana",
    shortName: "DDSSY",
    state: "Goa",
    description: "Health insurance for all Goa residents providing cashless treatment at network hospitals.",
    eligibility: "All residents of Goa with valid identity proof.",
    coverage: "₹4,00,000 per family per year",
    officialUrl: "https://www.ddssy.goa.gov.in",
    isNational: false,
  },
];

// City to state mapping for major cities
export const CITY_STATE_MAP: Record<string, string> = {
  // Rajasthan
  "jaipur": "Rajasthan",
  "jodhpur": "Rajasthan",
  "udaipur": "Rajasthan",
  "kota": "Rajasthan",
  "ajmer": "Rajasthan",
  "bikaner": "Rajasthan",
  
  // Delhi
  "delhi": "Delhi",
  "new delhi": "Delhi",
  "noida": "Uttar Pradesh",
  "gurgaon": "Haryana",
  "gurugram": "Haryana",
  "faridabad": "Haryana",
  "ghaziabad": "Uttar Pradesh",
  
  // Telangana
  "hyderabad": "Telangana",
  "secunderabad": "Telangana",
  "warangal": "Telangana",
  
  // Andhra Pradesh
  "visakhapatnam": "Andhra Pradesh",
  "vijayawada": "Andhra Pradesh",
  "guntur": "Andhra Pradesh",
  "tirupati": "Andhra Pradesh",
  
  // Maharashtra
  "mumbai": "Maharashtra",
  "pune": "Maharashtra",
  "nagpur": "Maharashtra",
  "nashik": "Maharashtra",
  "thane": "Maharashtra",
  "aurangabad": "Maharashtra",
  
  // Tamil Nadu
  "chennai": "Tamil Nadu",
  "coimbatore": "Tamil Nadu",
  "madurai": "Tamil Nadu",
  "salem": "Tamil Nadu",
  "tiruchirappalli": "Tamil Nadu",
  
  // Karnataka
  "bangalore": "Karnataka",
  "bengaluru": "Karnataka",
  "mysore": "Karnataka",
  "mysuru": "Karnataka",
  "mangalore": "Karnataka",
  "hubli": "Karnataka",
  
  // Gujarat
  "ahmedabad": "Gujarat",
  "surat": "Gujarat",
  "vadodara": "Gujarat",
  "rajkot": "Gujarat",
  
  // Kerala
  "kochi": "Kerala",
  "cochin": "Kerala",
  "thiruvananthapuram": "Kerala",
  "kozhikode": "Kerala",
  "thrissur": "Kerala",
  
  // West Bengal
  "kolkata": "West Bengal",
  "howrah": "West Bengal",
  "durgapur": "West Bengal",
  "siliguri": "West Bengal",
  
  // Odisha
  "bhubaneswar": "Odisha",
  "cuttack": "Odisha",
  "rourkela": "Odisha",
  
  // Punjab
  "chandigarh": "Punjab",
  "ludhiana": "Punjab",
  "amritsar": "Punjab",
  "jalandhar": "Punjab",
  
  // Madhya Pradesh
  "bhopal": "Madhya Pradesh",
  "indore": "Madhya Pradesh",
  "jabalpur": "Madhya Pradesh",
  "gwalior": "Madhya Pradesh",
  
  // Uttar Pradesh
  "lucknow": "Uttar Pradesh",
  "kanpur": "Uttar Pradesh",
  "agra": "Uttar Pradesh",
  "varanasi": "Uttar Pradesh",
  "prayagraj": "Uttar Pradesh",
  "allahabad": "Uttar Pradesh",
  
  // Bihar
  "patna": "Bihar",
  "gaya": "Bihar",
  "muzaffarpur": "Bihar",
  
  // Jharkhand
  "ranchi": "Jharkhand",
  "jamshedpur": "Jharkhand",
  "dhanbad": "Jharkhand",
  
  // Chhattisgarh
  "raipur": "Chhattisgarh",
  "bhilai": "Chhattisgarh",
  
  // Assam
  "guwahati": "Assam",
  "dibrugarh": "Assam",
  
  // Himachal Pradesh
  "shimla": "Himachal Pradesh",
  "manali": "Himachal Pradesh",
  "dharamshala": "Himachal Pradesh",
  
  // Uttarakhand
  "dehradun": "Uttarakhand",
  "haridwar": "Uttarakhand",
  "rishikesh": "Uttarakhand",
  
  // Goa
  "panaji": "Goa",
  "margao": "Goa",
  "vasco": "Goa",
  
  // Haryana (Note: Chandigarh is a UT, mapped above to Punjab for scheme purposes)
  "karnal": "Haryana",
  "panipat": "Haryana",
  "rohtak": "Haryana",
  "hisar": "Haryana",
  "ambala": "Haryana",
};

// Get schemes for a given location (city or state)
export function getSchemesForLocation(location: string): StateScheme[] {
  const locationLower = location.toLowerCase().trim();
  
  // Try to find state from city mapping
  const state = CITY_STATE_MAP[locationLower] || locationLower;
  
  // Always include national scheme
  const nationalSchemes = STATE_SCHEMES.filter(s => s.isNational);
  
  // Find state-specific schemes (case-insensitive match)
  const stateSchemes = STATE_SCHEMES.filter(
    s => !s.isNational && s.state.toLowerCase() === state.toLowerCase()
  );
  
  return [...nationalSchemes, ...stateSchemes];
}

// Get all unique states
export function getAllStates(): string[] {
  const states = new Set(STATE_SCHEMES.filter(s => !s.isNational).map(s => s.state));
  return Array.from(states).sort();
}

// Get scheme portability info
export function getPortabilityInfo(fromState: string, toState: string): string {
  if (fromState.toLowerCase() === toState.toLowerCase()) {
    return "You are within your home state. All your enrolled schemes apply.";
  }
  
  return `When traveling from ${fromState} to ${toState}:
  
• **Ayushman Bharat (PMJAY)** is portable across all states. Use your Ayushman card at any empanelled hospital in ${toState}.

• **State schemes** like those from ${fromState} may NOT be directly usable in ${toState}. You may need to:
  1. Get treatment at empanelled hospitals only
  2. Carry pre-authorization documents
  3. File for reimbursement after returning

• For planned medical travel, contact your scheme's helpline before traveling.`;
}
