<?php

/**
 * Capacités d'outils — droits avancés du back-office React (module MelisTipimail).
 *
 * Même convention que melis-commerce/config/react.capabilities.php : déclaration par `melisKey`,
 * lue par MelisReactApi\Service\Capabilities via la clé mergée `melisReactToolCapabilities`.
 * Pilote l'affichage des cases à cocher dans l'onglet Rights (RightsTreeView).
 * Mergé dans MelisTipimail\Module::getConfig().
 *
 * L'outil Tipimail (natif React) a 3 onglets : Dashboard (KPIs, lecture seule), Message log
 * (lecture seule) et Connection settings (édition de la config API/web). Chaque onglet = UNE case
 * (accès à l'onglet) — pas de sous-actions redondantes (un onglet = une seule fonction ici). Les
 * `label` sont des CLÉS de traduction Melis (`tr_...`, cf. language/*.interface.php), résolues dans
 * la locale courante côté serveur.
 *
 * Application (enforcement) : MelisReactApiTipimailController gate chaque endpoint par la clé
 * d'onglet correspondante (`dashboard` → statsAction, `messages` → messagesAction, `settings` →
 * settings save/test) via CapabilityGuardTrait. La brique masque l'onglet dont la clé est refusée.
 */

return [
    'melisReactToolCapabilities' => [
        'melis_tool_tipimail_webaccess' => [
            'tabs' => [
                // Dashboard : indicateurs d'envoi (lecture seule).
                ['key' => 'dashboard', 'label' => 'tr_melis_tipimail_tab_dashboard'],
                // Message log : journal des messages (lecture seule).
                ['key' => 'messages',  'label' => 'tr_melis_tipimail_tab_messages'],
                // Connection settings : configuration API/web (édition + test de connexion).
                ['key' => 'settings',  'label' => 'tr_melis_tipimail_tab_settings'],
            ],
        ],
    ],
];
