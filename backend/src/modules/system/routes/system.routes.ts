import { Router } from 'express';
import { getWeather } from '../controllers/weather.controller';
import { authenticate } from '../../../shared/middlewares/authenticate';

const router = Router();

// Assuming weather route can be public or authenticated, we'll authenticate it
router.get('/weather', authenticate, getWeather);

export default router;
