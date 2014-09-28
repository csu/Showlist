Built in under 24 hours for the Facebook Seattle Regional Hackathon. Won 2nd place.

# Facebook Hackathon 2014

Please don't push to master. Make a branch and make changes there.

## API Endpoints

### Reviews
`GET /api/reviews` with `artist_id` as a parameter – get a review by its id  
`POST /api/reviews` with `artist_id, creator, rating, review_body, and event_id` in body – post a new review  
`PUT /api/reviews/:id` – modify a new review by id  
`DELETE /api/reviews/:id` – delete a review by id  

### Artists
`GET /api/artists` – get all artists  
`GET /api/artists` with `artist_id` as a parameter – get a review by its id  
`POST /api/artists` with `artist_id` in body  – post a new review  
`PUT /api/artists/:id` – modify a new review by id  
`DELETE /api/artists/:id` as a parameter – delete a review by id  