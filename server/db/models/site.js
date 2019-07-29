import mongoose from "mongoose"

const Schema = mongoose.Schema

const SiteSchema = new Schema({
  title: {
    type: String
  },
  subtitle: {
    type: String
  },
  keyword: {
    type: String
  },
  description: {
    type: String
  },
  url: {
    type: String
  },
  logo: {
    type: String
  },
  beian: {
    type: String
  },
  phone: {
    type: String
  }
})

export default mongoose.model('Site', SiteSchema, 'site')
