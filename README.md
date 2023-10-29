# Meetup Scrapper
API for getting the latest meetup event for a group using only the fetch API. Currently caches requests for 24 hours via CLoudflare KV.

## Setup
- Create a KV store with Wrangler
- Copy `wrangler-example.toml` to `wrangler.toml` and fill in the binding id for your new KV store
- Edit the `TIMEZONE_NAME` env variable to match your timezone (ex: 'EST')
- Edit the `CACHE_TTL` env variable to match how long you want to cache requests (ex: '86400' for 24 hours)
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
  "id": "296072746",
  "groupSlug": "tridev",
  "href": "https://www.meetup.com/tridev/events/296072746/",
  "groupHref": "https://www.meetup.com/tridev/",
  "name": "Software Developer Meetup!",
  "featuredImage": "https://secure.meetupstatic.com/photos/event/8/6/6/9/highres_496372073.jpeg",
  "description": "TriDev is a monthly software development meetup with a wide range of topics in order to mix a wide range of people. Topics include code, IoT and maker projects, VR/AR, design, soft skills, leadership, and more. Each meetup starts at 6PM with a few minutes of chat and networking. At 6:15 a speaker gives the talk on the topic of the night. We try to limit the talk to an hour, so at 7:15 we can start our giveaways. We try and dismiss around 7:30 to have some time for discussion or extra Q/A with the speaker for folks who want to hang around, but allow for others to get home or to other obligations if needed. Doors close at 8.",
  "date": "2023-11-14T23:00:00.000Z",
  "location": "404 S Roan St · Johnson City, TN",
  "groupName": "TriDev",
  "groupType": "public"
}
```

GET - /api/{meetup group slug}/{event id}

**Note:** Only supports future events since past events are login protected.

Example 200 response:
```json
{
  "id": "296072746",
  "groupSlug": "tridev",
  "href": "https://www.meetup.com/tridev/events/296072746/",
  "groupHref": "https://www.meetup.com/tridev/",
  "name": "Software Developer Meetup!",
  "featuredImage": "https://secure.meetupstatic.com/photos/event/8/6/6/9/highres_496372073.jpeg",
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
  "featuredImage": "https://secure.meetupstatic.com/photos/event/e/0/1/c/clean_503817372.webp",
  "description": "Join our&nbsp; Slack Group &nbsp;to send us messages, show off something cool or trash talk your least favorite tech. TriDev is the largest developer community in the Tri-Cities. &nbsp;With talks ranging from JavaScript and web development, databases, VR, entrepreneurship, IoT and more. You're sure to find what you're looking for here. &nbsp;We meet every second Tuesday of the month at 6, grab some free food and chat for a few minutes, then have a great, informative talk on relevant topics. If you're an industry veteran or just looking to see if programming is right for you, you'll be in good company at TriDev. Have questions, reservations, or just want more information? Feel free to message any of the co-organizers here on Meetup. We're looking forward to meeting you!",
  "otherLink": "https://tricities.dev/",
  "twitterLink": "https://twitter.com/tridevmeetup",
  "upcomingEvents": [
    {
      "id": "296072746",
      "href": "https://www.meetup.com/tridev/events/296072746/",
      "name": "Software Developer Meetup!",
      "date": "2023-11-14T23:00:00.000Z"
    },
    {
      "id": "296072752",
      "href": "https://www.meetup.com/tridev/events/296072752/",
      "name": "Software Developer Meetup!",
      "date": "2024-01-09T23:00:00.000Z"
    },
    {
      "id": "hnhcksygcdbrb",
      "href": "https://www.meetup.com/tridev/events/hnhcksygcdbrb/",
      "name": "Software Developer Meetup!",
      "date": "2024-02-13T23:00:00.000Z"
    },
    {
      "id": "hnhcksygcfbqb",
      "href": "https://www.meetup.com/tridev/events/hnhcksygcfbqb/",
      "name": "Software Developer Meetup!",
      "date": "2024-03-12T23:00:00.000Z"
    }
  ],
  "pastEvent": {
    "id": "294188453",
    "href": "https://www.meetup.com/tridev/events/294188453/",
    "name": "Hacktober event, bring your computer!",
    "date": "2023-10-10T23:00:00.000Z"
  },
  "sponsors": [
    {
      "name": "Tek Systems",
      "description": "Food / Beverage",
      "href": "http://www.teksystems.com"
    },
    {
      "name": "JetBrains",
      "description": "Free software licenses to be raffled at meetings.",
      "href": "https://www.jetbrains.com"
    },
    {
      "name": "Spark Plaza",
      "description": "Meeting Place",
      "href": "http://sparkplaza.com"
    },
    {
      "name": ".NET Foundation",
      "description": "Meetup.com Costs",
      "href": "https://dotnetfoundation.org/"
    }
  ],
  "topics": [
    {
      "name": "HTML & CSS",
      "href": "https://www.meetup.com/find/?keywords=html%20%26%20css"
    },
    {
      "name": "Professional Networking",
      "href": "https://www.meetup.com/find/?keywords=professional%20networking"
    },
    {
      "name": "Entrepreneurship",
      "href": "https://www.meetup.com/find/?keywords=entrepreneurship"
    },
    {
      "name": "Front-end Development",
      "href": "https://www.meetup.com/find/?keywords=front-end%20development"
    },
    {
      "name": "Software Development",
      "href": "https://www.meetup.com/find/?keywords=software%20development"
    },
    {
      "name": "JavaScript",
      "href": "https://www.meetup.com/find/?keywords=javascript"
    },
    {
      "name": "Programming Languages",
      "href": "https://www.meetup.com/find/?keywords=programming%20languages"
    },
    {
      "name": "Database Professionals",
      "href": "https://www.meetup.com/find/?keywords=database%20professionals"
    }
  ]
}
```