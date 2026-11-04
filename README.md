# Local portfolio prototype

Requires Node.js 24+. No dependencies or build step. Run `npm start`, then open http://127.0.0.1:3000. Run `npm test` for contact handler tests. PORT can override 3000; the server binds only to localhost. Environment files are not loaded automatically.

Content lives in public/index.html and public/cases/*.html; styles and behavior are in public/styles.css and public/app.js. All three projects are explicitly demonstration concepts. No client results or identity have been supplied. Fonts use the existing system stack; no remote font request is needed.

## Contact delivery

Delivery is deliberately disabled. server.mjs constructs the handler without a deliver function, so valid submissions return 503 and never display success. No submissions are stored or logged by this application. Inputs stay in the browser form after a failure. Tests inject a delivery function; they do not send real messages. There are no supported provider credentials or delivery environment settings yet. Never place secrets in public/.

## Before publication

Obtain owner identity, confirmed contact channel, approved text and project materials. Select a delivery provider and implement the deliver adapter in server.mjs; require provider confirmation before resolving, and verify actual receipt. Define hosting, retention, lawful processing information and operator details before adding a legal page or collecting real submissions. Review consent requirements for the chosen setup. Do not publish fictional policy text.

Choose the domain and hosting; set canonical and absolute Open Graph image URLs, provide a raster social preview for platform compatibility, and generate the domain-specific sitemap. Testing is blocked from indexing by robots.txt, page metadata and the server X-Robots-Tag. Remove all three restrictions only for the approved production release. robots.txt is not access control: keep prelaunch hosting private. Configure HTTPS, security headers, proxy-aware abuse protection and delivery monitoring on the selected host. The included server is a local preview, not a production hosting configuration.

Complete browser/device accessibility and performance review listed in docs/verification.md, then verify public HTTPS, metadata, indexing rules and actual form receipt after deployment. No deployment has been performed.
