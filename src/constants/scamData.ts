import { ScamAlert, ScamCategory } from '@/types/studentCompanion';

export const SCAM_CATEGORIES: { id: ScamCategory; label: string; icon: string }[] = [
  { id: 'fake_listings', label: 'Fake PG / Hostels', icon: 'home' },
  { id: 'deposit_fraud', label: 'Deposit & Advance Theft', icon: 'cash' },
  { id: 'fake_brokers', label: 'Fake Property Brokers', icon: 'person-circle' },
  { id: 'fake_jobs', label: 'Fake Internships & Jobs', icon: 'briefcase' },
  { id: 'admission_fraud', label: 'Admission & Scholarship', icon: 'school' },
  { id: 'payment_upi', label: 'UPI & QR Code Frauds', icon: 'qr-code' },
  { id: 'transport_fraud', label: 'Transport Overcharging', icon: 'car' },
  { id: 'other', label: 'Other Student Scams', icon: 'shield-alert' },
];

export const INITIAL_SCAM_ALERTS: ScamAlert[] = [
  {
    id: 'scam-blr-qr-deposit',
    title: 'Fake Army / CISF Officer Rent Advance QR Code Trap',
    city: 'Bengaluru',
    category: 'payment_upi',
    verificationStatus: 'official_advisory',
    sourceName: 'Bengaluru City Police Cyber Advisory & RBI Kehta Hai',
    sourceLink: 'https://cybercrime.gov.in',
    sourceDate: '2026-03-15',
    reportedCount: 42,
    whatHappens:
      'Fraudster poses as an Indian Army officer or airport CISF officer transferring out of city. They post lavish PG / 1BHK photos at unusually cheap rent. When the student calls, the fraudster asks for a ₹2,000 "gate entry pass token" via UPI. They send a QR code claiming "Scan this to receive token receipt" which instead deducts money from the student account.',
    warningSigns: [
      'Landlord refuses a physical video call or room visit, claiming they are posted on defense duty.',
      'Rent is 40% below market average for prime locations (e.g., Koramangala, Indiranagar).',
      'Asks you to scan a QR code to "receive confirmation money" or enter your UPI PIN.',
      'Threatens that 5 other students are waiting to transfer the deposit right now.',
    ],
    preventionTips: [
      'NEVER scan a QR code or enter your UPI PIN to receive money. Entering a PIN ALWAYS deducts funds.',
      'Never transfer a single rupee before physically visiting the room in person.',
      'Check landlord phone numbers on Truecaller or ask the PG building security guard directly.',
    ],
    recoverySteps: [
      'IMMEDIATELY call the National Cyber Crime Helpline at 1930 within the first 2-3 hours (Golden Hour).',
      'Log into net banking and block your UPI handle / debit card instantly.',
      'File an official incident report with transaction UTR at cybercrime.gov.in.',
      'Save WhatsApp chat screenshots and transaction receipts for FIR reference.',
    ],
  },
  {
    id: 'scam-pune-hinjewadi-gatepass',
    title: 'Fake Owner "Visitor Gate Pass" Deposit Before Visiting',
    city: 'Pune',
    category: 'fake_listings',
    verificationStatus: 'verified_incident',
    sourceName: 'Pune City Police Cyber Cell Student Safety Circular',
    sourceLink: 'https://punepolice.gov.in',
    sourceDate: '2026-04-10',
    reportedCount: 29,
    whatHappens:
      'In tech corridors like Hinjewadi Phase 1 & Wakad, scam brokers scrape real photos from legitimate gated societies. When freshers ask to see the flat, the scammer claims the society security requires a ₹1,500 refundable "Society Visiting Pass Fee" before security permits gate entry. Once paid on UPI, the number is permanently blocked.',
    warningSigns: [
      'Demands visiting pass fees or security deposit BEFORE you even step into the building.',
      'Genuine gated societies NEVER charge visitors or prospective tenants a viewing fee.',
      'Owner refuses to share society flat number until payment is sent.',
    ],
    preventionTips: [
      'Walk directly to the society security gate yourself; ask guards for genuine flat vacancies.',
      'Remember: Zero legitimate societies or PGs charge money simply to inspect a vacant room.',
    ],
    recoverySteps: [
      'Report the UPI VPA to your bank fraud department and request a chargeback / freeze on the recipient account.',
      'Dial 1930 to lodge a complaint with transaction reference numbers.',
    ],
  },
  {
    id: 'scam-delhi-north-broker-forfeit',
    title: 'Fake Stamp Paper Advance with Disappearing Non-Refundable Clause',
    city: 'Delhi NCR',
    category: 'deposit_fraud',
    verificationStatus: 'verified_incident',
    sourceName: 'Delhi Police Citizen Advisory (North Campus)',
    sourceLink: 'https://delhipolice.gov.in',
    sourceDate: '2026-02-18',
    reportedCount: 35,
    whatHappens:
      'In student hubs around Kamla Nagar and GTB Nagar, unauthorized middlemen collect a ₹10,000 "holding advance" promising agreement papers on move-in day. On day 1, they introduce hidden conditions (e.g. ₹6,000 mandatory painting fee deduction, 10 PM lock). When the student refuses, the broker claims advances are strictly non-refundable and withholds the cash.',
    warningSigns: [
      'Middleman gives a handwritten slip instead of an authorized registered receipt or stamp agreement.',
      'Refuses to write "Full token refundable if terms not agreed upon" on WhatsApp or receipt.',
      'Pressure tactics: "Pay now or seat goes to another student from DU".',
    ],
    preventionTips: [
      'Demand that any advance slip explicitly mentions: "Refundable in full if physical inspection or draft agreement is rejected by student".',
      'Pay only by bank account transfer / UPI with a note "Refundable Token for Room 204", never raw cash.',
    ],
    recoverySteps: [
      'Approach the local student union / college grievance cell or beat constable at the local police station.',
      'File an online complaint with Delhi Police Public Grievance portal citing breach of trust (Section 406/420 IPC / BNS equivalent).',
    ],
  },
  {
    id: 'scam-national-fake-internship',
    title: 'Paid Placement / "Laptop Security Deposit" Internship Scam',
    city: 'All Cities',
    category: 'fake_jobs',
    verificationStatus: 'official_advisory',
    sourceName: 'Ministry of Labour & Employment / AICTE Advisory',
    sourceLink: 'https://aicte-india.org',
    sourceDate: '2026-01-20',
    reportedCount: 58,
    whatHappens:
      'Students looking for part-time income or summer internships receive unsolicited WhatsApp / Telegram offers from fake HR recruiters offering ₹25,000/month work-from-home stipend. After an informal 5-minute chat, they demand ₹3,000 to ₹8,000 as a "company laptop security deposit" or "HR portal verification charge".',
    warningSigns: [
      'Recruiter uses a Gmail/Yahoo address or WhatsApp instead of official company domain emails.',
      'Offers high stipends for low-skill tasks (e.g. data entry, reviewing hotel Google maps).',
      'ANY request for money from a student to secure an internship or training.',
    ],
    preventionTips: [
      'Legitimate companies NEVER ask candidates to pay for training, equipment, or interview fees.',
      'Verify company openings directly on their official careers page or LinkedIn profile.',
    ],
    recoverySteps: [
      'Report the scam phone number and UPI ID to cybercrime.gov.in.',
      'Block the sender immediately and alert your college placement cell.',
    ],
  },
  {
    id: 'scam-blr-auto-rigged-meter',
    title: 'Airport / Railway Station Rigged Auto Meter & Route Diversion',
    city: 'Bengaluru',
    category: 'transport_fraud',
    verificationStatus: 'general_warning',
    sourceName: 'Bengaluru Traffic Police Guidelines',
    sourceLink: 'https://btp.gov.in',
    sourceDate: '2026-05-02',
    reportedCount: 19,
    whatHappens:
      'Auto drivers outside Majestic railway station or Yashwantpur target arriving students with heavy luggage. They quote ₹800+ for a ₹250 journey or secretly use tampered speedometers that run twice as fast, claiming "night charges" or "one-way luggage tariff".',
    warningSigns: [
      'Driver refuses to turn on the prepaid counter or standard digital meter.',
      'Claims aggregator apps (Ola/Uber/Namma Yatri) are on strike or illegal.',
      'Refuses to take the direct ring-road route.',
    ],
    preventionTips: [
      'Use official Bengaluru Traffic Police Pre-Paid Auto stands located outside major railway stations.',
      'Use BMTC Vayu Vajra or ordinary city buses connecting Majestic to Koramangala, Whitefield, and Electronic City.',
      'Compare rates on open apps like Namma Yatri or Uber before boarding.',
    ],
    recoverySteps: [
      'Note down the auto registration number (KA 0x XX xxxx).',
      'Dial 080-22868550 / 080-22868444 or tweet @blrcitytraffic with the vehicle number and receipt for penalty.',
    ],
  },
  {
    id: 'scam-user-sample-btm',
    title: 'Unverified Student Report: Dual Electricity Bill on Move-out',
    city: 'Bengaluru',
    category: 'other',
    verificationStatus: 'user_report',
    sourceName: 'Student Community Submission (Under Review)',
    sourceDate: '2026-10-08',
    reportedCount: 3,
    whatHappens:
      'A student reported that their BTM 1st Stage landlord charged ₹4,000 for "unpaid backdated building common electricity" when vacating, deducting it from deposit despite regular monthly rent payments.',
    warningSigns: [
      'Landlord does not provide electricity bill receipts during monthly stays.',
      'No mention of common area electricity split in original agreement.',
    ],
    preventionTips: [
      'Ask for monthly BESCOM bill breakdown every month with your rent receipt.',
      'Ensure agreement states electricity covers room submeter only.',
    ],
    recoverySteps: [
      'Demand original BESCOM consumer bills and submeter comparison before vacating.',
    ],
  },
  {
    id: 'scam-indore-bhawarkua-advance',
    title: 'Bhawarkua Coaching Hostel Fake Token Money Scam',
    city: 'Indore',
    category: 'deposit_fraud',
    verificationStatus: 'official_advisory',
    sourceName: 'Indore Cyber Crime Cell Advisory & Student Safety Warning',
    sourceLink: 'https://mppolice.gov.in',
    sourceDate: '2026-09-20',
    reportedCount: 38,
    whatHappens:
      'Fraudsters post pictures of furnished AC rooms near Bhanwarkuan and Geeta Bhawan coaching hubs at just ₹3,500/month on OLX, Telegram, and Facebook groups. When MPPSC, IIT-JEE, or NEET aspirants contact them, the scammer claims "only 1 single bed left for the upcoming batch" and asks for a ₹2,000 seat booking fee via UPI. Once transferred, the student is blocked and arrives at an unrelated building.',
    warningSigns: [
      'Rent is significantly lower than average Bhawarkua rates (standard is ₹6,000–₹8,000 with food).',
      'The caller creates urgent panic ("Send ₹2,000 right now or I am giving the room to another student in 10 mins").',
      'Refuses to allow you or an Indore local friend to inspect the room physically before payment.',
      'Refuses to share full street address or building name until token money is transferred.',
    ],
    preventionTips: [
      'Never send booking money without visiting the hostel premises in Bhawarkua or Geeta Bhawan in person.',
      'If you are currently outside Indore, ask a friend or senior to inspect the building first.',
      'Always pay booking advances at the hostel office desk and collect a stamped, signed paper receipt.',
    ],
    recoverySteps: [
      'Immediately dial 1930 (National Cyber Crime Helpline) within 2 hours of payment.',
      'Report the UPI transaction ID / UTR and recipient account to your bank to freeze funds.',
      'Submit the complaint online on cybercrime.gov.in with screenshots of chats and listings.',
    ],
  },
  {
    id: 'scam-indore-fake-library-sub',
    title: 'Fake 24x7 AC Study Library Annual Fee Trap',
    city: 'Indore',
    category: 'admission_fraud',
    verificationStatus: 'verified_incident',
    sourceName: 'Bhawarkua Student Union Advisory',
    sourceDate: '2026-08-15',
    reportedCount: 19,
    whatHappens:
      'Scammers distribute pamphlets outside coaching institutes offering "24x7 High-Speed Wi-Fi Self-Study AC Library" with personal locker for a discounted annual subscription of ₹2,000. Students pay online to reserve a seat, but the facility never opens or shuts down abruptly within 2 weeks.',
    warningSigns: [
      'Demands 6 months or 1 year subscription upfront with no monthly trial option.',
      'Under-construction or locked basement premises shown with vague opening dates.',
    ],
    preventionTips: [
      'Insist on paying monthly fees only after verifying operating AC, Wi-Fi, and power backup.',
      'Check how long the library has been operating and speak to existing students.',
    ],
    recoverySteps: [
      'Lodge a joint complaint at Bhanwarkuan Police Station with other affected students.',
    ],
  },
];
