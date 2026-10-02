import 'dotenv/config';
import { PrismaClient, ItemType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with enterprise POS workspaces, printers, and cash drawers...');

  // 1. Create Default Permissions
  const permissionsData = [
    { code: 'AUTH_LOGIN', description: 'User login' },
    { code: 'AUTH_LOGOUT', description: 'User logout' },
    { code: 'ORDER_CREATE', description: 'Create pre-paid order' },
    { code: 'ORDER_VIEW', description: 'View order details' },
    { code: 'ORDER_CANCEL', description: 'Cancel order' },
    { code: 'MENU_CREATE', description: 'Create menu items' },
    { code: 'MENU_UPDATE', description: 'Update menu items' },
    { code: 'MENU_DELETE', description: 'Soft delete menu items' },
    { code: 'CATEGORY_CREATE', description: 'Create item categories' },
    { code: 'CATEGORY_UPDATE', description: 'Update item categories' },
    { code: 'CATEGORY_DELETE', description: 'Soft delete item categories' },
    { code: 'REPORT_VIEW', description: 'View financial/close reports' },
    { code: 'SETTINGS_UPDATE', description: 'Update restaurant metadata' },
    { code: 'USER_CREATE', description: 'Create employee accounts' },
    { code: 'USER_UPDATE', description: 'Update employee details' },
    { code: 'USER_DELETE', description: 'Delete employee accounts' },
    { code: 'AUDIT_VIEW', description: 'View system audit logs' },
    { code: 'MANAGE_TERMINALS', description: 'Register/Manage POS terminals' },
    { code: 'MANAGE_BUSINESS_DAY', description: 'Open/Close POS Business Days' },
    { code: 'MANAGE_SHIFTS', description: 'Override/Monitor cashier shifts' },
    { code: 'VIEW_ALL_SHIFTS', description: 'View all cashier shifts history' },
    { code: 'OPEN_OWN_SHIFT', description: 'Open cashier shift' },
    { code: 'CLOSE_OWN_SHIFT', description: 'Close cashier shift' },
    { code: 'VIEW_OWN_SHIFT', description: 'View own cashier shift' },
  ];

  const seededPermissions = [];
  for (const perm of permissionsData) {
    const record = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    });
    seededPermissions.push(record);
  }
  console.log(`Seeded ${seededPermissions.length} permissions.`);

  // 2. Create Default Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Admin with full system access',
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: {
      name: 'CASHIER',
      description: 'Cashier with access to checkout and orders',
    },
  });
  console.log('Seeded roles: SUPER_ADMIN, CASHIER.');

  // 3. Map Permissions to Roles
  for (const perm of seededPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  const cashierAllowedCodes = [
    'AUTH_LOGIN',
    'AUTH_LOGOUT',
    'ORDER_CREATE',
    'ORDER_VIEW',
    'ORDER_CANCEL',
    'OPEN_OWN_SHIFT',
    'CLOSE_OWN_SHIFT',
    'VIEW_OWN_SHIFT',
  ];
  for (const perm of seededPermissions) {
    if (cashierAllowedCodes.includes(perm.code)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: cashierRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: cashierRole.id,
          permissionId: perm.id,
        },
      });
    }
  }
  console.log('Mapped permissions to roles.');

  // 4. Create Default Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const cashierPasswordHash = await bcrypt.hash('Cashier@123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { roleId: adminRole.id },
    create: {
      name: 'Super Admin',
      username: 'admin',
      email: 'admin@pos.com',
      phone: '9876543210',
      password: adminPasswordHash,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: { roleId: cashierRole.id },
    create: {
      name: 'Default Cashier',
      username: 'cashier',
      email: 'cashier@pos.com',
      phone: '9876543211',
      password: cashierPasswordHash,
      roleId: cashierRole.id,
      status: 'ACTIVE',
    },
  });
  console.log('Seeded users.');

  // 5. Seed Printers
  const receiptPrinter = await prisma.printer.create({
    data: {
      printerName: 'Front Receipt Printer',
      printerType: 'ESC_POS',
      ipAddress: '192.168.1.100',
      port: 9100,
      paperWidth: '80mm',
      location: 'RECEIPT',
      status: 'ONLINE',
    },
  });

  const kitchenPrinter = await prisma.printer.create({
    data: {
      printerName: 'Kitchen KOT Printer',
      printerType: 'ESC_POS',
      ipAddress: '192.168.1.101',
      port: 9100,
      paperWidth: '80mm',
      location: 'KITCHEN',
      status: 'ONLINE',
    },
  });

  const backupPrinter = await prisma.printer.create({
    data: {
      printerName: 'Billing Backup Printer',
      printerType: 'BROWSER',
      location: 'BACKUP',
      status: 'ONLINE',
    },
  });
  console.log('Seeded printers: Receipt, Kitchen, Backup.');

  // 6. Create Terminals with printer assignments
  const t01 = await prisma.terminal.upsert({
    where: { terminalCode: 'T01' },
    update: {
      receiptPrinterId: receiptPrinter.id,
      kitchenPrinterId: kitchenPrinter.id,
      backupPrinterId: backupPrinter.id,
    },
    create: {
      terminalCode: 'T01',
      terminalName: 'Main Cash Counter',
      location: 'Front Entrance',
      status: 'OFFLINE',
      receiptPrinterId: receiptPrinter.id,
      kitchenPrinterId: kitchenPrinter.id,
      backupPrinterId: backupPrinter.id,
    },
  });

  const t02 = await prisma.terminal.upsert({
    where: { terminalCode: 'T02' },
    update: {
      receiptPrinterId: receiptPrinter.id,
      kitchenPrinterId: kitchenPrinter.id,
      backupPrinterId: backupPrinter.id,
    },
    create: {
      terminalCode: 'T02',
      terminalName: 'Drive Thru Window',
      location: 'Side Window',
      status: 'OFFLINE',
      receiptPrinterId: receiptPrinter.id,
      kitchenPrinterId: kitchenPrinter.id,
      backupPrinterId: backupPrinter.id,
    },
  });
  console.log('Seeded terminals T01 and T02 with printers.');

  // 7. Seed CashDrawers
  await prisma.cashDrawer.upsert({
    where: { terminalId: t01.id },
    update: {},
    create: {
      terminalId: t01.id,
      drawerCode: 'CDR-T01',
      openingBalance: 1500.00,
      currentBalance: 1500.00,
      expectedClosingBalance: 1500.00,
      status: 'CLOSED',
    },
  });

  await prisma.cashDrawer.upsert({
    where: { terminalId: t02.id },
    update: {},
    create: {
      terminalId: t02.id,
      drawerCode: 'CDR-T02',
      openingBalance: 1000.00,
      currentBalance: 1000.00,
      expectedClosingBalance: 1000.00,
      status: 'CLOSED',
    },
  });
  console.log('Seeded Cash Drawers.');

  // 8. Open a default Business Day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeBusinessDay = await prisma.businessDay.upsert({
    where: { businessDate: today },
    update: {},
    create: {
      businessDate: today,
      openedBy: admin.id,
      status: 'OPEN',
    },
  });
  console.log('Seeded active Business Day.');

  // 9. Create Categories
  const rawMenuData = [
    { category: 'Breakfast', name: 'Bread Butter', price: 40 },
    { category: 'Breakfast', name: 'Bread Jam', price: 50 },
    { category: 'Breakfast', name: 'Bread Toast', price: 30 },
    { category: 'Breakfast', name: 'Veg Sandwich', price: 50 },
    { category: 'Breakfast', name: 'Cheese Sandwich', price: 80 },
    { category: 'Breakfast', name: 'Poha', price: 50 },
    { category: 'Breakfast', name: 'Sattu Kachori (2 pcs)', price: 30 },
    { category: 'Breakfast', name: 'Sattu Kachori (4 pcs)', price: 50 },
    { category: 'Breakfast', name: 'Puri Sabji (4 pcs)', price: 40 },
    { category: 'Breakfast', name: 'Plain Daliya', price: 50 },
    { category: 'Breakfast', name: 'Veg Daliya', price: 70 },
    { category: 'Breakfast', name: 'Hot Milk (200ml)', price: 30 },
    { category: 'Breakfast', name: 'Idly (2 pcs)', price: 40 },
    { category: 'Breakfast', name: 'Upma', price: 60 },
    { category: 'Breakfast', name: 'Maggi Full', price: 60 },
    { category: 'Breakfast', name: 'Maggi Half', price: 30 },
    { category: 'Breakfast', name: 'Sprouts', price: 50 },
    { category: 'Tea Time', name: 'Tea', price: 20 },
    { category: 'Tea Time', name: 'Coffee Half', price: 20 },
    { category: 'Tea Time', name: 'Coffee Full', price: 40 },
    { category: 'Tea Time', name: 'Lemon Tea', price: 20 },
    { category: 'Tea Time', name: 'Kulhad Tea', price: 20 },
    { category: 'Tea Time', name: 'Black Coffee', price: 30 },
    { category: 'Chinese', name: 'Veg Chowmin Full', price: 100 },
    { category: 'Chinese', name: 'Veg Chowmin Half', price: 50 },
    { category: 'Chinese', name: 'Paneer Chowmin Full', price: 120 },
    { category: 'Chinese', name: 'Paneer Chowmin Half', price: 70 },
    { category: 'Chinese', name: 'Paneer Chilli Full', price: 160 },
    { category: 'Chinese', name: 'Paneer Chilli Half', price: 90 },
    { category: 'Chinese', name: 'Babycorn Chilli Full', price: 180 },
    { category: 'Chinese', name: 'Babycorn Chilli Half', price: 100 },
    { category: 'Chinese', name: 'Potato Chilli Full', price: 120 },
    { category: 'Chinese', name: 'Veg Fried Rice Full', price: 100 },
    { category: 'Chinese', name: 'Veg Fried Rice Half', price: 60 },
    { category: 'Chinese', name: 'Paneer Fried Rice', price: 110 },
    { category: 'Chinese', name: 'Veg Manchurian Full', price: 120 },
    { category: 'Chinese', name: 'Veg Manchurian Half', price: 70 },
    { category: 'Chinese', name: 'Chana Chilli', price: 120 },
    { category: 'Chinese', name: 'Shoya Chilli', price: 100 },
    { category: 'Dal', name: 'Dal Tadka Full', price: 120 },
    { category: 'Dal', name: 'Dal Tadka Half', price: 70 },
    { category: 'Dal', name: 'Dal Fry Full', price: 100 },
    { category: 'Dal', name: 'Dal Fry Half', price: 70 },
    { category: 'Dal', name: 'Plain Dal Full', price: 80 },
    { category: 'Dal', name: 'Plain Dal Half', price: 40 },
    { category: 'Dal', name: 'Dal Makhani', price: 80 },
    { category: 'Rice', name: 'Plain Rice Full', price: 60 },
    { category: 'Rice', name: 'Plain Rice Half', price: 30 },
    { category: 'Rice', name: 'Jeera Rice Full', price: 100 },
    { category: 'Rice', name: 'Jeera Rice Half', price: 60 },
    { category: 'Rice', name: 'Peas Pulao Full', price: 100 },
    { category: 'Rice', name: 'Peas Pulao Half', price: 50 },
    { category: 'Dinner', name: 'Mix Veg Full', price: 150 },
    { category: 'Dinner', name: 'Mix Veg Half', price: 80 },
    { category: 'Dinner', name: 'Paneer Kadai Full', price: 200 },
    { category: 'Dinner', name: 'Paneer Kadai Half', price: 120 },
    { category: 'Dinner', name: 'Paneer Butter Masala Full', price: 190 },
    { category: 'Dinner', name: 'Paneer Butter Masala Half', price: 100 },
    { category: 'Dinner', name: 'Matar Paneer Full', price: 160 },
    { category: 'Dinner', name: 'Matar Paneer Half', price: 90 },
    { category: 'Dinner', name: 'Paneer Do Pyaza Full', price: 190 },
    { category: 'Dinner', name: 'Paneer Do Pyaza Half', price: 100 },
    { category: 'Dinner', name: 'Aloo Dum Full', price: 140 },
    { category: 'Dinner', name: 'Aloo Dum Half', price: 80 },
    { category: 'Dinner', name: 'Aloo Matar Full', price: 150 },
    { category: 'Dinner', name: 'Aloo Matar Half', price: 80 },
    { category: 'Dinner', name: 'Chana Masala Full', price: 140 },
    { category: 'Dinner', name: 'Chana Masala Half', price: 80 },
    { category: 'Dinner', name: 'Chana Dal Tadka Full', price: 130 },
    { category: 'Dinner', name: 'Chana Dal Tadka Half', price: 70 },
    { category: 'Dinner', name: 'Veg Jhalfrezi Full', price: 150 },
    { category: 'Dinner', name: 'Veg Jhalfrezi Half', price: 80 },
    { category: 'Dinner', name: 'Mushroom Masala', price: 180 },
    { category: 'Lunch', name: 'Regular Thali', price: 70 },
    { category: 'Lunch', name: 'Special Thali', price: 100 },
    { category: 'Lunch', name: 'Khichri Choka', price: 70 },
    { category: 'Evening Snacks', name: 'Samosa', price: 15 },
    { category: 'Evening Snacks', name: 'Pakodi', price: 20 },
    { category: 'Evening Snacks', name: 'Aloo Chop', price: 15 },
    { category: 'Evening Snacks', name: 'Bread Chop', price: 15 },
    { category: 'Evening Snacks', name: 'Paneer Pakodi (8 pcs)', price: 120 },
    { category: 'Roti', name: 'Tawa Roti', price: 10 },
    { category: 'Roti', name: 'Ghee Roti', price: 15 },
    { category: 'Roti', name: 'Butter Roti', price: 15 },
    { category: 'Roti', name: 'Paratha', price: 25 },
    { category: 'Roti', name: 'Ghee Paratha', price: 30 },
    { category: 'Roti', name: 'Aloo Paratha', price: 50 },
    { category: 'Raita', name: 'Curd', price: 30 },
    { category: 'Raita', name: 'Misti Dahi Full', price: 15 },
    { category: 'Raita', name: 'Misti Dahi Half', price: 10 },
    { category: 'Raita', name: 'Bundi Raita', price: 60 },
    { category: 'Raita', name: 'Mix Raita', price: 50 },
    { category: 'Raita', name: 'Papad', price: 10 },
    { category: 'Beverages', name: 'Cold Drink', price: 20 },
    { category: 'Beverages', name: 'Drinking Water 20', price: 20 },
    { category: 'Beverages', name: 'Drinking Water 10', price: 10 },
    { category: 'Beverages', name: 'Lassi Sweet', price: 20 },
    { category: 'Beverages', name: 'Chhanch', price: 15 },
    { category: 'Colddrink', name: 'Water.', price: 20 },
    { category: 'Colddrink', name: 'Water', price: 15 },
    { category: 'Colddrink', name: 'Kurkure.', price: 10 },
    { category: 'Colddrink', name: 'Bhujiya.', price: 10 },
    { category: 'Colddrink', name: 'Mungdal.', price: 10 },
    { category: 'Colddrink', name: 'Rosted badam.', price: 10 },
    { category: 'Colddrink', name: 'Light chura.', price: 10 },
    { category: 'Colddrink', name: 'Cream roll.', price: 10 },
    { category: 'Colddrink', name: 'Cockes.', price: 5 },
    { category: 'Colddrink', name: 'Dahi sudha.', price: 12 },
    { category: 'Colddrink', name: 'Sudha lassi', price: 12 },
    { category: 'Colddrink', name: 'Keser badam', price: 10 },
    { category: 'Colddrink', name: 'Mix fruit juice.', price: 10 },
    { category: 'Colddrink', name: 'Lusy.', price: 10 },
    { category: 'Colddrink', name: 'Mixture.', price: 10 },
    { category: 'Colddrink', name: 'Uncal chips.', price: 10 },
    { category: 'Colddrink', name: 'Cream bun.', price: 10 },
    { category: 'Colddrink', name: 'Laccha bun.', price: 10 },
    { category: 'Colddrink', name: 'Solted badam.', price: 10 },
    { category: 'Colddrink', name: 'Dahi.mitha', price: 10 },
    { category: 'Colddrink', name: 'Allu bhujiya', price: 10 },
    { category: 'Colddrink', name: 'Pachratan mix.', price: 10 },
    { category: 'Colddrink', name: 'Tost.', price: 10 },
  ];

  const uniqueCategories = [...new Set(rawMenuData.map((item) => item.category))];

  // Wipe existing items and categories
  await prisma.orderItem.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});

  const seededCategories: any[] = [];
  let displayOrder = 1;
  for (const cat of uniqueCategories) {
    const category = await prisma.category.create({
      data: {
        name: cat,
        description: cat + ' menu',
        displayOrder: displayOrder++,
      },
    });
    seededCategories.push(category);
  }
  console.log('Seeded new categories successfully.');

  const getCatId = (name: string) => {
    const found = seededCategories.find((c) => c.name === name);
    if (!found) throw new Error(`Category ${name} not found`);
    return found.id;
  };

  let menuIndex = 1;
  for (const item of rawMenuData) {
    const itemType = (item.category === 'Colddrink' || item.category === 'Beverages') ? ItemType.PACKED : ItemType.KITCHEN;
    const itemNum = `M${String(menuIndex).padStart(4, '0')}`;
    menuIndex++;
    
    await prisma.menuItem.create({
      data: {
        itemNumber: itemNum,
        name: item.name,
        price: item.price,
        itemType: itemType,
        categoryId: getCatId(item.category),
        gst: 5.00,
        isAvailable: true,
      },
    });
  }
  console.log('Seeded new menu items successfully.');

  // 11. Create Restaurant Settings
  const settingsCount = await prisma.restaurantSettings.count();
  if (settingsCount === 0) {
    await prisma.restaurantSettings.create({
      data: {
        restaurantName: 'Shree Krishna',
        address: '123 Main Street, Bangalore',
        phone: '080-12345678',
        email: 'info@shreekrishna.com',
        gstNumber: '29AAAAA1111A1Z1',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        receiptFooter: 'Thank you! Visit again.',
      },
    });
    console.log('Seeded default restaurant settings.');

  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
