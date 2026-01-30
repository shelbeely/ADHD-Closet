import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

interface OutfitItem {
  id: string;
  category: string;
  colorPalette?: string[];
}

// POST /api/accessories/suggest - Get smart accessory suggestions for an outfit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outfitItems } = body as { outfitItems: OutfitItem[] };

    if (!outfitItems || outfitItems.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Extract outfit characteristics
    const hasShoes = outfitItems.some(item => item.category === 'shoes');
    const hasAccessory = outfitItems.some(item => item.category === 'accessories');
    const hasJewelry = outfitItems.some(item => item.category === 'jewelry');

    // Get all outfit colors for matching
    const outfitColors = outfitItems
      .flatMap(item => item.colorPalette || [])
      .filter((color, index, self) => self.indexOf(color) === index);

    // Fetch available accessories, jewelry, and shoes
    const [accessories, jewelry, shoes] = await Promise.all([
      prisma.item.findMany({
        where: {
          category: 'accessories',
          state: 'available',
          id: { notIn: outfitItems.map(item => item.id) }
        },
        include: {
          images: {
            where: { kind: 'ai_catalog' },
            take: 1
          },
          tags: {
            include: { tag: true }
          }
        },
        take: 10
      }),
      prisma.item.findMany({
        where: {
          category: 'jewelry',
          state: 'available',
          id: { notIn: outfitItems.map(item => item.id) }
        },
        include: {
          images: {
            where: { kind: 'ai_catalog' },
            take: 1
          },
          tags: {
            include: { tag: true }
          }
        },
        take: 10
      }),
      prisma.item.findMany({
        where: {
          category: 'shoes',
          state: 'available',
          id: { notIn: outfitItems.map(item => item.id) }
        },
        include: {
          images: {
            where: { kind: 'ai_catalog' },
            take: 1
          },
          tags: {
            include: { tag: true }
          }
        },
        take: 10
      })
    ]);

    const suggestions: Array<{
      id: string;
      title: string;
      category: 'accessories' | 'jewelry' | 'shoes';
      subType?: string;
      imageUrl?: string;
      reason: string;
      confidenceScore: number;
      colorMatch: boolean;
    }> = [];

    // Suggest shoes if not already in outfit
    if (!hasShoes && shoes.length > 0) {
      shoes.forEach(shoe => {
        const shoeColors = (shoe.colorPalette as string[]) || [];
        const colorMatch = shoeColors.some(color => outfitColors.includes(color));
        const shoeType = (shoe.attributes as any)?.shoeType || 'shoes';
        
        suggestions.push({
          id: shoe.id,
          title: shoe.title || `${shoeType}`,
          category: 'shoes',
          subType: shoeType,
          imageUrl: shoe.images[0]?.filePath ? `/api/images/${shoe.images[0].filePath}` : undefined,
          reason: colorMatch 
            ? 'Matches your outfit colors - great choice!'
            : 'Complements the outfit nicely',
          confidenceScore: colorMatch ? 0.85 : 0.65,
          colorMatch
        });
      });
    }

    // Suggest accessories (bags, purses) if needed
    if (!hasAccessory && accessories.length > 0) {
      accessories.forEach(accessory => {
        const accColors = (accessory.colorPalette as string[]) || [];
        const colorMatch = accColors.some(color => outfitColors.includes(color));
        const accType = (accessory.attributes as any)?.accessoryType || 'accessory';
        
        suggestions.push({
          id: accessory.id,
          title: accessory.title || `${accType}`,
          category: 'accessories',
          subType: accType,
          imageUrl: accessory.images[0]?.filePath ? `/api/images/${accessory.images[0].filePath}` : undefined,
          reason: colorMatch
            ? 'Color-coordinated with outfit'
            : 'Practical and stylish addition',
          confidenceScore: colorMatch ? 0.8 : 0.6,
          colorMatch
        });
      });
    }

    // Smart jewelry suggestions based on outfit complexity
    if (!hasJewelry && jewelry.length > 0) {
      jewelry.forEach(jewel => {
        const jewelColors = (jewel.colorPalette as string[]) || [];
        const colorMatch = jewelColors.some(color => outfitColors.includes(color));
        const jewelType = (jewel.attributes as any)?.jewelryType || 'jewelry';
        const isStatement = jewel.tags.some(t => 
          t.tag.name.toLowerCase().includes('statement') || 
          t.tag.name.toLowerCase().includes('bold')
        );
        
        suggestions.push({
          id: jewel.id,
          title: jewel.title || `${jewelType}`,
          category: 'jewelry',
          subType: jewelType,
          imageUrl: jewel.images[0]?.filePath ? `/api/images/${jewel.images[0].filePath}` : undefined,
          reason: isStatement
            ? 'Statement piece adds visual interest'
            : 'Subtle accent for your look',
          confidenceScore: colorMatch ? 0.85 : 0.65,
          colorMatch
        });
      });
    }

    // Sort by confidence score
    suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);

    // Return top 5 suggestions
    return NextResponse.json({
      suggestions: suggestions.slice(0, 5)
    });

  } catch (error) {
    console.error('Error generating accessory suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
