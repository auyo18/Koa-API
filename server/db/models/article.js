import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ArticleSchema = new Schema({
  title: {
    type: String,
    unique: true,
    require: true
  },
  content: {
    type: String
  },
  category_id: {
    type: Schema.Types.ObjectId,
    index: true,
    require: true
  },
  author: {
    type: String
  },
  thumbnail: {
    type: String
  },
  description: {
    type: String
  },
  keyword: {
    type: String
  },
  importance: {
    type: Number
  }
}, {timestamps: {createdAt: 'createTime', updatedAt: 'updateTime'}})

export default mongoose.model('Article', ArticleSchema, 'article')
