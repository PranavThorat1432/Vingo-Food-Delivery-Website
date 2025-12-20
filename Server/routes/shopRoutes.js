import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { createAndEditShop, getMyShop, getShopByCity } from '../controllers/shopController.js';
import upload from '../middlewares/multer.js';


const shopRouter = express.Router();


shopRouter.post('/create-edit-shop', isAuth, upload.single('image'), createAndEditShop);
shopRouter.get('/getMy-shop', isAuth, getMyShop);
shopRouter.get('/getShop-by-city/:city', isAuth, getShopByCity);


export default shopRouter;