import prisma from '../../../prisma/client';

export class CustomerService {
  /**
   * Fetch paginated list of customers with optional search by mobile or name.
   */
  static async getCustomers(query: { search?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { deletedAt: null };

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { mobileNumber: { contains: query.search } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where: whereClause })
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create a new customer profile. Validates mobile number uniqueness.
   */
  static async createCustomer(data: { name: string; mobileNumber: string; email?: string; notes?: string }) {
    // Check for existing
    const existing = await prisma.customer.findUnique({
      where: { mobileNumber: data.mobileNumber }
    });

    if (existing) {
      throw new Error(`Customer with mobile ${data.mobileNumber} already exists.`);
    }

    return await prisma.customer.create({
      data: {
        name: data.name,
        mobileNumber: data.mobileNumber,
        email: data.email,
        notes: data.notes
      }
    });
  }

  /**
   * Fetch high-level KPIs for the Customer Dashboard
   */
  static async getDashboardStats() {
    const totalCustomers = await prisma.customer.count({ where: { deletedAt: null } });
    const newThisMonth = await prisma.customer.count({
      where: {
        deletedAt: null,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    
    // Aggregate total points outstanding
    const aggregations = await prisma.customer.aggregate({
      _sum: {
        totalPoints: true
      },
      where: { deletedAt: null }
    });

    return {
      totalCustomers,
      newThisMonth,
      totalOutstandingPoints: aggregations._sum.totalPoints || 0
    };
  }
}
