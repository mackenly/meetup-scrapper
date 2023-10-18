# Meetup Scrapper
API for getting the latest meetup event for a group using only the fetch API. Currently caches requests for 24 hours via CLoudflare KV.

## Setup
- Create a KV store with Wrangler
- Copy `wrangler-example.toml` to `wrangler.toml` and fill in the binding id for your new KV store
- Edit the `TIMEZONE_NAME` env variable to match your timezone (ex: 'EST')
- Deploy with `wrangler deploy`

## Tests
Tests are setup for:
- Checking that root URL is 404
- Checking that invalid paths are 404
- Checking that valid paths return 200 and the correct data
- Checking that regex html parsing works correctly

Tests run on push to `main` via GitHub actions or can be run locally with `vitest run`.


## API Route
GET - /api/{meetup group slug}/latest

Example 200 response:
```json
{
  "id": "296072746",
  "groupSlug": "tridev",
  "href": "https://www.meetup.com/tridev/events/296072746/",
  "groupHref": "https://www.meetup.com/tridev/",
  "name": "Software Developer Meetup!",
  "description": "TriDev is a monthly software development meetup with a wide range of topics in order to mix a wide range of people. Topics include code, IoT and maker projects, VR/AR, design, soft skills, leadership, and more. Each meetup starts at 6PM with a few minutes of chat and networking. At 6:15 a speaker gives the talk on the topic of the night. We try to limit the talk to an hour, so at 7:15 we can start our giveaways. We try and dismiss around 7:30 to have some time for discussion or extra Q/A with the speaker for folks who want to hang around, but allow for others to get home or to other obligations if needed. Doors close at 8.",
  "date": "2023-11-14T23:00:00.000Z",
  "location": "404 S Roan St · Johnson City, TN",
  "groupName": "TriDev",
  "groupType": "public"
}
```

GET - /api/{meetup group slug}/

Example 200 response:
```json
{
  "slug": "tridev",
  "href": "https://www.meetup.com/tridev/",
  "name": "TriDev",
  "location": "Kingsport, TN",
  "memberCount": 433,
  "groupType": "Public",
  "description": "Join our&nbsp; Slack Group &nbsp;to send us messages, show off something cool or trash talk your least favorite tech. TriDev is the largest developer community in the Tri-Cities. &nbsp;With talks ranging from JavaScript and web development, databases, VR, entrepreneurship, IoT and more. You're sure to find what you're looking for here. &nbsp;We meet every second Tuesday of the month at 6, grab some free food and chat for a few minutes, then have a great, informative talk on relevant topics. If you're an industry veteran or just looking to see if programming is right for you, you'll be in good company at TriDev. Have questions, reservations, or just want more information? Feel free to message any of the co-organizers here on Meetup. We're looking forward to meeting you!"
}
```