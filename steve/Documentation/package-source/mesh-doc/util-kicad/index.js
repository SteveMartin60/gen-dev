//..............................................................................

const kicadUtils = require('./kicad-stuff');
const svgParser  = require('./svg-parser' );

require ('mesh-base');


//..............................................................................

//..............................................................................
function doStuff()
{
    console.time   ('Doing KiCad Stuff Completed            ');

    console.log    ('Doing KiCad Stuff...                   ');

    svgParser.parseSVG();

    kicadUtils.constructKiCadSymbolLibrary();

    console.log    ('---------------------------------------');
    console.timeEnd('Doing KiCad Stuff Completed            ');
    console.log    ('---------------------------------------');
}
//..............................................................................

//..............................................................................
doStuff();
//..............................................................................

//..............................................................................
