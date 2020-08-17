<?php

return [
    'plugins' => [
        'melisTipimail' => [
            'conf' => [
                // user rights exclusions
                'rightsDisplay' => 'none',
            ],
            'tools' => [
                'melis_tipmail_tool' => [
                    'config' => [
                        'url' => 'https://app.tipimail.com/#/access/login'
                    ],
                ],
            ],
        ],
    ],
];