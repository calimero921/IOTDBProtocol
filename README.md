# IOTDB
API server for IOT project

IOT typology
-   public : device shared with everyone. No security provided, registering but no key are provided.
-   personal : device dedicated to a user. Few security is provided by a server-side generated shared key.
-   secured : secured device with asymetric key exchange between server and device.

device data scheme (Ajv format): 
```
{
    "$async": true,
    "type": "object",
    "properties": {
        "id": {"type": "string", "format": "uuid"},
        "manufacturer": {"type": "string"},
        "serial_number": {"type": "string"},
        "name": {"type": "string"},
        "creation_date": {"type": "integer"},
        "class": {"type": "string"},
        "software_version": {"type": "string"},
        "capabilities": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                     "type": {"enum": ["sensor", "switch", 'slave']},
                     "publish": {"type": "string"},
                     "subscribe": {"type": "string"},
                     "last_value": {"type": "string"}
                },
                "required": ["name", "type"]
            }
        },
        "key": {"type": "string"},
        "last_connexion_date": {"type": "integer"}
    },
    "required": ["id", "manufacturer", "serial_number", "name", "class", "software_version", "capabilities", "key"]
};
```

