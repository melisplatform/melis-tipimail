<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 */

namespace MelisTipimail\Controller;

use MelisCore\Controller\MelisAbstractActionController;
use MelisReactApi\Controller\CapabilityGuardTrait;
use MelisTipimail\Service\MelisTipimailApiService;
use Laminas\Http\Response as HttpResponse;

/**
 * React-API for the NATIVE Tipimail tool (no iframe): a JSON bridge over the public
 * Tipimail REST API (https://api.tipimail.com/v1/). Routes live in config/react-api.php
 * (merged into melis-react-api's child_routes) — modular: the tool's controller/routes
 * ship in THIS module, not in MelisReactApi.
 *
 * Endpoints (all under /melis/react-api/tipimail, gated by the tool melisKey):
 *   GET  /settings                     current credentials (apiUser + hasKey; the key is NEVER returned)
 *   POST /settings/save                save apiUser/apiKey (blank key keeps the stored one)
 *   GET  /test                         validate credentials (GET account)
 *   GET  /stats?dateBegin&dateEnd      account credits + statistics/sends → KPI cards
 *   GET  /messages?page&pageSize&…     statistics/messages → message log
 *
 * Business logic stays in Melis: the HTTP calls live in MelisTipimailApiService; this
 * controller shapes the JSON ({success,data,error}) for the React brick.
 */
class MelisReactApiTipimailController extends MelisAbstractActionController
{
    // Advanced-rights guard (denyUnlessCan) keyed by self::MELIS_KEY — enforces the
    // per-tab capabilities declared in config/react.capabilities.php (default-allow, admin bypass).
    use CapabilityGuardTrait;

    /** Rights key = the tool's menu melisKey (app.interface.php). */
    private const MELIS_KEY = 'melis_tool_tipimail_webaccess';

    // ════════════════════════════════════════════════════════════════════════
    //  Settings (credentials)
    // ════════════════════════════════════════════════════════════════════════

    public function settingsGetAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        try {
            $row = $this->loadConfig();
            return $this->ok([
                'id'      => (int) ($row['tpc_id'] ?? 0),
                'apiUser' => (string) ($row['tpc_api_user'] ?? ''),
                'hasKey'  => trim((string) ($row['tpc_api_key'] ?? '')) !== '',
            ]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function settingsSaveAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($deny = $this->denyUnlessCan('settings')) { return $deny; }
        try {
            $body    = json_decode($this->getRequest()->getContent(), true) ?? [];
            $apiUser = trim((string) ($body['apiUser'] ?? ''));
            $apiKey  = trim((string) ($body['apiKey'] ?? ''));

            if ($apiUser === '') {
                return $this->bad('API user is required.');
            }
            if (mb_strlen($apiUser) > 255 || mb_strlen($apiKey) > 255) {
                return $this->bad('A field exceeds 255 characters.');
            }

            $db  = $this->db();
            $row = $this->loadConfig();
            $id  = (int) ($row['tpc_id'] ?? 0);

            // A blank key on an existing row means "keep the stored key" (it is masked on read).
            $keepKey = $apiKey === '' && $id > 0 && trim((string) ($row['tpc_api_key'] ?? '')) !== '';
            if ($apiKey === '' && !$keepKey) {
                return $this->bad('API key is required.');
            }

            if ($id > 0) {
                if ($keepKey) {
                    $db->query('UPDATE melis_tipimail_config SET tpc_api_user = ? WHERE tpc_id = ?', [$apiUser, $id]);
                } else {
                    $db->query('UPDATE melis_tipimail_config SET tpc_api_user = ?, tpc_api_key = ? WHERE tpc_id = ?', [$apiUser, $apiKey, $id]);
                }
            } else {
                $db->query('INSERT INTO melis_tipimail_config (tpc_api_user, tpc_api_key) VALUES (?, ?)', [$apiUser, $apiKey]);
                $id = (int) iterator_to_array($db->query('SELECT LAST_INSERT_ID() AS id', []))[0]['id'];
            }
            return $this->ok(['id' => $id, 'apiUser' => $apiUser, 'hasKey' => true]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    public function testAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($deny = $this->denyUnlessCan('settings')) { return $deny; }
        try {
            $api = $this->api();
            if (!$api->isConfigured()) {
                return $this->ok(['configured' => false, 'connected' => false]);
            }
            $res = $api->get('account');
            return $this->ok([
                'configured' => true,
                'connected'  => $res['ok'],
                'error'      => $res['ok'] ? null : $res['error'],
                'account'    => $res['ok'] ? $res['data'] : null,
            ]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Dashboard KPIs
    // ════════════════════════════════════════════════════════════════════════

    public function statsAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($deny = $this->denyUnlessCan('dashboard')) { return $deny; }
        try {
            $api = $this->api();
            if (!$api->isConfigured()) {
                return $this->ok(['configured' => false]);
            }

            [$dateBegin, $dateEnd] = $this->dateRange();

            $credits = $api->get('account/credits');
            $sends   = $api->post('statistics/sends', [
                'dateBegin' => $dateBegin,
                'dateEnd'   => $dateEnd,
                'froms'     => null,
                'tags'      => null,
                'apiKeys'   => null,
            ]);

            if (!$sends['ok']) {
                return $this->jsonResponse(['success' => false, 'error' => $sends['error'], 'configured' => true], 502);
            }

            $s = (array) ($sends['data'] ?? []);
            return $this->ok([
                'configured' => true,
                'credits'    => $credits['ok'] ? $credits['data'] : null,
                'kpis'       => [
                    'requested'    => (int) ($s['requested'] ?? 0),
                    'delivered'    => (int) ($s['delivered'] ?? 0),
                    'open'         => (int) ($s['open'] ?? 0),
                    'opener'       => (int) ($s['opener'] ?? 0),
                    'click'        => (int) ($s['click'] ?? 0),
                    'clicker'      => (int) ($s['clicker'] ?? 0),
                    'hardbounced'  => (int) ($s['hardbounced'] ?? 0),
                    'softbounced'  => (int) ($s['softbounced'] ?? 0),
                    'unsubscribed' => (int) ($s['unsubscribed'] ?? 0),
                    'complaint'    => (int) ($s['complaint'] ?? 0),
                ],
                'raw' => $s,
            ]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Message log
    // ════════════════════════════════════════════════════════════════════════

    public function messagesAction(): HttpResponse
    {
        if ($deny = $this->denyUnlessAccess()) { return $deny; }
        if ($deny = $this->denyUnlessCan('messages')) { return $deny; }
        try {
            $api = $this->api();
            if (!$api->isConfigured()) {
                return $this->ok(['configured' => false, 'items' => [], 'total' => 0]);
            }

            $page     = max(1, (int) $this->params()->fromQuery('page', 1));
            $pageSize = min(200, max(1, (int) $this->params()->fromQuery('pageSize', 25)));
            $search   = trim((string) $this->params()->fromQuery('search', ''));
            [$dateBegin, $dateEnd] = $this->dateRange();

            $res = $api->post('statistics/messages', [
                'page'      => $page,
                'pageSize'  => $pageSize,
                'dateBegin' => $dateBegin,
                'dateEnd'   => $dateEnd,
                'froms'     => null,
                'tags'      => null,
                'apiKeys'   => null,
            ]);

            if (!$res['ok']) {
                return $this->jsonResponse(['success' => false, 'error' => $res['error'], 'configured' => true], 502);
            }

            $d     = (array) ($res['data'] ?? []);
            $items = [];
            foreach ((array) ($d['messages'] ?? []) as $m) {
                $m   = (array) $m;
                $msg = (array) ($m['msg'] ?? []);
                $row = [
                    'id'            => (string) ($m['id'] ?? ''),
                    'createdDate'   => $m['createdDate'] ?? null,
                    'lastStateDate' => $m['lastStateDate'] ?? null,
                    'state'         => (string) ($m['lastState'] ?? ''),
                    'from'          => (string) ($msg['from'] ?? ''),
                    'email'         => (string) ($msg['email'] ?? ''),
                    'subject'       => (string) ($msg['subject'] ?? ''),
                    'size'          => (int)    ($msg['size'] ?? 0),
                ];
                // best-effort client-agnostic search over recipient/subject on the current page
                if ($search !== '') {
                    $hay = mb_strtolower($row['email'] . ' ' . $row['subject'] . ' ' . $row['from']);
                    if (mb_strpos($hay, mb_strtolower($search)) === false) {
                        continue;
                    }
                }
                $items[] = $row;
            }

            return $this->ok([
                'configured' => true,
                'total'      => (int) ($d['total'] ?? count($items)),
                'page'       => $page,
                'pageSize'   => $pageSize,
                'items'      => $items,
            ]);
        } catch (\Throwable $e) { return $this->errorResponse($e); }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Helpers
    // ════════════════════════════════════════════════════════════════════════

    private function db()
    {
        return $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
    }

    private function loadConfig(): array
    {
        $rows = iterator_to_array($this->db()->query(
            'SELECT tpc_id, tpc_api_user, tpc_api_key FROM melis_tipimail_config ORDER BY tpc_id LIMIT 1', []
        ));
        return $rows ? (array) $rows[0] : [];
    }

    private function api(): MelisTipimailApiService
    {
        $row = $this->loadConfig();
        return new MelisTipimailApiService(
            $row['tpc_api_user'] ?? null,
            $row['tpc_api_key'] ?? null
        );
    }

    /**
     * Resolve the dateBegin/dateEnd query params (unix seconds) — null when absent so
     * the Tipimail API applies its own default window.
     * @return array{0:?int,1:?int}
     */
    private function dateRange(): array
    {
        $b = $this->params()->fromQuery('dateBegin', '');
        $e = $this->params()->fromQuery('dateEnd', '');
        return [
            $b !== '' ? (int) $b : null,
            $e !== '' ? (int) $e : null,
        ];
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

    private function bad(string $msg): HttpResponse
    {
        return $this->jsonResponse(['success' => false, 'error' => $msg], 400);
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
