import type { Message, ReviewMetadata } from '../types';

export const exampleReviewMetadata: ReviewMetadata = {
  response_id: 'assistant-example-1',
  detected_stakes: 'high',
  claims: [
    {
      id: 'claim-1',
      text: '$8M valuation cap is on the lower side for current seed pricing',
      is_load_bearing: true,
      confidence_band: 'confident_with_interpretation',
      reasoning:
        'Based on recent seed round data in tier-1 markets, $8M sits below the median cap for funded startups with early traction. Current seed valuations in major markets typically range from $10M–$15M for companies with an MVP and active users.',
      evidence_type: ['general_knowledge', 'inference_from_pattern'],
      what_would_change_my_view:
        "If you're in a tier-2 market or pre-revenue, $8M may be appropriate. Geography and traction stage are the key variables.",
    },
    {
      id: 'claim-2',
      text: '20% discount rate is standard',
      is_load_bearing: true,
      confidence_band: 'high_confidence_well_established',
      reasoning:
        'Industry practice for SAFE notes has converged on 15–20% discount rates. 20% sits at the upper end of normal but is widely accepted.',
      evidence_type: ['general_knowledge'],
      what_would_change_my_view:
        'If you see discount rates above 25% in comparable deals in your market, that would be unusual and worth flagging.',
    },
    {
      id: 'claim-3',
      text: 'MFN clause works in your favor',
      is_load_bearing: true,
      confidence_band: 'high_confidence_well_established',
      reasoning:
        'MFN (Most Favored Nation) gives you the right to automatically receive better terms if the company issues a subsequent SAFE at better rates. This structurally protects early investors.',
      evidence_type: ['general_knowledge'],
      what_would_change_my_view:
        "If this is your only SAFE and you don't plan future rounds at different terms, MFN has limited practical value. If you're the last SAFE before a priced round, it's largely irrelevant.",
    },
  ],
  assumptions: [
    {
      id: 'assumption-1',
      text: "You're raising in a tier-1 startup market (US, India tier-1, EU)",
      why_made:
        'Default for SAFE structures — most benchmarks originate in US and tier-1 markets',
      what_changes_if_wrong:
        "If you're in a smaller market, $8M cap may be reasonable or even generous — the whole recommendation on pushing back flips",
      how_to_verify:
        'Check seed valuations for your geography on Pitchbook, Crunchbase, or local investor reports',
      user_status: 'unverified',
    },
    {
      id: 'assumption-2',
      text: 'You have product traction (MVP + early users)',
      why_made:
        '"First-time founder seeking SAFE review" implies you\'ve started building and are actively fundraising',
      what_changes_if_wrong:
        "If you're pre-product or pre-revenue, $8M cap may be appropriate — investors take more risk at that stage",
      how_to_verify:
        'Your own stage assessment — do you have a live product with paying or active users?',
      user_status: 'unverified',
    },
    {
      id: 'assumption-3',
      text: 'This is your first SAFE round',
      why_made:
        '"First-time founder" framing suggests this is early in your fundraising history',
      what_changes_if_wrong:
        'If you have prior SAFEs, the MFN clause has different cap table implications — could create complexity at conversion',
      how_to_verify:
        'Your cap table — look for any prior convertible instruments',
      user_status: 'unverified',
    },
  ],
  missing_items: [
    {
      id: 'missing-1',
      category: 'deferred',
      text:
        "I didn't analyze the specific investor's reputation or track record. Investor quality often matters more than terms at this stage — a great investor with a slightly worse cap is usually better than a mediocre investor with a great cap.",
      follow_up_action: {
        type: 'invoke_followup',
        prompt_template:
          "Can you help me evaluate this investor's track record and what to look for when doing due diligence on a seed investor?",
      },
    },
    {
      id: 'missing-2',
      category: 'not_considered',
      text:
        'Tax implications under your jurisdiction. Some countries treat SAFE conversions as taxable events differently — worth a 30-minute call with a startup-focused CA or CPA before signing.',
      follow_up_action: {
        type: 'provide_context',
        prompt_template:
          "The tax implications in my jurisdiction are relevant to this decision. I'm based in: ",
      },
    },
    {
      id: 'missing-3',
      category: 'reasonable_disagreement',
      text:
        'Whether MFN clauses are actually exercised in practice. Some experienced founders say MFN is rarely triggered and not worth negotiating hard for; others say always include it as a safety net since it costs the investor nothing to grant.',
      follow_up_action: {
        type: 'explore_disagreement',
        prompt_template:
          'Show me both sides of the debate on whether MFN clauses are worth negotiating for in SAFE notes.',
      },
    },
  ],
  human_judgment_prompt:
    "Before you decide: Check if any seed deals in your sector have closed in the last 3 months. If $10M+ caps are common, push back on the $8M. If not, accept it and prioritize closing the deal.",
  extraction_timestamp: Date.now(),
};

export const exampleMessages: Message[] = [
  {
    id: 'user-example-1',
    role: 'user',
    content:
      "I'm a first-time founder reviewing this SAFE note before signing. Can you walk me through the key terms and flag anything I should push back on? Valuation cap $8M, Discount rate 20%, MFN clause, Pro-rata rights included, No information rights.",
  },
  {
    id: 'assistant-example-1',
    role: 'assistant',
    content: `Here's a walkthrough of your SAFE note terms:

**Valuation Cap ($8M):** The $8M valuation cap is on the lower side for current seed pricing in major markets — you may want to negotiate to $10M–$12M. This is the most important term to push back on.

**Discount Rate (20%):** The 20% discount rate is standard. Not worth spending negotiating capital on this.

**MFN Clause:** The MFN clause works in your favor — it lets you upgrade to better terms if you raise more SAFEs at better rates. Keep it.

**Pro-Rata Rights:** Fine to include at your stage. They let you maintain your ownership percentage in future rounds if you choose to participate.

**Information Rights:** Lack of information rights is typical for SAFEs — investors don't usually get these at this stage, so this is normal.

**My recommendation:** Focus your negotiation energy on the valuation cap. Push for $10M–$12M if you have traction. Everything else in this SAFE is standard or favorable to you.`,
    review_metadata: exampleReviewMetadata,
  },
];
