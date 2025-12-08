import { SurveyResponse } from '../types/survey';

export type QuestionShape = 'single' | 'matrix' | 'scale' | 'multi';

export interface QuestionOption {
  value: number;
  label: string;
}

export interface BaseQuestionDefinition {
  id: string;
  label: string;
  prompt: string;
  category: string;
}

export interface SingleQuestionDefinition extends BaseQuestionDefinition {
  shape: 'single';
  field: keyof SurveyResponse;
  options: QuestionOption[];
}

export interface MultiSelectQuestionDefinition extends BaseQuestionDefinition {
  shape: 'multi';
  field: keyof SurveyResponse;
  options: QuestionOption[];
}

export interface MatrixQuestionDefinition extends BaseQuestionDefinition {
  shape: 'matrix';
  subQuestions: { field: keyof SurveyResponse; label: string }[];
  options: QuestionOption[];
  rangeOptions?: { label: string; range: [number, number] }[];
}

export interface ScaleQuestionDefinition extends BaseQuestionDefinition {
  shape: 'scale';
  field: keyof SurveyResponse;
  buckets: { label: string; range: [number, number] }[];
}

export type QuestionDefinition =
  | SingleQuestionDefinition
  | MultiSelectQuestionDefinition
  | MatrixQuestionDefinition
  | ScaleQuestionDefinition;

const likertAgreementOptions: QuestionOption[] = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither agree nor disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
];

const importanceOptions: QuestionOption[] = [
  { value: 1, label: 'Not important at all' },
  { value: 2, label: 'Slightly important' },
  { value: 3, label: 'Moderately important' },
  { value: 4, label: 'Very important' },
  { value: 5, label: 'Extremely important' },
];

const starRatingOptions: QuestionOption[] = [
  { value: 1, label: 'Poor (1 star)' },
  { value: 2, label: 'Fair (2 stars)' },
  { value: 3, label: 'Good (3 stars)' },
  { value: 4, label: 'Very good (4 stars)' },
  { value: 5, label: 'Excellent (5 stars)' },
];

const rankOptions: QuestionOption[] = [
  { value: 1, label: 'Ranked 1 (top priority)' },
  { value: 2, label: 'Ranked 2' },
  { value: 3, label: 'Ranked 3' },
  { value: 4, label: 'Ranked 4' },
  { value: 5, label: 'Ranked 5' },
  { value: 6, label: 'Ranked 6 (lowest priority)' },
];

const npsOptions: QuestionOption[] = [
  { value: 1, label: 'Not likely' },
  { value: 2, label: 'Somewhat likely' },
  { value: 3, label: 'Likely' },
  { value: 4, label: 'Very likely' },
  { value: 5, label: 'Extremely likely' },
];

export const questionCatalog: QuestionDefinition[] = [
  {
    id: 'children_2_7',
    label: 'Screener: Children ages 2-7',
    prompt: 'Do you currently have at least one child ages 2–7?',
    category: 'Screeners & Demographics',
    shape: 'single',
    field: 'children_2_7',
    options: [
      { value: 1, label: 'Yes' },
      { value: 0, label: 'No' },
    ],
  },
  {
    id: 'number_of_children',
    label: 'Number of children',
    prompt: 'How many children do you have?',
    category: 'Screeners & Demographics',
    shape: 'single',
    field: 'number_of_children',
    options: [
      { value: 1, label: '1 child' },
      { value: 2, label: '2 children' },
      { value: 3, label: '3 children' },
      { value: 4, label: '4 or more children' },
      { value: 5, label: "I don't have kids" },
    ],
  },
  {
    id: 'age_group',
    label: 'Age group',
    prompt: 'What is your age?',
    category: 'Screeners & Demographics',
    shape: 'single',
    field: 'age_group',
    options: [
      { value: 1, label: '18-24' },
      { value: 2, label: '25-29' },
      { value: 3, label: '30-34' },
      { value: 4, label: '35-39' },
      { value: 5, label: '40-44' },
      { value: 6, label: '45+' },
    ],
  },
  {
    id: 'gender',
    label: 'Gender',
    prompt: 'What is your gender?',
    category: 'Screeners & Demographics',
    shape: 'single',
    field: 'gender',
    options: [
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
      { value: 3, label: 'Non-binary / third gender' },
      { value: 4, label: 'Prefer not to say' },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    prompt: 'Where do you live?',
    category: 'Screeners & Demographics',
    shape: 'single',
    field: 'location',
    options: [
      { value: 1, label: 'Urban' },
      { value: 2, label: 'Suburban' },
      { value: 3, label: 'Rural' },
    ],
  },
  {
    id: 'household_income',
    label: 'Household income',
    prompt: 'Select your total household income range.',
    category: 'Screeners & Demographics',
    shape: 'single',
    field: 'household_income',
    options: [
      { value: 1, label: '<$50,000' },
      { value: 2, label: '$50,000-$99,999' },
      { value: 3, label: '$100,000-$149,999' },
      { value: 4, label: '$150,000+' },
      { value: 5, label: 'Prefer not to answer' },
    ],
  },
  {
    id: 'platforms_selections',
    label: 'Parenting platforms',
    prompt: 'Which platforms do you use for parenting tips and trends? (Select all)',
    category: 'Screeners & Demographics',
    shape: 'multi',
    field: 'platforms_selections',
    options: [
      { value: 1, label: 'Instagram' },
      { value: 2, label: 'TikTok' },
      { value: 3, label: 'Facebook' },
      { value: 4, label: 'YouTube' },
      { value: 5, label: 'Parenting Blogs / Websites' },
      { value: 6, label: 'Texts or group chats with friends' },
      { value: 7, label: 'Other' },
    ],
  },
  {
    id: 'q6_childhood_brand_rank',
    label: 'Childhood toy brand ranking',
    prompt: 'Rank which toy brands come to mind first when you think of your own childhood.',
    category: 'Brand Memory & Awareness',
    shape: 'matrix',
    subQuestions: [
      { field: 'q6_childhood_brand_rank_little_tikes', label: 'Little Tikes' },
      { field: 'q6_childhood_brand_rank_fisher_price', label: 'Fisher-Price' },
      { field: 'q6_childhood_brand_rank_playskool', label: 'Playskool' },
      { field: 'q6_childhood_brand_rank_toynado', label: 'Toynado' },
      { field: 'q6_childhood_brand_rank_lego', label: 'LEGO' },
      { field: 'q6_childhood_brand_rank_other', label: 'Other brand' },
    ],
    options: rankOptions,
  },
  {
    id: 'q7_memories_childhood',
    label: 'Nostalgia statements (Q7)',
    prompt: 'Rate the nostalgia statements about childhood toys.',
    category: 'Nostalgia & Emotion',
    shape: 'matrix',
    subQuestions: [
      { field: 'q7_memories_childhood_toys_vivid_memories_1_5', label: 'I have vivid memories of playing with my favorite toys.' },
      { field: 'q7_memories_childhood_toys_reminds_childhood_1_5', label: 'Seeing my favorite toys today reminds me of my childhood.' },
      { field: 'q7_memories_childhood_toys_want_child_experience_1_5', label: 'I want my child to experience my favorite childhood toy.' },
      { field: 'q7_memories_childhood_toys_not_relevant_today_1_5', label: 'My favorite childhood toys do not feel relevant today.' },
    ],
    options: likertAgreementOptions,
  },
  {
    id: 'q8_memories_influence_purchase_1_5',
    label: 'Memories influence purchase (Q8)',
    prompt: 'To what extent do memories of childhood toys influence your purchase decisions?',
    category: 'Nostalgia & Emotion',
    shape: 'single',
    field: 'q8_memories_influence_purchase_1_5',
    options: likertAgreementOptions,
  },
  {
    id: 'q9_importance_attributes',
    label: 'Importance of attributes (Q9)',
    prompt: 'How important are each of the following when choosing toys?',
    category: 'Brand Priorities',
    shape: 'matrix',
    subQuestions: [
      { field: 'q9_importance_quality_durability_1_5', label: 'Quality & Durability' },
      { field: 'q9_importance_safety_trust_1_5', label: 'Safety & Trust' },
      { field: 'q9_importance_active_imaginative_play_1_5', label: 'Active & Imaginative Play' },
      { field: 'q9_importance_educational_developmental_1_5', label: 'Educational & Developmental Value' },
      { field: 'q9_importance_use_of_technology_1_5', label: 'Use of Technology' },
      { field: 'q9_importance_childhood_memories_1_5', label: 'Childhood Memories' },
    ],
    options: importanceOptions,
  },
  {
    id: 'q10_future_attribute_ranks',
    label: 'Future attribute ranking (Q10)',
    prompt: 'Rank the future brand attributes that matter most to you.',
    category: 'Brand Priorities',
    shape: 'matrix',
    subQuestions: [
      { field: 'q10_rank_attributes_future_1', label: 'Quality & Durability' },
      { field: 'q10_rank_attributes_future_2', label: 'Safety & Trust' },
      { field: 'q10_rank_attributes_future_3', label: 'Active & Imaginative Play' },
      { field: 'q10_rank_attributes_future_4', label: 'Educational & Developmental Value' },
      { field: 'q10_rank_attributes_future_5', label: 'Use of Technology' },
      { field: 'q10_rank_attributes_future_6', label: 'My Childhood Memories' },
    ],
    options: rankOptions,
  },
  {
    id: 'q11_nostalgia_little_tikes_0_100',
    label: 'Nostalgia score (Q11)',
    prompt: 'How nostalgic does Little Tikes make you feel? (0-100)',
    category: 'Nostalgia & Emotion',
    shape: 'scale',
    field: 'q11_nostalgia_little_tikes_0_100',
    buckets: [
      { label: '0-20 (Not nostalgic)', range: [0, 20] },
      { label: '21-40 (A little nostalgic)', range: [21, 40] },
      { label: '41-60 (Nostalgic)', range: [41, 60] },
      { label: '61-80 (Moderately nostalgic)', range: [61, 80] },
      { label: '81-100 (Very nostalgic)', range: [81, 100] },
    ],
  },
  {
    id: 'q12_little_tikes_represents',
    label: 'Brand representation (Q12)',
    prompt: 'Which statement best describes what Little Tikes represents?',
    category: 'Brand Perception',
    shape: 'single',
    field: 'q12_little_tikes_represents',
    options: [
      { value: 1, label: 'Quality & Durability' },
      { value: 2, label: 'Safety & Trust' },
      { value: 3, label: 'Unlocking family memories' },
      { value: 4, label: 'Innovation & developmental growth' },
      { value: 5, label: 'Active & imaginative play' },
    ],
  },
  {
    id: 'q13_emotional_impact',
    label: 'Emotional impact (Q13)',
    prompt: 'Rate the emotional impact statements about Little Tikes.',
    category: 'Nostalgia & Emotion',
    shape: 'matrix',
    subQuestions: [
      { field: 'q13_emotional_impact_makes_nostalgic_1_5', label: 'Little Tikes makes me nostalgic.' },
      { field: 'q13_emotional_impact_nostalgia_buy_likelihood_1_5', label: 'Nostalgia increases my likelihood to buy Little Tikes.' },
      { field: 'q13_emotional_impact_trust_vs_newer_1_5', label: 'I trust Little Tikes more than newer toy brands.' },
    ],
    options: likertAgreementOptions,
  },
  {
    id: 'q14_perception_brand',
    label: 'Perception of Little Tikes (Q14)',
    prompt: 'Perception of Little Tikes today.',
    category: 'Brand Perception',
    shape: 'matrix',
    subQuestions: [
      { field: 'q14_perception_brand_feels_modern_1_5', label: 'Little Tikes feels modern.' },
      { field: 'q14_perception_brand_incorporate_technology_1_5', label: 'Little Tikes incorporates technology well.' },
      { field: 'q14_perception_brand_keep_traditional_1_5', label: 'Little Tikes should keep traditional play.' },
      { field: 'q14_perception_brand_trendy_social_media_1_5', label: 'Little Tikes is trendy on social media.' },
    ],
    options: likertAgreementOptions,
  },
  {
    id: 'q15_lt_rating_vs_competitors',
    label: 'Little Tikes vs competitors (Q15)',
    prompt: 'Rate Little Tikes versus competitors on a 0-100 scale.',
    category: 'Competitive Standing',
    shape: 'matrix',
    subQuestions: [
      { field: 'q15_lt_rating_vs_competitors_quality_durability_0_100', label: 'Quality & Durability' },
      { field: 'q15_lt_rating_vs_competitors_safety_trust_0_100', label: 'Safety & Trust' },
      { field: 'q15_lt_rating_vs_competitors_active_imaginative_play_0_100', label: 'Active & Imaginative Play' },
      { field: 'q15_lt_rating_vs_competitors_educational_developmental_0_100', label: 'Educational & Developmental Value' },
      { field: 'q15_lt_rating_vs_competitors_use_of_technology_0_100', label: 'Use of Technology' },
      { field: 'q15_lt_rating_vs_competitors_childhood_memories_0_100', label: 'My Childhood Memories' },
    ],
    options: [
      { value: 0, label: '0-20' },
      { value: 25, label: '21-40' },
      { value: 50, label: '41-60' },
      { value: 75, label: '61-80' },
      { value: 100, label: '81-100' },
    ],
    rangeOptions: [
      { label: '0-20', range: [0, 20] },
      { label: '21-40', range: [21, 40] },
      { label: '41-60', range: [41, 60] },
      { label: '61-80', range: [61, 80] },
      { label: '81-100', range: [81, 100] },
    ],
  },
  {
    id: 'q16_competitor_brand_rating',
    label: 'Brand star ratings (Q16)',
    prompt: 'Rate each toy brand on a 1-5 star scale.',
    category: 'Competitive Standing',
    shape: 'matrix',
    subQuestions: [
      { field: 'q16_competitor_brand_rating_fisher_price_1_5', label: 'Fisher-Price' },
      { field: 'q16_competitor_brand_rating_step2_1_5', label: 'Step2' },
      { field: 'q16_competitor_brand_rating_melissa_doug_1_5', label: 'Melissa & Doug' },
      { field: 'q16_competitor_brand_rating_lego_1_5', label: 'LEGO' },
      { field: 'q16_competitor_brand_rating_tonies_1_5', label: 'Tonies' },
      { field: 'q16_competitor_brand_rating_lovevery_1_5', label: 'Lovevery' },
      { field: 'q16_competitor_brand_rating_toynado_1_5', label: 'Toynado' },
      { field: 'q16_competitor_brand_rating_little_tikes_1_5', label: 'Little Tikes' },
    ],
    options: starRatingOptions,
  },
  {
    id: 'q17_future_directions_excitement_1_4',
    label: 'Future direction excitement (Q17)',
    prompt: 'Which future direction from Little Tikes excites you most?',
    category: 'Future Direction',
    shape: 'single',
    field: 'q17_future_directions_excitement_1_4',
    options: [
      { value: 1, label: 'Re-introducing vintage model/collection' },
      { value: 2, label: 'Launching tech-enhanced play experiences' },
      { value: 3, label: 'Partnering with nostalgic pop-culture icons or shows' },
      { value: 4, label: "Highlighting 'family play time' in advertising" },
    ],
  },
  {
    id: 'q18_preference_vs_brands_1_3',
    label: 'Preference versus other brands (Q18)',
    prompt: 'How much do you prefer Little Tikes compared to other brands?',
    category: 'Competitive Standing',
    shape: 'single',
    field: 'q18_preference_vs_brands_1_3',
    options: [
      { value: 1, label: 'Much less than other brands' },
      { value: 2, label: 'Neither more nor less (neutral)' },
      { value: 3, label: 'Much more than other brands' },
    ],
  },
  {
    id: 'q19_nps_little_tikes_1_5',
    label: 'Likelihood to recommend (Q19)',
    prompt: 'How likely are you to recommend Little Tikes to another parent?',
    category: 'Advocacy',
    shape: 'single',
    field: 'q19_nps_little_tikes_1_5',
    options: npsOptions,
  },
];

export const getDefaultQuestionId = (): string => questionCatalog[0]?.id || '';
