<?php

/**
 * Tool capabilities (advanced-rights checkboxes in the Rights tab).
 *
 * MelisTipimail is a single-screen tool (see ui-react/src/TipimailPage.tsx) gated only by
 * the base tool melisKey (`melis_tool_tipimail_webaccess`) — no sub-action granularity, same
 * as the legacy tool's `rightsDisplay: none` (config/app.tools.php). Nothing to declare here.
 */

return [
    'melisReactToolCapabilities' => [],
];
