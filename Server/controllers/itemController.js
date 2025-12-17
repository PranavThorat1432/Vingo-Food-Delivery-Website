import Item from "../models/ItemModel.js";
import Shop from "../models/ShopModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body;
        let image;
        if(req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        const shop = await Shop.findOne({owner: req.userId});
        if(!shop) {
            return res.status(400).json({
                message: 'Shop not found!'
            });
        }

        const item = await Item.create({
            name, category, foodType, price, image, shop: shop._id
        });
        shop.items.push(item._id);
        await shop.save();
        await shop.populate({
            path: 'items owner',
            options: {sort: {updatedAt: -1}}
        });

        return res.status(201).json({
            shop
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Add Item error: ${error.message}`
        });
    }
};


export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, foodType, category, price } = req.body;
        let image;
        if(req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        const item = await Item.findByIdAndUpdate(itemId, {
            name, foodType, category, price, image
        } , { new: true });

        if(!item) {
            return res.status(400).json({
                message: 'Item not found!'
            });
        }

        const shop = await Shop.findOne({owner: req.userId}).populate({
            path: 'items',
            options: {sort: {updatedAt: -1}}
        });

        return res.status(200).json({
            shop
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Edit Item error: ${error.message}`
        });
    }
};


export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);
        if(!item) {
            return res.status(400).json({
                message: 'Item not found!'
            });
        }

        return res.status(200).json(item);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-Item-By-Id error: ${error.message}`
        });
    }
};


export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);
        if(!item) {
            return res.status(400).json({
                message: 'Item not found!'
            });
        }

        const shop = await Shop.findOne({owner: req.userId});
        shop.items = shop.items.filter(i => i._id !== itemId);
        await shop.save();
        await shop.populate({
            path: 'items',
            options: {sort: {updatedAt: -1}}
        });

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Delete item error: ${error.message}`
        });
    }
};


export const getItemByCity = async (req, res) => {
    try {
        const {city} = req.params;
        if(!city) {
            return res.status(400).json({
                message: 'City is required!'
            });
        }
        const shops = await Shop.find({
            city: {
                $regex: new RegExp(`^${city}$`, 'i')
            }
        }).populate('items');

        if(!shops) {
            return res.status(400).json({
                message: 'Shops not found!'
            });
        }

        const shopIds = shops.map((shop) => shop._id);
        const items = await Item.find({shop: {$in: shopIds}});

        return res.status(200).json(items);


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-Item-By-city error: ${error.message}`
        });
    }
};