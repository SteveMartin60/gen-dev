//..............................................................................

const generatorSVG = require('./generator-svg');

//..............................................................................

//..............................................................................
function doStuff()
{
    console.time   ('SVG Image Generation Completed!        ');

    console.log    ('Generating SVG Images...               ');

    generatorSVG.generateImagesSVG();

    console.log    ('---------------------------------------');
    console.timeEnd('SVG Image Generation Completed!        ');
    console.log    ('---------------------------------------');
}
//..............................................................................

//..............................................................................
doStuff();
//..............................................................................

//..............................................................................