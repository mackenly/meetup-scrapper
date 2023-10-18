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
        const result = await scraper?.querySelector('h1,title,div.break-words,time,#event-group-link > div > div.ml-4 > div.text-sm.font-medium.leading-5,#event-group-link > div > div.ml-4 > div.flex.flex-row.text-gray6.text-sm.mt-1.h-5 > span > span,#event-info > div > div:nth-child(1) > div.flex.flex-col > div > div.overflow-hidden > div').getText({ spaced: true });

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
            eventDate = new Date(eventTitle + ` ${TIMEZONE_NAME}`).toISOString();
        }

        return {
            id: eventId,
            groupSlug: groupSlug,
            href: eventUrl.href || '',
            groupHref: `https://www.meetup.com/${groupSlug}/`,
            name: result["h1"][0].trim() || '',
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
        const result = await scraper?.querySelector('h1,#city-link > div,#member-count-link > div,#submain > div > div > div.w-full > div.relative.overflow-hidden.h-auto').getText({ spaced: true });
        
        const memberCountTypeString = result["#member-count-link > div"][0].split('·');
        const memberCount = Number(memberCountTypeString[0].replace(" members", "").trim());
        const groupType = memberCountTypeString[1].replace("group", "").trim();

        return {
            slug: groupSlug,
            href: groupUrl.href || '',
            name: result["h1"][0].trim() || '',
            location: result["#city-link > div"][0].trim() || '',
            memberCount: memberCount || 0,
            groupType: groupType || '',
            description: result["#submain > div > div > div.w-full > div.relative.overflow-hidden.h-auto"][0] || '',
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

export async function getLatestEventId(groupSlug: string, env: Env) {
    try {
        const eventUrl: URL = new URL(`https://www.meetup.com/${groupSlug}/`);
        const scraper = await new Scraper().fetch(eventUrl);

        const result = await scraper?.querySelector('a#event-card-e-1').getAttribute('href');

        return result.split('/')[5];
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