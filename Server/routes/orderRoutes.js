import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { acceptOrder, getCurrentOrder, getDeliveryAssignment, getMyOrders, getOrderById, placeOrder, sendDeliveryOTP, updateOrderStatus, verifyDeliveryOTP, verifyPayment } from '../controllers/OrderController.js';

const orderRouter = express.Router();

orderRouter.post('/place-order', isAuth, placeOrder);
orderRouter.post('/verify-payment', isAuth, verifyPayment);
orderRouter.get('/my-orders', isAuth, getMyOrders);
orderRouter.post('/update-status/:orderId/:shopId', isAuth, updateOrderStatus);
orderRouter.get('/get-delivery-assignment', isAuth, getDeliveryAssignment);
orderRouter.get('/accept-order/:assignmentId', isAuth, acceptOrder);
orderRouter.get('/get-current-order', isAuth, getCurrentOrder);
orderRouter.get('/get-order-by-id/:orderId', isAuth, getOrderById);
orderRouter.post('/send-delivery-otp', isAuth, sendDeliveryOTP);
orderRouter.post('/verify-delivery-otp', isAuth, verifyDeliveryOTP);


export default orderRouter;