import connection from "../configs/db.js";
import { QueryTypes } from "sequelize";

class TransactionController {
  async getAllTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const paymentStatus = req.query.paymentStatus || "";
      const offset = (page - 1) * limit;

      let whereClause = "WHERE 1=1";
      const params = {};

      // Search by order number
      if (search.trim()) {
        whereClause += " AND o.order_number LIKE :search";
        params.search = `%${search.trim()}%`;
      }

      // Filter by payment status
      if (paymentStatus.trim()) {
        whereClause += " AND o.payment_status = :paymentStatus";
        params.paymentStatus = paymentStatus.trim();
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ${whereClause}
      `;

      const countResult = await connection.query(countQuery, {
        replacements: params,
        type: QueryTypes.SELECT,
      });

      const totalTransactions = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalTransactions / limit);

      // Get transactions
      const query = `
        SELECT 
          o.order_id,
          o.order_number,
          o.grand_total as total_amount,
          o.payment_status,
          o.payment_method as payment_gateway,
          o.created_at,
          u.user_id,
          u.full_name,
          u.email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT :limit OFFSET :offset
      `;

      params.limit = limit;
      params.offset = offset;

      const transactions = await connection.query(query, {
        replacements: params,
        type: QueryTypes.SELECT,
      });

      const formattedTransactions = transactions.map((transaction) => ({
        order_id: transaction.order_id,
        order_number: transaction.order_number,
        total_amount: transaction.total_amount,
        payment_status: transaction.payment_status,
        payment_gateway: transaction.payment_gateway,
        created_at: transaction.created_at,
        user: {
          user_id: transaction.user_id,
          full_name: transaction.full_name,
          email: transaction.email,
        },
      }));

      return res.status(200).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: formattedTransactions,
        pagination: {
          page,
          limit,
          totalTransactions,
          totalPages,
          hasMore: page < totalPages,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve transactions",
      });
    }
  }

  async getTransactionStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END) as paid_amount,
          SUM(CASE WHEN payment_status = 'pending' THEN grand_total ELSE 0 END) as pending_amount,
          SUM(CASE WHEN payment_status = 'failed' THEN grand_total ELSE 0 END) as failed_amount,
          SUM(CASE WHEN payment_status = 'refunded' THEN grand_total ELSE 0 END) as refunded_amount,
          SUM(grand_total) as total_amount
        FROM orders
        WHERE payment_status IS NOT NULL
      `;

      const stats = await connection.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(200).json({
        success: true,
        message: "Transaction stats retrieved successfully",
        data: stats[0] || {
          total_transactions: 0,
          paid_amount: 0,
          pending_amount: 0,
          failed_amount: 0,
          refunded_amount: 0,
          total_amount: 0,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve transaction stats",
      });
    }
  }
}

export default new TransactionController();
