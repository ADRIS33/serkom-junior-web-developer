const router=require('express').Router(); const c=require('../controllers/cartController'); const auth=require('../middleware/authMiddleware');
router.use(auth); router.get('/',c.getCart); router.post('/',c.addToCart); router.put('/:id',c.updateCartItem); router.delete('/:id',c.deleteCartItem); module.exports=router;
