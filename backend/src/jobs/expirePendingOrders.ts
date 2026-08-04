import cron from 'node-cron';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { logger } from '../utils/logger';

const PENDING_TTL_MINUTES = 30;

/**
 * Expire unpaid Razorpay orders stuck in `pending` and restore stock.
 * Runs every 10 minutes.
 */
export function startPendingOrderExpiryJob(): void {
  cron.schedule('*/10 * * * *', async () => {
    const cutoff = new Date(Date.now() - PENDING_TTL_MINUTES * 60 * 1000);
    try {
      const staleOrders = await Order.find({
        status: 'pending',
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        createdAt: { $lt: cutoff },
      });

      for (const order of staleOrders) {
        order.status = 'payment-failed';
        order.paymentStatus = 'failed';
        await order.save();

        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product, 'weights.weight': item.weight },
            { $inc: { 'weights.$.stock': item.qty } },
          );
        }

        logger.info({ orderId: order._id }, 'Expired unpaid Razorpay order and restored stock');
      }

      if (staleOrders.length > 0) {
        logger.info({ count: staleOrders.length }, 'Pending order expiry job completed');
      }
    } catch (err) {
      logger.error({ err }, 'Pending order expiry job failed');
    }
  });

  logger.info('Pending order expiry cron scheduled (every 10 minutes)');
}
