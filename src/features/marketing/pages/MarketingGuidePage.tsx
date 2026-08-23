import { Fragment, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Container, Paper, Stack, Typography, Button, Divider,
} from '@mui/material';
import {
  ArrowBackRounded, CheckCircleRounded, ArrowForwardRounded, MenuBookRounded,
  EastRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  PRIMARY_MAIN, PRIMARY_DEEP,
  GOLD_TROPHY, AMBER_HOURGLASS, ACCENT_GOLD_LIGHT,
  TEXT_HEADING, TEXT_SECONDARY,
  GRADIENT_GOLD_VIVID,
  METRIC_GOOD, AMBER_TEXT_AA, ALPHA_WHITE_20, ALPHA_WHITE_80,
  MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import { riseIn } from '../../../shared/motion';

// ── Content model ─────────────────────────────────────────────────────────────
// The guide is authored here as structured data and rendered by <BlockView>. It is a
// faithful copy of the "Get The Most Out Of Winnbell" guide. Inline emphasis is written
// with **double asterisks**. No em dashes anywhere (project rule) - the original em dashes
// are rendered as commas/periods to preserve wording without breaking the rule.
type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'check'; items: string[] }
  | { type: 'stat'; from: { label: string; value: string }; to: { label: string; value: string } }
  | { type: 'callout'; text: string };

interface Chapter {
  id: string;
  kicker: string;
  title: string;
  blocks: Block[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 'welcome',
    kicker: 'Getting started',
    title: 'Welcome to Winnbell',
    blocks: [
      { type: 'h2', text: 'Welcome aboard!' },
      { type: 'p', text: 'Thank you for joining Winnbell.' },
      { type: 'p', text: "You're now part of a growing network of businesses using prize-based promotions to encourage higher spending, increase repeat visits, attract new customers through the Winnbell network, and create a more engaging customer experience." },
      { type: 'p', text: 'With Winnbell, you can unlock the same customer engagement tool that used to be exclusively limited to big brands, without the complexity or the cost of running your own promotion.' },
      { type: 'p', text: 'Every qualifying customer purchase becomes an opportunity to create excitement around your business.' },
      { type: 'p', text: 'This guide will show you how to get the most out of Winnbell and maximize the return on your participation from day one.' },
      { type: 'h2', text: 'How Winnbell Works' },
      { type: 'p', text: 'The concept is simple.' },
      { type: 'ol', items: [
        'You choose a qualifying purchase threshold for your business.',
        'Customers who meet that threshold can submit their purchase through the Winnbell platform.',
        'Every validated submission earns an entry into the current prize draw.',
        'Winnbell handles the campaign administration, validation, winner selection, prize fulfillment, and regulatory compliance.',
      ] },
      { type: 'p', text: 'Your role is simple: provide a great customer experience and remind customers about the opportunity to participate.' },
      { type: 'h2', text: 'Small Actions. Bigger Results.' },
      { type: 'p', text: "Businesses that get the most out of Winnbell don't rely on the platform alone, they actively integrate it into their daily operations. And it is not even complicated, simple actions like mentioning Winnbell at checkout, placing QR posters where customers can see them, and sharing your referral link on social media can significantly increase customer participation and maximize the value of your plan." },
      { type: 'p', text: 'This guide will show you exactly how.' },
      { type: 'h2', text: 'Your First Steps' },
      { type: 'p', text: 'Before your campaign begins, we recommend completing the following:' },
      { type: 'check', items: [
        'Complete your business profile',
        'Upload a sample receipt or invoice',
        'Choose the right qualifying threshold',
        'Download and display your QR posters',
        'Train your staff to mention Winnbell at checkout',
        'Share your referral link and social media materials',
      ] },
      { type: 'p', text: 'Most businesses can complete these steps in less than 20 minutes.' },
      { type: 'h2', text: "Let's Grow Together" },
      { type: 'p', text: "Our goal isn't simply to help you participate in a campaign." },
      { type: 'p', text: "It's to help you increase customer engagement, encourage repeat visits, and generate measurable returns from every Winnbell campaign." },
      { type: 'p', text: "Let's get started." },
    ],
  },
  {
    id: 'why',
    kicker: 'The idea behind it',
    title: 'Why Winnbell Works',
    blocks: [
      { type: 'p', text: 'Successful marketing is not only about getting customers\' attention. It is also about giving them a real reason to act.' },
      { type: 'p', text: 'Winnbell is built around several well-established ideas from behavioral science that help explain how people respond to opportunities, rewards, and progress.' },
      { type: 'h2', text: 'Small Chances Can Feel Highly Valuable' },
      { type: 'p', text: 'Research has shown that people do not always evaluate probabilities in a purely mathematical way. A small chance of receiving a meaningful reward can feel more valuable than the actual odds might suggest.' },
      { type: 'p', text: 'Winnbell uses this principle by giving customers the opportunity to participate in a significant prize campaign instead of offering only another small discount or coupon. Results will vary, but the possibility of winning can make the promotion feel more exciting, noticeable, and worth engaging with.' },
      { type: 'h2', text: 'Progress Can Encourage Continued Participation' },
      { type: 'p', text: 'People often become more motivated when they can see that they are making progress toward a goal.' },
      { type: 'p', text: 'When customers can track their entries during the campaign, each new qualifying visit feels connected to the entries they have already collected. Instead of every visit standing on its own, customers can see their participation building throughout the campaign.' },
      { type: 'p', text: 'This can give them another reason to return and keep participating.' },
      { type: 'h2', text: 'Customers Respond to Perceived Value' },
      { type: 'p', text: 'Customers do not judge every purchase by price alone.' },
      { type: 'p', text: 'Spending an extra $5 may feel unnecessary on its own. But when that same $5 also helps the customer reach the qualifying threshold and participate in the campaign, it can feel more worthwhile.' },
      { type: 'p', text: 'This is why choosing the right qualifying threshold is so important. Clearly showing customers how close they are to reaching it can also make the opportunity easier to understand and act on.' },
      { type: 'h2', text: 'Anticipation Adds to the Experience' },
      { type: 'p', text: 'The excitement does not begin only when a winner is selected.' },
      { type: 'p', text: "Customers may also enjoy imagining what they would do if they won and following the campaign as the draw gets closer. That feeling of anticipation can help keep Winnbell, and the participating businesses connected to it, in the customer's mind throughout the month." },
    ],
  },
  {
    id: 'entry-cap',
    kicker: 'Setup',
    title: 'Choosing the Right Entry Cap',
    blocks: [
      { type: 'p', text: 'Your Entry Cap determines the maximum number of entries that can be activated through your business during a campaign.' },
      { type: 'p', text: 'If your Entry Cap is exhausted before the campaign ends, customers will no longer be able to receive entries through your business, and your business will no longer appear as an active participating location until the next campaign begins.' },
      { type: 'p', text: "If you're unsure how much capacity you'll need, we recommend starting with a smaller Entry Cap. After your first campaign, you'll have a much better understanding of your customer participation and can easily increase your Entry Cap for future campaigns if needed." },
      { type: 'p', text: "Keep in mind that customer participation often grows over the first few campaigns as your customers become more familiar with Winnbell. If your Entry Cap is nearly exhausted during your first month, it's usually a good indication that you should consider upgrading it for your next campaign to avoid limiting future growth." },
      { type: 'callout', text: 'Review your campaign analytics after each month and adjust your Entry Cap until you find the level that best matches your business.' },
    ],
  },
  {
    id: 'profile',
    kicker: 'Setup',
    title: 'Complete Your Business Profile',
    blocks: [
      { type: 'p', text: 'Your business profile is often the first impression customers have of your business within the Winnbell app. A complete, professional profile increases visibility, builds trust, and makes it easier for customers to choose your business over others.' },
      { type: 'p', text: 'Take a few minutes to review the following:' },
      { type: 'ul', items: [
        '**Choose the correct business category.** Select the category that best describes your business. This helps customers discover your business when browsing participating locations or when they look for specific goods or services.',
        '**Upload a high-quality profile photo.** Use your business logo or a clear, recognizable image that represents your brand. Avoid blurry or low-resolution images.',
        '**Confirm your location.** Make sure your address is accurate so customers can easily find you through the map and navigation features.',
        '**Add your website.** Include your website or online ordering page so interested customers can learn more about your business.',
        '**Write a short business introduction.** Tell customers what makes your business unique. A friendly, concise description helps create a stronger first impression and encourages more visits.',
      ] },
      { type: 'p', text: 'A well-crafted profile takes only a few minutes to complete but can make a lasting difference in how customers discover and engage with your business.' },
      { type: 'p', text: 'Use the preview option to see what our users are going to see when they find you on the map.' },
    ],
  },
  {
    id: 'receipt',
    kicker: 'Setup',
    title: 'Upload a Sample Receipt',
    blocks: [
      { type: 'p', text: 'Uploading a sample receipt or invoice helps your customers quickly recognize which number they should use when submitting their entries through the Winnbell app.' },
      { type: 'p', text: 'After uploading your sample, simply indicate where the **receipt number** appears. This makes it easier for customers to identify the correct number on their own receipts and helps reduce confusion during the submission process.' },
      { type: 'h3', text: 'Best Practices' },
      { type: 'ul', items: [
        '**Use a scanned copy or PDF whenever possible.** These provide the clearest image and are easier for customers to read than photographs of printed receipts.',
        '**Avoid uploading photos of wrinkled, folded, damaged, or poorly lit receipts.** A clean, professional-looking sample is much easier to understand.',
        '**Protect sensitive information.** Before uploading your sample, ensure it does not display customer names, payment card numbers, or any other confidential information. If necessary, redact or cover with the black marker feature.',
        '**Use a typical receipt.** Choose a receipt that accurately represents what most of your customers will receive.',
      ] },
      { type: 'p', text: 'A clear sample receipt only needs to be uploaded once, but it helps every customer understand exactly which receipt to use and where to find the receipt number when participating in Winnbell.' },
    ],
  },
  {
    id: 'threshold',
    kicker: 'Strategy',
    title: 'Choosing the Right Threshold',
    blocks: [
      { type: 'p', text: 'Your qualifying threshold is one of the most powerful tools available in Winnbell. By adjusting it, you can influence customer behavior to support your business goals.' },
      { type: 'p', text: 'There is no single "perfect" threshold. The best choice depends on what you are trying to achieve, and you can adjust it from one campaign to the next as your objectives change.' },
      { type: 'h2', text: 'Increase Average Basket Size' },
      { type: 'p', text: 'If your goal is to encourage customers to spend more during each visit, consider setting your threshold slightly above your current average transaction value.' },
      { type: 'p', text: 'The ideal threshold should be close enough that customers can realistically reach it by adding one or two extra items to their purchase. If the threshold is set too high, customers may feel it is out of reach and simply choose not to participate, reducing overall engagement.' },
      { type: 'p', text: 'For example:' },
      { type: 'stat', from: { label: 'Average transaction', value: '$44' }, to: { label: 'Suggested threshold', value: '$50' } },
      { type: 'p', text: 'A customer may only need to add a dessert, drink, or side item to qualify.' },
      { type: 'h2', text: 'Maximize Customer Participation' },
      { type: 'p', text: 'If your objective is to generate as many entries as possible, make qualifying easy.' },
      { type: 'p', text: 'Setting your threshold below your average transaction value allows most customers to qualify automatically. You can even position the threshold so that many customers receive two or more entries from a typical purchase.' },
      { type: 'p', text: 'This approach is particularly useful when your priority is increasing visibility, customer engagement, or encouraging customers to choose your business over competitors.' },
      { type: 'h2', text: 'Businesses With Higher Transaction Values' },
      { type: 'p', text: 'Businesses with naturally higher average transaction values, such as furniture stores, jewelry stores, automotive services, or luxury retailers, may benefit from offering multiple entries per purchase.' },
      { type: 'p', text: 'Rather than requiring extremely large purchases, consider configuring your threshold so that a typical customer earns two or three entries. You can also encourage additional spending by positioning the next entry just within reach, motivating customers to add another product or service to qualify for an additional entry.' },
      { type: 'h2', text: 'Test, Measure, and Improve' },
      { type: 'p', text: 'Your threshold is not permanent.' },
      { type: 'p', text: 'One of the advantages of Winnbell is the ability to refine your strategy over time.' },
      { type: 'p', text: 'Monitor your campaign performance each month by reviewing metrics under the analytics section such as:' },
      { type: 'ul', items: [
        'Number of entries generated',
        'Qualified sales',
        'Average transaction value',
        'Average above threshold',
        'Customer participation',
      ] },
      { type: 'p', text: 'If engagement is lower than expected, consider reducing the threshold. If customers are consistently qualifying with ease, you may wish to increase it slightly to encourage additional spending.' },
      { type: 'p', text: "Over time, you'll discover the threshold that delivers the best balance between customer engagement and business growth." },
      { type: 'p', text: "Remember, the goal isn't simply to generate more entries, it's to choose the threshold that best supports your business objectives." },
    ],
  },
  {
    id: 'staff',
    kicker: 'In store',
    title: 'Train Your Staff',
    blocks: [
      { type: 'p', text: 'Your staff plays one of the biggest roles in the success of your Winnbell campaigns.' },
      { type: 'p', text: 'For decades, businesses have used a simple technique often referred to as the **"Would You Like Fries With That?" effect**, a friendly suggestion at the point of sale that encourages customers to make a small additional purchase. Winnbell builds on this same principle by giving customers an exciting reason to say "yes."' },
      { type: 'p', text: 'A simple mention of Winnbell during checkout can dramatically increase participation and engagement rates. It reminds customers about the opportunity to qualify for the campaign prize and encourages them to consider adding one more item or service to reach the qualifying threshold.' },
      { type: 'p', text: "To help your team succeed, we've included ready-to-use staff scripts and customer engagement tips in the **Marketing** section in the platform. We recommend reviewing these with all customer-facing staff before your campaign begins." },
      { type: 'p', text: 'Consistent staff engagement is one of the easiest and most effective ways to maximize the return from your Winnbell membership.' },
    ],
  },
  {
    id: 'qr',
    kicker: 'In store',
    title: 'Use Your QR Code',
    blocks: [
      { type: 'p', text: 'Your unique Winnbell QR code is one of the easiest ways to increase customer participation.' },
      { type: 'p', text: 'When customers scan your QR code, they are taken directly to the entry submission page, with your business already pre-selected. This eliminates unnecessary steps, reduces confusion, and makes it quicker and easier for customers to submit their entries.' },
      { type: 'p', text: "Don't limit your QR code to posters. Consider placing it wherever customers naturally interact with your business, for example:" },
      { type: 'ul', items: [
        'Posters near the checkout.',
        'Table stands for restaurants, cafés, and bars.',
        'Printed receipts or invoices.',
        'Email invoices and order confirmations.',
        'Packaging, menus, or other customer-facing materials.',
      ] },
      { type: 'p', text: 'You can download a collection of pre-approved marketing materials, including QR posters, from the **Marketing** section of the platform.' },
      { type: 'p', text: "If you'd like to create your own marketing materials, visit the **Create Your Own** page within the Marketing section. There, you can download your QR code, the Winnbell logo, and other brand assets to create custom designs that match your business." },
      { type: 'p', text: 'If you choose to create your own materials instead of using the pre-approved versions, please ensure they comply with the Participating Business Guidelines before publishing them.' },
    ],
  },
  {
    id: 'social',
    kicker: 'Reach',
    title: 'Promote Winnbell on Social Media',
    blocks: [
      { type: 'p', text: 'Social media is one of the easiest ways to let your existing customers know that your business is participating in Winnbell.' },
      { type: 'p', text: 'In the **Social Assets** page under the **Marketing** section, you can download ready-to-post Instagram and Facebook Story images announcing your participation in the current Winnbell campaign.' },
      { type: 'p', text: "We recommend posting during the campaign more than once. A post at the beginning of the month creates awareness, while reminder posts during the campaign help keep Winnbell fresh in your customers' minds and may encourage repeat visits." },
      { type: 'h2', text: 'Use Your Referral Link' },
      { type: 'p', text: 'From the **Social Assets** page, you can also generate your unique Winnbell referral link. When customers click your link, they will be taken to the Winnbell registration page. New customers who register through your link will receive a bonus entry for the current campaign.' },
      { type: 'p', text: "And don't forget to tag us **@winnbell_official** 😉" },
      { type: 'h2', text: 'How to Add Your Link to an Instagram Story' },
      { type: 'ol', items: [
        'Download your Winnbell Story image from the **Social Assets** page.',
        'Copy your unique referral link.',
        'Open Instagram and create a new Story.',
        'Upload the Winnbell Story image.',
        'Tap the sticker icon at the top of the screen.',
        'Choose the **Link** sticker.',
        'Paste your referral link.',
        'Add a short label, such as **"join Winnbell, the first entry is on us"**.',
        'Place the sticker at the correct place.',
        'Tag us on the story **@winnbell_official**',
        'Publish the Story.',
      ] },
      { type: 'p', text: 'Using your Winnbell Story together with your referral link makes it easy for followers to learn about the campaign, register, and start participating through your business.' },
    ],
  },
  {
    id: 'footer',
    kicker: 'Reach',
    title: 'Add Winnbell to Your Receipt Footer',
    blocks: [
      { type: 'p', text: "If your POS system allows you to customize your receipt footer, consider adding a short Winnbell message to every receipt. It's a simple way to remind customers about the campaign after they complete their purchase and encourages them to submit their entry." },
      { type: 'p', text: 'For even better results, you can include your Winnbell QR code in the receipt footer. Customers can simply scan the code to go directly to the entry submission page, with your business already selected.' },
      { type: 'p', text: 'You can also use the receipt footer to clearly indicate which number customers should submit as their **Receipt Number**, helping reduce confusion during the submission process.' },
      { type: 'p', text: 'Your QR code can be downloaded from the **Create Your Own** page in the **Marketing** section of the platform.' },
      { type: 'p', text: 'In all cases just add this sentence to the footer:' },
      { type: 'callout', text: 'NO PURCHASE NECESSARY. Alternative method of entry and Official Rules available at winnbell.com' },
    ],
  },
  {
    id: 'monitor',
    kicker: 'Improve',
    title: 'Monitor Your Performance',
    blocks: [
      { type: 'p', text: "Don't forget to check the **Analytics** section of the platform from time to time." },
      { type: 'p', text: 'Your dashboard provides valuable insights into your campaign performance, including customer participation, qualified sales, referral activity, and other key metrics. Reviewing these analytics regularly can help you identify trends and fine-tune your threshold, Entry Cap, and marketing strategy over time.' },
      { type: 'p', text: 'Keep in mind that the first one or two campaigns may not fully reflect your long-term performance. Some trends require time to develop, and customer engagement often increases as customers become more familiar with Winnbell and your participation in the platform.' },
      { type: 'p', text: "The best-performing businesses don't just participate, they use their analytics to continuously improve each campaign." },
    ],
  },
  {
    id: 'mistakes',
    kicker: 'Improve',
    title: 'Common Mistakes to Avoid',
    blocks: [
      { type: 'p', text: "Even small changes can make a big difference to your campaign's performance. Here are some of the most common mistakes we see:" },
      { type: 'ul', items: [
        '**Setting the qualifying threshold too high.** Customers should feel they can realistically reach it with a small additional purchase.',
        '**Forgetting to mention Winnbell at checkout.** A simple reminder from your staff can dramatically increase participation.',
        '**Not promoting Winnbell outside your store.** Use QR codes, social media, and receipt footers to keep customers engaged.',
        "**Using an Entry Cap that's too small.** If you consistently reach your cap early, consider increasing it for future campaigns.",
        '**Ignoring your campaign analytics.** Review your performance regularly and make small adjustments over time.',
        '**Expecting maximum engagement immediately.** It often takes a campaign or two for customers to become familiar with Winnbell and participation to build.',
      ] },
      { type: 'p', text: 'Businesses that consistently promote Winnbell and refine their strategy from one campaign to the next generally achieve the best long-term results.' },
    ],
  },
];

// ── Inline emphasis renderer (**bold**) ─────────────────────────────────────────
const renderInline = (text: string): ReactNode =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <Box component='span' key={i} sx={{ fontWeight: 700, color: TEXT_HEADING }}>
        {part.slice(2, -2)}
      </Box>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );

// Shared body copy metrics - the bullet/number markers are centered against this exact
// line box so they sit in the middle of the first line rather than on top of it.
const BODY_FONT = '0.95rem';
const BODY_LH = 1.65;

// ── Block renderer ──────────────────────────────────────────────────────────────
const BlockView = ({ block }: { block: Block }) => {
  switch (block.type) {
    case 'h2':
      return (
        <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, fontWeight: 800, color: TEXT_HEADING, mt: 3, mb: 0.5 }}>
          {block.text}
        </Typography>
      );
    case 'h3':
      return (
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER_HOURGLASS, mt: 2.5, mb: 0.5 }}>
          {block.text}
        </Typography>
      );
    case 'p':
      return (
        <Typography sx={{ fontSize: BODY_FONT, color: TEXT_SECONDARY, lineHeight: 1.7, mt: 1.25 }}>
          {renderInline(block.text)}
        </Typography>
      );
    case 'ul':
      return (
        <Stack component='ul' sx={{ listStyle: 'none', m: 0, mt: 1.5, p: 0 }} spacing={1.25}>
          {block.items.map((it, i) => (
            <Stack key={i} component='li' direction='row' spacing={1.25} alignItems='flex-start'>
              {/* Marker wrapper matches the first line's box height so the dot centers vertically. */}
              <Box sx={{ height: `calc(${BODY_FONT} * ${BODY_LH})`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: PRIMARY_MAIN }} />
              </Box>
              <Typography sx={{ fontSize: BODY_FONT, color: TEXT_SECONDARY, lineHeight: BODY_LH }}>
                {renderInline(it)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      );
    case 'ol':
      return (
        <Stack component='ol' sx={{ listStyle: 'none', m: 0, mt: 1.5, p: 0 }} spacing={1.25}>
          {block.items.map((it, i) => (
            <Stack key={i} component='li' direction='row' spacing={1.5} alignItems='flex-start'>
              {/* Number chip centered against the first line's box height. */}
              <Box sx={{ height: `calc(${BODY_FONT} * ${BODY_LH})`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 24, height: 24, borderRadius: '50%',
                    bgcolor: `${PRIMARY_MAIN}14`, color: PRIMARY_MAIN,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 800,
                  }}
                >
                  {i + 1}
                </Box>
              </Box>
              <Typography sx={{ fontSize: BODY_FONT, color: TEXT_SECONDARY, lineHeight: BODY_LH }}>
                {renderInline(it)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      );
    case 'check':
      return (
        <Stack sx={{ mt: 1.75 }} spacing={1}>
          {block.items.map((it, i) => (
            <Stack key={i} direction='row' spacing={1.25} alignItems='center'>
              <CheckCircleRounded sx={{ fontSize: 20, color: METRIC_GOOD, flexShrink: 0 }} />
              <Typography sx={{ fontSize: BODY_FONT, color: TEXT_HEADING, fontWeight: 600 }}>
                {renderInline(it)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      );
    case 'stat':
      return (
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ my: 2, flexWrap: 'wrap' }}>
          {[block.from, block.to].map((s, i) => (
            <Fragment key={i}>
              {i === 1 && <EastRounded sx={{ fontSize: 22, color: AMBER_HOURGLASS }} />}
              <Box
                sx={{
                  px: 2, py: 1.25, borderRadius: 2, minWidth: 150,
                  border: `1.5px solid ${i === 1 ? `${AMBER_HOURGLASS}66` : 'divider'}`,
                  bgcolor: i === 1 ? ACCENT_GOLD_LIGHT : '#fff',
                }}
              >
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: TEXT_SECONDARY }}>
                  {s.label}
                </Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: i === 1 ? AMBER_HOURGLASS : TEXT_HEADING, lineHeight: 1.2 }}>
                  {s.value}
                </Typography>
              </Box>
            </Fragment>
          ))}
        </Stack>
      );
    case 'callout':
      return (
        <Box
          sx={{
            mt: 2, p: 2, borderRadius: 2,
            bgcolor: ACCENT_GOLD_LIGHT,
            border: `1px solid ${GOLD_TROPHY}66`,
            borderLeft: `4px solid ${AMBER_HOURGLASS}`,
          }}
        >
          <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: TEXT_HEADING, lineHeight: 1.6 }}>
            {block.text}
          </Typography>
        </Box>
      );
    default:
      return null;
  }
};

// ── Page ────────────────────────────────────────────────────────────────────────
const MarketingGuidePage = () => {
  const navigate = useNavigate();

  const scrollToChapter = (id: string) => {
    document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: 8 }}>
      <motion.div variants={riseIn} initial='hidden' animate='visible'>
        <AppPageHero
          title='Get the most out of Winnbell'
          subtitle='Your playbook for turning every campaign into more customers.'
        />
      </motion.div>

      <Container maxWidth='md' sx={{ mt: { xs: 2, md: 1 } }}>
        <Button
          startIcon={<ArrowBackRounded sx={{ fontSize: 18 }} />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', fontWeight: 700, color: PRIMARY_MAIN, mb: 2, px: 1 }}
        >
          Back
        </Button>

        {/* Intro banner */}
        <motion.div variants={riseIn} initial='hidden' animate='visible'>
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              p: { xs: 2.5, md: 3.5 },
              mb: 3,
              background: `linear-gradient(135deg, ${PRIMARY_DEEP}, ${PRIMARY_MAIN})`,
              color: '#fff',
            }}
          >
            <Box sx={{ position: 'absolute', top: '-40%', right: '-6%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_20} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <Stack spacing={1.25} sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.75, alignSelf: 'flex-start',
                  bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_20}`, borderRadius: '999px', px: 1.25, py: 0.5,
                }}
              >
                <MenuBookRounded sx={{ fontSize: 14, color: GOLD_TROPHY }} />
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Business guide
                </Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' }, fontWeight: 800, lineHeight: 1.2 }}>
                Simple ways to bring in more customers and get more from every campaign.
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: ALPHA_WHITE_80, lineHeight: 1.6, maxWidth: 620 }}>
                A short read covering how Winnbell works, why it works, and the small actions that make the biggest difference. Most of it takes minutes to put in place.
              </Typography>
            </Stack>
          </Paper>
        </motion.div>

        {/* Table of contents */}
        <motion.div variants={riseIn} initial='hidden' animate='visible'>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 2.5 }, mb: 3, background: '#fff' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1.5 }}>
              In this guide
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 0.5 }}>
              {CHAPTERS.map((ch, idx) => (
                <Stack
                  key={ch.id}
                  direction='row'
                  spacing={1.25}
                  alignItems='center'
                  onClick={() => scrollToChapter(ch.id)}
                  sx={{
                    cursor: 'pointer', borderRadius: 2, px: 1, py: 1,
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: `${PRIMARY_MAIN}08` },
                  }}
                >
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: AMBER_TEXT_AA, width: 22, flexShrink: 0 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: TEXT_HEADING, flex: 1, minWidth: 0 }}>
                    {ch.title}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Paper>
        </motion.div>

        {/* Chapters */}
        <Stack spacing={2.5}>
          {CHAPTERS.map((ch, idx) => (
            <motion.div
              key={ch.id}
              id={`guide-${ch.id}`}
              variants={riseIn}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.15 }}
              style={{ scrollMarginTop: 16 }}
            >
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 }, background: '#fff' }}>
                <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: GRADIENT_GOLD_VIVID, color: '#fff',
                      fontSize: '1rem', fontWeight: 800,
                    }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: AMBER_TEXT_AA }}>
                      {ch.kicker}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.45rem' }, fontWeight: 800, color: TEXT_HEADING, lineHeight: 1.2 }}>
                      {ch.title}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                {ch.blocks.map((block, i) => (
                  <BlockView key={i} block={block} />
                ))}
              </Paper>
            </motion.div>
          ))}
        </Stack>

        {/* Closing CTA */}
        <motion.div variants={riseIn} initial='hidden' whileInView='visible' viewport={{ once: true, amount: 0.2 }}>
          <Paper
            elevation={0}
            sx={{
              mt: 3, borderRadius: 3, p: { xs: 2.5, md: 3 }, textAlign: 'center',
              border: `1.5px solid ${GOLD_TROPHY}55`, background: '#fff', boxShadow: `0 2px 8px ${GOLD_TROPHY}22`,
            }}
          >
            <Typography sx={{ fontSize: { xs: '1.15rem', md: '1.3rem' }, fontWeight: 800, color: TEXT_HEADING, mb: 0.75 }}>
              Ready to put it into action?
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: TEXT_SECONDARY, mb: 2 }}>
              Grab your QR posters, social posts, and staff scripts from the Marketing section.
            </Typography>
            <Button
              variant='contained'
              endIcon={<ArrowForwardRounded sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/marketing')}
              sx={{ background: GRADIENT_GOLD_VIVID, color: '#fff', fontWeight: 800, textTransform: 'none', borderRadius: 1.5, px: 3, py: 1, '&:hover': { background: GRADIENT_GOLD_VIVID, opacity: 0.94 } }}
            >
              Go to Marketing materials
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default MarketingGuidePage;
