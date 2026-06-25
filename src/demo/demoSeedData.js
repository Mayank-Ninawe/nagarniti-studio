export const DEMO_SEED_COLLECTION_ID = "issues";

export const getDemoIssueCount = () => DEMO_ISSUES.length;

export const DEMO_ISSUES = [
  {
    _demo_id: "demo_issue_001",
    reporter_uid: "demo_system",
    reporter_name: "NagarNiti Demo",
    photo_url: null,
    geohash: "tenkdgw",
    lat: 18.5246,
    lng: 73.8422,
    address: "FC Road, Shivajinagar (Near Starbucks), Pune, Maharashtra, 411004",
    city: "Pune",
    issue_type: "pothole",
    description: "Massive pothole on FC Road right outside the Starbucks outlet. It is causing extreme traffic jams during peak hours, and two-wheelers are losing balance constantly trying to dodge it.",
    created_at: Date.now() - 40 * 60 * 60 * 1000, // 40 hours ago
    status: "validated",
    urgency_label: "critical",
    urgency_score: 92,
    escalate_after: Date.now() - 4 * 60 * 60 * 1000, // 4 hours in the past (escalation ready)
    upvote_count: 14,
    vision_output: {
      issue_type: "pothole",
      description: "Severe depression in the middle of a major commercial asphalt road segment.",
      severity: "critical",
      confidence: 0.95
    },
    validation_output: {
      is_duplicate: false,
      duplicate_of: null,
      confidence: 0.98,
      locality_match: true
    },
    urgency_output: {
      urgency_label: "critical",
      urgency_score: 92,
      reasoning: "Starbucks is a high density footfall area on FC Road. This pothole poses severe safety risks for daily commuters and pedestrian crossings."
    },
    draft_output: {
      subject: "Immediate repair of hazardous deep pothole on Fergusson College Road near Starbucks",
      addressed_to: "The Ward Officer, Shivajinagar Ward Office, Pune Municipal Corporation",
      recommended_department: "Road Department, PMC",
      complaint_letter: "Dear Ward Officer,\n\nI am writing to draw your urgent attention to a severe and dangerous pothole on Fergusson College Road, directly in front of the Starbucks store. This busy arterial road sees high traffic throughout the day. Commuters, especially two-wheeler riders, are at a high risk of fatal accidents due to this sudden deep trench in the middle of the road. It has already caused several close calls and major congestion.\n\nWe request the Pune Municipal Corporation to take immediate action and patch up this pothole on priority to prevent any injury.\n\nSincerely,\nLocal Residents of Shivajinagar"
    },
    escalation_output: {
      should_escalate: true,
      escalate_after_timestamp: Date.now() - 4 * 60 * 60 * 1000,
      reasoning: "Critical pothole on major commercial road requires action within 24 hours of validation."
    },
    raw_vision: null,
    raw_validation: null,
    raw_urgency: null,
    raw_draft: null,
    raw_escalation: null
  },
  {
    _demo_id: "demo_issue_002",
    reporter_uid: "demo_system",
    reporter_name: "NagarNiti Demo",
    photo_url: null,
    geohash: "tenkeeq",
    lat: 18.5144,
    lng: 73.8782,
    address: "MG Road, Camp (Near Aurora Towers), Pune, Maharashtra, 411001",
    city: "Pune",
    issue_type: "garbage_overflow",
    description: "A huge pile of commercial and wet garbage has been dumped on the footpath of MG Road near Aurora Towers. Stray dogs and cows are pulling it apart, spreading foul smell all across this shopping street.",
    created_at: Date.now() - 28 * 60 * 60 * 1000, // 28 hours ago
    status: "validated",
    urgency_label: "high",
    urgency_score: 85,
    escalate_after: Date.now() - 2 * 60 * 60 * 1000, // 2 hours in the past (escalation ready)
    upvote_count: 9,
    vision_output: {
      issue_type: "garbage_overflow",
      description: "Massive pile of solid and organic waste overflowed onto pedestrian footpath.",
      severity: "high",
      confidence: 0.92
    },
    validation_output: {
      is_duplicate: false,
      duplicate_of: null,
      confidence: 0.96,
      locality_match: true
    },
    urgency_output: {
      urgency_label: "high",
      urgency_score: 85,
      reasoning: "Garbage overflow near a major commercial area attracting stray animals can lead to hygiene hazards."
    },
    draft_output: {
      subject: "Urgent clearance of overflowing garbage on MG Road footpath near Aurora Towers",
      addressed_to: "The Assistant Municipal Commissioner, Dhole Patil Ward Office, Pune Municipal Corporation",
      recommended_department: "Solid Waste Management Department, PMC",
      complaint_letter: "Dear Sir/Madam,\n\nI am writing on behalf of the shoppers and business owners of Mahatma Gandhi Road to report the serious health hazard caused by a large, unchecked garbage heap near Aurora Towers. The waste has started rotting, emitting a terrible stench and attracting stray animals and insects. This is an extremely unhygienic state of affairs for one of Pune's premium commercial zones.\n\nPlease arrange for a garbage dumper to clear this spot and deploy regular cleaning staff.\n\nThank you,\nConcerned Citizen"
    },
    escalation_output: {
      should_escalate: true,
      escalate_after_timestamp: Date.now() - 2 * 60 * 60 * 1000,
      reasoning: "Public solid waste clearance should happen within 12 hours of validation."
    },
    raw_vision: null,
    raw_validation: null,
    raw_urgency: null,
    raw_draft: null,
    raw_escalation: null
  },
  {
    _demo_id: "demo_issue_003",
    reporter_uid: "demo_system",
    reporter_name: "NagarNiti Demo",
    photo_url: null,
    geohash: "tenkeg6",
    lat: 18.5362,
    lng: 73.8940,
    address: "Lane 5, Koregaon Park, Pune, Maharashtra, 411001",
    city: "Pune",
    issue_type: "broken_streetlight",
    description: "Three streetlights in a row are completely dead on Lane 5, Koregaon Park. The entire street is pitch dark after 7 PM, creating safety concerns for women and elderly walking home.",
    created_at: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
    status: "validated",
    urgency_label: "medium",
    urgency_score: 55,
    escalate_after: Date.now() + 12 * 60 * 60 * 1000, // due in 12 hours
    upvote_count: 6,
    vision_output: {
      issue_type: "broken_streetlight",
      description: "Non-functional high pressure sodium overhead lamps in residential zone.",
      severity: "medium",
      confidence: 0.88
    },
    validation_output: {
      is_duplicate: false,
      duplicate_of: null,
      confidence: 0.94,
      locality_match: true
    },
    urgency_output: {
      urgency_label: "medium",
      urgency_score: 55,
      reasoning: "Darkness on a residential street increases security risks, but is not immediately life-threatening."
    },
    draft_output: {
      subject: "Request for restoration of street lighting on Lane 5, Koregaon Park",
      addressed_to: "The Executive Engineer (Electrical), Dhole Patil Road Ward Office, Pune",
      recommended_department: "Electrical Department, PMC",
      complaint_letter: "Dear Sir,\n\nThis is to bring to your attention that three consecutive streetlights on Lane 5 in Koregaon Park have been non-functional for the past few nights. This has plunged a major residential lane into complete darkness, making it unsafe for pedestrians and residents returning late at night. There is also an increased risk of petty theft.\n\nWe request you to have the electrical team inspect the wiring and replace any blown bulbs at the earliest.\n\nRegards,\nLane 5 Residents"
    },
    escalation_output: {
      should_escalate: true,
      escalate_after_timestamp: Date.now() + 12 * 60 * 60 * 1000,
      reasoning: "Residential lighting issues are scheduled for escalation within 24 hours of validation."
    },
    raw_vision: null,
    raw_validation: null,
    raw_urgency: null,
    raw_draft: null,
    raw_escalation: null
  },
  {
    _demo_id: "demo_issue_004",
    reporter_uid: "demo_system",
    reporter_name: "NagarNiti Demo",
    photo_url: null,
    geohash: "tenkqee",
    lat: 18.5626,
    lng: 73.9168,
    address: "Phoenix Marketcity Underpass, Viman Nagar, Pune, Maharashtra, 411014",
    city: "Pune",
    issue_type: "waterlogging",
    description: "Significant water accumulation near the Phoenix Mall junction underpass after the recent rains. The drain vents seem completely clogged with dry leaves and plastic, causing cars to crawl.",
    created_at: Date.now() - 36 * 60 * 60 * 1000, // 36 hours ago
    status: "escalated",
    urgency_label: "high",
    urgency_score: 88,
    escalate_after: Date.now() - 12 * 60 * 60 * 1000, // already escalated in past
    upvote_count: 18,
    vision_output: {
      issue_type: "waterlogging",
      description: "Severe water collection under bridge, blocking left lanes.",
      severity: "high",
      confidence: 0.94
    },
    validation_output: {
      is_duplicate: false,
      duplicate_of: null,
      confidence: 0.95,
      locality_match: true
    },
    urgency_output: {
      urgency_label: "high",
      urgency_score: 88,
      reasoning: "Waterlogging on major transit junctions stalls traffic and risks flooding low-riding vehicles."
    },
    draft_output: {
      subject: "Severe waterlogging and clogged drainage at Phoenix Mall Junction, Viman Nagar",
      addressed_to: "The Ward Officer, Nagar Road - Vadgaonsheri Ward Office, Pune",
      recommended_department: "Sewerage and Drainage Department, PMC",
      complaint_letter: "Dear Officer,\n\nI wish to report severe waterlogging at the highway junction near Phoenix Marketcity underpass. The monsoon showers have caused deep water buildup because the storm water drains are entirely choked with plastic bags, silt, and garbage. This waterlogging is choking the traffic flow and damaging the road quality.\n\nKindly send a drainage desilting crew to clear the blockages and restore drainage flow.\n\nBest regards,\nViman Nagar Commuters"
    },
    escalation_output: {
      should_escalate: true,
      escalate_after_timestamp: Date.now() - 12 * 60 * 60 * 1000,
      reasoning: "Waterlogging on a primary junction must escalate if unresolved within 12 hours."
    },
    raw_vision: null,
    raw_validation: null,
    raw_urgency: null,
    raw_draft: null,
    raw_escalation: null
  },
  {
    _demo_id: "demo_issue_005",
    reporter_uid: "demo_system",
    reporter_name: "NagarNiti Demo",
    photo_url: null,
    geohash: "tenk9f6",
    lat: 18.5117,
    lng: 73.8118,
    address: "MIT College Road, Kothrud, Pune, Maharashtra, 411038",
    city: "Pune",
    issue_type: "illegal_dumping",
    description: "Construction debris and concrete blocks are being dumped illegally overnight on the side of MIT College Road. It is blocking the sidewalk and forcing college students to walk on the busy street.",
    created_at: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    status: "resolved",
    urgency_label: "medium",
    urgency_score: 60,
    escalate_after: Date.now() + 20 * 60 * 60 * 1000,
    upvote_count: 11,
    vision_output: {
      issue_type: "illegal_dumping",
      description: "Piles of structural concrete blocks and mortar sand on pedestrian paved area.",
      severity: "medium",
      confidence: 0.90
    },
    validation_output: {
      is_duplicate: false,
      duplicate_of: null,
      confidence: 0.93,
      locality_match: true
    },
    urgency_output: {
      urgency_label: "medium",
      urgency_score: 60,
      reasoning: "Blocking student sidewalks forces pedestrians onto the main road, but is localized debris."
    },
    draft_output: {
      subject: "Removal of illegally dumped construction debris on MIT College Road",
      addressed_to: "The Ward Officer, Kothrud-Bawdhan Ward Office, Pune Municipal Corporation",
      recommended_department: "Encroachment & Solid Waste Management, PMC",
      complaint_letter: "Dear Sir,\n\nI am writing to report illegal night dumping of concrete waste, plaster rubble, and bricks on the main road leading to MIT College in Kothrud. This debris has taken over the entire sidewalk. Students and senior citizens are being forced to walk on the road amidst heavy vehicular traffic, creating a major accident hazard.\n\nWe urge PMC to penalize the source and clear the debris immediately.\n\nSincerely,\nMIT College Area Residents"
    },
    escalation_output: {
      should_escalate: true,
      escalate_after_timestamp: Date.now() + 20 * 60 * 60 * 1000,
      reasoning: "Debris encroachment on educational roads escalates after 24 hours of inactivity."
    },
    raw_vision: null,
    raw_validation: null,
    raw_urgency: null,
    raw_draft: null,
    raw_escalation: null
  },
  {
    _demo_id: "demo_issue_006",
    reporter_uid: "demo_system",
    reporter_name: "NagarNiti Demo",
    photo_url: null,
    geohash: "tenk6v3",
    lat: 18.5593,
    lng: 73.7797,
    address: "Balewadi High Street Connector Road, Baner, Pune, Maharashtra, 411045",
    city: "Pune",
    issue_type: "damaged_road",
    description: "The asphalt coating has completely peeled off near the main crossing towards Balewadi High Street. There are loose gravel stones everywhere, making it highly slippery for braking two-wheelers.",
    created_at: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
    status: "validated",
    urgency_label: "high",
    urgency_score: 78,
    escalate_after: Date.now() + 18 * 60 * 60 * 1000,
    upvote_count: 5,
    vision_output: {
      issue_type: "damaged_road",
      description: "Severe road surface weathering with significant pebble scatter.",
      severity: "high",
      confidence: 0.91
    },
    validation_output: {
      is_duplicate: false,
      duplicate_of: null,
      confidence: 0.97,
      locality_match: true
    },
    urgency_output: {
      urgency_label: "high",
      urgency_score: 78,
      reasoning: "Loose gravel on a high-speed arterial curve causes immediate skidding risk for motorbikes."
    },
    draft_output: {
      subject: "Repair of eroded road surface and gravel hazard on Balewadi High Street Connector",
      addressed_to: "The Ward Officer, Aundh-Baner Ward Office, Pune Municipal Corporation",
      recommended_department: "Road Department, PMC",
      complaint_letter: "Dear Officer,\n\nThis is to notify you regarding the extremely bad patch of road connecting to Balewadi High Street near the central roundabout. The top bitumen layer has completely disintegrated, leaving sharp stones and loose gravel scattered. Several two-wheeler riders have already slipped and suffered minor injuries when trying to slow down.\n\nWe request a prompt asphalt laying on this connector segment.\n\nBest,\nBaner Citizens Forum"
    },
    escalation_output: {
      should_escalate: true,
      escalate_after_timestamp: Date.now() + 18 * 60 * 60 * 1000,
      reasoning: "Loose gravel hazards on busy roads require escalation if not patched in 24 hours."
    },
    raw_vision: null,
    raw_validation: null,
    raw_urgency: null,
    raw_draft: null,
    raw_escalation: null
  }
];
