import { Router, Request, Response } from 'express';
import { checkAuthenticated } from 'src/lib/util';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('usage');

const router = Router();

router.post('/perMonth', checkAuthenticated, async (req: Request, res: Response) => {
  try {
    logDebug(' **** Token Month Usage **** ');

    const { year, month } = req.body as { year: number; month: number };
    logDebug(' **** MONTH ', month, year);

    const numDays = new Date(year, month + 1, 0).getDate();
    const data = Array.from({ length: numDays }, () => Math.floor(Math.random() * 91) + 10);

    res.json({
      month: data,
    });
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

export default router;
