//..............................................................................console.time    ('Intermediate Generator Modules Loaded  ');const {docUtils, docConstants} = require('mesh-doc-utils');const {docJSDocMarkdown} = require('mesh-doc-gen');const {jsDocToMarkdown} = docJSDocMarkdown;const{    delimiters,    directoryNames,    fileTypes,    fileExtensions,    fileNames,    languages,    stringsUtil,} = docConstants;const{    copyFolderRecursiveSync,    getUniqueArray,    findFiles,    loadTextFileIntoString,    replaceAll,    writeFileToDisk,} = docUtils;const {path, util} = cxq;const{    CRLF,    replaceFileExtension,} = util;console.timeEnd('Intermediate Generator Modules Loaded  ');//..............................................................................//..............................................................................var templateData    = '';var jsFileArray     = [];var contentBlocks   = [];const kindStaticMethod    = 'static method';const kindStaticProperty  = 'static property';const kindGlobalNamespace = 'global namespace';const kindStaticNamespace = 'static namespace';//..............................................................................//..............................................................................process.on('unhandledRejection', (reason, p) =>{    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);    // application specific logging, throwing an error, or other logic here});//..............................................................................//..............................................................................function getTemplateData(source){    console.time   ('Content Template Data Generated        ');    console.log    ('Getting Content Template Data...       ');    console.time   ('getTemplateDataSync');    templateData = jsDocToMarkdown.getTemplateDataSync({files: source});    console.timeEnd('getTemplateDataSync');    console.log    ('---------------------------------------');    console.timeEnd('Content Template Data Generated        ');    console.log    ('---------------------------------------');}//..............................................................................//..............................................................................function getFilenameArray(){    console.time   ('Get File and Method Names Completed!   ');    console.log    ('Getting File and Method Names...       ');    var jsDocObject =　{jsFilename : [], contentFilename : [], identifiers : []};    var jsFileNames = [];    for (var i = 0; i < templateData.length; i++)    {        jsFileNames.push(templateData[i].meta.filename);    }    jsFileNames = getUniqueArray(jsFileNames);    for (i = 0; i < jsFileNames.length; i++)    {        jsDocObject.jsFilename = jsFileNames[i];        jsDocObject.contentFilename = replaceFileExtension(jsDocObject.jsFilename, '.md');        for (var j = 0; j < templateData.length; j++)        {            var identifier = templateData[j];            // console.log('identifier.name:',  identifier.name);            if (jsDocObject.jsFilename === identifier.meta.filename)            {                jsDocObject.identifiers.push(identifier.name);            }        }        jsFileArray.push(jsDocObject);        jsDocObject =　{contentFilename : [], identifiers : []};    }    console.log    ('---------------------------------------');    console.timeEnd('Get File and Method Names Completed!   ');    console.log    ('---------------------------------------');}//..............................................................................//..............................................................................function getContentBlockProperties(contentBlock){    var block = {lines : []};    block.singleLine = contentBlock;    block.lines      = contentBlock.split('\n');    block.name       = block.lines[0].substring(9, block.lines[0].length - 6);    block.category   = block.lines[6].substring(13).trim();    if (block.lines[5].includes(kindGlobalNamespace)) block.kind = kindGlobalNamespace;    if (block.lines[5].includes(kindStaticMethod   )) block.kind = kindStaticMethod;    if (block.lines[5].includes(kindStaticNamespace)) block.kind = kindStaticNamespace;    if (block.lines[5].includes(kindStaticProperty )) block.kind = kindStaticProperty;    if (block.kind !== kindGlobalNamespace)    {        block.parent = block.lines[5].substring(block.lines[5].lastIndexOf('#') + 1, block.lines[5].length - 3);        block.lines[5] = block.lines[5].replace('of [<code>', 'of <code>');        block.lines[5] = block.lines[5].substring(0, block.lines[5].lastIndexOf(']')) + '\n';        block.singleLine = block.lines.join('\n');    }    return block;}//..............................................................................//..............................................................................function cleanupContentBody(content){    console.time   ('Content Body Cleanup Complete          ');    console.log    ('Cleaning Up Content Body...            ');    const horizontalRule = '---';    var contentBlocks = [];    var contentBlock  = [];    for (var i = 0; i < content.length; i++)    {        var contentLines = content[i].split('\n');        contentLines = getUniqueArray(contentLines);        for (var j = 0; j < contentLines.length; j++)        {            if (contentLines[j].indexOf('* [`.') === -1)            {                if (contentLines[j].indexOf('#') === 0)                {                    contentLines[j] = '##' + contentLines[j].substring(contentLines[j].lastIndexOf('#') + 1);                }                if (contentLines[j].indexOf('<a name=') === 0)                {                    contentLines[j] = stringsUtil.newLine + horizontalRule + stringsUtil.newLine + contentLines[j];                }                if (contentLines[j].indexOf('| Param') === 0)                {                    contentLines[j] = stringsUtil.newLine + contentLines[j];                }                if (contentLines[j].indexOf('| Name ') === 0)                {                    contentLines[j] = stringsUtil.newLine + contentLines[j];                }                contentBlock.push(contentLines[j]);            }        }        contentBlocks.push(contentBlock.join('\n'));        contentBlock = [];    }    contentBlocks[0] = contentBlocks[0].substring(5);    console.log    ('---------------------------------------');    console.timeEnd('Content Body Cleanup Complete          ');    console.log    ('---------------------------------------');    return contentBlocks;}//..............................................................................//..............................................................................function cleanupTOC(tocContent){    var lines = [];    var blocks = tocContent;    blocks = getUniqueArray(blocks);    for (var i = 0; i < blocks.length; i++)    {        var block = blocks[i].split('\n');        block = getUniqueArray(block);        for (var j = 0; j < block.length; j++)        {            if (block[j].indexOf('* [`') === 0 || block[j].indexOf('    * [`') === 0 )            {                lines.push(block[j]);            }        }    }    for (i = 0; i < lines.length; i++)    {        if (lines[i].includes(':'))            lines[i] = lines[i].substring(0, lines[i].indexOf(':'));        if ( lines[i].indexOf('* [`') === 0)        {            lines[i] = lines[i].substring(lines[i].indexOf('#') + 1, lines[i].lastIndexOf(')'));            lines[i] = '* ## [`' + lines[i] + '`](#' + lines[i] + ')';        }        else        {            lines[i] = lines[i].substring(lines[i].indexOf('#') + 1, lines[i].lastIndexOf(')'));            lines[i] = '* ### [`' + lines[i] + '`](#' + lines[i] + ')';        }    }    lines = lines.join('\n');    lines = lines.split('* ## [`');    lines.shift();    for (i = 0; i < lines.length; i++)    {        lines[i] = '* ## [`' + lines[i];    }    return lines;}//..............................................................................//..............................................................................function preProcessJSFiles(){    var blockJS   = [];    var commentEndLine = 0;    var fileJS    = [];    var sourceFolder = directoryNames.outputIntermediate + directoryNames.js + directoryNames.sourceAPI;    var targetFolder = directoryNames.outputTemp;    copyFolderRecursiveSync(sourceFolder, targetFolder, directoryNames.outputTemp, fileExtensions.js);    var filesJS = findFiles(directoryNames.outputTemp + directoryNames.sourceAPI, '*', 'preProcessJSFiles');    for (var i = 0; i < filesJS.length; i++)    {        console.time   ('Pre-processing: ' + filesJS[i]);        fileJS = loadTextFileIntoString(filesJS[i]).split(delimiters.jsDocStart);        for (var j = 1; j < fileJS.length; j++)        {            blockJS = fileJS[j].split('\r');            for (var k = 1; k < blockJS.length; k++)            {                if (blockJS[k].includes(delimiters.jsDocEnd))                {                    commentEndLine = k;                }            }            for (k = 0; k < commentEndLine; k++)            {                if (blockJS[k].indexOf(' \* ') !== 0)                    blockJS[k] = ' \* ' + blockJS[k];            }            blockJS.unshift(delimiters.jsDocStart);            fileJS[j] = blockJS.join('\r');        }        writeFileToDisk(fileJS.join('\n'), path.dirname(filesJS[i]), path.basename(filesJS[i]));        console.timeEnd('Pre-processing: ' + filesJS[i]);    }}//..............................................................................//..............................................................................function generateContentBody(source){    var contentBody      = [];    var contentGenerated = '';    console.time   ('Content Body Generated                 ');    console.log    ('Generating Content Body...             ');    var contentFiles = findFiles(path.dirname(source), '*', 'generateContentBody');    for (var i = 0; i < contentFiles.length; i++)    {        console.log('Generating ' + i + ' of ' + contentFiles.length, contentFiles[i]);        console.time   ('Generate Complete: ' + contentFiles[i]);        var contentMD = jsDocToMarkdown.renderSync(            {['files'               ]: contentFiles[i],             ['name-format'         ]: true,             ['module-index-format' ]: 'none',             ['example-lang'        ]: 'js',             ['global-index-format' ]: 'none',             ['param-list-format'   ]: 'table',             ['property-list-format']: 'table',             ['member-index-format' ]: 'list',             ['heading-depth'       ]: 1});        console.timeEnd('Generate Complete: ' + contentFiles[i]);        contentGenerated = contentGenerated + contentMD;    }    contentBlocks = contentGenerated.split('<a name=');    for (i = 1; i < contentBlocks.length; i++) contentBlocks[i] = '<a name=' + contentBlocks[i];    for (i = 1; i < contentBlocks.length; i++)    {        contentBlocks[i] = getContentBlockProperties(contentBlocks[i]);        var contentBlock = contentBlocks[i];        if (contentBlock.kind !== kindGlobalNamespace && contentBlock.kind !== kindStaticNamespace)        {            contentBody.push(contentBlock.singleLine);        }    }    contentBody = getUniqueArray(contentBody);    contentBody = cleanupContentBody(contentBody);    console.log    ('---------------------------------------');    console.timeEnd('Content Body Generated                 ');    console.log    ('---------------------------------------');    return contentBody;}//..............................................................................//..............................................................................function generateContentTOC(source, contentBody){    console.log    ('Generating TOC...                      ');    console.time   ('TOC Generated                          ');    var contentGenerated = '';    var toc = [];    var contentFiles = findFiles(path.dirname(source), '*', 'generateContentTOC');    for (var i = 0; i < contentFiles.length; i++)    {        console.log('Generating TOC:', contentFiles[i]);        var contentMD = jsDocToMarkdown.renderSync(            {['files'               ]: contentFiles[i],             ['name-format'         ]: true,             ['module-index-format' ]: 'none',             ['example-lang'        ]: 'js',             ['global-index-format' ]: 'none',             ['param-list-format'   ]: 'table',             ['property-list-format']: 'table',             ['member-index-format' ]: 'list',             ['heading-depth'       ]: 1});        contentGenerated = contentGenerated + contentMD;    }    var contentBlocks = contentGenerated.split('<a name=');    for (i = 1; i < contentBlocks.length; i++) contentBlocks[i] = '<a name=' + contentBlocks[i];    for (i = 1; i < contentBlocks.length; i++)    {        var contentBlock = getContentBlockProperties(contentBlocks[i]);        if (contentBlock.kind === kindGlobalNamespace || contentBlock.kind === kindStaticNamespace)        {            if (contentBlock.singleLine.includes(languages.english.name))            {                toc.push(contentBlock.singleLine);            }        }    }    toc = getUniqueArray(toc);    toc = cleanupTOC(toc);    return toc    console.log    ('---------------------------------------');    console.timeEnd('TOC Generated                          ');    console.log    ('---------------------------------------');}//..............................................................................//..............................................................................function postProcessDocFiles(){    console.time   ('Content Files Post Processing Complete ');    console.log    ('Post Processing Content Files...       ');    var content = loadTextFileIntoString(directoryNames.outputIntermediate + '/' + fileNames.generatedBodyAPI);    replaceAll(content, '<p>,<a'                , '<p><a'                         );    replaceAll(content, stringsUtil.unique      , ''                              );    replaceAll(content, stringsUtil.newLine     , CRLF                            );    replaceAll(content, '\r'                    , CRLF                            );    replaceAll(content, '<b> <\\/b>'            , ''                              );    replaceAll(content, 'static typedef of'     , 'custom type in'                );    replaceAll(content, 'static property of'    , 'property of'                   );    replaceAll(content, 'static method of'      , 'method of'                     );    replaceAll(content, '\\*\\*Kind\\*\\*:'     , stringsUtil.newLine + '**Kind**:'     );    replaceAll(content, '\\*\\*Summary\\*\\*:'  , stringsUtil.newLine + '**Summary**:'  );    replaceAll(content, '\\*\\*Properties\\*\\*', stringsUtil.newLine + '**Properties**');    writeFileToDisk(content, directoryNames.outputIntermediate, fileNames.generatedBodyAPI);    content = loadTextFileIntoString(directoryNames.outputIntermediate + '/' + fileNames.generatedTocAPI);    replaceAll(content, '<p>,<a'                , '<p><a'                         );    replaceAll(content, stringsUtil.unique      , ''                              );    replaceAll(content, stringsUtil.newLine     , CRLF                            );    replaceAll(content, '\r'                    , CRLF                            );    replaceAll(content, '<b> <\\/b>'            , ''                              );    replaceAll(content, 'static typedef of'     , 'custom type in'                );    replaceAll(content, 'static property of'    , 'property of'                   );    replaceAll(content, 'static method of'      , 'method of'                     );    replaceAll(content, '\\*\\*Kind\\*\\*:'     , stringsUtil.newLine + '**Kind**:'     );    replaceAll(content, '\\*\\*Summary\\*\\*:'  , stringsUtil.newLine + '**Summary**:'  );    replaceAll(content, '\\*\\*Properties\\*\\*', stringsUtil.newLine + '**Properties**');    writeFileToDisk(content, directoryNames.outputIntermediate, fileNames.generatedTocAPI);    console.log    ('---------------------------------------');    console.timeEnd('Content Files Post Processing Complete ');    console.log    ('---------------------------------------');}//..............................................................................//..............................................................................function generate(sourceDirectory){    console.time   ('Help Content Generation Complete       ');    console.log    ('Generating Help Content...             ');    var contentAll = {};    sourceDirectory = directoryNames.outputIntermediate + directoryNames.js + directoryNames.sourceAPI + '/' + fileTypes.js;    preProcessJSFiles();    getTemplateData(sourceDirectory);    getFilenameArray();    contentAll.body = generateContentBody(sourceDirectory);    contentAll.toc = generateContentTOC(sourceDirectory, contentAll.body);    writeFileToDisk(contentAll.body.join('\n'), directoryNames.outputIntermediate, fileNames.generatedBodyAPI);    writeFileToDisk(contentAll.toc .join('\n'), directoryNames.outputIntermediate, fileNames.generatedTocAPI );    postProcessDocFiles();    console.log    ('---------------------------------------');    console.timeEnd('Help Content Generation Complete       ');    console.log    ('---------------------------------------');}//..............................................................................//..............................................................................const exported ={    generate};module.exports =  exported;