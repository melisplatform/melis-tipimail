<?php

/**
 * Routes + controller React API provided by MelisTipimail.
 *
 * These routes ADD to the child_routes of `melis-react-api` (the generic bridge).
 * Modularity: the tool's controller/routes/invokable live in THIS module, not in
 * MelisReactApi. Laminas\Stdlib\ArrayUtils::merge() merges the configs (via
 * MelisTipimail\Module::getConfig()).
 *
 * The tool is a single screen (see ui-react/src/TipimailPage.tsx): it asks this one
 * endpoint for the configured Tipimail URL and whether it can be embedded in an iframe.
 *
 *   GET /melis/react-api/tipimail/webaccess-url   { url, canFrame }
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
                            'tipimail-webaccess-url' => $seg('/tipimail/webaccess-url[/]', 'webaccessUrl'),
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
