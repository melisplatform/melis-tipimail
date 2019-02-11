# melis-tipimail

MelisTipimail is the module that allow user access TipiMail inside the melisplatform as a module.

## Getting Started

These instructions will get you a copy of the project up and running on your machine.

### Prerequisites

You will need to install melisplatform/melis-core in order to have this module running.
This will automatically be done when using composer.

### Installing

Run the composer command:
```
    {
        "require": {
            "melisplatform/melis-tipimail": "dev-master"
        },
        "repositories": [
            {
                "type": "git",
                "url": "https://github.com/melisplatform/melis-tipimail"
            }
        ]
    }
```
### Configuration

Inside the melis-tipimail/config/app.tools.php you can configure the url of which the tool's iframe is being directed.
```
    'plugins' => array(
        'melisTipimail' => array(
            'tools' => array(
                'melis_tipmail_tool' => array(
                    'config' => array(
                        'url' => 'https://app.tipimail.com/#/access/login'
                    ),
                ),
            ),
        ),
    ),
```

## Tools & Elements provided

* Tipimail Tool

## Authors

* **Melis Technology** - [www.melistechnology.com](https://www.melistechnology.com/)

See also the list of [contributors](https://github.com/melisplatform/melis-tipimail/contributors) who participated in this project.


## Contributing

Please note that this project is released with a [Contributor Code of Conduct](http://contributor-covenant.org/version/1/2/0/).
By participating in this project you agree to abide by its terms.

Feel free to fork the project, create a feature branch, and send us a pull request!