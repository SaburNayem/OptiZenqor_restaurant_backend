import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@optizenqor.com' },
    update: {},
    create: {
      email: 'admin@optizenqor.com',
      fullName: 'Super Admin',
      role: Role.super_admin,
      passwordHash,
      isActive: true,
    },
  });

  const dhaka = await prisma.branch.upsert({
    where: { slug: 'dhaka-flagship' },
    update: {},
    create: {
      name: 'Dhaka Flagship',
      slug: 'dhaka-flagship',
      address: 'House 10, Road 12, Dhanmondi, Dhaka',
      isFlagship: true,
      deliveryRadiusKm: 8,
      phone: '+8801700000001',
      operatingHoursJson: {
        mon: '09:00-23:00',
        tue: '09:00-23:00',
      },
    },
  });

  const gulshan = await prisma.branch.upsert({
    where: { slug: 'gulshan' },
    update: {},
    create: {
      name: 'Gulshan Branch',
      slug: 'gulshan',
      address: 'Plot 22, Gulshan Avenue, Dhaka',
      deliveryRadiusKm: 6,
      phone: '+8801700000002',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@optizenqor.com' },
    update: {},
    create: {
      email: 'manager@optizenqor.com',
      fullName: 'Dhaka Branch Manager',
      role: Role.branch_manager,
      passwordHash,
      isActive: true,
    },
  });

  await prisma.staffBranchAssignment.upsert({
    where: { userId_branchId: { userId: manager.id, branchId: dhaka.id } },
    update: {},
    create: { userId: manager.id, branchId: dhaka.id },
  });

  const burgerCat = await prisma.category.upsert({
    where: { slug: 'burgers' },
    update: {},
    create: { name: 'Burgers', slug: 'burgers' },
  });

  const drinkCat = await prisma.category.upsert({
    where: { slug: 'drinks' },
    update: {},
    create: { name: 'Drinks', slug: 'drinks' },
  });

  const beefBurger = await prisma.menuItem.upsert({
    where: { slug: 'classic-beef-burger' },
    update: {},
    create: {
      name: 'Classic Beef Burger',
      slug: 'classic-beef-burger',
      categoryId: burgerCat.id,
      basePrice: 320,
      isFeatured: true,
      isPopular: true,
      description: 'Juicy grilled beef patty with house sauce',
    },
  });

  await prisma.menuItemBranchAvailability.createMany({
    data: [
      { menuItemId: beefBurger.id, branchId: dhaka.id, isAvailable: true },
      { menuItemId: beefBurger.id, branchId: gulshan.id, isAvailable: true },
    ],
    skipDuplicates: true,
  });

  const offer = await prisma.offer.create({
    data: {
      title: 'Weekend 15% Off',
      description: 'Get 15% off for orders over 1000 BDT',
      isGlobal: true,
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 1000,
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-01-01T00:00:00.000Z'),
      isActive: true,
      coupons: {
        create: [{ code: 'WKND15', isActive: true }],
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      fullName: 'Rahim Uddin',
      role: Role.customer,
      passwordHash,
      isActive: true,
      customerProfile: { create: {} },
      addresses: {
        create: {
          label: 'Home',
          line1: 'House 123, Mohammadpur',
          city: 'Dhaka',
          isDefault: true,
        },
      },
    },
    include: { addresses: true },
  });

  const order = await prisma.order.create({
    data: {
      orderNo: `OZ-${Date.now()}`,
      userId: customer.id,
      branchId: dhaka.id,
      addressId: customer.addresses[0]?.id,
      fulfillmentType: 'delivery',
      couponId: null,
      subtotal: 640,
      taxAmount: 64,
      discountAmount: 96,
      deliveryFee: 40,
      totalAmount: 648,
      status: 'confirmed',
      paymentStatus: 'pending',
      items: {
        create: [{
          menuItemId: beefBurger.id,
          name: beefBurger.name,
          unitPrice: 320,
          quantity: 2,
          totalPrice: 640,
        }],
      },
      statusHistory: {
        create: [{ status: 'pending' }, { status: 'confirmed' }],
      },
      payment: {
        create: {
          method: 'cash_on_delivery',
          amount: 648,
          status: 'pending',
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      userId: customer.id,
      orderId: order.id,
      branchId: dhaka.id,
      menuItemId: beefBurger.id,
      rating: 5,
      comment: 'Great burger and fast delivery',
      isVisible: true,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: 'Order confirmed',
        body: 'Your order has been confirmed by Dhaka Flagship.',
      },
      {
        userId: customer.id,
        title: 'Offer available',
        body: 'Use WKND15 to get 15% discount this weekend.',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.brandSetting.upsert({
    where: { key: 'brand.general' },
    update: {},
    create: {
      key: 'brand.general',
      valueJson: {
        brandName: 'OptiZenqor Restaurant',
        supportEmail: 'support@optizenqor.com',
        taxPercent: 10,
        defaultDeliveryFee: 40,
      },
    },
  });

  await prisma.staffBranchAssignment.upsert({
    where: { userId_branchId: { userId: superAdmin.id, branchId: gulshan.id } },
    update: {},
    create: { userId: superAdmin.id, branchId: gulshan.id },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete for OptiZenqor Restaurant backend');
}

main()
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
