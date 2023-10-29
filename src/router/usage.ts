import { Router, Request, Response } from 'express';
import { checkAuthenticated } from 'src/lib/util';
import DB from 'src/database';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('usage');

const router = Router();

router.post('/perMonth', checkAuthenticated, async (req: Request, res: Response) => {
  try {
    logDebug(' **** Token Monthly Usage **** ');

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

router.post('/perDay', checkAuthenticated, async (req: Request, res: Response) => {
  try {
    logDebug(' **** Token Daily Usage **** ', req.user);
    const { year, month, accountId } = req.body as { year: number; month: number; accountId: string };
    logDebug(' **** MONTH ', month, year, accountId);

    const savedUser = await DB.findBillingDay({ accountId });
    logDebug(' **** savedUser ', savedUser);
    const savedUserAggregate = await DB.findBillingDayAggregate(year, month + 1, accountId);
    logDebug(' **** savedUserAggregate ', savedUserAggregate);
    const { totalInputWords, totalOutputWords } = (await DB.findBillingLog({ accountId })) || {};

    const usage = { totalInputWords, totalOutputWords };

    res.json({
      monthly: savedUserAggregate,
      usage,
    });
  } catch (ex) {
    logError('perDay', ex);
    res.status(500).json({ error: ex });
  }
});

export default router;
