import DeliveryAssignment from "../models/DeliveryAssignmentModel.js";
import Order from "../models/OrderModel.js";
import Shop from "../models/ShopModel.js";
import User from "../models/UserModel.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();


let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
        if(!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                message: 'Cart is Empty!'
            });
        }

        if(!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({
                message: 'Delivery Address is incomplete!'
            });
        }

        const groupItemsByShop = {};

        cartItems.forEach(item => {
            // `item.shop` can be either the shop ObjectId string or the populated shop object
            const shopId = item?.shop?._id || item?.shop;
            if(!shopId) {
                throw new Error('Missing shop reference on cart item');
            }

            if(!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item);
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate('owner');
            if(!shop) {
                return res.status(400).json({
                    message: 'Shop not found!'
                });
            }
            const items = groupItemsByShop[shopId];
            const subTotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity) ,0)

            return {
                shop: shop._id,
                owner: shop.owner._id,
                subTotal,
                shopOrderItems: items.map((item) => ({
                    item: item._id || item.id,
                    price: item.price,
                    quantity: item.quantity,
                    name: item.name
                }))
            }
        }));

        // Condition for Online Payment
        if(paymentMethod === 'Online') {
            const razorOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });

            const order = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false
            });


            return res.status(200).json({
                razorOrder,
                orderId: order._id,
            });
        }

        const order = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        });
        await order.populate('shopOrders.shopOrderItems.item', 'name image price');
        await order.populate('shopOrders.shop', 'name');
        await order.populate('shopOrders.owner', 'name');
        await order.populate('user', 'name email mobileNo');

        const io = req.app.get('io');

        if(io) {
            order.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId;
                if(ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        payment: order.payment,
                        user: order.user,
                        deliveryAddress: order.deliveryAddress,
                        shopOrders: shopOrder,
                        createdAt: order.createdAt
                    })
                }
            });
        }

        return res.status(201).json({
            message: 'Order Placed Successfully!',
            order
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Place Order Error: ${error.message}`
        });
    }
};


export const verifyPayment = async (req, res) => {
    try {
        const {razorpay_payment_id, orderId} = req.body;
        const payment = await instance.payments.fetch(razorpay_payment_id);
        if(!payment || payment.status !== 'captured') {
            return res.status(400).json({
                message: 'Payment not captured!'
            });
        }

        const order = await Order.findById(orderId);
        if(!order) {
            return res.status(400).json({
                message: 'Order not found!!'
            });
        }

        order.payment = true;
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        await order.populate('shopOrders.shopOrderItems.item', 'name image price');
        await order.populate('shopOrders.shop', 'name');

        return res.status(200).json(order);
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Verify Payment Error: ${error.message}`
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if(user.role == 'User') {
            const orders = await Order.find({user: req.userId})
            .sort({createdAt: -1})
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.owner", "name email mobileNo")
            .populate("shopOrders.shopOrderItems.item", "name price image");
    
            return res.status(200).json(orders);

        } else if(user.role == 'Owner') {
            const orders = await Order.find({"shopOrders.owner": req.userId})
            .sort({createdAt: -1})
            .populate("shopOrders.shop", "name")
            .populate("user")
            .populate("shopOrders.shopOrderItems.item", "name price image")
            .populate("shopOrders.assignedDeliveryBoy", "fullName email mobileNo location");

            const filteredOrders = orders.map((order) => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                payment: order.payment,
                user: order.user,
                deliveryAddress: order.deliveryAddress,
                shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),
                createdAt: order.createdAt
            }));

            return res.status(200).json(filteredOrders);
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-My-Orders Error: ${error.message}`
        });
    }
};


export const updateOrderStatus = async (req, res) => {
    try {
        const {orderId, shopId} = req.params;
        const {status} = req.body;
        
        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found!'
            });
        }

        // Find the shop order index
        const shopOrderIndex = order.shopOrders.findIndex(so => so.shop.toString() === shopId);
        if (shopOrderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Shop Order not found!'
            });
        }

        // Get the shop order object (not just the index)
        const shopOrder = order.shopOrders[shopOrderIndex];
        
        // Update the status
        shopOrder.deliveryStatus = status;

        let deliveryBoysPayload = [];

        // Only assign delivery boy when status is "Out for Delivery"
        // Check if assignment already exists - if so, don't create a new one
        if(status === 'Out for Delivery') {
            // If assignment already exists, just return the existing assignment info
            if(shopOrder.assignment) {
                console.log('[DEBUG] Assignment already exists for this shop order');
                await order.save();
                
                // Reload the order to get the latest data
                const savedOrder = await Order.findById(orderId)
                    .populate('shopOrders.shop', 'name')
                    .populate('shopOrders.assignedDeliveryBoy', 'fullName email mobileNo location')
                    .populate('shopOrders.shopOrderItems.item', 'name image price');
                
                // Use the index we already know instead of searching again
                const updatedShopOrder = savedOrder.shopOrders[shopOrderIndex];
                
                if (!updatedShopOrder) {
                    console.log(`[DEBUG] Shop order not found at index ${shopOrderIndex} (existing assignment). Total shopOrders: ${savedOrder.shopOrders.length}`);
                    return res.status(404).json({
                        success: false,
                        message: 'Shop Order not found after update!'
                    });
                }
                
                // Try to get available boys from existing assignment
                const existingAssignment = await DeliveryAssignment.findById(shopOrder.assignment).populate('broadcastedTo', 'fullName email mobileNo location');
                if(existingAssignment) {
                    deliveryBoysPayload = existingAssignment.broadcastedTo.map(db => ({
                        id: db._id,
                        fullName: db.fullName,
                        email: db.email,
                        mobileNo: db.mobileNo,
                        longitude: db.location?.coordinates?.[0] || 0,
                        latitude: db.location?.coordinates?.[1] || 0,
                    }));
                }
                
                return res.status(200).json({
                    success: true,
                    shopOrder: updatedShopOrder,
                    assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy || null,
                    availableBoys: deliveryBoysPayload,
                    assignment: updatedShopOrder.assignment || null,
                    message: 'Status updated. Assignment already exists.'
                });
            }
            const {longitude, latitude} = order.deliveryAddress;
            
            console.log(`[DEBUG] Looking for delivery boys near: lat=${latitude}, lon=${longitude}`);
            
            // Find nearby delivery boys - handle case where location might not be set properly
            let nearByDeliveryBoys = [];
            try {
                nearByDeliveryBoys = await User.find({
                    role: 'Delivery-Boy',
                    location: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [Number(longitude), Number(latitude)]
                            },
                            $maxDistance: 20000 // 20km radius
                        }
                    }
                });
                console.log(`[DEBUG] Geospatial query found ${nearByDeliveryBoys.length} delivery boys`);
            } catch (geoError) {
                // If geospatial query fails (e.g., no location data), fall back to finding all delivery boys
                console.log('[DEBUG] Geospatial query failed, falling back to all delivery boys:', geoError.message);
                nearByDeliveryBoys = await User.find({
                    role: 'Delivery-Boy',
                    'location.coordinates': { $ne: [0, 0] } // Exclude default [0,0] coordinates
                });
                console.log(`[DEBUG] Fallback query found ${nearByDeliveryBoys.length} delivery boys`);
            }

            // If still no delivery boys found, try finding any delivery boys regardless of location
            if(nearByDeliveryBoys.length === 0) {
                console.log('[DEBUG] No delivery boys with valid location, finding all delivery boys');
                nearByDeliveryBoys = await User.find({ role: 'Delivery-Boy' });
                console.log(`[DEBUG] Found ${nearByDeliveryBoys.length} total delivery boys`);
            }

            const nearByIds = nearByDeliveryBoys.map(db => db._id.toString());
            console.log(`[DEBUG] Checking busy status for ${nearByIds.length} delivery boys`);
            
            // Check for busy delivery boys - only count as busy if they have an active assignment (not Broadcasted or Delivered)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ['Broadcasted', 'Delivered']},
            }).distinct('assignedTo');

            console.log(`[DEBUG] Found ${busyIds.length} busy delivery boys`);

            const busyIdSet = new Set(busyIds.map(id => String(id)));

            const availableBoys = nearByDeliveryBoys.filter(db => !busyIdSet.has(db._id.toString())); 
            console.log(`[DEBUG] ${availableBoys.length} delivery boys available after filtering`);
            
            const candidates = availableBoys.map(db => db._id);

            if(candidates.length == 0) {
                await order.save();
                console.log('[DEBUG] No available delivery boys found');
                return res.json({
                    success: true,
                    message: 'Order status updated, but no delivery boy available for assignment.',
                    availableBoys: [],
                    debug: {
                        totalDeliveryBoys: nearByDeliveryBoys.length,
                        busyDeliveryBoys: busyIds.length,
                        deliveryBoyLocations: nearByDeliveryBoys.map(db => ({
                            id: db._id,
                            name: db.fullName,
                            location: db.location?.coordinates || [0, 0],
                            isBusy: busyIdSet.has(db._id.toString())
                        }))
                    }
                });
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                broadcastedTo: candidates,
                status: 'Broadcasted'
            });

            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
            shopOrder.assignment = deliveryAssignment._id;
            
            console.log(`[DEBUG] Set assignment ID: ${deliveryAssignment._id} for shopOrder`);

            deliveryBoysPayload = availableBoys.map(db => ({
                id: db._id,
                name: db.fullName,
                email: db.email,
                mobileNo: db.mobileNo,
                longitude: db.location?.coordinates?.[0] || 0,
                latitude: db.location?.coordinates?.[1] || 0,
            }));
        }
        
        // Mark the shopOrders array as modified to ensure Mongoose saves nested changes
        order.markModified('shopOrders');
        
        // Save the parent document
        await order.save();
        console.log(`[DEBUG] Order saved, assignment should be: ${order.shopOrders[shopOrderIndex].assignment}`);
        
        // Reload the order to get the latest data with populated fields
        const savedOrder = await Order.findById(orderId)
            .populate('shopOrders.shop', 'name')
            .populate('shopOrders.assignedDeliveryBoy', 'fullName email mobileNo location')
            .populate('shopOrders.shopOrderItems.item', 'name image price');

        // Use the index we already know instead of searching again
        // This is more reliable than searching by shopId after population
        const updatedShopOrder = savedOrder.shopOrders[shopOrderIndex];

        if (!updatedShopOrder) {
            console.log(`[DEBUG] Shop order not found at index ${shopOrderIndex}. Total shopOrders: ${savedOrder.shopOrders.length}`);
            return res.status(404).json({
                success: false,
                message: 'Shop Order not found after update!'
            });
        }

        console.log(`[DEBUG] Returning assignment ID: ${updatedShopOrder.assignment}`);

        return res.status(200).json({
            success: true,
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy || null,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder.assignment || null,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Update-Order-Status Error: ${error.message}`
        });
    }
};


export const getDeliveryAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;
        const assignments = await DeliveryAssignment.find({
            broadcastedTo: deliveryBoyId,
            status: 'Broadcasted'
        }).populate('order shop');

        const formatedData = assignments.map(assignment => ({
            assignmentId: assignment._id,
            orderId: assignment.order._id,
            shopName: assignment.shop.name,
            deliveryAddress: assignment.order.deliveryAddress,
            items: assignment.order.shopOrders.find(so => so._id.equals(assignment.shopOrderId))?.shopOrderItems || [],
            subTotal: assignment.order.shopOrders.find(so => so._id.equals(assignment.shopOrderId))?.subTotal || 0,
        }));

        return res.status(200).json(formatedData);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-Delivery-Assignment Error: ${error.message}`
        });
    }
};


export const acceptOrder = async (req, res) => {
    try {
        const {assignmentId} = req.params;
        const assignment = await DeliveryAssignment.findById(assignmentId);
        if(!assignment) {
            return res.status(400).json({
                message: 'Assignment not found!'
            });
        }

        if(assignment.status !== 'Broadcasted') {
            return res.status(400).json({
                message: 'Assignment is expired!'
            });
        }

        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ['Broadcasted', 'Delivered'] },
        });
        if(alreadyAssigned) {
            return res.status(400).json({
                message: 'You already have an active delivery assignment!'
            });
        }

        assignment.assignedTo = req.userId;
        assignment.status = 'Assigned';
        assignment.acceptedAt = new Date();
        await assignment.save();

        const order = await Order.findById(assignment.order);
        if(!order) {
            return res.status(404).json({
                message: 'Order not found!'
            });
        }

        const shopOrder = order.shopOrders.find(so => so._id.equals(assignment.shopOrderId));
        shopOrder.assignedDeliveryBoy = req.userId;

        await order.save();

        return res.status(200).json({
            message: 'Order Accepted!'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Accept Order Error: ${error.message}`
        });
    }
};


export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: 'Assigned',
        })
        .populate('shop', 'name')
        .populate('assignedTo', 'fullName email mobileNo location')
        .populate({
            path: 'order',
            populate: [{
                path: 'user',
                select: 'fullName email location mobileNo'
            }]
        });

        if(!assignment) {
            return res.status(404).json({
                message: 'No current active order found!'
            });
        }
        if(!assignment.order) {
            return res.status(404).json({
                message: 'Order not found!'
            });
        }

        const shopOrder = assignment.order.shopOrders.find(so => so._id.equals(assignment.shopOrderId).toString());
        if(!shopOrder) {
            return res.status(404).json({
                message: 'Shop Order not found in the order!'
            });
        }

        let deliveryBoyLocation = {lat: null, lon: null};
        if(assignment.assignedTo.location.coordinates.length === 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
        }

        let customerLocation = {lat: null, lon: null};
        if(assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude;
            customerLocation.lon = assignment.order.deliveryAddress.longitude;
        }

        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-Current-Order Error: ${error.message}`
        });
    }
};


export const getOrderById = async (req, res) => {
    try {
        const {orderId} = req.params;
        const order = await Order.findById(orderId)
        .populate('user')
        .populate({
            path: 'shopOrders.shop',
            model: 'Shop'
        })
        .populate({
            path: 'shopOrders.assignedDeliveryBoy',
            model: 'User'
        })
        .populate({
            path: 'shopOrders.shopOrderItems.item',
            model: 'Item'
        })
        .lean();

        if(!order) {
            return res.status(404).json({
                message: 'Order not found!'
            });
        }

        return res.status(200).json(order);


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Get-Order-ById Error: ${error.message}`
        });
    }
};


export const sendDeliveryOTP = async (req, res) => {
    try {
        const {orderId, shopOrderId} = req.body;
        const order = await Order.findById(orderId).populate('user');
        if(!order) {
            return res.status(404).json({
                message: 'OrderId not found!'
            })
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if(!shopOrder) {
            return res.status(404).json({
                message: 'ShopOrderId not found!'
            })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        shopOrder.deliveryOtp = otp;
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;

        await order.save();
        await sendDeliveryOtpMail(order.user, otp, order._id);

        return res.status(200).json({
            message: `Delivery OTP sent to ${order?.user?.fullName}'s email!`,

        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Send-Delivery-OTP Error: ${error.message}`
        });
    }
};


export const verifyDeliveryOTP = async (req, res) => {
    try {
        const {orderId, shopOrderId, otp} = req.body;
        
        console.log('[DEBUG] verifyDeliveryOTP called with:', {orderId, shopOrderId, otp});
        
        if(!orderId || !shopOrderId || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: orderId, shopOrderId, or otp'
            });
        }

        const order = await Order.findById(orderId).populate('user');
        if(!order) {
            console.log('[DEBUG] Order not found:', orderId);
            return res.status(404).json({
                success: false,
                message: 'OrderId not found!'
            });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if(!shopOrder) {
            console.log('[DEBUG] ShopOrder not found:', shopOrderId);
            return res.status(404).json({
                success: false,
                message: 'ShopOrderId not found!'
            });
        }

        console.log('[DEBUG] ShopOrder found. OTP check:', {
            storedOtp: shopOrder.deliveryOtp,
            providedOtp: otp,
            otpExpires: shopOrder.otpExpires,
            isExpired: shopOrder.otpExpires ? shopOrder.otpExpires < Date.now() : 'no expiry set'
        });

        if(shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid / Expired OTP!'
            });
        }

        // Fix: Use deliveryStatus instead of status
        shopOrder.deliveryStatus = 'Delivered';
        shopOrder.deliveredAt = new Date();

        // Mark the shopOrders array as modified
        order.markModified('shopOrders');
        await order.save();

        console.log('[DEBUG] Order saved with Delivered status');

        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy,
        });

        console.log('[DEBUG] DeliveryAssignment deleted');

        return res.status(200).json({
            success: true,
            message: 'Order Delivered!'
        });

    } catch (error) {
        console.error('[DEBUG] verifyDeliveryOTP error:', error);
        return res.status(500).json({
            success: false,
            message: `Verify-Delivery-OTP Error: ${error.message}`
        });
    }
};