import { prisma } from './src/prisma/client';

async function main() {
  const items = await prisma.menuItem.findMany();
  let updatedCount = 0;
  
  for (const item of items) {
    if (!item.itemNumber || item.itemNumber.trim() === '') {
      // Find max item number
      const lastItem = await prisma.menuItem.findFirst({
        where: { itemNumber: { startsWith: 'M' } },
        orderBy: { itemNumber: 'desc' }
      });
      let finalItemNumber = 'M0001';
      if (lastItem && lastItem.itemNumber) {
        const lastNum = parseInt(lastItem.itemNumber.substring(1), 10);
        finalItemNumber = `M${String(lastNum + 1).padStart(4, '0')}`;
      }
      
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { itemNumber: finalItemNumber }
      });
      console.log(`Updated ${item.name} to ${finalItemNumber}`);
      updatedCount++;
    }
  }
  
  console.log(`Finished checking menu items. Updated: ${updatedCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
