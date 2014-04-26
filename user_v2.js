
    var UserSchema = new Schema({
        provider: { type: String, required: true },
        user_id: { type: String, unique: true, required: true},
        name: { type: String, required: true},
        email: { type: String, required: true},
        photo: { type: String},
        facebook_token: { type: String, required: true}
      })
