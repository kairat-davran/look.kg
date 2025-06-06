import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    isSeller: { type: Boolean, default: false, required: true },
    seller: {
      name: String,
      logo: String,
      notLogo: { data: Buffer },
      description: String,
      instagram: {
        username: String,
      },
      payMethod: {
        visaCard: String,
        elsom: String,
        Omoney: String,
        balanceKg: String,
        mBank: String
      },
      rating: { type: Number, default: 0, required: true },
      numReviews: { type: Number, default: 0, required: true },
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model('User', userSchema);
User.createIndexes();

export default User;
