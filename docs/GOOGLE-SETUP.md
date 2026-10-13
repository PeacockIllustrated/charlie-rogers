# Google Search Console and Business Profile

Brian Rankin asked for both on 12 October 2026. Each needs a Google account
that owns it, so they are set up by hand. The site side is done.

## Search Console

Use the Google account that should own the site's search data long term
(Brian's, or one shared with him, rather than a personal one).

1. Go to search.google.com/search-console and choose Add property.
2. Choose Domain and enter `charlierogers.art`. This covers www and every
   other address in one go.
3. Google shows a TXT record. Add it at the domain's DNS host (wherever
   charlierogers.art is registered), then press Verify. DNS can take a few
   minutes to an hour.
4. Once verified, open Sitemaps and submit `https://www.charlierogers.art/sitemap.xml`.
5. Under Settings, Users and permissions, add Brian (and Tom) as owners or
   full users.

If the DNS is awkward to reach, use a URL prefix property for
`https://www.charlierogers.art/` with the HTML tag method instead: copy only the
`content="..."` value from the tag Google shows, set it in Vercel as
`GOOGLE_SITE_VERIFICATION` for Production, redeploy, then press Verify. The
site writes the tag itself (`app/layout.tsx`).

## Business Profile

1. Go to business.google.com and choose Add business.
2. Name: decide whose business this is. Google only lists a business that
   meets customers at an address or delivers to a service area. A memorial
   website on its own does not qualify; the shop selling the book, cards and
   prints by post may, as a service-area business with no public address.
   Littlecroft Publishing, as the book's publisher, is the other candidate.
3. Category: something like Art gallery or Book publisher. Website:
   `https://www.charlierogers.art`.
4. Choose "No" to a location customers visit, and set the service area (for
   example Tyne and Wear, or the UK).
5. Google verifies by postcard, phone, or video. The verification goes to
   whoever runs the business, so Brian will likely need to do this step.

## Not yet done

The shop pages carry `noindex` (`app/(public)/shop`), set while nothing in the
shop was priced. Now that the prints and cards have prices, it is worth
deciding whether the shop should appear in search before submitting the
sitemap.
