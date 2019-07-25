import mongoose from 'mongoose'

const Schema = mongoose.Schema
const CategorySchema = new Schema({
  name: {
    type: String,
    unique: true,
    require: true
  },
  slug: {
    type: String,
    unique: true,
    require: true
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String
  }
})

export default mongoose.model('Category', CategorySchema)
