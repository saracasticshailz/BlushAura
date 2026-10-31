# Images, videos, and storefront motion

## Add product media

1. Open the admin panel, choose **Products**, and edit a product.
2. Keep the primary product image using the existing cover-image upload control.
3. Under **Images & reels**, select **Add image or video**. Repeat to add up to eight gallery items.
4. JPEG/PNG images (up to 5 MB) open the crop/white-padding editor. Output dimensions adjust automatically.
5. Upload MP4 or WebM videos up to 20 MB. For broad browser compatibility use H.264 MP4. A 9:16 source is ideal for reels; other aspect ratios fit inside the frame without cropping.
6. Edit each caption, use the arrows to reorder media, or remove it from the product's gallery. Save the product to publish changes.

Removing an item detaches it from the gallery. Uploaded bytes are not deleted by this operation; storage reclamation is not implemented.

## Customer experience

- The homepage hero rotates through featured product media and original illustrated scenes. It has previous/next buttons, slide selectors, and a pause control. Images advance every 5.5 seconds; videos finish before advancing.
- Hovering or focusing the carousel pauses slide advancement. Touch swipes and arrow keys navigate slides. Native video controls remain usable independently.
- Product details show the ordered image/video gallery and thumbnails. Existing product covers remain compatible and are not duplicated if already in the gallery.
- The **Little rituals. In motion.** section uses portrait 9:16 frames. Uploaded videos appear first, with product illustrations/images filling remaining featured cards. Each card opens the associated product.
- Videos start muted and inline when visible. Native controls provide playback, sound, seeking, and fullscreen where the browser supports them. Off-screen/hidden-tab videos pause. Browser autoplay restrictions can require pressing Play.
- Reduced-motion preferences disable automatic video/slideshow playback and decorative animations. All content and manual controls remain available.
- Body text, product captions, prices, and supporting text have been increased. Homepage sections reveal on scroll; cards have hover feedback, and the admin overview has a short staggered entrance.

## Storage and API

Flyway V3 adds an ordered JSONB `media` array to products. Items have `url`, `type` (`image` or `video`), and `caption`. Up to eight items are accepted. Old clients omitting `media` preserve an existing gallery when updating a product.

`POST /api/admin/media` remains authenticated and CSRF-protected. It validates image decoding or supported video container signatures. Product saves validate that every referenced upload exists and matches its declared media type. Only local `/api/media/{uuid}` references are accepted; arbitrary external media URLs are not accepted.

The public media endpoint returns a Spring `Resource`, enabling HTTP byte-range responses for video seeking. Media bytes remain in the same PostgreSQL database as customer/admin data. Videos count against free database storage and transfer quotas. There is no automatic video transcoding, compression, or subtitle-track editor; captions here are gallery descriptions, not timed subtitles.

## Verification

- Frontend tests cover cover/gallery ordering and compatibility, alongside Atomic Design and shared-workflow tests.
- Backend integration checks exercise gallery persistence, type/reference validation, invalid/oversized video rejection, and partial-content responses.
- Local browser QA uploaded an original four-second 360×640 H.264 test clip and two images, cropped the images, reordered the gallery, saved it, and verified decoded video playback and image navigation. The original local product was restored afterward. The generated fixtures are private local QA assets and are not included in the release.

References: [Spring MVC range requests](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-range.html), [browser autoplay behavior](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
