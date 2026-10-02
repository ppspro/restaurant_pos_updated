import { body } from 'express-validator';

export const createUserValidator = [
  body('fullName').trim().notEmpty().withMessage('Full Name is required'),
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain a special character'),
  body('role').isIn(['SUPER_ADMIN', 'CASHIER', 'MANAGER']).withMessage('Invalid role'),
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

export const updateUserValidator = [
  body('fullName').optional().trim().notEmpty().withMessage('Full Name cannot be empty'),
  body('username').optional().trim().notEmpty().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['SUPER_ADMIN', 'CASHIER', 'MANAGER']).withMessage('Invalid role'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

export const updateStatusValidator = [
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
];

export const resetPasswordValidator = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain a special character'),
];
