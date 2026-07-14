import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  
  static async getCustomers(req: Request, res: Response) {
    try {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await CustomerService.getCustomers({ search, page, limit });
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch customers' });
    }
  }

  static async createCustomer(req: Request, res: Response) {
    try {
      const { name, mobileNumber, email, notes } = req.body;
      
      if (!name || !mobileNumber) {
        return res.status(400).json({ success: false, error: 'Name and Mobile Number are required.' });
      }

      const newCustomer = await CustomerService.createCustomer({ name, mobileNumber, email, notes });
      res.status(201).json({ success: true, data: newCustomer });
    } catch (error: any) {
      console.error('Error creating customer:', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to create customer' });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await CustomerService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Error fetching customer stats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch customer stats' });
    }
  }
}
