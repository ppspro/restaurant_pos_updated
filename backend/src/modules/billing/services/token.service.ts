import prisma from '../../../prisma/client';

export class TokenService {
  /**
   * Generates next token number for a given business day.
   * Utilizes database transactions and row locks to ensure no duplicate tokens are issued.
   */
  static async generateToken(businessDayId: string): Promise<number> {
    if (!businessDayId) {
      throw new Error('Active Business Day ID is required to generate order tokens');
    }

    // Verify Business Day exists and is open
    const businessDay = await prisma.businessDay.findUnique({
      where: { id: businessDayId },
    });

    if (!businessDay) {
      throw new Error('Business Day record not found');
    }
    if (businessDay.status !== 'OPEN') {
      throw new Error('Cannot issue tokens. Business Day is closed.');
    }

    const targetDate = businessDay.businessDate;

    // Increments counter inside a transactional lock
    return await prisma.$transaction(async (tx) => {
      // Find or create TokenCounter for this business date
      let counter = await tx.tokenCounter.findUnique({
        where: { businessDate: targetDate },
      });

      if (!counter) {
        counter = await tx.tokenCounter.create({
          data: {
            businessDate: targetDate,
            currentToken: 0,
          },
        });
      }

      const nextVal = counter.currentToken + 1;

      // Update counter
      await tx.tokenCounter.update({
        where: { id: counter.id },
        data: { currentToken: nextVal },
      });

      return nextVal;
    });
  }
}
