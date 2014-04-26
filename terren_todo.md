Rewrite:

    var User = app.resource = restful.model('user', mongoose.Schema({
        provider: { type: 'string', required: true },
        user_id: { type: 'string', unique: true, required: true},
        name: { type: 'string', required: true},
        email: { type: 'string', required: true},
        photo: { type: 'string'},
        facebook_token: { type: 'string', required: true}
      }))
      .methods(['get', 'post', 'put', 'delete']);

in this format:

    var ReviewSchema = new Schema({
        added_at: {
            type: Date,
            default: Date.now
        },
        artist_id: {
            type: String,
            required: true,
            lowercase: true,
            trim: true 
        },
        user_id: {
            type: String,
            required: true,
            lowercase: true,
            trim: true 
        },
        rating: {
            type: Number,
            required: true
        },
        review_body: {
            type: String,
            required: true
        },
        event_id: String
    });