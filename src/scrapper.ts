/**
 * Scrapper function that gets the latest event from the a Meetup group
 * @param {string} groupSlug - The Meetup group slug found in the URL
 * @returns {Promise<{link: string, title: string, details: string}>}
 */
export async function scrape(groupSlug: string) {
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
    const hrefRegex = /<a[^>]*id="event-card-e-1"[^>]*href="([^"]*)"[^>]*>/;
    const hrefMatch = eventsPage.match(hrefRegex);
    var eventHref = '';

    if (hrefMatch && hrefMatch[1]) {
        console.log(`Href value is: ${hrefMatch[1]}`);
        eventHref = hrefMatch[1];
    } else {
        console.log('Href value not found');
    }

    const eventHtmlContent = await fetch(eventHref, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    });

    const eventPage = await eventHtmlContent.text();
    const h1Regex = /<h1[^>]*>([^<]*)<\/h1>/;
    const h1Match = eventPage.match(h1Regex);
    var eventH1 = '';

    if (h1Match && h1Match[1]) {
        console.log(`H1 text is: ${h1Match[1]}`);
        eventH1 = h1Match[1];
    } else {
        console.log('H1 text not found');
    }

    const titleRegex = /<title[^>]*>([^<]*)<\/title>/;
    const titleMatch = eventPage.match(titleRegex);
    var eventTitle = '', eventDate = null;

    if (titleMatch && titleMatch[1]) {
        eventTitle = titleMatch[1];

        // remote " | Meetup" from title
        eventTitle = eventTitle.replace(' | Meetup', '').trim();

        // split on comma
        const titleParts = eventTitle.split(',');

        // only keep the last 4 parts
        titleParts.splice(0, titleParts.length - 4);

        // join back
        eventTitle = titleParts.join(',').trim();

        // set date
        eventDate = new Date(eventTitle).toISOString();
    } else {
        console.log('Title text not found');
    }

    const descriptionRegex = /<div id="event-details"[^>]*>.*?<div class="break-words">([\s\S]*?)<\/div>/;
    const descriptionMatch = eventPage.match(descriptionRegex);
    var eventDetails = '';

    if (descriptionMatch && descriptionMatch[1]) {
        const eventDetailsHtml = descriptionMatch[1];
        // Remove all HTML tags to get plain text
        const eventDetailsText = eventDetailsHtml.replace(/<\/?[^>]+(>|$)/g, "");
        eventDetails = eventDetailsText;
    } else {
        console.log('Event details text not found');
    }

    return {
        link: eventHref || '',
        title: eventH1 || '',
        details: eventDetails || '',
        date: eventDate || '',
    };
}