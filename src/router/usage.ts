import { Router, Request, Response } from 'express';
import DB from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('usage');

const router = Router();

router.post('/perMonth', async (req: Request, res: Response) => {
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

router.post('/perDay', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Token Daily Usage **** ', req.user);
    const { year, month, accountId } = req.body as { year: number; month: number; accountId: string };
    logDebug(' **** MONTH ', month, year, accountId);

    const savedUser = await DB.findBillingDay({
      accountId: req.user?.id,
      createdAt: { $gte: new Date(year, month, 1), $lt: new Date(year, month + 1, 1) },
    });
    logDebug(' **** savedUser ', savedUser);
    const numberOfDaysInMonth = new Date(year, month, 0).getDate(); // Calculate the number of days in the specified month

    const input = Array(numberOfDaysInMonth).fill(0);
    const output = Array(numberOfDaysInMonth).fill(0);

    // Fill in the actual data where it exists
    savedUser.forEach((entry: any) => {
      const dayOfMonth = new Date(entry.createdAt).getDate();
      logDebug(' **** entry ', entry);

      input[dayOfMonth - 1] = entry.inputWords || 0;
      output[dayOfMonth - 1] = entry.outputWords || 0;
    });

    // {
    //   input: [
    //     0,   0, 0,   0, 0, 0, 0, 0, 0,
    //     0,   0, 0,   0, 0, 0, 0, 0, 0,
    //     0,   0, 0,   0, 0, 0, 0, 0, 0,
    //     0, 410, 0, 820
    //   ],
    //   output: [
    //     0,  0, 0,   0, 0, 0, 0, 0, 0,
    //     0,  0, 0,   0, 0, 0, 0, 0, 0,
    //     0,  0, 0,   0, 0, 0, 0, 0, 0,
    //     0, 65, 0, 130
    //   ]
    // }

    // const savedUserAggregate = await DB.findBillingDayAggregate(year, month + 1, accountId);
    // logDebug(' **** savedUserAggregate ', savedUserAggregate);
    const {
      totalInputWords,
      totalOutputWords,
    } = (await DB.findOne(DataBaseSchemas.BILLING, { accountId: req.user?.id })) || {};

    const usage = { totalInputWords, totalOutputWords };

    res.json({
      monthly: { input, output },
      usage,
    });
  } catch (ex) {
    logError('perDay', ex);
    res.status(500).json({ error: ex });
  }
});

export default router;
