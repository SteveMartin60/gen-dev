//..............................................................................

const
    {
        light_level,
        temperature_internal_enclosure,
    } = require('./device-endpoints');

//..............................................................................
const uh001 =
{
    id: 'mesh-uh001',
    device_model : 'mesh-uh001',
    endpoints:
    {
        light_level,
        temperature_internal_enclosure,
    }
};
//..............................................................................

//..............................................................................
const exports =
    [
        uh001
    ];
//..............................................................................

module.exports = exports;
