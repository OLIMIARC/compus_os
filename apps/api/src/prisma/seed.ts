import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Campuses
    const campuses = await Promise.all([
        prisma.campus.create({
            data: {
                id: 'cmp_makerere',
                name: 'Makerere University',
                city: 'Kampala',
            },
        }),
        prisma.campus.create({
            data: {
                id: 'cmp_mubs',
                name: 'Makerere University Business School',
                city: 'Kampala',
            },
        }),
        prisma.campus.create({
            data: {
                id: 'cmp_kyambogo',
                name: 'Kyambogo University',
                city: 'Kampala',
            },
        }),
    ]);
    console.log(`✅ Created ${campuses.length} campuses`);

    // Create Courses for Makerere
    const courses = await Promise.all([
        prisma.course.create({
            data: {
                id: 'crs_' + nanoid(10),
                campusId: 'cmp_makerere',
                code: 'CSC2101',
                title: 'Data Structures and Algorithms',
            },
        }),
        prisma.course.create({
            data: {
                id: 'crs_' + nanoid(10),
                campusId: 'cmp_makerere',
                code: 'CSC2201',
                title: 'Database Systems',
            },
        }),
        prisma.course.create({
            data: {
                id: 'crs_' + nanoid(10),
                campusId: 'cmp_makerere',
                code: 'CSC3101',
                title: 'Software Engineering',
            },
        }),
        prisma.course.create({
            data: {
                id: 'crs_' + nanoid(10),
                campusId: 'cmp_mubs',
                code: 'ACF1101',
                title: 'Financial Accounting',
            },
        }),
    ]);
    console.log(`✅ Created ${courses.length} courses`);

    // Create Test Users
    const passwordHash = await bcrypt.hash('Password123', 10);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                id: 'usr_' + nanoid(10),
                fullName: 'John Doe',
                email: 'john@example.com',
                passwordHash,
                username: 'johndoe',
                campusId: 'cmp_makerere',
                roles: 'student',
                status: 'active',
                reputationScore: 50,
            },
        }),
        prisma.user.create({
            data: {
                id: 'usr_' + nanoid(10),
                fullName: 'Jane Smith',
                email: 'jane@example.com',
                passwordHash,
                username: 'janesmith',
                campusId: 'cmp_makerere',
                roles: 'student,moderator',
                status: 'active',
                reputationScore: 150,
            },
        }),
        prisma.user.create({
            data: {
                id: 'usr_' + nanoid(10),
                fullName: 'Alice Johnson',
                phone: '+256700123456',
                passwordHash,
                username: 'alicejohnson',
                campusId: 'cmp_mubs',
                roles: 'student',
                status: 'active',
                reputationScore: 25,
            },
        }),
    ]);
    console.log(`✅ Created ${users.length} test users`);

    // Create Sample Feed Post
    const post = await prisma.feedPost.create({
        data: {
            id: 'fp_' + nanoid(10),
            campusId: 'cmp_makerere',
            authorUserId: users[0].id,
            postType: 'text',
            title: 'Welcome to Campus OS!',
            body: 'This is the first post on the new campus social platform. Share your notes, ask questions, and connect with your campus community!',
            status: 'active',
            likesCount: 0,
            commentsCount: 0,
            engagementScore: 1.0,
        },
    });
    console.log(`✅ Created sample post`);

    // Create Sample Marketplace Listings
    const listings = await Promise.all([
        // Textbook listing
        prisma.marketplaceListing.create({
            data: {
                id: 'mpl_' + nanoid(10),
                sellerId: users[1].id,
                campusId: 'cmp_makerere',
                title: 'Data Structures Textbook - 3rd Edition',
                description: 'Introduction to Algorithms by Cormen et al. Excellent condition with minimal highlighting. Perfect for CSC2101 students.',
                category: 'academics',
                subcategory: 'textbooks',
                listingType: 'for_sale',
                priceUgx: 45000,
                isNegotiable: true,
                condition: 'like_new',
                images: JSON.stringify([]),
                meetsLocation: 'Main Library',
                status: 'active',
            },
        }),
        // Laptop listing
        prisma.marketplaceListing.create({
            data: {
                id: 'mpl_' + nanoid(10),
                sellerId: users[0].id,
                campusId: 'cmp_makerere',
                title: 'HP Laptop - Core i5, 8GB RAM',
                description: 'HP ProBook laptop in good working condition. Perfect for students. Battery lasts 4-5 hours. Comes with charger.',
                category: 'electronics',
                subcategory: 'laptops',
                listingType: 'for_sale',
                priceUgx: 850000,
                isNegotiable: true,
                condition: 'good',
                images: JSON.stringify([]),
                meetsLocation: 'Main Hall',
                status: 'active',
            },
        }),
        // Tutoring service
        prisma.marketplaceListing.create({
            data: {
                id: 'mpl_' + nanoid(10),
                sellerId: users[1].id,
                campusId: 'cmp_makerere',
                title: 'Programming Tutoring - Python & Java',
                description: 'Experienced CS student offering tutoring in Python, Java, and Data Structures. One-on-one or group sessions available. Flexible schedule.',
                category: 'services',
                subcategory: 'tutoring',
                listingType: 'service',
                priceUgx: 20000,
                isNegotiable: false,
                condition: null,
                images: JSON.stringify([]),
                meetsLocation: 'CS Department or Online',
                status: 'active',
            },
        }),
    ]);
    console.log(`✅ Created ${listings.length} marketplace listings`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ${campuses.length} campuses`);
    console.log(`   ${courses.length} courses`);
    console.log(`   ${users.length} users`);
    console.log('   1 feed post');
    console.log(`   ${listings.length} marketplace listings`);
    console.log('');
    console.log('🔑 Test Account Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: Password123');
    console.log('');
    console.log('🚀 Try these endpoints:');
    console.log('   POST http://localhost:3000/api/v1/auth/login');
    console.log('   GET  http://localhost:3000/api/v1/campuses');
    console.log('   GET  http://localhost:3000/api/v1/courses');
    console.log('   GET  http://localhost:3000/api/v1/feed');
    console.log('   GET  http://localhost:3000/api/v1/marketplace?campus_id=cmp_makerere');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seeding error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
