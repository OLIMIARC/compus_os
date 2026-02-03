import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Marketplace Listings specifically...');

    const user = await prisma.user.findFirst({
        where: { email: 'john@example.com' }
    });

    if (!user) {
        console.error('❌ Could not find test user. Run the main seed first (or reset).');
        return;
    }

    const campusId = user.campusId;

    const listings = [
        {
            id: 'mpl_' + nanoid(10),
            sellerId: user.id,
            campusId: campusId,
            title: 'Calculus for Engineers - Textbook',
            description: 'Essential calculus textbook for first-year engineering students. Good condition, no missing pages.',
            category: 'academics',
            subcategory: 'textbooks',
            listingType: 'for_sale',
            priceUgx: 35000,
            isNegotiable: true,
            condition: 'good',
            images: '[]',
            meetsLocation: 'Main Library',
            status: 'active',
        },
        {
            id: 'mpl_' + nanoid(10),
            sellerId: user.id,
            campusId: campusId,
            title: 'iPhone 13 - 128GB',
            description: 'Slightly used iPhone 13. Blue color. Battery health 92%. Comes with original box and cable.',
            category: 'electronics',
            subcategory: 'phones',
            listingType: 'for_sale',
            priceUgx: 1800000,
            isNegotiable: false,
            condition: 'like_new',
            images: '[]',
            meetsLocation: 'Campus Security Office',
            status: 'active',
        },
        {
            id: 'mpl_' + nanoid(10),
            sellerId: user.id,
            campusId: campusId,
            title: 'Laundry Services - Weekly',
            description: 'I offer laundry services for students in Hall 5. Pick up and deliver within 24 hours.',
            category: 'services',
            subcategory: 'other',
            listingType: 'service',
            priceUgx: 15000,
            isNegotiable: true,
            condition: null,
            images: '[]',
            meetsLocation: 'Hall 5 Ground Floor',
            status: 'active',
        }
    ];

    for (const data of listings) {
        await prisma.marketplaceListing.upsert({
            where: { id: data.id },
            update: {},
            create: data
        });
    }

    console.log(`✅ Seeded ${listings.length} marketplace listings for ${user.fullName}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
