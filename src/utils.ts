import Scraper from "./scrapper";

/**
 * scrapeEvent function that scraps a single event from Meetup
 * @param {string} groupSlug - The Meetup group slug found in the URL
 * @param {string} eventId - The Meetup event ID found in the URL
 * @param {Env} env - The environment variables
 * @returns {Promise<{id: string, groupSlug: string, href: string, name: string, description: string, date: string}>} - The event object
 */
export async function scrapeEvent(groupSlug: string, eventId: string, env: Env) {
    try {
        const eventUrl: URL = new URL(`https://www.meetup.com/${groupSlug}/events/${eventId}/`);
        const scraper = await new Scraper().fetch(eventUrl);
        const result = await scraper?.getText([
            'h1',
            'title',
            'div.break-words',
            'time',
            '#event-group-link > div > div.ml-4 > div.text-sm.font-medium.leading-5',
            '#event-group-link > div > div.ml-4 > div.flex.flex-row.text-gray6.text-sm.mt-1.h-5 > span > span',
            '#event-info > div > div:nth-child(1) > div.flex.flex-col > div > div.overflow-hidden > div',
        ], true);
        const attributeResults = await scraper?.getAttributes([
            '#main > div > div > div > div > div > div > div:nth-child(1) > picture > div > img',
        ], [
            'src',
        ]);

        let eventDate = '';
        if (result["title"].length != 0) {
            let eventTitle = result["title"][0].trim() || '';
            // remove " | Meetup" from title
            eventTitle = eventTitle.replace(' | Meetup', '').trim();

            // get event date from title
            const titleParts = eventTitle.split(',');
            titleParts.splice(0, titleParts.length - 4);
            eventTitle = titleParts.join(',').trim();
            // the string is in EST, so we need to add 5 hours to get UTC
            const TIMEZONE_NAME = env.TIMEZONE_NAME || 'EST';
            try {
                eventDate = new Date(eventTitle + ` ${TIMEZONE_NAME}`).toISOString();
            } catch (error) {
                return new Response(JSON.stringify({
                    "error": "Not found.",
                }), {
                    status: 404,
                    headers: {
                        "content-type": "application/json;charset=UTF-8",
                    },
                });
            }
        }

        return {
            id: eventId,
            groupSlug: groupSlug,
            href: eventUrl.href || '',
            groupHref: `https://www.meetup.com/${groupSlug}/`,
            name: result["h1"][0].trim() || '',
            featuredImage: attributeResults["#main > div > div > div > div > div > div > div:nth-child(1) > picture > div > img"][0] || '',
            description: result["div.break-words"][0].trim() || '',
            date: eventDate || '',
            location: result["#event-info > div > div:nth-child(1) > div.flex.flex-col > div > div.overflow-hidden > div"][0].trim() || '',
            groupName: result["#event-group-link > div > div.ml-4 > div.text-sm.font-medium.leading-5"][0].trim() || '',
            groupType: result["#event-group-link > div > div.ml-4 > div.flex.flex-row.text-gray6.text-sm.mt-1.h-5 > span > span"][0].trim() || '',
        };
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({
            "error": "Not found.",
        }), {
            status: 404,
            headers: {
                "content-type": "application/json;charset=UTF-8",
            },
        });
    }
}

/**
 * scrapeGroup function that scraps a single group from Meetup
 * @param {string} groupSlug - The Meetup group slug found in the URL
 * @param {Env} env - The environment variables
 * @returns {Promise<{slug: string, href: string, name: string, location: string, membersCount: number, groupType: string, description: string}>} - The group object
 */
export async function scrapeGroup(groupSlug: string, env: Env) {
    try {
        const groupUrl: URL = new URL(`https://www.meetup.com/${groupSlug}/`);
        const scraper = await new Scraper().fetch(groupUrl);
        const result = await scraper?.getText([
            'h1',
            '#city-link > div',
            '#member-count-link > div',
            '#submain > div > div > div.w-full > div.relative.overflow-hidden.h-auto',
            '#event-card-e-1 > div > div > div > span',
            '#event-card-e-1 > div > div > div > time',
            '#event-card-e-2 > div > div > div > span',
            '#event-card-e-2 > div > div > div > time',
            '#event-card-e-3 > div > div > div > span',
            '#event-card-e-3 > div > div > div > time',
            '#event-card-e-4 > div > div > div > span',
            '#event-card-e-4 > div > div > div > time',
            '#past-event-card-ep-1 > div > div > div > span',
            '#past-event-card-ep-1 > div > div > div > time',
            'li.swiper-slide > a > div.w-full > div.break-words.font-medium',
            'li.swiper-slide > a > div.w-full > div.text-sm',
            'a[data-event-label="topic-link"]'
        ], true);

        const attributeResults = await scraper?.getAttributes([
            '#main > div:nth-child(2) > section > div.relative > img',
            '#event-card-e-1',
            '#event-card-e-2',
            '#event-card-e-3',
            '#event-card-e-4',
            '#past-event-card-ep-1',
            'a[data-event-label="group-other-button"]',
            'a[data-event-label="group-twitter-button"]',
            'a[data-event-label="sponsor-group-home-button"]',
            'a[data-event-label="topic-link"]'
        ], [
            'src',
            'href',
            'href',
            'href',
            'href',
            'href',
            'href',
            'href',
            'href',
            'href'
        ]);

        const memberCountTypeString = result["#member-count-link > div"][0].split('·');
        const uniqueSponsorNames = [... new Set(result["li.swiper-slide > a > div.w-full > div.break-words.font-medium"])];
        const uniqueSponsorDescriptions = [... new Set(result["li.swiper-slide > a > div.w-full > div.text-sm"])];
        const TIMEZONE_NAME = env.TIMEZONE_NAME || 'EST';

        return {
            slug: groupSlug,
            href: groupUrl.href || '',
            name: result["h1"][0].trim() || '',
            location: result["#city-link > div"][0].trim() || '',
            memberCount: Number(memberCountTypeString[0].replace(" members", "").trim()) || 0,
            groupType: memberCountTypeString[1].replace("group", "").trim() || '',
            featuredImage: attributeResults["#main > div:nth-child(2) > section > div.relative > img"][0] || '',
            description: result["#submain > div > div > div.w-full > div.relative.overflow-hidden.h-auto"][0] || '',
            otherLink: attributeResults["a[data-event-label=\"group-other-button\"]"] ?? '',
            twitterLink: attributeResults["a[data-event-label=\"group-twitter-button\"]"] ?? '',
            upcomingEvents: [
                {
                    id: attributeResults["#event-card-e-1"]?.[0]?.split('/')?.[5] ?? '',
                    href: attributeResults["#event-card-e-1"]?.[0] ?? '',
                    name: result["#event-card-e-1 > div > div > div > span"]?.[0]?.trim() || '',
                    date: new Date(result["#event-card-e-1 > div > div > div > time"]?.[0]?.trim()?.slice(0, -4) + ` ${TIMEZONE_NAME}`)?.toISOString() || '',
                },
                {
                    id: attributeResults["#event-card-e-2"]?.[0]?.split('/')?.[5] ?? '',
                    href: attributeResults["#event-card-e-2"]?.[0] ?? '',
                    name: result["#event-card-e-2 > div > div > div > span"]?.[0]?.trim() || '',
                    date: new Date(result["#event-card-e-2 > div > div > div > time"]?.[0]?.trim()?.slice(0, -4) + ` ${TIMEZONE_NAME}`)?.toISOString() || '',
                },
                {
                    id: attributeResults["#event-card-e-3"]?.[0]?.split('/')?.[5] ?? '',
                    href: attributeResults["#event-card-e-3"]?.[0] ?? '',
                    name: result["#event-card-e-3 > div > div > div > span"]?.[0]?.trim() || '',
                    date: new Date(result["#event-card-e-3 > div > div > div > time"]?.[0]?.trim()?.slice(0, -4) + ` ${TIMEZONE_NAME}`)?.toISOString() || '',
                },
                {
                    id: attributeResults["#event-card-e-4"]?.[0]?.split('/')?.[5] ?? '',
                    href: attributeResults["#event-card-e-4"]?.[0] ?? '',
                    name: result["#event-card-e-4 > div > div > div > span"]?.[0]?.trim() || '',
                    date: new Date(result["#event-card-e-4 > div > div > div > time"]?.[0]?.trim()?.slice(0, -4) + ` ${TIMEZONE_NAME}`)?.toISOString() || '',
                },
            ],
            pastEvent: {
                id: attributeResults["#past-event-card-ep-1"]?.[0]?.split('/')?.[5] ?? '',
                href: attributeResults["#past-event-card-ep-1"]?.[0] ?? '',
                name: result["#past-event-card-ep-1 > div > div > div > span"]?.[0]?.trim() || '',
                date: new Date(result["#past-event-card-ep-1 > div > div > div > time"]?.[0]?.trim()?.slice(0, -4) + ` ${TIMEZONE_NAME}`)?.toISOString() || '',
            },
            sponsors: uniqueSponsorNames.map((name, index: number) => {
                return {
                    name: name,
                    description: uniqueSponsorDescriptions[index],
                    href: attributeResults["a[data-event-label=\"sponsor-group-home-button\"]"]?.[index] ?? '',
                }
            }, {}),
            topics: result["a[data-event-label=\"topic-link\"]"].map((topic: string, index: number) => {
                return {
                    name: topic.replace('&amp;', '&'),
                    href: attributeResults["a[data-event-label=\"topic-link\"]"]?.[index] ?? '',
                }
            }, {}),
        };
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({
            "error": "Not found.",
        }), {
            status: 404,
            headers: {
                "content-type": "application/json;charset=UTF-8",
            },
        });
    }
}

export async function getLatestEventId(groupSlug: string, env: Env): Promise<string> {
    try {
        const eventUrl: URL = new URL(`https://www.meetup.com/${groupSlug}/`);
        const scraper = await new Scraper().fetch(eventUrl);

        const result: { [key: string]: Array<string> } = await scraper?.getAttributes(['a#event-card-e-1'], ['href']);

        return result['a#event-card-e-1'][0].split('/')[5];
    } catch (error) {
        console.log(error);
        throw new Error(`Error fetching latest event ID for ${groupSlug}`);
    }
}