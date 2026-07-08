<?php

/**
 * Routes + controller React API provided by MelisTipimail (native tool).
 *
 * These routes ADD to the child_routes of `melis-react-api` (the generic bridge).
 * Modularity: the tool's controller/routes/invokable live in THIS module, not in
 * MelisReactApi. Laminas\Stdlib\ArrayUtils::merge() merges the configs (via
 * MelisTipimail\Module::getConfig()). The UI is delivered by the module's React brick
 * (public/ui-react/), which talks to these endpoints instead of embedding an iframe.
 *
 * All endpoints are gated by the tool melisKey (`melis_tool_tipimail_webaccess`) and
 * return the standard `{success, data, error}` envelope. They proxy the public Tipimail
 * REST API (https://api.tipimail.com/v1/) via MelisTipimail\Service\MelisTipimailApiService.
 *
 *   GET  /melis/react-api/tipimail/settings          current credentials (apiUser + hasKey)
 *   POST /melis/react-api/tipimail/settings/save     save credentials
 *   GET  /melis/react-api/tipimail/test              validate credentials (GET account)
 *   GET  /melis/react-api/tipimail/stats             account credits + statistics/sends (KPIs)
 *   GET  /melis/react-api/tipimail/messages          statistics/messages (message log)
 */

$defaults = static function (string $action): array {
    return [
        '__NAMESPACE__' => 'MelisTipimail\Controller',
        'controller'    => 'MelisReactApiTipimail',
        'action'        => $action,
    ];
};

$seg = static function (string $route, string $action) use ($defaults): array {
    return ['type' => 'Segment', 'options' => ['route' => $route, 'defaults' => $defaults($action)]];
};

return [
    'router' => [
        'routes' => [
            'melis-backoffice' => [
                'child_routes' => [
                    'melis-react-api' => [
                        'child_routes' => [
                            // ⚠ literal segments (/settings/save) declared before the plain /settings.
                            'tipimail-settings-save' => $seg('/tipimail/settings/save[/]', 'settingsSave'),
                            'tipimail-settings-get'  => $seg('/tipimail/settings[/]', 'settingsGet'),
                            'tipimail-test'          => $seg('/tipimail/test[/]', 'test'),
                            'tipimail-stats'         => $seg('/tipimail/stats[/]', 'stats'),
                            'tipimail-messages'      => $seg('/tipimail/messages[/]', 'messages'),
                        ],
                    ],
                ],
            ],
        ],
    ],

    'controllers' => [
        'invokables' => [
            'MelisTipimail\Controller\MelisReactApiTipimail' => \MelisTipimail\Controller\MelisReactApiTipimailController::class,
        ],
    ],
];
