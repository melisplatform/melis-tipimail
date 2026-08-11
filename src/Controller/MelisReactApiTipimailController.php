<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 */

namespace MelisTipimail\Controller;

use MelisCore\Controller\MelisAbstractActionController;
use Laminas\Http\Response as HttpResponse;

/**
 * React-API for the Tipimail tool (single screen — see TipimailPage.tsx).
 *
 * The tool is essentially a bookmark to the Tipimail web app (config/app.tools.php ->
 * melisTipimail.tools.melis_tipmail_tool.config.url). Whether that app can be embedded in
 * an iframe is decided by ITS OWN X-Frame-Options / CSP frame-ancestors response headers —
 * headers on a cross-origin response can't be read from our own JS (same-origin policy
 * blocks reading into a cross-origin iframe, and the iframe's `load` event fires the same
 * way whether the navigation succeeded or was blocked by the browser), so the only reliable
 * way to know in advance is to ask Tipimail directly, from PHP, and read the headers here.
 *
 *   GET /melis/react-api/tipimail/webaccess-url   { url, canFrame }
 */
class MelisReactApiTipimailController extends MelisAbstractActionController
{
    /** Rights key = the tool's menu melisKey (app.interface.php). */
    private const MELIS_KEY = 'melis_tool_tipimail_webaccess';

    public function webaccessUrlAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $config = $this->getServiceManager()->get('MelisCoreConfig');
            $tool   = (array) $config->getItem('melisTipimail/tools/melis_tipmail_tool/config');
            $url    = (string) ($tool['url'] ?? '');

            return $this->ok([
                'url'      => $url,
                'canFrame' => $url !== '' && $this->canBeFramed($url),
            ]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    /**
     * HEAD-probes the URL and inspects the response for the headers browsers use to refuse
     * framing. Fails CLOSED (returns false) on any network error/timeout — better to show the
     * "open in a new tab" fallback than to embed an iframe that may still get blocked.
     */
    private function canBeFramed(string $url): bool
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        $raw   = curl_exec($ch);
        $errno = curl_errno($ch);
        curl_close($ch);

        if ($errno || $raw === false) {
            return false;
        }

        if (preg_match('/^X-Frame-Options:\s*(.+)$/im', (string) $raw, $m)) {
            $v = strtolower(trim($m[1]));
            if ($v === 'deny' || $v === 'sameorigin' || str_starts_with($v, 'allow-from')) {
                return false;
            }
        }
        // A frame-ancestors CSP directive without a wildcard will list origins Tipimail knows
        // about — never ours — so any such directive blocks us too.
        if (preg_match('/^Content-Security-Policy:\s*(.+)$/im', (string) $raw, $m)
            && preg_match('/frame-ancestors\s+([^;\r\n]+)/i', $m[1], $fa)
            && !str_contains($fa[1], '*')
        ) {
            return false;
        }

        return true;
    }

    private function isAuthenticated(): bool
    {
        return $this->getServiceManager()->get('MelisCoreAuth')->hasIdentity();
    }

    private function denyUnlessAccess(): ?HttpResponse
    {
        if (!$this->isAuthenticated()) {
            return $this->jsonResponse(['success' => false, 'error' => 'Unauthenticated'], 401);
        }
        try {
            if (!$this->getServiceManager()->get('MelisCoreRights')->canAccess(self::MELIS_KEY)) {
                return $this->jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
            }
        } catch (\Throwable) {}
        return null;
    }

    private function ok($data, int $status = 200): HttpResponse
    {
        return $this->jsonResponse(['success' => true, 'data' => $data], $status);
    }

    private function jsonResponse(array $data, int $status = 200): HttpResponse
    {
        /** @var HttpResponse $response */
        $response = $this->getResponse();
        $response->setStatusCode($status);
        $response->getHeaders()->addHeaders([
            'Content-Type'           => 'application/json; charset=utf-8',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setContent(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $response;
    }

    private function errorResponse(\Throwable $e, int $status = 500): HttpResponse
    {
        return $this->jsonResponse([
            'success' => false,
            'error'   => $e->getMessage(),
            'file'    => basename($e->getFile()) . ':' . $e->getLine(),
        ], $status);
    }
}
