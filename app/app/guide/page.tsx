'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Guide Page - Fit & Proportion Guide
 * 
 * Design Decisions (M3 + ADHD-optimized):
 * - Progressive disclosure with collapsible sections
 * - Clear visual hierarchy with section headers
 * - Easy navigation with sticky header and back button
 * - Comfortable reading width and spacing
 * - Quick access to sections via table of contents
 */

export default function GuidePage() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const expandAll = () => {
    const allSections = [
      'intro', 'philosophy', 'ideal', 'neckline', 'belting', 
      'hemlines', 'pants', 'shoes'
    ];
    const newState: Record<string, boolean> = {};
    allSections.forEach(id => newState[id] = true);
    setExpandedSections(newState);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top app bar */}
      <header className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                aria-label="Back to home"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-headline-medium text-on-surface">Fit & Proportion Guide</h1>
                <p className="text-body-small text-on-surface-variant">
                  Understanding what works for your wardrobe
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-2 bg-surface-variant text-on-surface-variant rounded-full text-label-small hover:bg-surface-container-high transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 bg-surface-variant text-on-surface-variant rounded-full text-label-small hover:bg-surface-container-high transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        
        {/* Introduction Section */}
        <Section 
          id="intro"
          title="Introduction"
          emoji="📖"
          expanded={expandedSections['intro']}
          onToggle={() => toggleSection('intro')}
        >
          <p className="mb-4">
            This guide helps you understand fit and proportion in clothing. A solid understanding of 
            these concepts is the first step to dressing well, for the following reasons:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Being able to evaluate fit allows you to buy pieces that are properly shaped for your body.</li>
            <li>Being able to evaluate proportions lets you go beyond body type and understand the reasons behind dressing for your shape.</li>
            <li>Developing an eye for fit and proportion lets you break traditional sartorial rules in a way that's still harmonious and aesthetically interesting.</li>
            <li>Being able to articulate what is off in fit and proportion also makes evaluating your own outfits much easier.</li>
          </ul>
        </Section>

        {/* General Philosophies */}
        <Section 
          id="philosophy"
          title="General Philosophies"
          emoji="💭"
          expanded={expandedSections['philosophy']}
          onToggle={() => toggleSection('philosophy')}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-title-medium text-on-surface mb-3">Watch horizontal lines that segment your body</h3>
              <p className="mb-3">
                One of the greatest challenges is observing how horizontal lines section your body in a 
                flattering or unflattering way:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Changes in item:</strong> The transition from a shirt to a skirt (hemline hanging over or tucked under waistband)</li>
                <li><strong>Changes in fabric:</strong> Colorblocking or textureblocking creates divisions</li>
                <li><strong>Changes in proportion:</strong> Going from boxy/large to slim/fitted creates horizontal divisions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-title-medium text-on-surface mb-3">Consider visual weight</h3>
              <p className="mb-3">
                Think about how complex, dominant, or heavy each item appears, and how pieces interact:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Visually complex:</strong> Textured, embellished, or patterned pieces draw attention</li>
                <li><strong>Visually dominant:</strong> Bold colors or shapes determine how the outfit is analyzed</li>
                <li><strong>Visually heavy:</strong> Thick knits, wedge heels, or voluminous pieces anchor the eye</li>
              </ul>
            </div>

            <div>
              <h3 className="text-title-medium text-on-surface mb-3">Notice how fit affects shape</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Tightness/fittedness:</strong> Can create the impression of slenderness or width depending on structure</li>
                <li><strong>Looseness/volume:</strong> Can create the impression of largeness or smallness in contrast to fitted pieces</li>
              </ul>
            </div>

            <div>
              <h3 className="text-title-medium text-on-surface mb-3">See when visual conflict works</h3>
              <p>
                Visual conflict can be jarring, but it can also be a deliberate aesthetic choice (like pairing 
                androgynous pieces with feminine cuts). However, thoughtlessly introduced conflict will feel wrong.
              </p>
            </div>
          </div>
        </Section>

        {/* The Ideal Body */}
        <Section 
          id="ideal"
          title="The Ideal Body"
          emoji="👤"
          expanded={expandedSections['ideal']}
          onToggle={() => toggleSection('ideal')}
        >
          <p className="mb-4">
            Most fit and proportion advice assumes a "slim hourglass with long legs" as the ideal. 
            Understanding this bias helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
            <li><strong>Slim:</strong> Most advice aims to make you look thinner</li>
            <li><strong>Hourglass:</strong> Advice focuses on "evening out" bust and hips</li>
            <li><strong>Long legs:</strong> Lower leg length is often emphasized over upper leg</li>
          </ul>
          <p className="p-4 bg-primary-container text-on-primary-container rounded-2xl">
            <strong>Important:</strong> Don't discard traditional advice without understanding why. 
            Rules are made to be broken, but knowing the rationale helps you create visually interesting 
            outfits that work for you.
          </p>
        </Section>

        {/* Neckline */}
        <Section 
          id="neckline"
          title="Neckline"
          emoji="👔"
          expanded={expandedSections['neckline']}
          onToggle={() => toggleSection('neckline')}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">How neckline changes shoulder width</h3>
              <p>
                A wide boatneck or square neck makes shoulders more prominent. For strapped items, 
                positioning (closer or farther from neck) affects how shoulders appear.
              </p>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">How neckline changes cleavage impression</h3>
              <p>
                High necklines with cleavage can look stuffed; low necklines with little cleavage 
                emphasize the lack. High necklines create continuity that tends to flatten the bust.
              </p>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">How neckline changes torso appearance</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Wideness:</strong> Wide/shallow necklines make torsos look wider and shorter</li>
                <li><strong>Taperedness:</strong> V-necks send the eye downward, slimming and lengthening the torso</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Belting */}
        <Section 
          id="belting"
          title="Belting"
          emoji="🎀"
          expanded={expandedSections['belting']}
          onToggle={() => toggleSection('belting')}
        >
          <p className="mb-4">
            <strong>Belting is not just about your waistline.</strong> The goal is a defined silhouette, 
            not just a defined waist.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-error-container text-on-error-container rounded-2xl">
              <h3 className="font-bold mb-2">❌ When belting fails:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Defining only the waist when the rest is puffy or awkwardly fitted</li>
                <li>Adding a belt to items not intended to cinch (like standard cardigans)</li>
                <li>Creating "two waists" by belting above or below existing waist definition</li>
              </ul>
            </div>
            <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-2xl">
              <h3 className="font-bold mb-2">✅ When belting works:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Belting where a waistline already exists</li>
                <li>Adding aesthetic interest or complementary color</li>
                <li>Establishing a gathered waist where none exists (if the cut allows)</li>
                <li>Defining complementary shape with other pieces</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">
                💡 Check your silhouette with and without a belt. Belts must be coherent with the fit 
                and are not a substitute for poorly-shaped clothing.
              </p>
            </div>
          </div>
        </Section>

        {/* Hemlines and Sleevelines */}
        <Section 
          id="hemlines"
          title="Hemlines & Sleevelines"
          emoji="📏"
          expanded={expandedSections['hemlines']}
          onToggle={() => toggleSection('hemlines')}
        >
          <div className="space-y-4">
            <div className="p-4 bg-secondary-container text-on-secondary-container rounded-2xl">
              <h3 className="font-bold mb-2">How to find your best length:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Get a full-body mirror</li>
                <li>Wrap a towel or sheet around your waist</li>
                <li>Roll or unroll to create different hemlines</li>
                <li>Find which length is most flattering</li>
              </ol>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Optimal lengths for bottoms:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Cropped pants:</strong> Don't let crops hit above the widest part of your calf</li>
                <li><strong>Skirts:</strong> Find your optimal length based on upper leg to lower leg ratio</li>
                <li><strong>Shorts:</strong> May differ from skirts since you can go shorter</li>
              </ul>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Sleevelines and shoulders:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Cap sleeves often make shoulders look round</li>
                <li>Shoulder seams too far out can make shoulders look slouched</li>
                <li>Shoulder seams too far in can make shoulders look strangely round</li>
                <li>Check where sleeves cut off your arm for optimal proportion</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">
                💡 The height of your visually-defined waist determines leg length. High-waisted bottoms 
                are flattering because we're conditioned to find longer legs attractive.
              </p>
            </div>
          </div>
        </Section>

        {/* Pants */}
        <Section 
          id="pants"
          title="Pants"
          emoji="👖"
          expanded={expandedSections['pants']}
          onToggle={() => toggleSection('pants')}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Choose the correct rise</h3>
              <p>
                If you feel self-conscious bending over in jeans, try a higher rise. The fabric should 
                cover appropriately for how curved your shape is.
              </p>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Pocket positioning matters:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Height:</strong> Lower pockets make your shape look fuller</li>
                <li><strong>Angle:</strong> Pockets should complement your form (outward angles for flared hips)</li>
                <li><strong>Proportion:</strong> Pocket size should be proportionate to your shape</li>
                <li><strong>Decoration:</strong> Fancy stitching adds visual weight</li>
              </ul>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Select the right cut:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Volume with torso:</strong> Maintain similar volume or create intentional contrast</li>
                <li><strong>Volume with hips/thighs:</strong> Super-skinny cuts may create unflattering taper</li>
              </ul>
            </div>
            <div className="p-4 bg-error-container text-on-error-container rounded-2xl">
              <p className="font-bold">⚠️ When looseness looks awkward:</p>
              <p className="mt-2">
                Bootcut or flare cuts often look jarring because they create volume where we expect 
                slimness (ankles and calves). Use thoughtfully or avoid.
              </p>
            </div>
          </div>
        </Section>

        {/* Shoes */}
        <Section 
          id="shoes"
          title="Shoes"
          emoji="👠"
          expanded={expandedSections['shoes']}
          onToggle={() => toggleSection('shoes')}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Visual weight matters</h3>
              <p className="mb-3">
                Shoes anchor your outfit at the bottom. Check that their visual weight feels coherent 
                with the rest of your outfit.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Slim shoes:</strong> Ballet flats and thin sandals have little weight but may look insubstantial with heavy layering</li>
                <li><strong>Heavy shoes:</strong> Wedges, chunky sneakers have more visual weight</li>
              </ul>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Toebox shapes:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Rounded toes:</strong> Can look childish, makes feet look shorter and wider</li>
                <li><strong>Almond toes:</strong> Generally recommended - lengthens while staying natural</li>
                <li><strong>Pointy toes:</strong> Angular statement that lengthens the foot deliberately</li>
              </ul>
            </div>
            <div>
              <h3 className="text-title-medium text-on-surface mb-2">Heel thickness and height:</h3>
              <p>
                Look at heel proportion to the rest of the shoe. Thick heels with strappy sandals 
                (or thin heels with substantial shoes) create strong contrast. Matching substantial 
                shoes with substantial heels (or slim with slim) creates visual balance.
              </p>
            </div>
          </div>
        </Section>

        {/* Attribution */}
        <div className="bg-surface-container rounded-2xl p-6 mt-8">
          <h2 className="text-title-large text-on-surface mb-2">About This Guide</h2>
          <p className="text-body-medium text-on-surface-variant mb-4">
            This guide is adapted from an excellent Reddit post about understanding fit and proportion. 
            The concepts here focus on theoretical understanding rather than strict rules, helping you 
            develop an eye for what works and why.
          </p>
          <p className="text-body-small text-on-surface-variant">
            Note: The guide mentions specific body ideals and traditional advice. Remember that these 
            are conventions, not requirements. Understanding the rationale helps you make informed 
            choices that work for your personal style and preferences.
          </p>
        </div>
      </main>
    </div>
  );
}

// Collapsible Section Component
interface SectionProps {
  id: string;
  title: string;
  emoji: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, emoji, expanded, onToggle, children }: SectionProps) {
  return (
    <div className="bg-surface-container rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <h2 className="text-title-large text-on-surface">{title}</h2>
        </div>
        <svg
          className={`w-6 h-6 text-on-surface-variant transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <div className="px-6 pb-6 text-body-large text-on-surface-variant">
          {children}
        </div>
      )}
    </div>
  );
}
