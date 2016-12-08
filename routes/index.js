import { Router } from 'express';

const router = new Router();

router.get('/', async (req, res, next) => {
  try {
    res.send(`<code>
        this is an api not for browser consumption<br>
        postman is a better tool to use<br>
        please see the README.md<br>
        or visit scripts in the test folder for guidance<br>
        refunds available upon request<br>
        </code>`);
  } catch (err) {
    next(err);
  }
});

export default router;
