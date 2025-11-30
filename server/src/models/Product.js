import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true, trim: true, index: 'text' },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
export default Product;
