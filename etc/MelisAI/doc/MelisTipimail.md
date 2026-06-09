# MelisTipimail — AI & developer guide

> **Module:** `melisplatform/melis-tipimail` · **Namespace:** `MelisTipimail` · type `melisplatform-module`
> **What it is:** a **thin back-office shortcut** that embeds the external **Tipimail** web app (a transactional
> email-delivery service) inside the Melis admin via an **iframe**. It is essentially a built-in bookmark: it
> opens Tipimail’s own login/dashboard in a Melis tab. It does **not** send email itself and adds no database,
> service or model. No screenshots are bundled with this doc.

---

## 0. What it is — and what it is *not*

- **Is:** one BO tool whose single screen is an `<iframe>` pointing at a configurable Tipimail URL
  (default `https://app.tipimail.com/#/access/login`). README: *“the module that allows user access TipiMail
  inside the melisplatform as a module.”*
- **Is *not*** a mail transport. Installing it does **not** route MelisCore’s outgoing mail through Tipimail —
  it just shows you Tipimail’s website. For modules that actually *send* (e.g. the SMS/email senders), see
  their own docs; this one is a viewer only.

Depends only on **`melisplatform/melis-core`** (`^5.2`) — it needs the BO shell, the config service and the
rights check. See [`MelisCore`](../../../melis-core/etc/MelisAI/doc/MelisCore.md).

> **Honest caveat — the API config is inert.** `config/app.interface.php` defines a `tipimail_conf` block with
> empty **API** (`serverURI`, `username`, `apikey`, `apiVersion '1.8'`, `urlWS '/Api/'`, `userAgent`) and
> **web** (`user`/`password`) placeholders. **No code in this module reads them** — the controller only uses
> the iframe `url`. Treat that block as scaffolding for a future/external API integration, not as a working
> feature here.

---

# PART A — Functional guide

## A1. Using the tool

In the left menu under **MelisMarketing → Tipimail** (icon `fa-envelope`) there is a single **Tipimail** entry.
Opening it shows the Tipimail web application embedded in the page, where you log in and manage your Tipimail
account exactly as you would on their site — just without leaving Melis.

Access is gated by the back-office rights system: a user who lacks the `melis_tipmail_tool` right sees a
“no access” message instead of the embed.

## A2. How do I…?

- **…point it at a different Tipimail URL (or a self-hosted login)?** Edit `config/app.tools.php` →
  `plugins.melisTipimail.tools.melis_tipmail_tool.config.url`. The controller reads exactly this value.
- **…actually send transactional email through Tipimail?** Not with this module — it only embeds the web app.
  You would integrate Tipimail’s API separately (the empty `tipimail_conf` API block hints at where credentials
  would live, but nothing here consumes them).

---

# PART B — Technical reference

## B1. The whole module, end to end

There is one controller and one view; no service, table or model.

- **Menu** (`config/app.interface.php`): under `meliscore_leftmenu → melismarketing_toolstree_section →
  meliscms_tools_section` (name `tr_melis_tipimail`, icon `fa-envelope`), the tool `Tipimail_tool_access`
  (melisKey `melis_tool_tipimail_webaccess`) **forwards** to `MelisTipimail / Tipimail / webaccess`.
- **Controller** `TipimailController::webaccessAction()` (`const TOOL_KEY = 'melis_tipmail_tool'`):
  1. reads the URL from `MelisCoreConfig->getItem('melisTipimail/tools/melis_tipmail_tool/config')['url']`;
  2. checks `MelisCoreRights->canAccess('melis_tipmail_tool')` — if denied, prepares the
     `tr_tool_no_access` translation;
  3. passes `$view->url` to the view.
- **View** `view/melis-tipimail/tipimail/webaccess.phtml` — a single element:
  ```php
  <iframe width="100%" class="melis-tipimail" onload="load();" src="<?php echo $this->url; ?>"></iframe>
  ```
- **JS** `public/js/page/tipimail.js` (+ built `bundle.js`) — front-side iframe handling (the `load()` hook).
- **`Module.php`** — boilerplate only (`ModuleRouteListener`, config/autoloader, `createTranslations`). It
  attaches **no** event listeners and registers **no** mail transport.

## B2. Configuration

| Where | Key | Purpose |
|---|---|---|
| `config/app.tools.php` | `melisTipimail.tools.melis_tipmail_tool.config.url` | the **iframe URL** (default `https://app.tipimail.com/#/access/login`) — the only setting the code uses. |
| `config/app.interface.php` | `melisTipimail.datas.tipimail_conf.default.{api,web}` | **unused** API/web credential placeholders (see §0 caveat). |

> **Naming quirk (verbatim):** the tool key is `melis_tipmail_tool` and `getTool()` calls
> `setMelisToolKey('MelisTipmail', 'melis_tipmail_tool')` — both spelled **Tipmail** (no second “i”), unlike the
> module name `MelisTipimail`. Match the existing strings exactly when referencing rights/config.

## B3. Code map

```
config/
  app.interface.php   ← left-menu tool (MelisMarketing → Tipimail) + inert tipimail_conf block
  app.tools.php       ← the configurable iframe URL
  module.config.php   ← route + controller registration
src/
  Controller/TipimailController.php   ← webaccessAction(): read url, rights-check, render iframe
  Module.php                          ← boilerplate (no listeners, no transport)
view/melis-tipimail/tipimail/webaccess.phtml  ← the <iframe>
public/js/page/tipimail.js                    ← iframe load handling
```

---

*No screenshots are bundled with this doc. The only screen is the embedded Tipimail web app (external content).
If you capture the tool, save the PNG under `./images/`, reference it 1:1 from Part A, and add a Screenshot
index here.*
