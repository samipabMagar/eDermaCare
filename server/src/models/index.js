import userModel from "./userModel.js";
import doctorProfileModel from "./doctorProfileModel.js";
import productModel from "./productModel.js";
import brandModel from "./brandModel.js";
import appointmentModel from "./appointmentModel.js";
import cartModel from "./cartModel.js";
import cartItemModel from "./cartItemModel.js";
import orderModel from "./orderModel.js";
import orderItemModel from "./orderItemModel.js";

// Define relationships
// One-to-One: User has one DoctorProfile
userModel.hasOne(doctorProfileModel, {
  foreignKey: "user_id",
  as: "doctorProfile",
});

doctorProfileModel.belongsTo(userModel, {
  foreignKey: "user_id",
  as: "user",
});

// One-to-Many: Brand has many Products
brandModel.hasMany(productModel, {
  foreignKey: "brand_id",
  as: "products",
});

// Many-to-One: Product belongs to Brand
productModel.belongsTo(brandModel, {
  foreignKey: "brand_id",
  as: "brand",
});

// One-to-Many: User (patient) has many appointments
userModel.hasMany(appointmentModel, {
  foreignKey: "patient_user_id",
  as: "patientAppointments",
});

// One-to-Many: User (doctor) has many appointments
userModel.hasMany(appointmentModel, {
  foreignKey: "doctor_user_id",
  as: "doctorAppointments",
});

// Many-to-One: Appointment belongs to patient user
appointmentModel.belongsTo(userModel, {
  foreignKey: "patient_user_id",
  as: "patient",
});

// Many-to-One: Appointment belongs to doctor user
appointmentModel.belongsTo(userModel, {
  foreignKey: "doctor_user_id",
  as: "doctor",
});

// One-to-One: User has one Cart
userModel.hasOne(cartModel, {
  foreignKey: "user_id",
  as: "cart",
});

cartModel.belongsTo(userModel, {
  foreignKey: "user_id",
  as: "user",
});

// One-to-Many: Cart has many CartItems
cartModel.hasMany(cartItemModel, {
  foreignKey: "cart_id",
  as: "items",
});

cartItemModel.belongsTo(cartModel, {
  foreignKey: "cart_id",
  as: "cart",
});

// One-to-Many: Product has many CartItems
productModel.hasMany(cartItemModel, {
  foreignKey: "product_id",
  as: "cartItems",
});

cartItemModel.belongsTo(productModel, {
  foreignKey: "product_id",
  as: "product",
});

// One-to-Many: User has many Orders
userModel.hasMany(orderModel, {
  foreignKey: "user_id",
  as: "orders",
});

orderModel.belongsTo(userModel, {
  foreignKey: "user_id",
  as: "user",
});

// One-to-Many: Order has many OrderItems
orderModel.hasMany(orderItemModel, {
  foreignKey: "order_id",
  as: "items",
});

orderItemModel.belongsTo(orderModel, {
  foreignKey: "order_id",
  as: "order",
});

// One-to-Many: Product has many OrderItems
productModel.hasMany(orderItemModel, {
  foreignKey: "product_id",
  as: "orderItems",
});

orderItemModel.belongsTo(productModel, {
  foreignKey: "product_id",
  as: "product",
});

export {
  userModel,
  doctorProfileModel,
  productModel,
  brandModel,
  appointmentModel,
  cartModel,
  cartItemModel,
  orderModel,
  orderItemModel,
};
