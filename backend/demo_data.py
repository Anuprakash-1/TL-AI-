from typing import List, Dict, Any

DEMO_REPORTS: List[Dict[str, Any]] = [
    {
        "report_id": "DEMO-TL-RBI2000",
        "is_demo": True,
        "demo_label": "DEMONSTRATION CASE STUDY",
        "submitted_content": "Viral WhatsApp Forward: Reserve Bank of India has embedded NGC (Nano GPS Chip) in the new ₹2000 currency notes. It does not require any power source. When notes are accumulated in one place, satellites can track the exact coordinates up to 120 meters under the ground to eliminate black money.",
        "submitted_url": None,
        "headline": "Viral WhatsApp Claim: ₹2000 Currency Notes Contain Nano GPS Satellite Chips",
        "language": "en",
        "country": "IN",
        "verdict": "FALSE",
        "verdict_definition": "Strong, reliable evidence from official records, primary documentation, or established investigations directly contradicts the claim.",
        "explanation": "Official statements from the Reserve Bank of India (RBI) and multiple independent technical evaluations confirm that no Indian currency notes have ever been fitted with GPS chips or electronic tracking devices. The Reserve Bank officially characterized the rumors as completely baseless when the note was issued in November 2016.",
        "what_evidence_establishes": "Official technical specifications from the Reserve Bank of India confirm ₹2000 currency notes carry standard paper security features with zero electronic or semiconductor components.",
        "corrected_information": "Indian currency notes do not contain GPS microchips, antennas, or batteries. Satellite-based radio tracking through concrete without an active power cell is physically impossible.",
        "final_conclusion": "The claim is completely false and contradicted by central banking authorities and physical engineering limits.",
        "extracted_claims": [
            {
                "claim_id": "claim-1",
                "claim_text": "RBI ₹2000 currency notes are embedded with Nano GPS Chips (NGC) that enable satellite tracking underground.",
                "entities": ["Reserve Bank of India", "₹2000 Note", "Nano GPS Chip", "Satellites"],
                "time_period": "November 2016 – Present",
                "category": "economics_business",
                "verifiability": "SPECIFIC_FACTUAL",
                "verdict": "FALSE",
                "verdict_definition": "Reliable evidence directly contradicts the claim, or primary authorities have officially debunked it as untrue.",
                "explanation": "The Reserve Bank of India officially clarified that the ₹2000 note carries standard currency security features such as watermarks, latent images, and security threads, and contains zero electronic components. Technical experts note that passive GPS tracking from satellites through earth and concrete without an active antenna or power cell is physically impossible.",
                "what_evidence_establishes": "Primary RBI gazette notifications establish all 17 security features of the note contain zero microchips or transmitters.",
                "corrected_information": "Banknotes contain no electronic components; viral claims of satellite GPS tracking are fabricated.",
                "supporting_evidence_indices": [],
                "contradicting_evidence_indices": [0, 1, 2],
                "context_evidence_indices": [3],
                "remaining_uncertainties": ["None regarding the technical absence of chips; ₹2000 notes were later withdrawn from circulation in May 2023 for unrelated policy reasons."]
            }
        ],
        "evidence_sources": [
            {
                "title": "No, India's 2,000 Rupee notes do not contain nano chips - AFP Fact Check",
                "publisher": "AFP Fact Check (IFCN Signatory)",
                "url": "https://factcheck.afp.com/no-indias-2000-rupee-notes-do-not-contain-nano-chips",
                "published_at": "2019-02-13T08:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "The Reserve Bank of India told AFP that the claim circulating on social media that ₹2,000 notes contain a Nano GPS Chip is 'completely fictitious and without basis.'",
                "evidence_relation": "CONTRADICTS",
                "relevance_explanation": "Quotes direct on-record confirmation from the central banking authority debunking the presence of any GPS chip.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "CERTIFIED_FACT_CHECKER"
            },
            {
                "title": "Security Features of Indian Banknotes - Reserve Bank of India",
                "publisher": "Reserve Bank of India (Official Website)",
                "url": "https://rbi.org.in/Scripts/FAQView.aspx?Id=136",
                "published_at": "2016-11-08T00:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "Official notification outlining all 17 security features of the ₹2000 banknote: intaglio printing, microlettering, color-shifting windowed security thread, and see-through register. No microchips or transmitters are listed.",
                "evidence_relation": "CONTRADICTS",
                "relevance_explanation": "Primary constitutional authority document detailing full technical anatomy of the note.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "GOVERNMENT_PRIMARY"
            },
            {
                "title": "Fact Check: The Myth of Nano GPS Chip in ₹2000 Note",
                "publisher": "BOOM Live",
                "url": "https://www.boomlive.in/fact-file/2000-rupee-note-nano-gps-chip-myth-fact-check",
                "published_at": "2016-11-10T11:30:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "Analysis demonstrating that RFID and GPS chips require battery power and substantial dimensions that cannot be concealed inside a standard 0.11mm thick banknote.",
                "evidence_relation": "CONTRADICTS",
                "relevance_explanation": "Technical and engineering evaluation of physical constraints.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "CERTIFIED_FACT_CHECKER"
            },
            {
                "title": "Withdrawal of ₹2000 Denomination Banknotes - RBI Press Release",
                "publisher": "Press Information Bureau (PIB)",
                "url": "https://pib.gov.in/PressReleasePage.aspx?PRID=1925648",
                "published_at": "2023-05-19T17:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "The Reserve Bank of India announced the withdrawal of ₹2,000 denomination banknotes from circulation under the Clean Note Policy. Banknotes continued to remain legal tender.",
                "evidence_relation": "CONTEXT",
                "relevance_explanation": "Provides historical background on the eventual lifecycle of the denomination.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "GOVERNMENT_PRIMARY"
            }
        ],
        "source_comparison": {
            "source_a": "AFP Fact Check & RBI: Explicitly denied presence of tracking hardware, citing physical impossibilities and regulatory facts.",
            "source_b": "PIB & RBI Official Gazettes: Full specifications of currency security features show no electronic or semiconductor components.",
            "additional_sources": "Cross-verified with independent IFCN signatory BOOM Live.",
            "areas_of_agreement": [
                "All credible sources agree that no currency note in India has ever possessed electronic chips.",
                "All sources agree the viral message was fabricated on social media messaging groups."
            ],
            "areas_of_disagreement": [],
            "common_origin_suspected": False,
            "comparison_summary": "Unanimous agreement across banking authorities, engineering analyses, and certified fact-checkers."
        },
        "verification_method": {
            "search_queries": [
                "\"₹2000 note\" \"GPS chip\" fact check",
                "RBI official notification security features 2000 note",
                "AFP factcheck nano chip 2000 rupee note",
                "PIB fact check 2000 note microchip"
            ],
            "source_types": ["Constitutional/Central Bank Record", "Certified Fact-Checking Bureau", "National Press Bureau"],
            "date_ranges": "November 2016 – October 2026",
            "evaluation_criteria": [
                "Primary source documentation from the currency-issuing authority (RBI)",
                "Independent technical verification by certified IFCN signatories",
                "Physical and electrical engineering feasibility"
            ],
            "important_limitations": [
                "Demonstration case study prepared to exhibit multi-source verification architecture."
            ]
        },
        "confidence_level": "HIGH",
        "confidence_reason": "Direct, authoritative on-record statement from the central bank and physical impossibility documented by engineers.",
        "research_coverage": "HIGH",
        "coverage_reason": "Multiple primary government documents and certified fact-checker reports examined.",
        "checked_at": "2026-10-23T14:30:00Z",
        "limitations": [
            "Demonstration archive record for illustrative inspection.",
            "Exemplifies multi-source synthesis, source comparison, and verdict categorization."
        ],
        "live_search_available": True,
        "warning_notice": None
    },
    {
        "report_id": "DEMO-TL-ISRO3",
        "is_demo": True,
        "demo_label": "DEMONSTRATION CASE STUDY",
        "submitted_content": "India's Chandrayaan-3 successfully touched down on the lunar south pole region on August 23, 2023, making India the first nation to soft-land near the lunar south pole.",
        "submitted_url": "https://www.isro.gov.in/Chandrayaan3_Details.html",
        "headline": "Chandrayaan-3 Lunar South Pole Soft Landing",
        "language": "en",
        "country": "IN",
        "verdict": "TRUE",
        "verdict_definition": "Strong, reliable evidence from authoritative or primary sources directly supports the factual claim.",
        "explanation": "Extensive primary documentation from ISRO, telemetry corroboration from international deep space networks (NASA DSN and ESA), and peer-reviewed scientific publications substantiate that the Vikram lander successfully executed a powered soft descent near 69.37°S, 32.35°E on August 23, 2023.",
        "what_evidence_establishes": "Primary space agency telemetry and international deep space ground tracking confirm the Vikram lander executed a soft landing near the lunar south pole on August 23, 2023 at 18:04 IST.",
        "corrected_information": None,
        "final_conclusion": "The claim is true and substantiated by authentic space agency telemetry and independent orbital imagery.",
        "extracted_claims": [
            {
                "claim_id": "claim-1",
                "claim_text": "Chandrayaan-3 achieved a successful soft touchdown near the lunar south pole on August 23, 2023.",
                "entities": ["Chandrayaan-3", "ISRO", "Moon", "Lunar South Pole", "Vikram Lander"],
                "time_period": "August 23, 2023",
                "category": "science_tech",
                "verifiability": "SPECIFIC_FACTUAL",
                "verdict": "TRUE",
                "verdict_definition": "Strong, reliable evidence from authoritative or primary sources directly supports the factual claim.",
                "explanation": "Corroborated by primary orbital telemetry, international ground station tracking (NASA/ESA), and photographic confirmation from the Lunar Reconnaissance Orbiter (LRO).",
                "what_evidence_establishes": "ISRO telemetry and international deep space station data confirm the successful lunar soft landing.",
                "corrected_information": None,
                "supporting_evidence_indices": [0, 1],
                "contradicting_evidence_indices": [],
                "context_evidence_indices": [],
                "remaining_uncertainties": []
            }
        ],
        "evidence_sources": [
            {
                "title": "Chandrayaan-3 Mission Landing Notification - ISRO",
                "publisher": "Indian Space Research Organisation (ISRO)",
                "url": "https://www.isro.gov.in/Chandrayaan3_Details.html",
                "published_at": "2023-08-23T18:04:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "India's Chandrayaan-3 successfully completed its powered descent sequence and achieved a safe and soft landing on the Moon at 18:04 IST on August 23, 2023.",
                "evidence_relation": "SUPPORTS",
                "relevance_explanation": "Primary space agency record documenting telemetry and descent confirmation.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "GOVERNMENT_PRIMARY"
            },
            {
                "title": "India makes historic moon landing near south pole - Reuters",
                "publisher": "Reuters International News Agency",
                "url": "https://www.reuters.com/technology/space/indias-chandrayaan-3-moon-landing-2023-08-23/",
                "published_at": "2023-08-23T13:30:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "India became the first nation to land a spacecraft near the moon's south pole on Wednesday, an unexplored territory that scientists believe could hold vital reserves of frozen water.",
                "evidence_relation": "SUPPORTS",
                "relevance_explanation": "Global independent wire reporting corroborating international reception and verified landing parameters.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "GLOBAL_NEWS_WIRE"
            }
        ],
        "source_comparison": {
            "source_a": "ISRO: Provided direct engineering telemetry, coordinates (69.37°S, 32.35°E), and Pragyan rover deployment status.",
            "source_b": "Reuters & International Deep Space Networks: Verified telemetry independently via NASA and ESA tracking stations.",
            "additional_sources": "Corroborated by NASA Lunar Reconnaissance Orbiter imaging.",
            "areas_of_agreement": [
                "Exact landing date (August 23, 2023)",
                "Landing zone in the lunar south polar region",
                "Safe operational status of lander"
            ],
            "areas_of_disagreement": [],
            "common_origin_suspected": False,
            "comparison_summary": "Complete convergence across primary space agency data and independent international ground networks."
        },
        "verification_method": {
            "search_queries": [
                "Chandrayaan-3 landing date ISRO official",
                "Reuters Chandrayaan 3 lunar south pole landing"
            ],
            "source_types": ["National Space Agency", "Global News Wire"],
            "date_ranges": "August 2023",
            "evaluation_criteria": ["Primary telemetry", "Independent orbital imagery"],
            "important_limitations": ["Historical verification of established scientific event."]
        },
        "confidence_level": "HIGH",
        "confidence_reason": "Direct telemetry and independent multi-nation tracking consensus.",
        "research_coverage": "HIGH",
        "coverage_reason": "Multiple primary and independent wire records examined.",
        "checked_at": "2026-10-23T14:35:00Z",
        "limitations": ["Demonstration case study."],
        "live_search_available": True,
        "warning_notice": None
    },
    {
        "report_id": "DEMO-TL-KANYASUMANGALA",
        "is_demo": True,
        "demo_label": "DEMONSTRATION CASE STUDY",
        "submitted_content": "वायरल व्हाट्सएप मैसेज: 'केंद्र सरकार की नई योजना के तहत हर बेटी को ₹50,000 की राशि सीधे बैंक खाते में दी जा रही है। तुरंत नीचे दिए लिंक पर क्लिक करके फॉर्म भरें।' (Viral claim: Central Government giving ₹50,000 cash directly to every girl child's account).",
        "submitted_url": None,
        "headline": "हिंदी वायरल दावा: बेटियों को केंद्र सरकार की तरफ से ₹50,000 की मुफ्त सहायता",
        "language": "hi",
        "country": "IN",
        "verdict": "FALSE",
        "verdict_definition": "Strong, reliable evidence from official records, primary documentation, or established investigations directly contradicts the claim.",
        "explanation": "पीआईबी फैक्ट चेक (PIB Fact Check) और महिला एवं बाल विकास मंत्रालय द्वारा यह स्पष्ट किया जा चुका है कि केंद्र सरकार द्वारा ऐसी कोई योजना नहीं चलाई जा रही है जिसमें ₹50,000 नकद सीधे दिए जाएं। यह संदेश एक साइबर फ्रॉड/फ़िशिंग लिंक है। उत्तर प्रदेश सरकार की 'कन्या सुमंगला योजना' ₹25,000 (संशोधित) की सहायता छह चरणों में शिक्षा व स्वास्थ्य से जोड़कर देती है, न कि एकमुश्त नकद।",
        "what_evidence_establishes": "पीआईबी और संबंधित मंत्रालय के आधिकारिक रिकॉर्ड पुष्टि करते हैं कि केंद्र सरकार द्वारा ₹50,000 नकद वितरण की कोई योजना शुरू नहीं की गई है।",
        "corrected_information": "वायरल संदेश फर्जी फ़िशिंग धोखाधड़ी है। सरकारी योजनाओं की आधिकारिक जानकारी केवल .gov.in पोर्टल्स पर ही मिलती है।",
        "final_conclusion": "दावा पूर्णतः फर्जी (False) है और धोखाधड़ी के उद्देश्य से प्रसारित किया गया है।",
        "extracted_claims": [
            {
                "claim_id": "claim-1",
                "claim_text": "केंद्र सरकार हर बेटी को सीधे खाते में ₹50,000 की नकद राशि प्रदान कर रही है।",
                "entities": ["केंद्र सरकार", "₹50,000", "बेटी योजना"],
                "time_period": "2023–2026",
                "category": "government_policy",
                "verifiability": "SPECIFIC_FACTUAL",
                "verdict": "FALSE",
                "verdict_definition": "विश्वसनीय साक्ष्य दावे का सीधे खंडन करते हैं।",
                "explanation": "प्रेस सूचना ब्यूरो (PIB) ने इस वायरल मैसेज को फर्जी (Fake) घोषित किया है और नागरिकों को अज्ञात लिंक पर व्यक्तिगत या बैंकिंग जानकारी न देने की सलाह दी है।",
                "what_evidence_establishes": "पीआईबी फैक्ट चेक ने प्रमाणित किया कि सरकार ने ऐसा कोई आदेश जारी नहीं किया है।",
                "corrected_information": "केंद्र सरकार की ऐसी कोई योजना नहीं है। यह फ़िशिंग लिंक है।",
                "supporting_evidence_indices": [],
                "contradicting_evidence_indices": [0, 1],
                "context_evidence_indices": [],
                "remaining_uncertainties": ["संदेश में दिए गए दुर्भावनापूर्ण लिंक का सर्वर ऑपरेटर।"]
            }
        ],
        "evidence_sources": [
            {
                "title": "PIB Fact Check: केंद्र सरकार नहीं दे रही ₹50,000 की नकद सहायता - PIB India",
                "publisher": "Press Information Bureau (PIB)",
                "url": "https://pib.gov.in/FactCheck.aspx",
                "published_at": "2023-11-15T10:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "सोशल मीडिया पर एक मैसेज वायरल हो रहा है जिसमें दावा किया गया है कि केंद्र सरकार हर बेटी को 50,000 रुपये दे रही है। यह दावा फर्जी है। केंद्र सरकार ऐसी कोई योजना नहीं चला रही।",
                "evidence_relation": "CONTRADICTS",
                "relevance_explanation": "भारत सरकार के आधिकारिक जनसंपर्क और फैक्ट चेक विभाग द्वारा सीधे तौर पर खंडन।",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "GOVERNMENT_PRIMARY"
            },
            {
                "title": "फैक्ट चेक: कन्या सुमंगला योजना में 50 हजार रुपये मिलने का सच क्या है? - Alt News Hindi",
                "publisher": "Alt News Hindi (IFCN Signatory)",
                "url": "https://www.altnews.in/hindi/fact-check-kanya-sumangala-scheme-viral-forward/",
                "published_at": "2023-12-04T14:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "जांच में पाया गया कि वायरल मैसेज के साथ दिया गया लिंक फ़िशिंग वेबसाइट का है जिसका मकसद यूज़र्स का डेटा चुराना है। सरकारी योजनाओं के लिए केवल आधिकारिक .gov.in पोर्टल्स पर ही आवेदन होता है।",
                "evidence_relation": "CONTRADICTS",
                "relevance_explanation": "स्वतंत्र तथ्य-जांच संगठन द्वारा दुर्भावनापूर्ण लिंक और भ्रामक संदेश का विश्लेषण।",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "CERTIFIED_FACT_CHECKER"
            }
        ],
        "source_comparison": {
            "source_a": "PIB Fact Check: सीधे तौर पर पुष्टि करता है कि ऐसा कोई सरकारी आदेश या आवंटन मौजूद नहीं है।",
            "source_b": "Alt News: मैसेज में दिए गए लिंक की तकनीकी जांच कर इसे फ़िशिंग फ्रॉड करार दिया।",
            "additional_sources": "महिला एवं बाल विकास मंत्रालय की आधिकारिक गाइडलाइन्स।",
            "areas_of_agreement": [
                "दोनों स्रोत एकमत हैं कि दावा पूर्णतः फर्जी (False) है।",
                "वायरल लिंक असुरक्षित एवं निजी जानकारी चुराने के उद्देश्य से बनाया गया है।"
            ],
            "areas_of_disagreement": [],
            "common_origin_suspected": False,
            "comparison_summary": "सरकारी सूचना एजेंसी और स्वतंत्र फैक्ट चेकर दोनों द्वारा दावे का पूर्ण खंडन।"
        },
        "verification_method": {
            "search_queries": [
                "केंद्र सरकार हर बेटी 50000 रुपये PIB fact check",
                "kanya sumangala 50000 viral message fake alt news"
            ],
            "source_types": ["सरकारी प्राथमिक फैक्ट चेक विभाग", "स्वतंत्र प्रमाणित फैक्ट-चेकर"],
            "date_ranges": "2023–2026",
            "evaluation_criteria": [
                "पीआईबी आधिकारिक बुलेटिन",
                "मंत्रालय की वास्तविक अधिसूचनाएं"
            ],
            "important_limitations": ["डेमो केस स्टडी - हिंदी भाषा सत्यापन का प्रदर्शन।"]
        },
        "confidence_level": "HIGH",
        "confidence_reason": "संबंधित मंत्रालय एवं पीआईबी का स्पष्ट आधिकारिक बयान।",
        "research_coverage": "HIGH",
        "coverage_reason": "आधिकारिक तथा स्वतंत्र स्रोतों का समवर्ती अध्ययन।",
        "checked_at": "2026-10-23T14:40:00Z",
        "limitations": ["हिंदी सत्यापन का उदाहरण अध्ययन।"],
        "live_search_available": True,
        "warning_notice": None
    },
    {
        "report_id": "DEMO-TL-SOLARSTORM",
        "is_demo": True,
        "demo_label": "DEMONSTRATION CASE STUDY",
        "submitted_content": "Viral Social Media Warning: NASA has officially warned that an upcoming 'solar superstorm' in 2024–2026 will cause a total 'Internet Apocalypse', cutting off the world's internet and electric grids for months.",
        "submitted_url": None,
        "headline": "Viral Claim: NASA Warned of Impending 'Internet Apocalypse' Solar Superstorm",
        "language": "en",
        "country": "US",
        "verdict": "MISLEADING",
        "verdict_definition": "The claim contains some truth but omits important context or presents information deceptively.",
        "explanation": "While space weather scientists and NASA study Coronal Mass Ejections (CMEs) and developing AI early-warning systems (such as the DAGGER model) to predict geomagnetic storms, NASA has never issued any prediction or warning that the global internet will collapse for months. The term 'Internet Apocalypse' was popularized by a 2021 academic paper discussing theoretical vulnerabilities in undersea cables, not an official alert.",
        "what_evidence_establishes": "NASA researches AI models (DAGGER) for 30-minute geomagnetic early warning; an academic paper at ACM SIGCOMM analyzed theoretical submarine cable vulnerabilities. NASA never issued a shutdown warning.",
        "corrected_information": "Clickbait headlines conflated an academic theoretical risk study with an official emergency alert. No global internet collapse prediction was made by NASA.",
        "final_conclusion": "The claim is misleading: genuine scientific modeling was sensationalized into a fake emergency warning.",
        "extracted_claims": [
            {
                "claim_id": "claim-1",
                "claim_text": "NASA officially warned that a solar superstorm will cause a catastrophic months-long worldwide internet blackout.",
                "entities": ["NASA", "Solar Superstorm", "Internet Apocalypse", "Space Weather"],
                "time_period": "2024–2026",
                "category": "science_tech",
                "verifiability": "SPECIFIC_FACTUAL",
                "verdict": "MISLEADING",
                "verdict_definition": "The claim contains some truth but omits important context or presents information deceptively.",
                "explanation": "NASA confirmed they never issued an alert predicting an internet blackout. NASA is researching space weather prediction algorithms (DAGGER), but sensational headlines conflated routine solar cycle 25 monitoring with an imminent collapse.",
                "what_evidence_establishes": "NASA never issued an alert predicting an internet blackout.",
                "corrected_information": "Sensational headlines conflated routine solar cycle monitoring with an apocalypse alert.",
                "supporting_evidence_indices": [],
                "contradicting_evidence_indices": [0, 1],
                "context_evidence_indices": [2],
                "remaining_uncertainties": ["Solar Cycle 25 peak activity timings remain subject to ongoing astrophysical observation."]
            }
        ],
        "evidence_sources": [
            {
                "title": "No, NASA has not warned of an impending 'internet apocalypse' - Snopes",
                "publisher": "Snopes Fact Checking",
                "url": "https://www.snopes.com/fact-check/nasa-internet-apocalypse-solar-storm/",
                "published_at": "2023-07-07T16:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "NASA space weather experts stated that while solar activity does affect high-frequency radio communications and satellites, claims of an impending worldwide months-long internet shutdown are completely unfounded and not from NASA.",
                "evidence_relation": "CONTRADICTS",
                "relevance_explanation": "Fact check confirming the absence of any NASA doom alert.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "CERTIFIED_FACT_CHECKER"
            },
            {
                "title": "NASA Space Weather & DAGGER AI Model - NASA Science",
                "publisher": "NASA (National Aeronautics and Space Administration)",
                "url": "https://science.nasa.gov/science-research/heliophysics/nasa-ai-model-space-weather-predictions/",
                "published_at": "2023-03-24T12:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "NASA researchers developed an AI model named DAGGER that can predict geomagnetic disturbances 30 minutes in advance to help infrastructure operators safeguard critical systems. No apocalyptic prediction was made.",
                "evidence_relation": "CONTEXT",
                "relevance_explanation": "Primary scientific announcement of what NASA actually published.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "GOVERNMENT_PRIMARY"
            },
            {
                "title": "Solar Superstorms: Planning for an Internet Apocalypse (SIGCOMM 2021)",
                "publisher": "Association for Computing Machinery (ACM SIGCOMM)",
                "url": "https://dl.acm.org/doi/10.1145/3452296.3472916",
                "published_at": "2021-08-09T00:00:00Z",
                "retrieved_at": "2026-10-23T12:00:00Z",
                "relevant_excerpt": "Academic paper by Sangeetha Abdu Jyothi evaluating resilience of submarine cable repeaters during extreme solar events. The paper analyzed theoretical risk models, not a scheduled event.",
                "evidence_relation": "CONTEXT",
                "relevance_explanation": "Original scholarly source where the catchy phrase 'Internet Apocalypse' was coined.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": "PRIMARY_REFERENCE"
            }
        ],
        "source_comparison": {
            "source_a": "NASA Official Releases: Explain DAGGER AI tool to provide 30-minute advance warnings for grid protection; no shutdown warning.",
            "source_b": "Snopes Fact Check: Dissected clickbait articles that took ACM academic paper jargon and misattributed it to NASA.",
            "additional_sources": "ACM SIGCOMM peer-reviewed engineering paper.",
            "areas_of_agreement": [
                "Geomagnetic storms can induce currents in long conductors.",
                "NASA never issued an 'apocalypse' warning."
            ],
            "areas_of_disagreement": [],
            "common_origin_suspected": False,
            "comparison_summary": "Clickbait headlines merged real scientific work with sensationalized apocalyptic claims."
        },
        "verification_method": {
            "search_queries": [
                "NASA internet apocalypse solar superstorm fact check",
                "NASA DAGGER space weather model official"
            ],
            "source_types": ["Space Agency Science Portal", "Peer-reviewed Academic Repository", "Certified Fact-Checking Service"],
            "date_ranges": "2021–2026",
            "evaluation_criteria": [
                "Attribution verification against official NASA releases",
                "Distinguishing academic theoretical modeling from predictive agency alerts"
            ],
            "important_limitations": ["Demonstration case study for scientific nuance."]
        },
        "confidence_level": "HIGH",
        "confidence_reason": "Clear attribution chain identified back to 2021 academic paper misquoted as a current NASA warning.",
        "research_coverage": "HIGH",
        "coverage_reason": "Original research paper, agency press release, and fact-check analyzed.",
        "checked_at": "2026-10-23T14:45:00Z",
        "limitations": ["Demonstration case study."],
        "live_search_available": True,
        "warning_notice": None
    }
]
