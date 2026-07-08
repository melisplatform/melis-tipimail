<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 */

namespace MelisTipimail\Service;

/**
 * Thin REST client for the public Tipimail API (https://api.tipimail.com/v1/).
 *
 * Auth is header-based: X-Tipimail-ApiUser (SMTP user) + X-Tipimail-ApiKey (API key).
 * Mirrors the official tipimail/tipimail-php-library base client (getData/postData).
 * Business logic (which endpoints, how the JSON is shaped for the UI) stays in the
 * React-API controller; this class only performs the authenticated HTTP calls.
 */
class MelisTipimailApiService
{
    private const BASE = 'https://api.tipimail.com/v1/';

    private string $apiUser;
    private string $apiKey;

    public function __construct(?string $apiUser, ?string $apiKey)
    {
        $this->apiUser = trim((string) $apiUser);
        $this->apiKey  = trim((string) $apiKey);
    }

    public function isConfigured(): bool
    {
        return $this->apiUser !== '' && $this->apiKey !== '';
    }

    /** GET <path> (e.g. "account", "account/credits"). */
    public function get(string $path): array
    {
        return $this->request('GET', $path, null);
    }

    /** POST <path> with a JSON body (e.g. "statistics/sends"). */
    public function post(string $path, array $body): array
    {
        return $this->request('POST', $path, $body);
    }

    /**
     * @return array{ok:bool,status:int,data:mixed,error:?string}
     */
    private function request(string $method, string $path, ?array $body): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => false, 'status' => 0, 'data' => null, 'error' => 'not_configured'];
        }

        $headers = [
            'Cache-control: no-cache',
            'Content-Type: application/json',
            'X-Tipimail-ApiUser: ' . $this->apiUser,
            'X-Tipimail-ApiKey: ' . $this->apiKey,
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, self::BASE . ltrim($path, '/'));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        if ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode((object) ($body ?? [])));
        }

        $raw    = curl_exec($ch);
        $errno  = curl_errno($ch);
        $err    = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($errno) {
            return ['ok' => false, 'status' => 0, 'data' => null, 'error' => 'network: ' . $err];
        }

        $data = json_decode((string) $raw, true);

        if ($status < 200 || $status >= 300) {
            // Tipimail returns { code, message } style errors; surface the message.
            $msg = is_array($data) ? ($data['message'] ?? $data['error'] ?? null) : null;
            if ($status === 401 || $status === 403) {
                $msg = $msg ?: 'invalid_credentials';
            }
            return ['ok' => false, 'status' => $status, 'data' => $data, 'error' => $msg ?: ('http_' . $status)];
        }

        return ['ok' => true, 'status' => $status, 'data' => $data, 'error' => null];
    }
}
