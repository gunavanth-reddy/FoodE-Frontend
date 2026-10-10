const Payment = require("../models/Payment");
const Order = require("../models/Order");


// =====================================================
// CREATE PAYMENT
// =====================================================

const createPayment = async (req, res) => {
  try {
    const {orderId, method} = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!["COD", "ONLINE"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // CHECK EXISTING PAYMENT
    // ==========================================

    const existingPayment =
      await Payment.findOne({
        order: order._id,
      });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message:
          "Payment already exists for this order",
        payment: existingPayment,
      });
    }

    // ==========================================
    // COD
    // ==========================================

    if (method === "COD") {
      const payment = await Payment.create({
        user: req.user._id,
        order: order._id,
        amount: order.total,
        currency: "INR",
        method: "COD",
        status: "PENDING",
      });

      order.paymentMethod = "COD";
      order.paymentStatus = "PENDING";

      await order.save();

      return res.status(201).json({
        success: true,
        message:
          "Cash on Delivery selected successfully",
        payment,
        order,
      });
    }

    // ==========================================
    // ONLINE PAYMENT
    // ==========================================
    //
    // Real gateway integration will be added later.
    //

    const payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      amount: order.total,
      currency: "INR",
      method: "ONLINE",
      status: "PENDING",
      gateway: "",
    });

    order.paymentMethod = "ONLINE";
    order.paymentStatus = "PENDING";

    await order.save();

    return res.status(201).json({
      success: true,
      message:
        "Online payment initialized",
      payment,
      order,
    });

  } catch (error) {
    console.error(
      "Create Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating payment",
    });
  }
};


// =====================================================
// GET PAYMENT BY ORDER
// =====================================================

const getPaymentByOrder = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findOne({
        order: req.params.orderId,
        user: req.user._id,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });

  } catch (error) {
    console.error(
      "Get Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching payment",
    });
  }
};


// =====================================================
// MARK COD PAYMENT AS PAID
// =====================================================
//
// This will eventually be used by the restaurant/
// delivery workflow when COD money is collected.
// =====================================================

const markCODAsPaid = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findOne({
        order: req.params.orderId,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.method !== "COD") {
      return res.status(400).json({
        success: false,
        message:
          "This payment is not Cash on Delivery",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(400).json({
        success: false,
        message:
          "Payment is already marked as paid",
      });
    }

    payment.status = "SUCCESS";

    await payment.save();

    const order = await Order.findById(
      req.params.orderId
    );

    if (order) {
      order.paymentStatus = "PAID";
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "COD payment marked as paid",
      payment,
      order,
    });

  } catch (error) {
    console.error(
      "Mark COD Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating payment",
    });
  }
};


// =====================================================
// REFUND PAYMENT
// =====================================================
//
// Actual gateway refund integration will be added
// when online payments are implemented.
// =====================================================

const refundPayment = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findOne({
        order: req.params.orderId,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message:
          "Only successful payments can be refunded",
      });
    }

    payment.status = "REFUNDED";
    payment.refundedAt = new Date();

    await payment.save();

    const order = await Order.findById(
      req.params.orderId
    );

    if (order) {
      order.paymentStatus = "REFUNDED";
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment refunded successfully",
      payment,
      order,
    });

  } catch (error) {
    console.error(
      "Refund Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while refunding payment",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createPayment,
  getPaymentByOrder,
  markCODAsPaid,
  refundPayment,
};