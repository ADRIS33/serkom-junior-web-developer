const router=require('express').Router(); const c=require('../controllers/orderController'); const auth=require('../middleware/authMiddleware');
router.use(auth); router.post('/',c.createOrder); router.get('/',c.getMyOrders); module.exports=router;
