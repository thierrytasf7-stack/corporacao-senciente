import { Router } from 'express';

const router = Router();

router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test router funcionando!',
        timestamp: new Date().toISOString()
    });
});

export default router;
