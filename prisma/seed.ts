import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('demo1234', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@scanflow.app' },
    update: {},
    create: {
      name: 'Raj Kumar',
      email: 'demo@scanflow.app',
      password,
    },
  })

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'spice-garden' },
    update: {},
    create: {
      name: 'Spice Garden',
      slug: 'spice-garden',
      description: 'Authentic North Indian cuisine with a modern twist. Known for our butter chicken and fresh naan.',
      address: '42 MG Road, Bangalore - 560001',
      phone: '+91 98765 43210',
      email: 'hello@spicegarden.in',
      googleReviewUrl: 'https://g.page/r/demo-review-link',
      googleMapsUrl: 'https://maps.google.com',
      instagram: 'spicegardenblr',
      wifiPassword: 'spice@2024',
      primaryColor: '#22c55e',
      ownerId: user.id,
    },
  })

  const startersCategory = await prisma.menuCategory.create({
    data: { name: 'Starters', sortOrder: 1, restaurantId: restaurant.id },
  })
  const mainCourseCategory = await prisma.menuCategory.create({
    data: { name: 'Main Course', sortOrder: 2, restaurantId: restaurant.id },
  })
  const breadCategory = await prisma.menuCategory.create({
    data: { name: 'Breads & Rice', sortOrder: 3, restaurantId: restaurant.id },
  })
  const drinksCategory = await prisma.menuCategory.create({
    data: { name: 'Beverages', sortOrder: 4, restaurantId: restaurant.id },
  })

  await prisma.menuItem.createMany({
    data: [
      { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in tandoor', price: 280, isVeg: true, isBestSeller: true, categoryId: startersCategory.id, sortOrder: 1 },
      { name: 'Chicken Seekh Kebab', description: 'Minced chicken with herbs, grilled on skewers', price: 320, isVeg: false, isBestSeller: true, categoryId: startersCategory.id, sortOrder: 2 },
      { name: 'Veg Spring Rolls', description: 'Crispy rolls with mixed vegetables', price: 180, isVeg: true, categoryId: startersCategory.id, sortOrder: 3 },
      { name: 'Mushroom Pepper Fry', description: 'Button mushrooms tossed with black pepper', price: 220, isVeg: true, categoryId: startersCategory.id, sortOrder: 4 },
      { name: 'Butter Chicken', description: 'Tender chicken in rich tomato-butter gravy', price: 380, isVeg: false, isBestSeller: true, categoryId: mainCourseCategory.id, sortOrder: 1 },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils in creamy gravy', price: 260, isVeg: true, isBestSeller: true, categoryId: mainCourseCategory.id, sortOrder: 2 },
      { name: 'Palak Paneer', description: 'Fresh cottage cheese in spinach gravy', price: 290, isVeg: true, categoryId: mainCourseCategory.id, sortOrder: 3 },
      { name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked mutton curry', price: 450, isVeg: false, isSpicy: true, categoryId: mainCourseCategory.id, sortOrder: 4 },
      { name: 'Shahi Paneer', description: 'Cottage cheese in rich Mughlai gravy', price: 320, isVeg: true, categoryId: mainCourseCategory.id, sortOrder: 5 },
      { name: 'Butter Naan', description: 'Soft leavened bread baked in tandoor', price: 60, isVeg: true, isBestSeller: true, categoryId: breadCategory.id, sortOrder: 1 },
      { name: 'Garlic Naan', description: 'Naan topped with garlic and butter', price: 70, isVeg: true, categoryId: breadCategory.id, sortOrder: 2 },
      { name: 'Jeera Rice', description: 'Fragrant basmati rice with cumin', price: 140, isVeg: true, categoryId: breadCategory.id, sortOrder: 3 },
      { name: 'Veg Biryani', description: 'Aromatic basmati rice with mixed vegetables', price: 280, isVeg: true, categoryId: breadCategory.id, sortOrder: 4 },
      { name: 'Mango Lassi', description: 'Thick yogurt drink blended with fresh mango', price: 120, isVeg: true, isBestSeller: true, categoryId: drinksCategory.id, sortOrder: 1 },
      { name: 'Sweet Lassi', description: 'Classic chilled yogurt drink', price: 90, isVeg: true, categoryId: drinksCategory.id, sortOrder: 2 },
      { name: 'Masala Chai', description: 'Spiced Indian milk tea', price: 60, isVeg: true, categoryId: drinksCategory.id, sortOrder: 3 },
      { name: 'Fresh Lime Soda', description: 'Lime juice with soda, sweet or salted', price: 80, isVeg: true, categoryId: drinksCategory.id, sortOrder: 4 },
    ],
  })

  await prisma.offer.createMany({
    data: [
      { title: '20% OFF on Weekday Lunch', description: 'Valid Mon–Fri, 12pm–3pm on orders above ₹500', isActive: true, restaurantId: restaurant.id },
      { title: 'Free Dessert on Birthday', description: 'Show your ID on your birthday and get a complimentary dessert', isActive: true, restaurantId: restaurant.id },
    ],
  })

  const qr1 = await prisma.qRCode.create({ data: { name: 'Table 1', type: 'table', tableNumber: '1', restaurantId: restaurant.id } })
  const qr2 = await prisma.qRCode.create({ data: { name: 'Table 2', type: 'table', tableNumber: '2', restaurantId: restaurant.id } })
  await prisma.qRCode.create({ data: { name: 'Bill QR', type: 'bill', restaurantId: restaurant.id } })
  await prisma.qRCode.create({ data: { name: 'Takeaway Counter', type: 'takeaway', restaurantId: restaurant.id } })

  const now = new Date()
  const scansData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const count = Math.floor(Math.random() * 25) + 8
    for (let j = 0; j < count; j++) {
      const scanDate = new Date(date)
      scanDate.setHours(Math.floor(Math.random() * 14) + 9)
      scansData.push({ restaurantId: restaurant.id, qrCodeId: j % 2 === 0 ? qr1.id : qr2.id, qrType: 'table', createdAt: scanDate })
    }
  }
  await prisma.scan.createMany({ data: scansData })

  await prisma.feedback.createMany({
    data: [
      { restaurantId: restaurant.id, rating: 'excellent', sentiment: 'positive', comment: 'Amazing food! The butter chicken was exceptional.', redirectedToGoogle: true, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { restaurantId: restaurant.id, rating: 'good', sentiment: 'positive', comment: 'Great ambience and friendly staff.', redirectedToGoogle: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { restaurantId: restaurant.id, rating: 'excellent', sentiment: 'positive', comment: 'Best dal makhani in the city!', redirectedToGoogle: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { restaurantId: restaurant.id, rating: 'average', sentiment: 'negative', comment: 'Service was a bit slow today.', redirectedToGoogle: false, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { restaurantId: restaurant.id, rating: 'excellent', sentiment: 'positive', comment: 'Loved every dish!', redirectedToGoogle: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { restaurantId: restaurant.id, rating: 'good', sentiment: 'positive', comment: 'Will definitely come back.', redirectedToGoogle: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { restaurantId: restaurant.id, rating: 'bad', sentiment: 'negative', comment: 'Food was cold when served.', redirectedToGoogle: false, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { restaurantId: restaurant.id, rating: 'excellent', sentiment: 'positive', redirectedToGoogle: true, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    ],
  })

  console.log('✅ Seed complete!')
  console.log('📧 Login: demo@scanflow.app')
  console.log('🔑 Password: demo1234')
  console.log('🔗 Customer page: http://localhost:3000/r/spice-garden')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
