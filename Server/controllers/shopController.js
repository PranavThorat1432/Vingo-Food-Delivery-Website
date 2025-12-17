import Shop from "../models/ShopModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


export const createAndEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let imageUrl = '';
        
        // Handle file upload if exists
        if (req.file) {
            try {
                // Upload to Cloudinary and remove local temp file inside helper
                imageUrl = await uploadOnCloudinary(req.file.path);
            } catch (uploadError) {
                console.error('File upload error:', uploadError?.message || uploadError);
                return res.status(500).json({
                    success: false,
                    message: `Error uploading image: ${uploadError?.message || 'Unknown error'}`
                });
            }
        }

        // Create or update shop
        let shop = await Shop.findOne({ owner: req.userId });
        
        try {
            if (!shop) {
                // Create new shop
                shop = await Shop.create({
                    name,
                    city,
                    state,
                    address,
                    image: imageUrl || undefined,
                    owner: req.userId
                });
            } else {
                // Update existing shop
                const updateData = {
                    name,
                    city,
                    state,
                    address,
                    owner: req.userId
                };
                
                // Only update image if a new one was uploaded
                if (imageUrl) {
                    updateData.image = imageUrl;
                }
                
                shop = await Shop.findByIdAndUpdate(
                    shop._id,
                    updateData,
                    { new: true }
                );
            }

            await shop.populate('owner items');

            return res.status(201).json({
                success: true,
                message: 'Shop saved successfully!',
                shop
            });
            
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error saving shop information'
            });
        }

    } catch (error) {
        console.error('Unexpected error in createAndEditShop:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred'
        });
    }
}; 


export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate('owner').populate({
            path: 'items',
            options: {sort: {updatedAt: -1}}
        });
        
        if(!shop) {
            return null;
        }

        return res.status(200).json(shop);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-My-Shop Error: ${error.message}`
        });
    }
};


export const getShopByCity = async (req, res) => {
    try {
        const {city} = req.params;
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

        return res.status(200).json(shops);


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-Shop-By-City Error: ${error.message}`
        });
    }
};