/**
 * Scrapper function that gets the latest event from the a Meetup group
 * @param {string} groupSlug - The Meetup group slug found in the URL
 * @param {Env} env - The environment variables
 * @returns {Promise<{link: string, title: string, description: string, date: string}>}
 */
export async function scrape(groupSlug: string, env: Env) {
    console.log(`Group slug is: ${groupSlug}`);
    const htmlContent = await fetch(`https://www.meetup.com/${groupSlug}/events/?type=upcoming`, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    }).catch((err) => {
        console.log(`Error is: ${err}`);
        throw err;
    });
    const eventsPage = await htmlContent.text();

    // Get the event href from the first event card
    const eventHref = getTextFromHtml(eventsPage, /<a[^>]*id="event-card-e-1"[^>]*href="([^"]*)"[^>]*>/);
    console.log(`Event href is: ${eventHref}`);

    // Get the event's page
    const eventHtmlContent = await fetch(eventHref, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    });
    const eventPage = await eventHtmlContent.text();

    // Get the event H1
    const eventH1 = getTextFromHtml(eventPage, /<h1[^>]*>([^<]*)<\/h1>/);
    console.log(`Event H1 is: ${eventH1}`);

    // Get the event title
    let eventTitle = getTextFromHtml(eventPage, /<title[^>]*>([^<]*)<\/title>/);
    console.log(`Event title is: ${eventTitle}`);

    // remote " | Meetup" from title
    eventTitle = eventTitle.replace(' | Meetup', '').trim();

    // get event date from title
    const titleParts = eventTitle.split(',');
    titleParts.splice(0, titleParts.length - 4);
    eventTitle = titleParts.join(',').trim();
    // the string is in EST, so we need to add 5 hours to get UTC
    const TIMEZONE_NAME = env.TIMEZONE_NAME || 'EST';
    const eventDate = new Date(eventTitle + ` ${TIMEZONE_NAME}`).toISOString();
    console.log(`Event date is: ${eventDate}`);

    // get event details/description
    const eventDescription = getTextFromHtml(eventPage, /<div id="event-details"[^>]*>.*?<div class="break-words">([\s\S]*?)<\/div>/).replace(/<\/?[^>]+(>|$)/g, "");
    console.log(`Event description is: ${eventDescription.substring(0, 100)}`);

    // get event data
    return {
        link: eventHref || '',
        title: eventH1 || '',
        description: eventDescription || '',
        date: eventDate || '',
    };
}

/**
 * Function that gets the text from an HTML string using a regex
 * @param html - The HTML string of the page or element
 * @param regex - The regex to use to get the text
 * @returns {string} - The text found
 */
export function getTextFromHtml(html: string, regex: RegExp) {
    const match = html.match(regex);
    var text = '';

    if (match && match[1]) {
        text = match[1];
    }

    return text;
}