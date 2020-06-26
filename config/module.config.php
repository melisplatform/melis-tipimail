<?php

/**
 * Melis Technology (http://www.melistechnology.com]
 *
 * @copyright Copyright (c] 2015 Melis Technology (http://www.melistechnology.com]
 *
 */

return [
    'router' => [
        'routes' => [
            'melis-backoffice' => [
                'type'    => 'Segment',
                'options' => [
                    'route'    => '/melis[/]',
                ],
                'child_routes' => [
                    'applicationMelisTipiMail' => [
                        'type'    => 'Literal',
                        'options' => [
                            'route'    => 'MelisTipimail',
                            'defaults' => [
                                '__NAMESPACE__' => 'MelisTipimail\Controller',
                                'controller'    => 'Index',
                                'action'        => 'index',
                            ],
                        ],
                        'may_terminate' => true,
                        'child_routes' => [
                            'default' => [
                                'type'    => 'Segment',
                                'options' => [
                                    'route'    => '/[:controller[/:action]]',
                                    'constraints' => [
                                        'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                        'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                                    ],
                                    'defaults' => [
                                    ],
                                ],
                            ],
                        ],
                    ], 
                ], 
            ], 
        ],
    ],
    'translator' => [
        'locale' => 'en_EN',
    ],
    'service_manager' => [
        'invokables' => [
        ],
    ],
    'controllers' => [
        'invokables' => [
            'MelisTipimail\Controller\Tipimail' => \MelisTipimail\Controller\TipimailController::class,
        ],
    ],
    'view_manager' => [
        'doctype' => 'HTML5',
        'template_map' => [
        ],
        'template_path_stack' => [
            __DIR__ . '/../view',
        ],
        'strategies' => [
            'ViewJsonStrategy',
        ],
    ],
];
