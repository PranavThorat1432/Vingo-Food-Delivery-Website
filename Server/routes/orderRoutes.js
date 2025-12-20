import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { acceptOrder, getCurrentOrder, getDeliveryAssignment, getMyOrders, placeOrder, updateOrderStatus } from '../controllers/OrderController.js';

const orderRouter = express.Router();

orderRouter.post('/place-order', isAuth, placeOrder);
orderRouter.get('/my-orders', isAuth, getMyOrders);
orderRouter.post('/update-status/:orderId/:shopId', isAuth, updateOrderStatus);
orderRouter.get('/get-delivery-assignment', isAuth, getDeliveryAssignment);
orderRouter.get('/accept-order/:assignmentId', isAuth, acceptOrder);
orderRouter.get('/get-current-order', isAuth, getCurrentOrder);


export default orderRouter;