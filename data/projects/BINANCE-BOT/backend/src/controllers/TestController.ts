import { Request, Response } from 'express';

export class TestController {
    async testMethod(req: Request, res: Response) {
        res.json({ success: true, message: 'Test method works' });
    }
}
