# Meetup Scrapper
API for getting the latest meetup event for a group using only the fetch API. Currently caches requests for 24 hours via CLoudflare KV.

## Setup
- Create a KV store with Wrangler
- Copy `wrangler-example.toml` to `wrangler.toml` and fill in the binding id for your new KV store
- Deploy with `wrangler deploy`

## Tests
Tests are setup for:
- Checking that root URL is 404
- Checking that invalid paths are 404
- Checking that valid paths return 200 and the correct data

Tests run on push to `main` via GitHub actions or can be run locally with `vitest run`.


## API Route
GET - /api/{meetup group slug}/latest

Example 200 response:
```json
{
  "link": "https://www.meetup.com/tridev/events/294188453/",
  "title": "Hacktober event, bring your computer!",
  "details": "TriDev is a monthly software development meetup with a wide range of topics in order to mix a wide range of people. Topics include code, IoT and maker projects, VR/AR, design, soft skills, leadership, and more.\nEach meetup starts at 6PM with a few minutes of chat and networking. At 6:15 a speaker gives the talk on the topic of the night. We try to limit the talk to an hour, so at 7:15 we can start our giveaways. We try and dismiss around 7:30 to have some time for discussion or extra Q/A with the speaker for folks who want to hang around, but allow for others to get home or to other obligations if needed. Doors close at 8.",
  "date": "2023-10-10T18:00:00.000Z"
}
```