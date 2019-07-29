import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const saltRounds = 10

const Schema = mongoose.Schema
const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    require: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    require: true
  },
  roles: {
    type: Array,
    require: true
  },
  introduction: {
    type: String,
    require: true
  },
  avatar: {
    type: String
  },
  loginCount: {
    type: Number,
    default: 0
  },
  isEnable: {
    type: Boolean,
    require: true,
    default: true
  }
}, {timestamps: {createdAt: 'createTime', updatedAt: 'loginTime'}})

// 保存前密码加盐加密
UserSchema.pre('save', function (next) {
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err)
      this.password = hash
      next()
    })
  })
})

export default mongoose.model('User', UserSchema, 'user')
